// 把正式站後台（Vercel Blob）最新的內容抓回 content/site-content.json，
// 推送前跑一次，repo 就會跟正式站一致，下次部署不會用舊內容蓋掉後台的修改。
import { promises as fs } from "node:fs";
import path from "node:path";
import { list } from "@vercel/blob";

const ROOT = path.resolve(import.meta.dirname, "..");
const SNAPSHOT = path.join(ROOT, "content", "site-content.json");
// 正式站金鑰只放這裡（.vercel 已 gitignore，且 Next 不會讀它），避免本機開發誤寫正式資料
const ENV_FILE = path.join(ROOT, ".vercel", ".env.production.local");

async function loadToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  try {
    const text = await fs.readFile(ENV_FILE, "utf-8");
    const m = text.match(/^BLOB_READ_WRITE_TOKEN=["']?([^"'\r\n]+)/m);
    return m?.[1];
  } catch {
    return undefined;
  }
}

const token = await loadToken();
if (!token) {
  console.error(
    "找不到 BLOB_READ_WRITE_TOKEN。請先執行一次：\n" +
      "  vercel env pull .vercel/.env.production.local --environment=production"
  );
  process.exit(1);
}

const { blobs } = await list({ prefix: "content/site-", limit: 100, token });
if (blobs.length === 0) {
  console.log("正式站後台還沒存過內容，不用同步。");
  process.exit(0);
}
const latest = blobs.reduce((a, b) => (new Date(a.uploadedAt) > new Date(b.uploadedAt) ? a : b));
const blobTime = new Date(latest.uploadedAt).getTime();

let local = { updatedAt: 0 };
try {
  local = JSON.parse(await fs.readFile(SNAPSHOT, "utf-8"));
} catch {}

const fmt = (t) => (t ? new Date(t).toLocaleString("zh-TW") : "（無）");
if ((Number(local.updatedAt) || 0) >= blobTime) {
  console.log(`repo 內容已是最新（本機 ${fmt(local.updatedAt)} ≥ 正式站 ${fmt(blobTime)}），不用同步。`);
  process.exit(0);
}

const res = await fetch(latest.url, { cache: "no-store" });
if (!res.ok) throw new Error(`下載失敗：${res.status}`);
const content = await res.json();
await fs.mkdir(path.dirname(SNAPSHOT), { recursive: true });
await fs.writeFile(SNAPSHOT, JSON.stringify({ updatedAt: blobTime, content }, null, 2) + "\n", "utf-8");
console.log(`已同步正式站後台內容（${fmt(blobTime)}）→ content/site-content.json`);
