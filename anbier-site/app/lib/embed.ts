// 後台可能貼網址，也可能整段 <iframe ...> 嵌入碼，兩種都接受；
// 只放行 https，避免 javascript: 之類的網址被塞進 iframe
export function normalizeEmbedUrl(input: string | undefined | null): string {
  const raw = String(input ?? "").trim();
  if (!raw) return "";
  const fromIframe = raw.match(/src\s*=\s*["']([^"']+)["']/i)?.[1];
  const candidate = (fromIframe ?? raw).replace(/&amp;/g, "&");
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}
