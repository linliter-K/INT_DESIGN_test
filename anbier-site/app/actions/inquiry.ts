"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { getContent } from "../lib/content/store";
import { KIND_LABEL, type RefKind } from "../lib/content/catalog";
import { recordEvent } from "../lib/analytics";
import { saveInquiry, sendInquiryEmail, type Inquiry, type InquiryRef } from "../lib/inquiries";

const MAX_REFS = 30;

function str(v: unknown, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function submitInquiry(input: {
  name: string;
  phone: string;
  email: string;
  size: string;
  budget?: string;
  services: string[];
  message: string;
  refs: InquiryRef[];
  website?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  // 蜜罐欄位：真人看不到也不會填，機器人會
  if (input.website) return { ok: true };

  const name = str(input.name, 60);
  const phone = str(input.phone, 30);
  const email = str(input.email, 120);
  if (!name || !phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "請填寫姓名、電話與正確的 Email" };
  }

  // 只接受網站上真的存在的圖片，避免有人塞外部連結進來寄到你信箱
  const content = await getContent();
  const known = new Set<string>([
    ...content.projects.flatMap((p) => [p.cover, ...p.gallery]),
    ...content.materials.items.map((m) => m.image),
    ...content.furnishings.items.map((m) => m.image),
  ]);
  const refs = (Array.isArray(input.refs) ? input.refs : [])
    .filter((r) => r && known.has(r.image))
    .slice(0, MAX_REFS)
    .map((r) => ({
      kind: (Object.hasOwn(KIND_LABEL, r.kind) ? r.kind : "project") as RefKind,
      image: r.image,
      title: str(r.title, 80),
      subtitle: str(r.subtitle, 80),
      href: typeof r.href === "string" && r.href.startsWith("/") ? r.href.slice(0, 200) : "/",
    }));

  const inquiry: Inquiry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    name,
    phone,
    email,
    size: str(input.size, 100),
    // 單位固定是「萬」，只留數字與區間符號，避免客戶自己再打「萬」或「元」變成「200萬 萬」
    budget: str(input.budget, 30)
      .replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xfee0))
      .replace(/[～~—–至到]/g, "-")
      .replace(/[^\d.\-]/g, ""),
    services: (Array.isArray(input.services) ? input.services : []).map((s) => str(s, 30)).filter(Boolean).slice(0, 10),
    message: str(input.message, 3000),
    refs,
  };

  try {
    await saveInquiry(inquiry);
  } catch (e) {
    console.error("儲存詢問失敗", e);
    return { ok: false, error: "送出失敗，請稍後再試或直接來電" };
  }

  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  // 寄信放到回應之後做，客戶不用等 Email 服務
  after(async () => {
    const result = await sendInquiryEmail(inquiry, origin).catch((e) => ({ sent: false, reason: String(e) }));
    if (!result.sent) console.warn("詢問通知信未寄出：", result.reason);
    await recordEvent({ t: "inquiry" }).catch(() => {});
  });

  return { ok: true };
}
