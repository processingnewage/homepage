#!/usr/bin/env node
/**
 * Mirror the binary assets stored under `content/` into `public/`.
 *
 * Text content (`.md`, `.toml`, `.bib`) is read straight from disk at build
 * time, but images and PDFs are fetched by the browser over HTTP — and with
 * `output: 'export'` Next.js only serves whatever is inside `public/`.
 * So every media file below `content/` is copied to the same relative path in
 * `public/` (`content/blog/post.png` -> `public/blog/post.png`), which keeps
 * the URLs used by MarkdownRenderer / SelectedPublications / bibtexParser stable
 * while letting each asset live next to the file that references it.
 *
 * `public/` therefore stays the single source of truth for favicon + avatar;
 * everything else in it is generated output, git-ignored and rebuilt on every
 * `npm run dev` / `npm run build`.
 */
import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const PUBLIC_DIR = path.join(ROOT, 'public');
const MANIFEST = path.join(PUBLIC_DIR, '.assets-manifest.json');

// Only these extensions are mirrored. Everything else (`.md`, `.toml`, `.bib`,
// …) is parsed at build time and must stay out of the served directory — this
// is what keeps docs such as `content/papers/pdf/README.md` unpublished.
const ASSET_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg', '.ico',
  '.pdf', '.mp4', '.webm', '.mov', '.mp3', '.wav',
]);

/**
 * Recursively collect media files under `dir`, returned as paths relative to
 * `root` (the content root), so the mirrors keep the same directory layout.
 */
async function collectAssets(dir, root = dir) {
  const found = [];

  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      found.push(...(await collectAssets(absolute, root)));
    } else if (entry.isFile() && ASSET_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      found.push(path.relative(root, absolute));
    }
  }

  return found;
}

async function main() {
  if (!(await stat(CONTENT_DIR).catch(() => null))) {
    console.warn('[sync-assets] no content/ directory, nothing to do');
    return;
  }

  const assets = (await collectAssets(CONTENT_DIR)).sort();
  const copied = [];

  for (const relative of assets) {
    const target = path.join(PUBLIC_DIR, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(path.join(CONTENT_DIR, relative), target);
    copied.push(relative.split(path.sep).join('/'));
  }

  // Drop mirrors of assets that were deleted or renamed in content/. Only the
  // paths recorded in the previous manifest are ever removed, so hand-written
  // files in public/ (favicon, avatar, …) can never be clobbered.
  const previous = await readFile(MANIFEST, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => []);

  const current = new Set(copied);
  for (const stale of previous) {
    if (!current.has(stale)) {
      await rm(path.join(PUBLIC_DIR, stale), { force: true });
      console.log(`[sync-assets] removed stale public/${stale}`);
    }
  }

  await writeFile(MANIFEST, `${JSON.stringify(copied, null, 2)}\n`);
  console.log(`[sync-assets] mirrored ${copied.length} asset(s) from content/ to public/`);
  for (const asset of copied) {
    console.log(`[sync-assets]   public/${asset}`);
  }
}

await main();