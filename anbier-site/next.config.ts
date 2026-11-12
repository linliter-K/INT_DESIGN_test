import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 內容快照是執行時用 fs 讀的，打包追蹤不到，要手動帶進每個路由
  outputFileTracingIncludes: {
    "/**": ["./content/**/*.json"],
  },
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
