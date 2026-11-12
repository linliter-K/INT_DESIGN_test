import { redirect } from "next/navigation";
import { getAdminSession } from "../lib/session";
import { isBlobEnabled, readContentUncached } from "../lib/content/store";
import AdminEditor from "./editor/AdminEditor";

export const metadata = {
  title: "後台 | AMB",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  // 後台一定要讀最新版，不能吃到前台的快取
  const content = await readContentUncached();
  return (
    <AdminEditor
      initial={content}
      storageMode={isBlobEnabled() ? "blob" : "local"}
      session={session}
      emailConfigured={Boolean(process.env.RESEND_API_KEY && process.env.INQUIRY_NOTIFY_EMAIL)}
    />
  );
}
