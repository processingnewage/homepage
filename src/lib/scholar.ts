import fs from 'fs';
import https from 'node:https';
import path from 'path';

/**
 * Google Scholar statistics, resolved at build time.
 *
 * The site is statically exported (`output: 'export'` in `next.config.ts`), so
 * the badge is produced while `next build` runs and there is no server to hit
 * at request time. This module fetches the Scholar profile page once per build,
 * extracts the citation metrics and caches them on disk so repeated builds stay
 * fast and do not hammer Scholar.
 *
 * Everything here is best-effort: Scholar rate-limits aggressively and returns
 * an interstitial captcha page instead of the profile, so no failure may ever
 * break the build. The resolution order is
 *
 *   1. `SCHOLAR_CITATIONS` environment variable (explicit override / CI cache)
 *   2. `social.google_scholar_citations` in `content/config.toml`
 *   3. a fresh on-disk cache entry
 *   4. a live fetch, whose result is written back to the cache
 *   5. a stale on-disk cache entry
 *   6. the number hard-coded in the badge URL in `content/bio.md`
 *
 * Only step 4 touches the network, so an offline build still renders a number.
 */

const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'scholar.json');

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Scholar serves a captcha / "unusual traffic" page with HTTP 200, so the
 * status code alone is not enough to detect a blocked request.
 */
const BLOCK_MARKERS = [
    'id="gs_ai_dfp"',
    'Our systems have detected unusual traffic',
    '/sorry/index',
    'unusual traffic from your computer network',
];

export interface ScholarStats {
    citations: number;
    hIndex?: number;
    i10Index?: number;
    /** Where the number came from, surfaced in build logs. */
    source: 'env' | 'config' | 'cache' | 'fetch' | 'stale-cache';
}

interface CacheEntry {
    citations: number;
    hIndex?: number;
    i10Index?: number;
    /** Epoch milliseconds of the last successful fetch. */
    fetchedAt: number;
}

type CacheFile = Record<string, CacheEntry>;

