import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "../../../lib/auth";
import { saveImage } from "../../../lib/content/store";

// Vercel Function 請求上限約 4.5MB；前端會先壓縮，這裡再擋一次
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  const store = await cookies();
  if (!(await verifySessionToken(store.get(SESSION_COOKIE)?.value))) {
    return Response.json({ error: "未登入" }, { status: 401 });
  }

  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "沒有收到檔案" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "檔案超過 4MB" }, { status: 413 });
  }

  try {
    return Response.json({ url: await saveImage(file) });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
