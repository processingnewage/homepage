import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // `next dev` runs on Turbopack. Configuring the equivalent Turbopack entry
  // prevents the "Webpack is configured while Turbopack is not" warning.
  // Turbopack has no built-in equivalent of webpack's `asset/source`, and the
  // publication list is read from disk at build time (see `getBibtexContent`
  // in src/lib/content.ts), so no loader is registered for `.bib` here.
  turbopack: {
    rules: {
      '*.bib': false,
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.bib$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;
