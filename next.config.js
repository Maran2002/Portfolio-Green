/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["mongoose"],
  experimental: { cpus: 1 },
};

export default nextConfig;
