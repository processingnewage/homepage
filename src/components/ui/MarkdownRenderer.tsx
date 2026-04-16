'use client';

import ReactMarkdown, { Components } from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useThemeStore } from '@/lib/stores/themeStore';
import { cn } from '@/lib/utils';

// ============ Markdown 组件样式定义 ============

// 标题样式 - 紧凑简洁
const headingStyles = {
  h1: "text-3xl font-serif font-bold text-primary mt-10 mb-6 pb-3 border-b-2 border-neutral-200 dark:border-neutral-700",
  h2: "text-2xl font-serif font-semibold text-primary mt-8 mb-4 pb-2 border-b border-neutral-200 dark:border-neutral-700 relative pl-4 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-8 before:bg-accent before:rounded-full",
  h3: "text-xl font-semibold text-primary mt-6 mb-3 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-accent before:rounded-full before:flex-shrink-0",
  h4: "text-lg font-semibold text-primary mt-4 mb-2",
  h5: "text-base font-semibold text-primary mt-4 mb-2",
  h6: "text-sm font-semibold text-primary mt-4 mb-2",
};

// 段落和文本样式 - 紧凑
const textStyles = {
  p: "text-neutral-700 dark:text-neutral-300 leading-normal mb-2 last:mb-0 text-justify",

  strong: "font-semibold text-primary",
  em: "italic text-neutral-600 dark:text-neutral-400",
  hr: "my-4 border-neutral-200 dark:border-neutral-700",
};

// 链接样式 - 优雅的下划线动画
const linkClass = "text-accent hover:text-accent-dark transition-colors duration-200 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent hover:after:w-full after:transition-all duration-300";

// 代码块样式 - 紧凑简洁
const codeBlockWrapper = "mx-0 my-3 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-sm";
const codeBlockHeader = "px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2";
const codeInline = "px-1 py-0.5 mx-0.5 bg-neutral-100 dark:bg-neutral-800 text-accent-dark dark:text-accent-light rounded text-sm font-mono border border-neutral-200 dark:border-neutral-700";

// 列表样式 - 整洁统一，* 和文字连接在一起，左对齐
const listStyles = {
  ul: "space-y-1 my-1 mx-0 py-0 ml-4 pl-4 list-disc list-outside marker:text-neutral-700 dark:marker:text-neutral-400",
  ol: "space-y-1 my-1 mx-0 py-0 ml-4 pl-4 list-decimal list-outside marker:text-neutral-700 dark:marker:text-neutral-400",
  li: "text-neutral-700 dark:text-neutral-300 py-0 leading-normal text-justify",
};

// 引用块样式 - 紧凑简洁
const blockquote = "border-l-2 border-accent/60 pl-3 pt-2 pb-0 my-0 bg-accent/5 dark:bg-accent/10 rounded-r-lg not-italic overflow-hidden text-justify";
const blockquoteText = "text-neutral-600 dark:text-neutral-400";

// 表格样式 - 紧凑清晰
const tableWrapper = "my-3 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700";
const table = "w-full border-collapse";
const tableHeader = "bg-neutral-50 dark:bg-neutral-800/50";
const tableHeaderCell = "px-3 py-2 text-left text-sm font-semibold text-primary border-b border-neutral-200 dark:border-neutral-700";
const tableCell = "px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 border-b border-neutral-100 dark:border-neutral-800/50 text-justify";

// ============ 组件定义 ============

interface MarkdownComponentsProps {
  isDark: boolean;
  plainImage?: boolean;
}

export function getMarkdownComponents({ isDark, plainImage = false }: MarkdownComponentsProps) {
  return {
    h1: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <h1 className={headingStyles.h1} {...props}>{children}</h1>
    ),
    h2: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <h2 className={headingStyles.h2} {...props}>{children}</h2>
    ),
    h3: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <h3 className={headingStyles.h3} {...props}>{children}</h3>
    ),
    h4: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <h4 className={headingStyles.h4} {...props}>{children}</h4>
    ),
    h5: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <h5 className={headingStyles.h5} {...props}>{children}</h5>
    ),
    h6: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <h6 className={headingStyles.h6} {...props}>{children}</h6>
    ),
    p: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <p className={textStyles.p} {...props}>{children}</p>
    ),
    strong: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <strong className={textStyles.strong} {...props}>{children}</strong>
    ),
    em: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <em className={textStyles.em} {...props}>{children}</em>
    ),
    hr: (props: Record<string, unknown>) => <hr className={textStyles.hr} {...props} />,
    a: ({ ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a
        {...props}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      />
    ),
    blockquote: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <blockquote className={blockquote} {...props}>
        <div className={blockquoteText}>{children}</div>
      </blockquote>
    ),
    ul: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <ul className={listStyles.ul} {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <ol className={listStyles.ol} {...props}>{children}</ol>
    ),
    li: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <li className={listStyles.li} {...props}>{children}</li>
    ),
    table: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <div className={tableWrapper}>
        <table className={table} {...props}>{children}</table>
      </div>
    ),
    thead: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <thead className={tableHeader} {...props}>{children}</thead>
    ),
    tbody: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <tbody {...props}>{children}</tbody>
    ),
    tr: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <tr {...props}>{children}</tr>
    ),
    th: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <th className={tableHeaderCell} {...props}>{children}</th>
    ),
    td: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <td className={tableCell} {...props}>{children}</td>
    ),
    code: ({ className, children, ...props }: { className?: string; children?: React.ReactNode } & Record<string, unknown>) => {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match;

      if (isInline) {
        return (
          <code className={codeInline} {...props}>
            {children}
          </code>
        );
      }

      return (
        <div className={codeBlockWrapper}>
          <div className={codeBlockHeader}>
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
              padding: '1.25rem',
              fontSize: '0.875rem',
              lineHeight: '1.7',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
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
    pre: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
      <div className="flex justify-center mx-0 my-3 [&>code]:whitespace-pre-wrap" {...props}>
        {children}
      </div>
    ),
    img: ({ src, alt, ...props }: { src?: string; alt?: string } & Record<string, unknown>) => {
      if (typeof src === 'string') {
        let imageSrc = src;
        if (!src.startsWith('http://') && !src.startsWith('https://')) {
          imageSrc = `/blog/${src}`;
        }
        if (plainImage) {
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={alt || ''}
              className="w-[95%] h-auto mx-auto block my-3"
              {...props}
            />
          );
        }
        return (
          <figure className="my-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={alt || ''}
              className="rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 max-w-full h-auto"
              {...props}
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
  } as Components;
}

// ============ 主渲染组件 ============

interface MarkdownRendererProps {
  content: string;
  className?: string;
  plainImage?: boolean;
}

export default function MarkdownRenderer({ content, className, plainImage = false }: MarkdownRendererProps) {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  const components = getMarkdownComponents({ isDark, plainImage });

  return (
    <div className={cn("prose prose-lg dark:prose-invert max-w-none [&_.katex-display]:mx-auto [&_.katex-display]:w-fit [&_.katex-display]:block [&_.katex-display]:text-center [&_.katex-display>*:first-child]:mx-auto [&_.katex-display>table]:mx-auto", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
