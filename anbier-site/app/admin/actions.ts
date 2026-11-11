"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  checkPassword,
  createSessionToken,
  isAdminConfigured,
  verifySessionToken,
} from "../lib/auth";
import { CONTENT_TAG, writeContent } from "../lib/content/store";
import type { SiteContent } from "../lib/content/types";

async function requireAdmin() {
  const store = await cookies();
  if (!(await verifySessionToken(store.get(SESSION_COOKIE)?.value))) {
    throw new Error("未登入或登入已過期，請重新登入");
  }
}

export async function login(_prev: string | null, formData: FormData) {
  if (!isAdminConfigured()) return "伺服器尚未設定 ADMIN_PASSWORD";
  const password = String(formData.get("password") ?? "");
  if (!(await checkPassword(password))) {
    // 拖慢暴力破解
    await new Promise((r) => setTimeout(r, 1000));
    return "密碼錯誤";
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), {
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
