import { ReactNode } from 'react';

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