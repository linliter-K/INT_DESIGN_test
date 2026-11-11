import { promises as fs } from "fs";
import path from "path";
import { unstable_cache } from "next/cache";
import { put, list, del } from "@vercel/blob";
import { defaultContent } from "./defaults";
import type { SiteContent } from "./types";

export const CONTENT_TAG = "site-content";

const CONTENT_PREFIX = "content/site-";
// 每次儲存都寫成新檔，保留最近幾版以便出事時能從 Vercel 後台手動救回
const KEEP_VERSIONS = 10;

const LOCAL_DIR = path.join(process.cwd(), ".local-content");
const LOCAL_FILE = path.join(LOCAL_DIR, "site-content.json");
const LOCAL_UPLOADS = path.join(process.cwd(), "public", "uploads");

// 沒設定 Blob token（本機開發）就退回寫本機檔案，讓 localhost 也能完整測試後台
export function isBlobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function mergeWithDefaults(stored: Partial<SiteContent>): SiteContent {
  const merged = { ...defaultContent } as Record<string, unknown>;
  for (const [key, value] of Object.entries(stored)) {
    const base = merged[key];
    merged[key] =
      base && typeof base === "object" && !Array.isArray(base) && value
        ? { ...base, ...(value as object) }
        : value;
  }
  return merged as SiteContent;
}

async function readStored(): Promise<Partial<SiteContent> | null> {
  if (!isBlobEnabled()) {
    try {
      return JSON.parse(await fs.readFile(LOCAL_FILE, "utf-8"));
    } catch {
      return null;
    }
  }
  const { blobs } = await list({ prefix: CONTENT_PREFIX, limit: 100 });
  if (blobs.length === 0) return null;
  const latest = blobs.reduce((a, b) =>
    new Date(a.uploadedAt) > new Date(b.uploadedAt) ? a : b
  );
  // 檔名每版都不同，所以 URL 內容永遠不會被 CDN 快取成舊版
  const res = await fetch(latest.url, { cache: "no-store" });
  if (!res.ok) throw new Error(`讀取內容失敗：${res.status}`);
  return res.json();
}

export async function readContentUncached(): Promise<SiteContent> {
  const stored = await readStored();
  return stored ? mergeWithDefaults(stored) : defaultContent;
}

// 只快取「存進去的原始資料」，預設值每次讀取時才合併：
// 這樣程式新增區塊（例如軟裝）時，舊快取不會缺欄位導致整頁壞掉
const readStoredCached = unstable_cache(readStored, [CONTENT_TAG, "stored-v2"], {
  tags: [CONTENT_TAG],
});

export async function getContent(): Promise<SiteContent> {
  const stored = await readStoredCached();
  return stored ? mergeWithDefaults(stored) : defaultContent;
}

export async function writeContent(content: SiteContent) {
  const json = JSON.stringify(content);
  if (!isBlobEnabled()) {
    await fs.mkdir(LOCAL_DIR, { recursive: true });
    await fs.writeFile(LOCAL_FILE, json, "utf-8");
    return;
  }
  await put(`${CONTENT_PREFIX}${Date.now()}.json`, json, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: true,
  });
  const { blobs } = await list({ prefix: CONTENT_PREFIX, limit: 100 });
  const stale = blobs
    .sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))
    .slice(KEEP_VERSIONS);
  if (stale.length) await del(stale.map((b) => b.url));
}

export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export async function saveImage(file: File): Promise<string> {
  // 副檔名由 MIME 決定，不信任使用者檔名（避免上傳 .html 之類的檔案到 public）
  const ext = IMAGE_TYPES[file.type];
  if (!ext) throw new Error("只接受 JPG / PNG / WebP / AVIF 圖片");
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  if (!isBlobEnabled()) {
    await fs.mkdir(LOCAL_UPLOADS, { recursive: true });
    await fs.writeFile(
      path.join(LOCAL_UPLOADS, name),
      Buffer.from(await file.arrayBuffer())
    );
    return `/uploads/${name}`;
  }
  const blob = await put(`images/${name}`, file, {
    access: "public",
    contentType: file.type || undefined,
  });
  return blob.url;
}
