"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";
import { useMoodboard } from "../lib/moodboard";
import { KIND_LABEL } from "../lib/content/catalog";

export default function MoodboardDock() {
  const pathname = usePathname();
  const { items, remove, clear } = useMoodboard();
  const [open, setOpen] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  // 聯絡表單本身就會顯示清單，浮動按鈕在那裡只會擋住「送出詢問」
  useEffect(() => {
    const el = document.getElementById("contact");
    if (!el) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContactVisible(false);
      return;
    }
    const io = new IntersectionObserver(([e]) => setContactVisible(e.isIntersecting), {
      threshold: 0.15,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [pathname]);

  if (pathname.startsWith("/admin") || items.length === 0) return null;

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={contactVisible ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
        style={{ pointerEvents: contactVisible ? "none" : "auto" }}
        onClick={() => setOpen(true)}
        className="fixed z-40 right-5 md:right-8 bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] flex items-center gap-3 pl-4 pr-5 py-3 bg-accent text-background shadow-lg shadow-black/40"
      >
        <Heart size={16} fill="currentColor" />
        <span className="text-xs tracking-[0.25em]">參考清單</span>
        <motion.span
          key={items.length}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          className="min-w-6 h-6 px-1.5 grid place-items-center rounded-full bg-background text-accent text-xs"
        >
          {items.length}
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[70] bg-black/60"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed z-[71] top-0 right-0 h-full w-full max-w-md bg-surface border-l border-white/10 flex flex-col"
            >
              <header className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                <div>
                  <div className="text-[10px] tracking-[0.4em] text-accent mb-1">MOOD BOARD</div>
                  <h2 className="font-serif text-2xl">參考清單（{items.length}）</h2>
                </div>
                <button onClick={() => setOpen(false)} aria-label="關閉" className="p-2 text-foreground/60 hover:text-accent">
                  <X size={22} strokeWidth={1.25} />
                </button>
              </header>

              <p className="px-6 pt-4 text-xs text-foreground/50 leading-relaxed">
                送出詢問時，這些圖片會一起附上，讓我們更快了解你喜歡的風格。
              </p>

              <div className="flex-1 overflow-y-auto px-6 py-4 grid grid-cols-2 gap-3 content-start">
                {items.map((it) => (
                  <div key={it.image} className="group relative bg-background">
                    <Link href={it.href} onClick={() => setOpen(false)} className="block">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {/* 清單圖片數量少且來源混雜，用原生 img 即可 */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={it.image} alt={it.title} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                      <div className="px-2 py-2">
                        <div className="text-xs truncate">{it.title}</div>
                        <div className="text-[10px] text-foreground/40 truncate">
                          {KIND_LABEL[it.kind] ?? "作品"}
                          {it.subtitle ? ` · ${it.subtitle}` : ""}
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={() => remove(it.image)}
                      aria-label="移除"
                      className="absolute top-1.5 right-1.5 w-7 h-7 grid place-items-center rounded-full bg-background/80 text-foreground/80 hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <footer className="px-6 py-5 border-t border-white/10 space-y-3 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
                <Link
                  href="/#contact"
                  onClick={() => setOpen(false)}
                  className="block text-center py-4 text-sm tracking-[0.3em] bg-accent text-background hover:opacity-90"
                >
                  附上清單，預約諮詢 →
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm("確定清空參考清單？")) clear();
                  }}
                  className="w-full text-xs text-foreground/40 hover:text-foreground/70"
                >
                  清空清單
                </button>
              </footer>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
