import { getStoredSnapshot } from "../../lib/content/store";

// 網站文字圖片本來就公開顯示，所以這裡不用金鑰；詢問、員工帳號不在這份資料裡。
// 走快取版本：後台儲存時會清快取，所以抓到的永遠是最新，又不會讓人狂刷 Blob 用量
export async function GET() {
  const stored = await getStoredSnapshot();
  return Response.json(stored ?? { updatedAt: 0, content: null }, {
    headers: { "Cache-Control": "no-store" },
  });
}
