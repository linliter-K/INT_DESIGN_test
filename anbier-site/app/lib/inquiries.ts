import { promises as fs } from "fs";
import path from "path";
import { put, list, del } from "@vercel/blob";
import { isBlobEnabled } from "./content/store";
import { KIND_LABEL, type RefKind } from "./content/catalog";

export type InquiryRef = {
  kind: RefKind;
  image: string;
  title: string;
  subtitle?: string;
  href: string;
};

export type Inquiry = {
  id: string;
  createdAt: number;
  name: string;
  phone: string;
  email: string;
  size: string;
  services: string[];
  message: string;
  refs: InquiryRef[];
};

const PREFIX = "inquiries/";
const LOCAL_DIR = path.join(process.cwd(), ".local-content", "inquiries");

export async function saveInquiry(inquiry: Inquiry) {
  const json = JSON.stringify(inquiry);
  if (!isBlobEnabled()) {
    await fs.mkdir(LOCAL_DIR, { recursive: true });
    await fs.writeFile(path.join(LOCAL_DIR, `${inquiry.id}.json`), json, "utf-8");
    return;
  }
  // 隨機尾碼讓網址無法被猜到（內含客戶電話與 Email）
  await put(`${PREFIX}${inquiry.id}.json`, json, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: true,
  });
}

export async function listInquiries(): Promise<Inquiry[]> {
  if (!isBlobEnabled()) {
    try {
      const files = await fs.readdir(LOCAL_DIR);
      const all = await Promise.all(
        files.map(async (f) => JSON.parse(await fs.readFile(path.join(LOCAL_DIR, f), "utf-8")))
      );
      return all.sort((a, b) => b.createdAt - a.createdAt);
    } catch {
      return [];
    }
  }
  const { blobs } = await list({ prefix: PREFIX, limit: 1000 });
  const all = await Promise.all(
    blobs.map(async (b) => {
      const res = await fetch(b.url, { cache: "no-store" });
      return res.ok ? ((await res.json()) as Inquiry) : null;
    })
  );
  return all
    .filter((x): x is Inquiry => x !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteInquiry(id: string) {
  if (!/^[\w-]+$/.test(id)) throw new Error("id 格式錯誤");
  if (!isBlobEnabled()) {
    await fs.rm(path.join(LOCAL_DIR, `${id}.json`), { force: true });
    return;
  }
  const { blobs } = await list({ prefix: `${PREFIX}${id}` });
  if (blobs.length) await del(blobs.map((b) => b.url));
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// 用 Resend REST API 直接寄，不額外裝 SDK；未設定金鑰就略過（後台收件匣照樣有紀錄）
export async function sendInquiryEmail(inquiry: Inquiry, origin: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_NOTIFY_EMAIL;
  if (!apiKey || !to) return { sent: false, reason: "未設定 RESEND_API_KEY / INQUIRY_NOTIFY_EMAIL" };

  const abs = (u: string) => (u.startsWith("/") ? origin + u : u);
  const row = (k: string, v: string) =>
    v
      ? `<tr><td style="padding:6px 16px 6px 0;color:#888;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0;white-space:pre-wrap">${esc(v)}</td></tr>`
      : "";
  const refs = inquiry.refs
    .map(
      (r) => `<td style="padding:6px;width:50%;vertical-align:top">
        <a href="${esc(abs(r.href))}"><img src="${esc(abs(r.image))}" width="260" style="width:100%;max-width:260px;display:block;border:0" alt=""></a>
        <div style="font-size:13px;margin-top:4px">${esc(r.title)}</div>
        <div style="font-size:11px;color:#888">${KIND_LABEL[r.kind] ?? "作品"}${r.subtitle ? " · " + esc(r.subtitle) : ""}</div>
      </td>`
    )
    .reduce<string[]>((rows, cell, i) => {
      if (i % 2 === 0) rows.push(cell);
      else rows[rows.length - 1] += cell;
      return rows;
    }, [])
    .map((r) => `<tr>${r}</tr>`)
    .join("");

  const html = `<div style="font-family:-apple-system,'Noto Sans TC',sans-serif;color:#222;max-width:600px">
    <h2 style="font-weight:400">新詢問：${esc(inquiry.name)}</h2>
    <table style="font-size:14px;border-collapse:collapse">
      ${row("姓名", inquiry.name)}${row("電話", inquiry.phone)}${row("Email", inquiry.email)}
      ${row("坪數 / 地區", inquiry.size)}${row("服務項目", inquiry.services.join("、"))}${row("需求說明", inquiry.message)}
    </table>
    ${inquiry.refs.length ? `<h3 style="font-weight:400;margin-top:28px">參考清單（${inquiry.refs.length} 張）</h3><table style="width:100%;border-collapse:collapse">${refs}</table>` : ""}
    <p style="font-size:12px;color:#888;margin-top:28px">完整紀錄可在網站後台「詢問」分頁查看：${esc(origin)}/admin</p>
  </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.INQUIRY_FROM_EMAIL || "AMB 官網 <onboarding@resend.dev>",
      to: to.split(",").map((s) => s.trim()),
      // 直接按回覆就能回給客戶
      reply_to: inquiry.email,
      subject: `【官網詢問】${inquiry.name}${inquiry.refs.length ? `（附 ${inquiry.refs.length} 張參考圖）` : ""}`,
      html,
    }),
  });
  if (!res.ok) return { sent: false, reason: `Resend ${res.status}: ${await res.text()}` };
  return { sent: true };
}
