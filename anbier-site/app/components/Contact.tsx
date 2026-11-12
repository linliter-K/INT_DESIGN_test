"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import RichText from "./RichText";
import { useMoodboard } from "../lib/moodboard";
import { submitInquiry } from "../actions/inquiry";
import type { SiteContent } from "../lib/content/types";

export default function Contact({
  contact,
}: {
  contact: SiteContent["contact"];
}) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, startSending] = useTransition();
  const { items: refs, remove, clear } = useMoodboard();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startSending(async () => {
      const res = await submitInquiry({
        name: String(fd.get("name") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        email: String(fd.get("email") ?? ""),
        size: String(fd.get("size") ?? ""),
        budget: String(fd.get("budget") ?? ""),
        services: fd.getAll("service").map(String),
        message: String(fd.get("message") ?? ""),
        website: String(fd.get("website") ?? ""),
        refs,
      }).catch(() => ({ ok: false as const, error: "網路連線異常，請稍後再試" }));
      if (res.ok) {
        // 表單留在原位並清空，成功訊息改用彈窗，關掉後還能再填一筆
        formRef.current?.reset();
        setSubmitted(true);
        clear();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <section id="contact" className="py-28 lg:py-40 px-6 lg:px-12 bg-surface">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-5"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="h-px w-10 bg-accent" />
            <span className="text-accent text-xs tracking-[0.5em]">
              {contact.kicker}
            </span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-light leading-[1.1] mb-8">
            <RichText text={contact.title} />
          </h2>
          <p className="text-foreground/70 leading-relaxed mb-12">
            {contact.intro}
          </p>

          <div className="space-y-6 text-sm">
            <div>
              <div className="text-[10px] tracking-[0.4em] text-accent mb-2">
                STUDIO
              </div>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                {contact.address}
              </p>
            </div>
            <div>
              <div className="text-[10px] tracking-[0.4em] text-accent mb-2">
                CONTACT
              </div>
              <p className="text-foreground/80">{contact.phone}</p>
              <p className="text-foreground/80">{contact.email}</p>
            </div>
            <div>
              <div className="text-[10px] tracking-[0.4em] text-accent mb-2">
                HOURS
              </div>
              {contact.hours.map((h, i) => (
                <p key={i} className="text-foreground/80">
                  {h}
                </p>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="lg:col-span-7 lg:pl-12 lg:border-l border-white/10"
        >
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="姓名 *" name="name" required />
                <Field label="聯絡電話 *" name="phone" type="tel" required />
              </div>
              <Field label="Email *" name="email" type="email" required />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field
                  label="預計坪數 / 地區"
                  name="size"
                  placeholder="例：35 坪 / 台北信義"
                />
                <div>
                  <label className="block text-[10px] tracking-[0.4em] text-accent mb-3">
                    預算
                  </label>
                  <div className="flex items-baseline border-b border-white/20 focus-within:border-accent transition-colors">
                    <input
                      name="budget"
                      inputMode="numeric"
                      placeholder="例：200 或 150-250"
                      className="flex-1 min-w-0 bg-transparent outline-none py-3 text-foreground"
                    />
                    <span className="pl-3 text-sm text-foreground/60">萬</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.4em] text-accent mb-3">
                  服務項目
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "住宅設計",
                    "商業空間",
                    "設計諮詢",
                    "統包工程",
                    "其他",
                  ].map((opt) => (
                    <label
                      key={opt}
                      className="cursor-pointer px-4 py-2 text-xs border border-white/15 hover:border-accent transition-colors has-[:checked]:bg-accent has-[:checked]:text-background has-[:checked]:border-accent"
                    >
                      <input
                        type="checkbox"
                        name="service"
                        value={opt}
                        className="sr-only"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.4em] text-accent mb-3">
                  需求說明
                </label>
                <textarea
                  name="message"
                  rows={5}
                  className="w-full bg-transparent border-b border-white/20 focus:border-accent outline-none py-3 text-foreground resize-none transition-colors"
                  placeholder="告訴我們一些關於你的空間與期待…"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="block text-[10px] tracking-[0.4em] text-accent">
                    參考清單{refs.length > 0 && `（${refs.length} 張，將一併附上）`}
                  </span>
                </div>
                {refs.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {refs.map((r) => (
                      <div key={r.image} className="group relative aspect-square bg-background overflow-hidden" title={r.title}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.image} alt={r.title} className="absolute inset-0 w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => remove(r.image)}
                          aria-label={`移除 ${r.title}`}
                          className="absolute top-1 right-1 w-6 h-6 grid place-items-center rounded-full bg-background/80 text-foreground/80 hover:text-red-400"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-foreground/50 leading-relaxed border border-dashed border-white/15 px-4 py-4 flex items-center gap-2 flex-wrap">
                    <Heart size={14} className="text-accent shrink-0" />
                    瀏覽
                    <Link href="/projects" className="text-accent hover:underline">作品</Link>
                    或
                    <Link href="/materials" className="text-accent hover:underline">材質</Link>
                    時點愛心，喜歡的圖片會出現在這裡，讓我們更快抓到你要的風格。
                  </p>
                )}
              </div>

              {/* 蜜罐欄位，擋垃圾機器人 */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={sending}
                className="group relative px-10 py-4 disabled:opacity-60 overflow-hidden border border-accent text-sm tracking-[0.3em] w-full md:w-auto"
              >
                <span className="relative z-10 group-hover:text-background transition-colors duration-500">
                  {sending ? "送出中…" : "送出詢問"}
                </span>
                <span className="absolute inset-0 bg-accent -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              </button>
            </form>
        </motion.div>
      </div>
      <SuccessDialog
        open={submitted}
        title={contact.successTitle}
        text={contact.successText}
        onClose={() => setSubmitted(false)}
      />
    </section>
  );
}

function SuccessDialog({
  open,
  title,
  text,
  onClose,
}: {
  open: boolean;
  title: string;
  text: string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-6"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiry-success-title"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-surface border border-accent/30 px-8 py-12 text-center shadow-2xl"
          >
            <button
              onClick={onClose}
              aria-label="關閉"
              className="absolute top-3 right-3 p-2 text-foreground/40 hover:text-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="block mx-auto mb-6 h-px w-10 bg-accent" />
            <div id="inquiry-success-title" className="font-serif text-3xl text-accent mb-4">
              {title}
            </div>
            <p className="text-foreground/70 leading-relaxed">{text}</p>
            <button
              ref={closeRef}
              onClick={onClose}
              className="mt-10 px-10 py-3 text-xs tracking-[0.4em] border border-accent text-accent hover:bg-accent hover:text-background transition-colors"
            >
              好的
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.4em] text-accent mb-3">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-white/20 focus:border-accent outline-none py-3 text-foreground transition-colors"
      />
    </div>
  );
}
