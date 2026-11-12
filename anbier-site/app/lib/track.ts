"use client";

// 前台事件回報：不用 cookie，只在訪客瀏覽器存一組隨機代碼來算「不重複訪客」
const VID_KEY = "amb-vid";
// 老大與員工登入後台後會被標記，自己逛網站不算進數據
export const NO_TRACK_KEY = "amb-no-track";

function safeGet(k: string) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}

export function trackingDisabled() {
  if (typeof window === "undefined") return true;
  return (
    safeGet(NO_TRACK_KEY) === "1" ||
    navigator.webdriver ||
    location.pathname.startsWith("/admin")
  );
}

export function visitorId() {
  let id = safeGet(VID_KEY);
  if (!id) {
    id = crypto.randomUUID().replace(/-/g, "");
    try {
      localStorage.setItem(VID_KEY, id);
    } catch {}
  }
  return id;
}

export function track(event: Record<string, unknown>) {
  if (trackingDisabled()) return;
  const body = JSON.stringify(event);
  // sendBeacon 在關分頁時也送得出去；不支援才退回 fetch keepalive
  if (navigator.sendBeacon?.("/api/track", body)) return;
  fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
}
