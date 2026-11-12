"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track, trackingDisabled, visitorId } from "../lib/track";

// 掛在 layout，負責瀏覽數、停留時間與點擊；加入參考清單的事件在 moodboard.ts 送
export default function Analytics() {
  const pathname = usePathname();
  const firstView = useRef(true);

  // 瀏覽數 + 停留時間：只算分頁在前景的時間
  useEffect(() => {
    if (trackingDisabled()) return;
    track({
      t: "pv",
      path: pathname,
      vid: visitorId(),
      // 只有進站第一頁的 referrer 有意義，站內換頁不算來源
      ref: firstView.current ? document.referrer : "",
      device: matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop",
    });
    firstView.current = false;

    let visibleSince: number | null = document.visibilityState === "visible" ? Date.now() : null;
    const flush = () => {
      if (visibleSince === null) return;
      const sec = (Date.now() - visibleSince) / 1000;
      visibleSince = null;
      if (sec >= 1) track({ t: "dur", path: pathname, sec });
    };
    // 手機切到背景時不一定會觸發 pagehide，所以以「變成背景」為準先送一段
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
      else visibleSince = Date.now();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [pathname]);

  // 點擊：連結與按鈕都記；可用 data-track 指定比較好讀的名稱
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (trackingDisabled()) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track], a, button");
      if (!el || el.closest("form input, form textarea")) return;
      const text = (el.dataset.track || el.getAttribute("aria-label") || el.textContent || "")
        .replace(/\s+/g, " ")
        .trim();
      const label = text.slice(0, 30) || el.getAttribute("href") || "";
      if (label) track({ t: "click", label });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
