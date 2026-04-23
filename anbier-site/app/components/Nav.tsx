"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { key: "home", label: "首頁", en: "Home" },
  { key: "portfolio", label: "作品", en: "Works" },
  { key: "services", label: "服務", en: "Services" },
  { key: "about", label: "關於", en: "About" },
  { key: "contact", label: "聯絡", en: "Contact" },
];

function resolveHref(key: string, isHome: boolean) {
  if (key === "home") return "/";
  // 所有 section（包含作品）：在首頁就用 hash 滾動，不在首頁就跳回首頁 + 滾到對應 section
  return isHome ? `#${key}` : `/#${key}`;
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        scrolled || !isHome
          ? "bg-background/85 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-serif text-2xl tracking-[0.3em] text-foreground">
            AMB
          </span>
          <span className="text-[10px] tracking-[0.4em] text-muted group-hover:text-accent transition-colors">
            艾柏設計
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <Link
              key={l.key}
              href={resolveHref(l.key, isHome)}
              className="group relative text-sm tracking-wider text-foreground/80 hover:text-accent transition-colors"
            >
              {l.label}
              <span className="absolute -bottom-2 left-0 h-px w-0 bg-accent transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
          <Link
            href={isHome ? "#member" : "/#member"}
            className="px-5 py-2 text-xs tracking-[0.3em] border border-accent/40 text-accent hover:bg-accent hover:text-background transition-all duration-300"
          >
            會員登入
          </Link>
        </nav>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="toggle menu"
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
        >
          <span
            className={`block w-6 h-px bg-foreground transition-transform ${
              menuOpen ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block w-6 h-px bg-foreground transition-opacity ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-px bg-foreground transition-transform ${
              menuOpen ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-background/95 backdrop-blur border-t border-white/5"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {links.map((l) => (
                <Link
                  key={l.key}
                  href={resolveHref(l.key, isHome)}
                  onClick={() => setMenuOpen(false)}
                  className="text-base tracking-wider text-foreground/90 hover:text-accent"
                >
                  {l.label}
                  <span className="ml-3 text-xs text-muted">{l.en}</span>
                </Link>
              ))}
              <Link
                href={isHome ? "#member" : "/#member"}
                onClick={() => setMenuOpen(false)}
                className="mt-2 px-5 py-3 text-center text-xs tracking-[0.3em] border border-accent/40 text-accent"
              >
                會員登入
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
