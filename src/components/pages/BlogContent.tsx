'use client';

import MarkdownRenderer from '@/components/ui/MarkdownRenderer';

interface BlogContentProps {
    body: string;
    plainImage?: boolean;
}

export default function BlogContent({ body, plainImage }: BlogContentProps) {
    return (
        <div className="prose prose-lg dark:prose-invert max-w-none">
            <MarkdownRenderer content={body} plainImage={plainImage} />
        </div>
    );
}