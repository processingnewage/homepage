'use client';

import { cn } from '@/lib/utils';
import { parseShieldsBadge, parseShieldsCitationCount, type ShieldsBadge } from '@/lib/shields';

interface ScholarBadgeProps {
    /** The original shields.io badge URL from the Markdown, used for the label and as a fallback count. */
    src: string;
    /** Citation count resolved at build time; wins over the number in `src`. */
    citations?: number | null;
    hIndex?: number | null;
    i10Index?: number | null;
    className?: string;
}

/**
 * Google Scholar citation badge.
 *
 * This replaces the plain `<img>` shields.io badge with a real element so the
 * citation count can be filled in from the build-time Scholar fetch, and so the
 * badge can be aligned precisely.
 *
 * Alignment is the reason this is not an image: an `<img>` sits on the text
 * baseline and always looks dropped. Here the badge is an inline box whose
 * `vertical-align: middle` centres it on the surrounding text, and each segment
 * is itself a flex box that centres its own content. Note that no inner element
 * may carry `vertical-align`: inside a flex container that shifts content down
 * by half the x-height and fights the `items-center` centring, which is what
 * made the number look misaligned before.
 */
export default function ScholarBadge({ src, citations, hIndex, i10Index, className }: ScholarBadgeProps) {
    const parsed: ShieldsBadge | null = parseShieldsBadge(src);
    const label = parsed?.label || 'Citations';

    // Build-time stats win; the number typed into the badge URL is the fallback.
    const count = citations ?? parseShieldsCitationCount(src);

    const details = [
        count === null ? null : `Citations: ${count}`,
        hIndex ? `h-index: ${hIndex}` : null,
        i10Index ? `i10-index: ${i10Index}` : null,
    ].filter(Boolean).join(' · ');

    return (
        <span
            role="img"
            aria-label={details || label}
            title={details || undefined}
            data-citations={count ?? undefined}
            className={cn(
                // `align-middle` centres the badge's midpoint on the parent's
                // baseline + half the x-height, but text reads as centred on half
                // the cap-height (Inter: ~0.727em vs an x-height of ~0.546em).
                // That difference leaves the badge ~1.4px low, so nudge it back up.
                //
                // `items-stretch` + a fixed height keeps both segments flush so the
                // join between them stays seamless; the segments centre their own
                // content with `items-center` (see the note above).
                'inline-flex items-stretch align-middle h-5 overflow-hidden rounded-[4px] -translate-y-[1.5px]',
                'border border-black/10 shadow-sm',
                'text-[11px] leading-none font-semibold whitespace-nowrap',
                className,
            )}
        >
            {/* Left segment: logo + label, mirrors the shields.io `?logo=` look. */}
            <span className="flex items-center gap-1 bg-[#555555] pr-1.5 pl-1.5 text-white dark:bg-[#3d4450]">
                <ScholarGlyph className="h-3 w-3 shrink-0" />
                {label}
            </span>

            {/* Right segment: the number. */}
            <span className="flex items-center bg-[#0969da] px-1.5 font-bold text-white tabular-nums dark:bg-[#1a73e8]">
                {count === null ? '–' : count.toLocaleString('en-US')}
            </span>
        </span>
    );
}

/** Minimal graduation-cap mark standing in for the shields.io Google Scholar logo. */
function ScholarGlyph({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" focusable="false">
            <path d="M12 3 1 9l4 2.18v6L12 21l7-3.82v-6L21.5 10 12 3Zm0 2.31 6.98 4.25L12 13.94 5.02 9.56 12 5.31ZM5 12.1v4.02l7 3.82 7-3.82V12.1l-7 3.81L5 12.1Z" />
        </svg>
    );
}