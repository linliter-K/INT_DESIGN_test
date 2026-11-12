// 只用 Web Crypto，讓 proxy 與 Route Handler 都能共用同一份驗證邏輯
export const SESSION_COOKIE = "amb_admin";
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 小時

const encoder = new TextEncoder();

function secret() {
  // 沒另外設 secret 就用密碼本身當 key；改密碼時所有舊登入也會一併失效
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

async function hmac(data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Buffer.from(sig).toString("base64url");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // 比較雜湊而非原文，長度不同時也不會因提早結束而洩漏資訊
  return safeEqual(await hmac(input), await hmac(expected));
}

export const OWNER_ID = "owner";

// token 帶上帳號 id，才知道是誰登入、停用員工時能立刻擋下
export async function createSessionToken(uid: string) {
  const exp = String(Date.now() + SESSION_MAX_AGE * 1000);
  return `${uid}.${exp}.${await hmac(`${uid}.${exp}`)}`;
}

// 只驗簽章與期限（proxy 也能用）；員工是否被停用由 lib/session.ts 再查
export async function verifySessionToken(token: string | undefined): Promise<string | null> {
  if (!token || !isAdminConfigured()) return null;
  const [uid, exp, sig] = token.split(".");
  if (!uid || !exp || !sig || !/^[a-z0-9]+$/.test(uid) || Number(exp) < Date.now()) return null;
  return safeEqual(sig, await hmac(`${uid}.${exp}`)) ? uid : null;
}
