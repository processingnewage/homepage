'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useThemeStore } from '@/lib/stores/themeStore';

interface BlogContentProps {
    body: string;
}

export default function BlogContent({ body }: BlogContentProps) {
    const isDark = useThemeStore((state) => state.theme) === 'dark';
    
    return (
        <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="text-3xl font-serif font-bold text-primary mt-10 mb-5 pb-2 border-b border-neutral-200 dark:border-neutral-700">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-2xl font-serif font-semibold text-primary mt-8 mb-4 relative before:content-[''] before:absolute before:-left-4 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-accent before:rounded-full">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-xl font-semibold text-primary mt-6 mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-lg font-semibold text-primary mt-5 mb-2">{children}</h4>
                    ),
                    p: ({ children }) => (
                        <p className="mb-5 last:mb-0 text-neutral-700 dark:text-neutral-300 leading-relaxed text-justify">
                            {children}
                        </p>
                    ),
                    ul: ({ children }) => (
                        <ul className="mb-5 space-y-2">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="mb-5 space-y-2 list-decimal list-inside marker:text-accent">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="text-neutral-700 dark:text-neutral-300 leading-relaxed pl-2">
                            <span className="inline-flex items-start">
                                <span className="mr-2 text-accent mt-1.5">
                                    <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                                        <circle cx="4" cy="4" r="3" />
                                    </svg>
                                </span>
                                <span>{children}</span>
                            </span>
                        </li>
                    ),
                    a: ({ ...props }) => (
                        <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:text-accent-dark transition-colors duration-200 font-medium relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent hover:after:w-full after:transition-all duration-300"
                        />
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-accent/60 pl-6 py-3 my-6 bg-accent/5 dark:bg-accent/10 rounded-r-lg italic">
                            <div className="text-neutral-600 dark:text-neutral-400">
                                {children}
                            </div>
                        </blockquote>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-semibold text-primary">{children}</strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic text-neutral-600 dark:text-neutral-400">{children}</em>
                    ),
                    hr: () => (
                        <hr className="my-8 border-neutral-200 dark:border-neutral-700" />
                    ),
                    table: ({ children }) => (
                        <div className="my-6 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
                            <table className="w-full border-collapse">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-neutral-100 dark:bg-neutral-800">
                            {children}
                        </thead>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-3 text-left text-sm font-semibold text-primary border-b border-neutral-200 dark:border-neutral-700">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-700/50">
                            {children}
                        </td>
                    ),
                    code: ({ className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match;
                        
                        if (isInline) {
                            return (
                                <code 
                                    className="px-1.5 py-0.5 mx-0.5 bg-neutral-100 dark:bg-neutral-800 text-accent-dark dark:text-accent-light rounded text-sm font-mono border border-neutral-200 dark:border-neutral-700"
                                    {...props}
                                >
                                    {children}
                                </code>
                            );
                        }
                        
                        return (
                            <div className="my-6 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-lg">
                                <div className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    <span>{match[1]}</span>
                                </div>
                                <SyntaxHighlighter
                                    style={isDark ? oneDark : oneLight}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{
                                        margin: 0,
                                        padding: '1rem',
                                        fontSize: '0.875rem',
                                        lineHeight: '1.7',
                                    }}
                                    codeTagProps={{
                                        style: {
                                            fontFamily: 'var(--font-mono)',
                                        }
                                    }}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            </div>
                        );
                    },
                    pre: ({ children }) => {
                        return <>{children}</>;
                    },
                    img: ({ src, alt }) => {
                        if (typeof src === 'string') {
                            let imageSrc = src;
                            if (!src.startsWith('http://') && !src.startsWith('https://')) {
                                imageSrc = `/blog/${src}`;
                            }
                            return (
                                <figure className="my-6">
                                    <img 
                                        src={imageSrc} 
                                        alt={alt || ''} 
                                        className="rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 max-w-full h-auto" 
                                    />
                                    {alt && (
                                        <figcaption className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 text-center italic">
                                            {alt}
                                        </figcaption>
                                    )}
                                </figure>
                            );
                        }
                        return null;
                    },
                }}
            >
                {body}
            </ReactMarkdown>
        </div>
    );
}
