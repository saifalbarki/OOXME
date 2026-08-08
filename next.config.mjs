import { pages } from './config/pages.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return pages.map((page) => ({
      source: `/${page}.html`,
      destination: page === 'index' ? '/' : `/${page}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
