"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: hook up to Firebase / email service in Phase 3
    setSubmitted(true);
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
              GET IN TOUCH
            </span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-light leading-[1.1] mb-8">
            談談你的
            <br />
            <span className="italic text-accent">理想空間</span>
          </h2>
          <p className="text-foreground/70 leading-relaxed mb-12">
            不論是正在裝修的新家、想翻新的老宅，或是品牌開店計畫——
            留下訊息，我們會在 1 個工作日內回覆。
          </p>

          <div className="space-y-6 text-sm">
            <div>
              <div className="text-[10px] tracking-[0.4em] text-accent mb-2">
                STUDIO
              </div>
              <p className="text-foreground/80 leading-relaxed">
                台北市大安區仁愛路四段 XXX 號 X 樓
                <br />
                （暫定地址，待替換）
              </p>
            </div>
            <div>
              <div className="text-[10px] tracking-[0.4em] text-accent mb-2">
                CONTACT
              </div>
              <p className="text-foreground/80">+886-2-XXXX-XXXX</p>
              <p className="text-foreground/80">hello@anbier.design</p>
            </div>
            <div>
              <div className="text-[10px] tracking-[0.4em] text-accent mb-2">
                HOURS
              </div>
              <p className="text-foreground/80">週一至週五 10:00 – 19:00</p>
              <p className="text-foreground/80">週末採預約制</p>
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
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
              <div className="font-serif text-3xl text-accent mb-4">
                訊息已送出
              </div>
              <p className="text-foreground/70 max-w-sm">
                感謝您的來信，AMB 團隊會於 1 個工作日內與您聯繫。
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="姓名 *" name="name" required />
                <Field label="聯絡電話 *" name="phone" type="tel" required />
              </div>
              <Field label="Email *" name="email" type="email" required />
              <Field
                label="預計坪數 / 地區"
                name="size"
                placeholder="例：35 坪 / 台北信義"
              />
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

              <button
                type="submit"
                className="group relative px-10 py-4 overflow-hidden border border-accent text-sm tracking-[0.3em] w-full md:w-auto"
              >
                <span className="relative z-10 group-hover:text-background transition-colors duration-500">
                  送出詢問
                </span>
                <span className="absolute inset-0 bg-accent -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
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
