import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 後台上傳的圖片存在 Vercel Blob
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
