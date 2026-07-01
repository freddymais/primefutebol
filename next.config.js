/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.BUILD_STATIC === 'true' ? 'export' : undefined,
  cleanDistDir: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    esmExternals: 'loose',
  },
  onDemandEntries: {
    maxInactiveAge: 60000,
    pagesBufferLength: 5,
  },
};

module.exports = nextConfig;
