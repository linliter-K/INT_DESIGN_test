# INT_DESIGN_test — AMB 艾柏設計官網專案

## 專案定位
為室內設計公司「AMB 艾柏設計」打造的官方網站。
風格：**工業風 + 現代風**為核心，兼容各式設計語彙。
首頁要漂亮、有設計感、簡單大方，含動畫特效。

## ⚠️ 工作路徑重要提醒（選項 A）
因 Google Drive 同步 `node_modules` 會鎖檔、造成 npm 安裝失敗，
**Next.js 專案本體已搬到本機**，只留 Markdown 文件 + Git 在 Drive。

- 📋 **開發實際目錄（用這個）**：`C:\Users\User\Projects\INT_DESIGN_test\`
- 📋 Drive 版（舊複本、目前僅含 CLAUDE.md + tools/）：`G:\我的雲端硬碟\INT_DESIGN_test\`
- 🐙 GitHub repo：`linliter-K/INT_DESIGN_test`（Git 是跨電腦同步的真正方式）
- 📘 Obsidian 駕駛艙：`G:\我的雲端硬碟\OBSIDIAN\OBSIDIAN K\01 - Projects\INT_DESIGN_test\工作筆記.md`

**跨電腦工作流**：一律用 `git pull` / `git push`，不要依賴 Drive。

## 對話開始時請先讀
1. 工作目錄先切到 `C:\Users\User\Projects\INT_DESIGN_test\anbier-site\`
2. 進度與最近更動在 Obsidian：`G:\我的雲端硬碟\OBSIDIAN\OBSIDIAN K\01 - Projects\INT_DESIGN_test\工作筆記.md`

## 技術棧
- **前端框架**：Next.js 16（App Router、Turbopack）
- **語言**：TypeScript
- **樣式**：Tailwind CSS v4
- **動畫**：Framer Motion 12
- **字型**：Noto Serif TC（標題）+ Noto Sans TC（內文）
- **部署目標**：Vercel（⚠️ GitHub Pages 不行，會員系統需要 API routes）
- **會員 / 後台資料庫**（Phase 3 之後）：Firebase Auth + Firestore

## 階段規劃
- ✅ **Phase 1**：首頁完成（Hero、Portfolio、Services、About、Contact、Footer）
- ⏳ **Phase 2**：作品集列表頁 + 作品詳細頁、關於我們獨立頁
- ⏳ **Phase 3**：會員註冊 / 登入（Firebase Auth）、會員提問功能
- ⏳ **Phase 4**：管理員後台回覆系統

## 工作模式
- **加新頁面 / 區塊**：對 Claude 說「我想加 XXX」→ Claude 會建對應檔案
- **結束工作**：對 Claude 說「**收工**」→ 自動 commit + push + 更新 Obsidian 工作筆記
- **接續工作**：對 Claude 說「讀工作筆記、告訴我上次做到哪」

## 頁面清單
- ✅ `/`（首頁）— `anbier-site/app/page.tsx`

## 設計方向（已定）
- **色系**：
  - 背景 `#1a1817`（深炭色）
  - 前景 `#e8e2d6`（暖米白）
  - 點綴 `#b08a5b`（古銅金）
  - 表面 `#252220`（略亮炭色）
- **首頁結構**：Hero 全屏大圖 + Ken Burns 慢速縮放 → 作品集 3 欄 Grid → 服務項目 4 格 → 關於 + 數據統計 → 聯絡表單

## ⚠️ 圖片版權提醒
- `anbier-site/public/placeholder/` 裡的 9 張圖全部擷取自 muldesign.com
- **僅作本地開發用，上線前必須全部替換**（換成自家作品或 Unsplash 免費素材）
- 詳見 `anbier-site/public/placeholder/README.md`

## 工作注意事項
- 圖片要壓縮過再放進 repo
- commit 訊息要寫清楚做了什麼 + 為什麼
- 收工前說「收工」讓 Claude 同步 GitHub + Obsidian
- 開發伺服器指令：`cd C:\Users\User\Projects\INT_DESIGN_test\anbier-site && npm run dev`
