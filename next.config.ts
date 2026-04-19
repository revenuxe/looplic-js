import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zhoverulwcybtgrezaob.supabase.co",
      },
      {
        protocol: "https",
        hostname: "www.fixma.in",
      },
      {
        protocol: "https",
        hostname: "fixma.in",
      },
    ],
  },
};

export default nextConfig;
