import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "../lib/auth";
import { isBlobEnabled, readContentUncached } from "../lib/content/store";
import AdminEditor from "./editor/AdminEditor";

export const metadata = {
  title: "後台 | AMB",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const store = await cookies();
  if (!(await verifySessionToken(store.get(SESSION_COOKIE)?.value))) {
    redirect("/admin/login");
  }
  // 後台一定要讀最新版，不能吃到前台的快取
  const content = await readContentUncached();
  return (
    <AdminEditor initial={content} storageMode={isBlobEnabled() ? "blob" : "local"} />
  );
}
