import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3', 'geoip-lite'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
