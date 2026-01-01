/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignore ESLint during builds - root .eslintrc.json conflicts with spokestack config
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type checking is done separately
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
