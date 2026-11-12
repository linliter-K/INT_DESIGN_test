import { cookies } from "next/headers";
import { OWNER_ID, SESSION_COOKIE, verifySessionToken } from "./auth";
import { getUserName, isUserActive } from "./admin-users";

export type AdminSession = { uid: string; name: string; isOwner: boolean };

// 完整驗證：簽章 + 員工帳號仍啟用中（停用後舊 cookie 立即失效）
export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const uid = await verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!uid) return null;
  if (uid === OWNER_ID) return { uid, name: "管理者", isOwner: true };
  if (!(await isUserActive(uid))) return null;
  return { uid, name: (await getUserName(uid)) ?? "員工", isOwner: false };
}
