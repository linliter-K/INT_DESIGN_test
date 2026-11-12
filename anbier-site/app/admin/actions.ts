"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import {
  OWNER_ID,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  checkPassword,
  createSessionToken,
  isAdminConfigured,
} from "../lib/auth";
import { getAdminSession } from "../lib/session";
import {
  addUser,
  findUserByPassword,
  readUsers,
  removeUser,
  setUserActive,
  toView,
  touchLogin,
} from "../lib/admin-users";
import { CONTENT_TAG, writeContent } from "../lib/content/store";
import type { SiteContent } from "../lib/content/types";
import { listInquiries, deleteInquiry } from "../lib/inquiries";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("未登入或登入已過期，請重新登入");
  return session;
}

async function requireOwner() {
  const session = await requireAdmin();
  if (!session.isOwner) throw new Error("只有管理者可以管理帳號");
  return session;
}

export async function login(_prev: string | null, formData: FormData) {
  if (!isAdminConfigured()) return "伺服器尚未設定 ADMIN_PASSWORD";
  const password = String(formData.get("password") ?? "");
  let uid: string | null = null;
  if (await checkPassword(password)) {
    uid = OWNER_ID;
  } else if (password) {
    const user = await findUserByPassword(password);
    if (user) {
      uid = user.id;
      await touchLogin(user.id).catch(() => {});
    }
  }
  if (!uid) {
    // 拖慢暴力破解
    await new Promise((r) => setTimeout(r, 1000));
    return "密碼錯誤";
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(uid), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/");
}

export async function saveContent(content: SiteContent) {
  await requireAdmin();
  if (!content || !Array.isArray(content.projects) || !content.hero) {
    throw new Error("內容格式錯誤");
  }
  const ids = content.projects.map((p) => p.id);
  if (ids.some((id) => !/^[a-z0-9-]+$/.test(id))) {
    throw new Error("作品網址代碼只能用小寫英文、數字與 -");
  }
  if (new Set(ids).size !== ids.length) throw new Error("作品網址代碼重複");

  await writeContent(content);
  updateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
  return { savedAt: Date.now() };
}

export async function fetchInquiries() {
  await requireAdmin();
  return listInquiries();
}

export async function removeInquiry(id: string) {
  await requireAdmin();
  await deleteInquiry(id);
}

export async function fetchAdminUsers() {
  await requireOwner();
  return (await readUsers()).map(toView);
}

export async function createAdminUser(name: string, password: string) {
  await requireOwner();
  const cleanName = String(name ?? "").trim().slice(0, 30);
  const pw = String(password ?? "");
  if (!cleanName) throw new Error("請輸入員工名稱");
  if (pw.length < 8) throw new Error("密碼至少 8 個字元");
  if (await checkPassword(pw)) throw new Error("不能跟管理者密碼相同");
  return addUser(cleanName, pw);
}

export async function toggleAdminUser(id: string, active: boolean) {
  await requireOwner();
  await setUserActive(String(id), Boolean(active));
}

export async function deleteAdminUser(id: string) {
  await requireOwner();
  await removeUser(String(id));
}
