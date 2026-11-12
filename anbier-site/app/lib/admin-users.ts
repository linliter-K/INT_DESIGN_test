import { promises as fs } from "fs";
import path from "path";
import { put, list, del } from "@vercel/blob";
import { isBlobEnabled } from "./content/store";

// 員工帳號：只存加鹽雜湊，不存密碼原文；擁有者（老大）的密碼仍是 Vercel 的 ADMIN_PASSWORD
export type AdminUser = {
  id: string;
  name: string;
  salt: string;
  hash: string;
  active: boolean;
  createdAt: number;
  lastLoginAt?: number;
};

export type AdminUserView = Omit<AdminUser, "salt" | "hash">;

const PREFIX = "admin/users-";
// 帳號檔不進 git（含密碼雜湊），本機只放 gitignore 的 .local-content
const LOCAL_FILE = path.join(process.cwd(), ".local-content", "admin-users.json");
const ITERATIONS = 210_000;
const encoder = new TextEncoder();

export async function readUsers(): Promise<AdminUser[]> {
  if (!isBlobEnabled()) {
    try {
      return JSON.parse(await fs.readFile(LOCAL_FILE, "utf-8"));
    } catch {
      return [];
    }
  }
  const { blobs } = await list({ prefix: PREFIX, limit: 100 });
  if (!blobs.length) return [];
  const latest = blobs.reduce((a, b) => (new Date(a.uploadedAt) > new Date(b.uploadedAt) ? a : b));
  const res = await fetch(latest.url, { cache: "no-store" });
  if (!res.ok) throw new Error(`讀取帳號失敗：${res.status}`);
  return res.json();
}

async function writeUsers(users: AdminUser[]) {
  const json = JSON.stringify(users);
  if (!isBlobEnabled()) {
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await fs.writeFile(LOCAL_FILE, json, "utf-8");
    return;
  }
  // 隨機尾碼讓網址猜不到；每次寫新檔再刪舊檔，避免 CDN 吃到舊版
  const saved = await put(`${PREFIX}${Date.now()}.json`, json, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: true,
  });
  const { blobs } = await list({ prefix: PREFIX, limit: 100 });
  const stale = blobs.filter((b) => b.url !== saved.url).map((b) => b.url);
  if (stale.length) await del(stale);
}

async function derive(password: string, salt: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: Buffer.from(salt, "base64url"), iterations: ITERATIONS },
    key,
    256
  );
  return Buffer.from(bits).toString("base64url");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function matches(user: AdminUser, password: string) {
  return safeEqual(await derive(password, user.salt), user.hash);
}

export function toView(u: AdminUser): AdminUserView {
  return { id: u.id, name: u.name, active: u.active, createdAt: u.createdAt, lastLoginAt: u.lastLoginAt };
}

// 登入只輸入密碼，所以用密碼反查是哪位員工
export async function findUserByPassword(password: string) {
  const users = await readUsers();
  for (const u of users) {
    if (u.active && (await matches(u, password))) return u;
  }
  return null;
}

export async function touchLogin(id: string) {
  const users = await readUsers();
  const u = users.find((x) => x.id === id);
  if (!u) return;
  u.lastLoginAt = Date.now();
  await writeUsers(users);
}

export async function isUserActive(id: string) {
  return (await readUsers()).some((u) => u.id === id && u.active);
}

export async function getUserName(id: string) {
  return (await readUsers()).find((u) => u.id === id)?.name ?? null;
}

export async function addUser(name: string, password: string) {
  const users = await readUsers();
  // 密碼就是身分，不能跟別人撞，否則登入時分不出是誰
  for (const u of users) {
    if (await matches(u, password)) throw new Error("這組密碼已經有人在用，請換一組");
  }
  const salt = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64url");
  const user: AdminUser = {
    id: `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name,
    salt,
    hash: await derive(password, salt),
    active: true,
    createdAt: Date.now(),
  };
  await writeUsers([...users, user]);
  return toView(user);
}

export async function setUserActive(id: string, active: boolean) {
  const users = await readUsers();
  const u = users.find((x) => x.id === id);
  if (!u) throw new Error("找不到這個帳號");
  u.active = active;
  await writeUsers(users);
}

export async function removeUser(id: string) {
  const users = await readUsers();
  await writeUsers(users.filter((u) => u.id !== id));
}
