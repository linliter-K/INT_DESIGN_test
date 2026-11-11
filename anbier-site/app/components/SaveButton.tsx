"use client";

import { Heart } from "lucide-react";
import { MOODBOARD_MAX, useMoodboard, type MoodItem } from "../lib/moodboard";

export default function SaveButton({
  item,
  className = "absolute top-4 right-4",
}: {
  item: MoodItem;
  className?: string;
}) {
  const { has, toggle, items } = useMoodboard();
  const saved = has(item.image);
  const full = !saved && items.length >= MOODBOARD_MAX;

  return (
    <button
      type="button"
      onClick={(e) => {
        // 按鈕常疊在連結或可放大的圖片上，不能讓點擊穿透
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      disabled={full}
      aria-pressed={saved}
      title={saved ? "從參考清單移除" : full ? `參考清單最多 ${MOODBOARD_MAX} 張` : "加入參考清單"}
      aria-label={saved ? "從參考清單移除" : "加入參考清單"}
      className={`${className} z-10 w-10 h-10 grid place-items-center rounded-full backdrop-blur-sm transition-all duration-300 disabled:opacity-40 ${
        saved
          ? "bg-accent text-background"
          : "bg-background/50 text-foreground/90 hover:bg-background/80 hover:text-accent"
      }`}
    >
      <Heart size={17} strokeWidth={1.5} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
