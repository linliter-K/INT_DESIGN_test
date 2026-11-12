// 把正式站後台最新的內容抓回 content/site-content.json，
// 推送前跑一次，repo 就會跟正式站一致，下次部署不會用舊內容蓋掉後台的修改。
// 正式站的 Blob 金鑰被 Vercel 標成敏感、下載不了，所以改從正式站的公開讀取網址抓
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SNAPSHOT = path.join(ROOT, "content", "site-content.json");
const SITE = process.env.SITE_URL || "https://int-design-test.vercel.app";

const res = await fetch(`${SITE}/api/content`, { cache: "no-store" });
if (!res.ok) {
  console.error(`讀取正式站內容失敗：${res.status}（正式站是否已部署 /api/content？）`);
  process.exit(1);
}
const remote = await res.json();
if (!remote?.content) {
  console.log("正式站後台還沒存過內容，不用同步。");
  process.exit(0);
}
const remoteTime = Number(remote.updatedAt) || 0;

let local = { updatedAt: 0 };
try {
  local = JSON.parse(await fs.readFile(SNAPSHOT, "utf-8"));
} catch {}

const fmt = (t) => (t ? new Date(t).toLocaleString("zh-TW") : "（無）");
if ((Number(local.updatedAt) || 0) >= remoteTime) {
  console.log(`repo 內容已是最新（本機 ${fmt(local.updatedAt)} ≥ 正式站 ${fmt(remoteTime)}），不用同步。`);
  process.exit(0);
}

await fs.mkdir(path.dirname(SNAPSHOT), { recursive: true });
await fs.writeFile(
  SNAPSHOT,
  JSON.stringify({ updatedAt: remoteTime, content: remote.content }, null, 2) + "\n",
  "utf-8"
);
console.log(`已同步正式站後台內容（${fmt(remoteTime)}）→ content/site-content.json`);
