/** @type {import('next').NextConfig} */
const nextConfig = {
  // We only transpile the local workspace package
  transpilePackages: ["@portal/shared"],

  // (optional) keep this light while debugging
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;