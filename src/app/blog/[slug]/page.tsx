import { notFound } from 'next/navigation';
import { getMarkdownContent } from '@/lib/content';
import { getPageConfig } from '@/lib/content';
import { CardPageConfig } from '@/types/page';
import { cn } from '@/lib/utils';

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
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : `Blog - ${slug}`;

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
        <div 
          className={cn(
            "blog-content",
            "prose-headings:font-serif prose-headings:font-bold prose-headings:text-primary",
            "prose-a:text-accent hover:prose-a:text-accent/80",
            "prose-code:bg-neutral-100 dark:prose-code:bg-neutral-800 prose-code:px-2 prose-code:py-1 prose-code:rounded",
            "prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:pl-4 prose-blockquote:italic"
          )}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}