import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MoodboardDock from "./components/MoodboardDock";
import Analytics from "./components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 中文字型改由瀏覽器直接向 Google Fonts 載入：next/font 在 build 時要下載數百個 CJK 分檔，
// 任一個失敗就整個 build 失敗（2026-11-11 Vercel 部署踩過）
const CJK_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&family=Noto+Serif+TC:wght@300;400;500;700&display=swap";

export const metadata: Metadata = {
  title: "AMB 艾柏設計 | 室內設計 Interior Design",
  description: "AMB 艾柏設計——以工業風與現代風為核心，跨足各式風格的空間設計事務所。住宅、商業、辦公空間整合設計與工程。",
  keywords: "室內設計, 工業風, 現代風, 艾柏設計, AMB, 住宅設計, 商業空間, 辦公室設計",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={CJK_FONTS_URL} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <MoodboardDock />
        <Analytics />
      </body>
    </html>
  );
}
