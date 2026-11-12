"use client";

import { useSyncExternalStore } from "react";
import type { RefKind } from "./content/catalog";
import { track } from "./track";

export type MoodItem = {
  kind: RefKind;
  image: string;
  title: string;
  subtitle?: string;
  href: string;
};

export const MOODBOARD_MAX = 30;
const KEY = "amb-moodboard";
const EMPTY: MoodItem[] = [];

// 存在訪客自己的瀏覽器：不用註冊會員，關掉分頁再回來清單也還在
let cache: MoodItem[] | null = null;
const listeners = new Set<() => void>();

function read(): MoodItem[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function write(items: MoodItem[]) {
  cache = items;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // 無痕模式等情況存不進去，至少這次瀏覽期間還能用
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // 同一位訪客開多個分頁時保持同步
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useMoodboard() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    items,
    has: (image: string) => items.some((i) => i.image === image),
    toggle(item: MoodItem) {
      const current = read();
      if (current.some((i) => i.image === item.image)) {
        write(current.filter((i) => i.image !== item.image));
        return false;
      }
      if (current.length >= MOODBOARD_MAX) return false;
      write([...current, item]);
      // 只記「加入」，取消不扣分：要知道的是客人「曾經喜歡過」哪些
      track({ t: "save", image: item.image, title: item.title, kind: item.kind, href: item.href });
      return true;
    },
    remove: (image: string) => write(read().filter((i) => i.image !== image)),
    clear: () => write([]),
  };
}
