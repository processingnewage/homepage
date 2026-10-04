/**
 * Where content-owned binary assets are served from.
 *
 * Images and PDFs live next to the content that references them — blog posts go
 * in `content/blog/posts/` with their pictures in `content/blog/images/`, while
 * a paper's preview image sits in `content/papers/images/` and its PDF in
 * `content/papers/pdf/`. `scripts/sync-assets.mjs` mirrors those assets into
 * `public/` before `next dev` / `next build`; because the mirror keeps the
 * relative path, the public URLs below are stable and never mention `content/`.
 *
 * Note that Markdown images are resolved against the blog *root*, not against
 * each post's own folder: `![...](images/foo.png)` inside
 * `content/blog/posts/bar.md` becomes `/blog/images/foo.png`.
 *
 * These constants are plain strings so they can be imported from both server
 * and client components; the on-disk source locations live with the code that
 * touches the filesystem.
 */
export const BLOG_ASSET_URL_PREFIX = '/blog/';
export const PAPER_ASSET_URL_PREFIX = '/papers/';
export const PDF_URL_PREFIX = '/papers/pdf/';