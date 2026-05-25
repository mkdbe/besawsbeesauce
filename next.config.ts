import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3', 'geoip-lite', 'sharp'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
