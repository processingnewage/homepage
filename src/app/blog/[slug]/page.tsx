import { notFound } from 'next/navigation';
import { getMarkdownContent } from '@/lib/content';
import { getPageConfig } from '@/lib/content';
import { CardPageConfig } from '@/types/page';
import ReactMarkdown from 'react-markdown';

export async function generateStaticParams() {
  // Get blog posts from blog.toml to generate static params
  const blogConfig = getPageConfig<CardPageConfig>('blog');
  
  if (!blogConfig || !blogConfig.items) {
    return [];
  }
  
  // Extract slugs from link fields (e.g., "/blog/first-post" -> "first-post")
  const slugs = blogConfig.items
    .filter(item => item.link)
    .map(item => {
      const link = item.link as string;
      return link.replace('/blog/', '');
    });
  
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Try to get the blog post content to extract title
  const content = getMarkdownContent(`blog/${slug}.md`);
  
  if (!content) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.'
    };
  }

  // Extract title from markdown content (first heading)
  // Try multiple patterns to find the title
  const titleMatch = content.match(/^#\s+(.+)$/m) || 
                    content.match(/^#\s+(.+)$/);
  const extractedTitle = titleMatch ? titleMatch[1].trim() : null;
  
  // Fallback to blog config if available
  const blogConfig = getPageConfig<CardPageConfig>('blog');
  const configItem = blogConfig?.items?.find(item => item.link === `/blog/${slug}`);
  const fallbackTitle = configItem?.title || `Blog - ${slug}`;
  
  const title = extractedTitle || fallbackTitle;

  return {
    title: `${title} | Blog`,
    description: `Read ${title} on my blog`
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Try to get content for current locale first, then fallback
  let content = getMarkdownContent(`blog/${slug}.md`);
  
  if (!content) {
    content = getMarkdownContent(`blog/${slug}.md`);
  }

  if (!content) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-4xl font-serif font-bold text-primary mb-6">{children}</h1>,
            h2: ({ children }) => <h2 className="text-3xl font-serif font-bold text-primary mb-4">{children}</h2>,
            h3: ({ children }) => <h3 className="text-2xl font-serif font-bold text-primary mb-3">{children}</h3>,
            h4: ({ children }) => <h4 className="text-xl font-serif font-bold text-primary mb-2">{children}</h4>,
            p: ({ children }) => <p className="text-base leading-relaxed text-neutral-700 dark:text-neutral-300 mb-4">{children}</p>,
            a: ({ href, children }) => (
              <a 
                href={href} 
                className="text-accent hover:text-accent/80 underline underline-offset-4 decoration-accent/50 hover:decoration-accent"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            code: ({ children, className }) => {
              const isInline = !className;
              return isInline ? (
                <code className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-sm font-mono">
                  {children}
                </code>
              ) : (
                <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm font-mono">{children}</code>
                </pre>
              );
            },
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-accent pl-4 italic text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded">
                {children}
              </blockquote>
            ),
            ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4">{children}</ol>,
            li: ({ children }) => <li className="text-neutral-700 dark:text-neutral-300">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
            em: ({ children }) => <em className="italic text-neutral-600 dark:text-neutral-400">{children}</em>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}