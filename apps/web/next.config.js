/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@cancelkit/db"],
  typescript: {
    // next-auth v5 beta generates an inferred type that references next-auth/lib
    // This is a known issue with isolatedModules + next-auth v5 beta
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