function readPositiveInt(value: string | undefined, fallback: number): number {
    if (!value) return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** `1,234` / `1.2k` -> `1234`; returns `null` when nothing numeric is present. */
function toCount(value: string | undefined | null): number | null {
    if (!value) return null;

    const trimmed = value.trim();

    // Compact form, e.g. `1.2k`.
    const compact = /^([\d.]+)\s*k$/i.exec(trimmed);
    if (compact) {
        const scaled = Number.parseFloat(compact[1]) * 1000;
        return Number.isFinite(scaled) ? Math.round(scaled) : null;
    }

    const digits = trimmed.replace(/[,\s]/g, '');
    if (!/^\d+$/.test(digits)) return null;

    const parsed = Number.parseInt(digits, 10);
    return Number.isSafeInteger(parsed) ? parsed : null;
}

/** Strip tags and collapse whitespace, so cell text is comparable. */
function textOf(html: string): string {
    return html
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Parse the metrics table Scholar renders under the profile name.
 *
 * Markup has changed over the years, so two shapes are handled: the classic
 * `<td class="gsc_rsb_std">` cells and the newer text-only table.
 */
export function parseScholarStats(html: string): Omit<ScholarStats, 'source'> | null {
    if (BLOCK_MARKERS.some((marker) => html.includes(marker))) {
        return null;
    }

    // Classic layout: one row of `gsc_rsb_std` cells reading
    // ["", Citations, h-index, i10-index]; empty cells are dropped.
    const cells = [...html.matchAll(/class="gsc_rsb_std"[^>]*>([\s\S]*?)<\/td>/g)]
        .map((match) => textOf(match[1]))
        .filter((cell) => cell.length > 0);

    if (cells.length >= 1) {
        const [citations, hIndex, i10Index] = cells.map(toCount);

        if (citations !== null) {
            return {
                citations,
                ...(hIndex !== null ? { hIndex } : {}),
                ...(i10Index !== null ? { i10Index } : {}),
            };
        }
    }

    // Newer layout: header row then value row inside `gsc_rsb_st`.
    const table = /class="gsc_rsb_st"[^>]*>([\s\S]*?)<\/table>/.exec(html);

    if (table) {
        const text = textOf(table[1]);
        const citations = toCount(/Cited by\s*([\d.,\s]+[kK]?)/.exec(text)?.[1])
            ?? toCount(/Citations\s*([\d.,\s]+[kK]?)/.exec(text)?.[1]);

        if (citations !== null) {
            const hIndex = toCount(/h-?index\s*([\d.,\s]+[kK]?)/i.exec(text)?.[1]);
            const i10Index = toCount(/i10-?index\s*([\d.,\s]+[kK]?)/i.exec(text)?.[1]);

            return {
                citations,
                ...(hIndex !== null ? { hIndex } : {}),
                ...(i10Index !== null ? { i10Index } : {}),
            };
        }
    }

    return null;
}

function readCache(): CacheFile {
    try {
        const parsed = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        return parsed && typeof parsed === 'object' ? (parsed as CacheFile) : {};
    } catch {
        // No cache yet, or it was corrupted — both are recoverable.
        return {};
    }
}

function writeCache(cache: CacheFile): void {
    try {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
        fs.writeFileSync(CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
    } catch (error) {
        console.warn('[scholar] could not write cache:', (error as Error).message);
    }
}

/** Extract the `user=<ID>` parameter that identifies a Scholar profile. */
export function extractScholarUserId(profileUrl?: string): string | null {
    if (!profileUrl) return null;

    try {
        return new URL(profileUrl).searchParams.get('user');
    } catch {
        return null;
    }
}

/**
 * Perform the profile request with `node:https` rather than the global `fetch`.
 *
 * Next.js patches `globalThis.fetch` during the build, and rejects any request
 * that opts out of its data cache (`cache: 'no-store'`) on a statically
 * exported route -- which is exactly what a build-time, self-cached fetch needs.
 * The patch turns the request into an error instead of a network call, so this
 * deliberately uses the unpatched Node API.
 */
function requestProfile(url: string, timeoutMs: number): Promise<string | null> {
    return new Promise((resolve) => {
        const request = https.get(
            url,
            {
                headers: {
                    // Scholar rejects requests without a browser-like User-Agent.
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'en-US,en;q=0.9',
                    // Ask for plain text so no gzip decoding is required.
                    'Accept-Encoding': 'identity',
                },
                timeout: timeoutMs,
            },
            (response) => {
                const { statusCode, headers } = response;

                // Scholar may redirect (e.g. to a consent page); follow it.
                if (statusCode && statusCode >= 300 && statusCode < 400 && headers.location) {
                    response.resume();
                    requestProfile(new URL(headers.location, url).toString(), timeoutMs).then(resolve);
                    return;
                }

                if (statusCode !== 200) {
                    response.resume();
                    console.warn(`[scholar] profile request returned HTTP ${statusCode}`);
                    resolve(null);
                    return;
                }

                let body = '';
                response.setEncoding('utf8');
                response.on('data', (chunk: string) => { body += chunk; });
                response.on('end', () => resolve(body));
                response.on('error', (error) => {
                    console.warn('[scholar] profile response failed:', error.message);
                    resolve(null);
                });
            },
        );

        request.on('timeout', () => {
            request.destroy();
            console.warn(`[scholar] profile request timed out after ${timeoutMs}ms`);
            resolve(null);
        });

        request.on('error', (error) => {
            console.warn('[scholar] profile request failed:', error.message);
            resolve(null);
        });
    });
}

async function fetchScholarStats(
    profileUrl: string,
    timeoutMs: number,
): Promise<Omit<ScholarStats, 'source'> | null> {
    const html = await requestProfile(profileUrl, timeoutMs);

    if (!html) return null;

    const parsed = parseScholarStats(html);

    if (!parsed) {
        console.warn('[scholar] profile page did not contain readable metrics (blocked or markup changed)');
    }

    return parsed;
}

function toStats(entry: CacheEntry, source: ScholarStats['source']): ScholarStats {
    return {
        citations: entry.citations,
        ...(entry.hIndex !== undefined ? { hIndex: entry.hIndex } : {}),
        ...(entry.i10Index !== undefined ? { i10Index: entry.i10Index } : {}),
        source,
    };
}

/**
 * Resolve the citation statistics for a Scholar profile.
 *
 * Never throws and never returns `undefined`: when Scholar is unreachable the
 * most recent known value (config override, cache, or the number written in the
 * badge URL) is used instead, so the badge always renders.
 */
export async function getScholarStats(options: {
    profileUrl?: string;
    /** `social.google_scholar_citations` from `content/config.toml`. */
    configuredCitations?: number;
}): Promise<ScholarStats | null> {
    const { profileUrl, configuredCitations } = options;

    // 1. Explicit environment override — used by CI to pin a known value.
    const envCitations = toCount(process.env.SCHOLAR_CITATIONS);
    if (envCitations !== null) {
        console.log(`[scholar] using SCHOLAR_CITATIONS=${envCitations}`);
        return { citations: envCitations, source: 'env' };
    }

    // 2. Hand-maintained value in config.toml.
    if (typeof configuredCitations === 'number' && Number.isSafeInteger(configuredCitations) && configuredCitations >= 0) {
        return { citations: configuredCitations, source: 'config' };
    }

    const userId = extractScholarUserId(profileUrl);
    if (!userId || !profileUrl) {
        return null;
    }

    const cache = readCache();
    const entry = cache[userId];
    const ttlMs = readPositiveInt(process.env.SCHOLAR_CACHE_TTL_MS, DEFAULT_TTL_MS);
    const now = Date.now();

    // 3. Fresh cache entry — skip the network entirely.
    if (entry && now - entry.fetchedAt < ttlMs) {
        console.log(`[scholar] using cached citations=${entry.citations} for ${userId}`);
        return toStats(entry, 'cache');
    }

    // 4. Live fetch, then persist for the next build.
    const fetched = await fetchScholarStats(
        profileUrl,
        readPositiveInt(process.env.SCHOLAR_FETCH_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
    );

    if (fetched) {
        cache[userId] = { ...fetched, fetchedAt: now };
        writeCache(cache);
        console.log(`[scholar] fetched citations=${fetched.citations} for ${userId}`);
        return { ...fetched, source: 'fetch' };
    }

    // 5. Stale cache is better than nothing.
    if (entry) {
        console.warn(`[scholar] fetch failed, falling back to cached citations=${entry.citations}`);
        return toStats(entry, 'stale-cache');
    }

    // 6. Nothing known at all; the caller falls back to the badge URL number.
    console.warn(`[scholar] no citation data available for ${userId}`);
    return null;
}