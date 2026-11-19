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

// 內容快照放在 repo 裡（有進 git）：本機後台直接改它，正式站後台的修改則用
// `npm run pull-content` 抓回來，推送時就會一起帶上去，不會被舊版蓋掉
const SNAPSHOT_FILE = path.join(process.cwd(), "content", "site-content.json");
const LOCAL_UPLOADS = path.join(process.cwd(), "public", "uploads");

type Stored = { updatedAt: number; content: Partial<SiteContent> };

// 沒設定 Blob token（本機開發）就退回寫本機檔案，讓 localhost 也能完整測試後台
export function isBlobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function mergeWithDefaults(stored: Partial<SiteContent>): SiteContent {
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

async function readSnapshot(): Promise<Stored | null> {
  try {
    const snap = JSON.parse(await fs.readFile(SNAPSHOT_FILE, "utf-8"));
    return snap?.content ? { updatedAt: Number(snap.updatedAt) || 0, content: snap.content } : null;
  } catch {
    return null;
  }
}

async function readBlob(): Promise<Stored | null> {
  const { blobs } = await list({ prefix: CONTENT_PREFIX, limit: 100 });
  if (blobs.length === 0) return null;
  const latest = blobs.reduce((a, b) =>
    new Date(a.uploadedAt) > new Date(b.uploadedAt) ? a : b
  );
  // 檔名每版都不同，所以 URL 內容永遠不會被 CDN 快取成舊版
  const res = await fetch(latest.url, { cache: "no-store" });
  if (!res.ok) throw new Error(`讀取內容失敗：${res.status}`);
  return { updatedAt: new Date(latest.uploadedAt).getTime(), content: await res.json() };
}

// 快照與 Blob 誰新用誰：本機改完推上去會生效，正式站後台改的也不會被推送蓋掉
async function readStored(): Promise<Stored | null> {
  const snapshot = await readSnapshot();
  if (!isBlobEnabled()) return snapshot;
  const blob = await readBlob();
  if (!blob) return snapshot;
  if (!snapshot) return blob;
  return snapshot.updatedAt > blob.updatedAt ? snapshot : blob;
}

export async function readContentUncached(): Promise<SiteContent> {
  const stored = await readStored();
  return stored ? mergeWithDefaults(stored.content) : defaultContent;
}

// 只快取「存進去的原始資料」，預設值每次讀取時才合併：
// 這樣程式新增區塊（例如軟裝）時，舊快取不會缺欄位導致整頁壞掉
const readStoredCached = unstable_cache(readStored, [CONTENT_TAG, "stored-v3"], {
  tags: [CONTENT_TAG],
});

// 給 pull-content 用：回傳原始存檔與時間，讓本機判斷要不要更新快照
export async function getStoredSnapshot(): Promise<Stored | null> {
  return readStoredCached();
}

export async function getContent(): Promise<SiteContent> {
  const stored = await readStoredCached();
  return stored ? mergeWithDefaults(stored.content) : defaultContent;
}

// 本機模式的舊版放 .local-content（不進 git），避免 repo 塞滿歷史檔
const LOCAL_HISTORY = path.join(process.cwd(), ".local-content", "content-history");

export type ContentVersion = { id: string; savedAt: number };

async function listBlobVersions() {
  const { blobs } = await list({ prefix: CONTENT_PREFIX, limit: 100 });
  return blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));
}

// 回傳由新到舊，第一筆就是目前網站正在用的版本
export async function listContentVersions(): Promise<ContentVersion[]> {
  if (isBlobEnabled()) {
    return (await listBlobVersions()).map((b) => ({
      id: b.pathname,
      savedAt: new Date(b.uploadedAt).getTime(),
    }));
  }
  const versions: ContentVersion[] = [];
  const current = await readSnapshot();
  if (current?.updatedAt) versions.push({ id: "current", savedAt: current.updatedAt });
  try {
    const files = await fs.readdir(LOCAL_HISTORY);
    for (const f of files) {
      const t = Number(f.replace(/\.json$/, ""));
      if (t) versions.push({ id: f, savedAt: t });
    }
  } catch {}
  return versions.sort((a, b) => b.savedAt - a.savedAt).slice(0, KEEP_VERSIONS);
}

export async function readContentVersion(id: string): Promise<Partial<SiteContent>> {
  if (isBlobEnabled()) {
    // id 只接受清單裡真的存在的檔案，不讓人拿任意網址來讀
    const blob = (await listBlobVersions()).find((b) => b.pathname === id);
    if (!blob) throw new Error("找不到這個版本，可能已被清除");
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) throw new Error(`讀取版本失敗：${res.status}`);
    return res.json();
  }
  if (id === "current") {
    const snap = await readSnapshot();
    if (!snap) throw new Error("找不到這個版本");
    return snap.content;
  }
  if (!/^\d+\.json$/.test(id)) throw new Error("版本代碼錯誤");
  const snap = JSON.parse(await fs.readFile(path.join(LOCAL_HISTORY, id), "utf-8"));
  if (!snap?.content) throw new Error("找不到這個版本");
  return snap.content;
}

async function archiveLocalSnapshot() {
  const current = await readSnapshot();
  if (!current?.updatedAt) return;
  await fs.mkdir(LOCAL_HISTORY, { recursive: true });
  await fs.writeFile(
    path.join(LOCAL_HISTORY, `${current.updatedAt}.json`),
    JSON.stringify(current),
    "utf-8"
  );
  const files = (await fs.readdir(LOCAL_HISTORY)).sort((a, b) => parseInt(b) - parseInt(a));
  // 目前版本本身也算一版，所以歷史只留 KEEP_VERSIONS - 1 份
  for (const f of files.slice(KEEP_VERSIONS - 1)) {
    await fs.rm(path.join(LOCAL_HISTORY, f), { force: true });
  }
}

export async function writeContent(content: SiteContent) {
  if (!isBlobEnabled()) {
    await archiveLocalSnapshot();
    await fs.mkdir(path.dirname(SNAPSHOT_FILE), { recursive: true });
    await fs.writeFile(
      SNAPSHOT_FILE,
      JSON.stringify({ updatedAt: Date.now(), content }, null, 2) + "\n",
      "utf-8"
    );
    return;
  }
  const json = JSON.stringify(content);
  await put(`${CONTENT_PREFIX}${Date.now()}.json`, json, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: true,
  });
  const stale = (await listBlobVersions()).slice(KEEP_VERSIONS);
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
