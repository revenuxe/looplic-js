import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zhoverulwcybtgrezaob.supabase.co",
      },
    ],
  },
};

export default nextConfig;
