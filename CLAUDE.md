# INT_DESIGN_test — AMB 艾柏設計官網

> 通用工作流程（收工、讀筆記、資料夾慣例等）在使用者層 CLAUDE.md，這裡只記專案特有資訊。

## 專案定位
為室內設計公司「AMB 艾柏設計」打造的官方網站。
風格：**工業風 + 現代風**為核心，兼容各式設計語彙。

## 📍 路徑
- 🐙 GitHub：[linliter-K/INT_DESIGN_test](https://github.com/linliter-K/INT_DESIGN_test)
- 📋 開發目錄（本機）：`C:\Users\User\Projects\INT_DESIGN_test\anbier-site\`
- 📘 Obsidian 工作筆記：`G:\我的雲端硬碟\OBSIDIAN\INT_DESIGN_test\工作筆記.md`
- ▶️ Dev server：`cd C:\Users\User\Projects\INT_DESIGN_test\anbier-site && npm run dev`（http://localhost:3000）

## 技術棧
- Next.js 16（App Router、Turbopack）+ TypeScript + Tailwind v4 + Framer Motion 12
- 字型：Noto Serif TC（標題）+ Noto Sans TC（內文）
- 部署目標：**Vercel**（GitHub Pages 不支援 API routes，會員系統需要）
- Phase 3 後端：Firebase Auth + Firestore

## 階段規劃
- ✅ **Phase 1**：首頁 + 9 件作品詳細頁 + 作品總覽頁 + Nav 跨頁跳轉
- ⏳ **Phase 2**：替換真實文案與圖片、關於我們獨立頁
- ⏳ **Phase 3**：會員系統（Firebase Auth）+ 提問功能
- ⏳ **Phase 4**：管理員後台回覆系統

## 頁面清單
- ✅ `/` 首頁（`anbier-site/app/page.tsx`）
- ✅ `/projects` 作品總覽（`anbier-site/app/projects/page.tsx`）
- ✅ `/projects/[id]` 作品詳細頁（`anbier-site/app/projects/[id]/page.tsx`）

## 設計規格
- 深炭 `#1a1817` / 暖米白 `#e8e2d6` / 古銅金 `#b08a5b` / 略亮炭 `#252220`
- 風格關鍵字：簡約、留白、質感、工業 × 現代

## ⚠️ 上線前必做
1. **圖片版權**：`anbier-site/public/placeholder/` 的 128 張圖全部擷取自 muldesign.com，**上線前必須全部替換**（Unsplash／Pexels／自家作品）
2. **真實文案**：9 件作品的 concept／描述／info 目前是範例文字
3. **真實聯絡資訊**：公司電話、地址、Email、年資數據

## 🔄 後台內容同步（收工前必做）
- 網站文字/圖片的「真正內容」= `anbier-site/content/site-content.json`（有進 git）+ 正式站 Vercel Blob，**誰新用誰**
- 本機後台（localhost/admin）的修改直接寫進 `content/site-content.json`，上傳圖片進 `public/uploads/`，推送後正式站生效
- 正式站後台的修改存在 Blob；**收工 `git add` 前先跑 `cd anbier-site && npm run pull-content`** 把它抓回 repo
- pull-content 從正式站公開網址 `/api/content` 抓（不用金鑰；Vercel 把 Blob 金鑰標成敏感、`vercel env pull` 拿不到真值）
- 改 `defaults.ts` 的文案：若該區塊已被後台存過，正式站會以後台版本為準，要改請直接在後台改
