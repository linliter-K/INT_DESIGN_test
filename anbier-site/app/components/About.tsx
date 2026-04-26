"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const stats = [
  { num: "15+", label: "設計年資", en: "Years" },
  { num: "200+", label: "完工案件", en: "Projects" },
  { num: "98%", label: "客戶滿意度", en: "Satisfaction" },
  { num: "12", label: "設計獎項", en: "Awards" },
];

export default function About() {
  return (
    <section id="about" className="py-28 lg:py-40 px-6 lg:px-12">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9 }}
          className="lg:col-span-5 relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="/placeholder/covers/serenity.png"
              alt="AMB studio"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 w-40 h-40 border border-accent/40 -z-10" />
          <div className="absolute -top-6 -left-6 w-40 h-40 bg-surface -z-10" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="lg:col-span-7"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="h-px w-10 bg-accent" />
            <span className="text-accent text-xs tracking-[0.5em]">
              ABOUT AMB
            </span>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] mb-8">
            讓每一處轉角，
            <br />
            都有<span className="italic text-accent">被凝視</span>的理由。
          </h2>

          <div className="space-y-5 text-foreground/70 leading-relaxed mb-12">
            <p>
              AMB 艾柏設計成立於 2009
              年，從一間小型設計工作室出發，至今已完成超過 200
              件住宅與商業空間設計。我們相信「設計是生活的骨架」——
              每一次規劃都從屋主的日常節奏開始。
            </p>
            <p>
              以工業風與現代風為我們的設計語彙核心，但不拘泥於單一風格；
              依據每位業主的個性與需求，靈活融入日式、北歐、輕奢、
              侘寂等不同元素，創造出真正屬於你的場所。
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
              >
                <div className="font-serif text-3xl lg:text-4xl text-accent mb-1">
                  {s.num}
                </div>
                <div className="text-sm text-foreground/80">{s.label}</div>
                <div className="text-[10px] tracking-[0.3em] text-foreground/40 mt-1">
                  {s.en}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
