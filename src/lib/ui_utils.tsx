import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function highlightDescription(desc?: string): ReactNode {
    if (!desc) return null;

    const match = desc.match(/\[(.*?)\]/);
    if (!match) return <span>{desc}</span>;

    const content = match[1];
    const tags = content.split('|').map((tag) => tag.trim());

    const hasCCFA = tags.some((tag) => tag === 'CCF A');

    const renderedTags = tags.map((tag, index) => {
        let isHighlight = false;

        if (tag === 'CCF A') {
            isHighlight = true;
        } else if (tag === 'CAS Q1' && !hasCCFA) {
            isHighlight = true;
        }

        if (isHighlight) {
            return (
                <span key={index} className="text-red-500 dark:text-red-400 font-medium">
                    {tag}
                </span>
            );
        }
        return <span key={index}>{tag}</span>;
    });

    return (
        <span>[{
            renderedTags.reduce((prev, curr, index) => (
                <>
                    {prev}
                    {index > 0 && <span className="text-neutral-400">{' | '}</span>}
                    {curr}
                </>
            ))}
            {']'}
        </span>
    );
}

// Tone styles for description tags (JCR/Q ratings, CCF ranks, etc.)
const TAG_TONES: Record<string, string> = {
    gold: 'bg-amber-500/10 text-amber-700 border-amber-500/25 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/25',
    green: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/25',
    blue: 'bg-sky-500/10 text-sky-700 border-sky-500/25 dark:bg-sky-400/10 dark:text-sky-300 dark:border-sky-400/25',
    neutral: 'bg-neutral-500/10 text-neutral-600 border-neutral-500/20 dark:bg-neutral-400/10 dark:text-neutral-400 dark:border-neutral-500/30',
};

function getTagTone(tag: string): string {
    const t = tag.toLowerCase();
    if (t.includes('ccf a') || t.includes('ccf-a')) return TAG_TONES.gold;
    if (t.includes('q1')) return TAG_TONES.green;
    if (t.includes('q2') || t.includes('ccf b') || t.includes('ccf-b')) return TAG_TONES.blue;
    return TAG_TONES.neutral;
}

/**
 * Render the bracketed quality tags inside a description (e.g. "[JCR Q1 | CAS Q2 | CCF A]")
 * as a set of small rounded pill badges. Falls back to plain text when no bracket is present.
 */
// Compact icon button used by publication actions (PDF / DOI / Code / abstract / BibTeX)
export const ICON_BUTTON = 'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 transition-all duration-200 hover:border-accent hover:bg-accent hover:text-white dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400 dark:hover:border-accent dark:hover:bg-accent dark:hover:text-white';
export const ICON_BUTTON_ACTIVE = 'border-accent bg-accent text-white hover:bg-accent hover:text-white';

export function renderDescriptionBadges(desc?: string): ReactNode {
    if (!desc) return null;

    const match = desc.match(/\[(.*?)\]/);
    if (!match) {
        return <span>{desc}</span>;
    }

    const tags = match[1]
        .split('|')
        .map((tag) => tag.trim())
        .filter(Boolean);

    return (
        <span className="inline-flex flex-wrap items-center gap-1.5">
            {tags.map((tag, index) => (
                <span
                    key={index}
                    className={cn(
                        'inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium',
                        getTagTone(tag)
                    )}
                >
                    {tag}
                </span>
            ))}
        </span>
    );
}