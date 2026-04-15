/// <reference types="next" />
/// <reference types="next/image-types/global" />

import { notFound } from 'next/navigation';
import { getMarkdownContent } from '@/lib/content';
import { getPageConfig } from '@/lib/content';
import { CardPageConfig } from '@/types/page';
import BlogContent from '@/components/pages/BlogContent';

// Parse YAML front matter from markdown content
function parseFrontMatter(content: string): { frontMatter: Record<string, unknown>; body: string } {
  const frontMatter: Record<string, unknown> = {};
  let body = content;

  // Check if content starts with ---
  if (content.trim().startsWith('---')) {
    const lines = content.split('\n');
    let endIndex = -1;

    // Find the closing ---
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        endIndex = i;
        break;
      }
    }

    if (endIndex > 0) {
      // Parse front matter lines
      for (let i = 1; i < endIndex; i++) {
        const line = lines[i];
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();

          // Parse different value types
          if (value.startsWith('[') && value.endsWith(']')) {
            // Parse array
            const arrayValue = value.slice(1, -1);
            frontMatter[key] = arrayValue.split(',').map(item => item.trim().replace(/^["']|["']$/g, ''));
          } else if (value.startsWith('"') && value.endsWith('"')) {
            // Parse quoted string
            frontMatter[key] = value.slice(1, -1);
          } else {
            frontMatter[key] = value;
          }
        }
      }

      // Get body content (after front matter)
      body = lines.slice(endIndex + 1).join('\n');
    }
  }

  return { frontMatter, body };
}

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
  let rawContent = getMarkdownContent(`blog/${slug}.md`);

  if (!rawContent) {
    rawContent = getMarkdownContent(`blog/${slug}.md`);
  }

  if (!rawContent) {
    notFound();
  }

  // Parse front matter and body
  const { frontMatter, body } = parseFrontMatter(rawContent);

  // Extract values with proper typing
  const title = frontMatter.title as string | undefined;
  const subtitle = frontMatter.subtitle as string | undefined;
  const date = frontMatter.date as string | undefined;
  const tags = frontMatter.tags as string[] | undefined;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Front Matter Display */}
      {Object.keys(frontMatter).length > 0 && (
        <div className="mb-10 pb-8 border-b border-neutral-200 dark:border-neutral-700 relative">
          {/* Decorative accent line */}
          <div className="absolute bottom-0 left-0 w-16 h-1 bg-gradient-to-r from-accent to-accent-light rounded-full"></div>
          
          {title && (
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-3 leading-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
              {subtitle}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-500 mb-4">
            {date && (
              <span className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800/50 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {date}
              </span>
            )}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-accent/10 dark:bg-accent/20 text-accent-dark dark:text-accent-light rounded-full text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <BlogContent body={body} />
    </div>
  );
}
