"use client";

import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";

const services = [
  {
    num: "01",
    title: "住宅空間設計",
    en: "Residential Design",
    desc: "從格局配置到軟裝挑選，量身打造屬於屋主生活節奏的家。",
    points: ["格局規劃", "風格定位", "軟裝佈置", "燈光照明"],
  },
  {
    num: "02",
    title: "商業空間設計",
    en: "Commercial Design",
    desc: "為品牌打造兼顧視覺辨識與顧客體驗的商業場域。",
    points: ["餐飲空間", "零售門市", "辦公空間", "展示空間"],
  },
  {
    num: "03",
    title: "設計諮詢",
    en: "Design Consultation",
    desc: "針對屋主既有空間提供專業風格、動線與採購建議。",
    points: ["風格評估", "動線檢討", "採購建議", "色彩計畫"],
  },
  {
    num: "04",
    title: "工程統包施工",
    en: "Construction Management",
    desc: "從拆除、水電到木作、系統櫃，全案監造一條龍。",
    points: ["泥作木作", "水電工程", "系統櫃體", "完工保固"],
  },
];

export default function Services() {
  return (
    <section id="services" className="py-28 lg:py-40 px-6 lg:px-12 bg-surface">
      <div className="max-w-[1400px] mx-auto">
        <SectionHeading
          kicker="WHAT WE DO"
          title="服務項目"
          subtitle="以工業風與現代風為核心，橫跨各式設計語彙——從私領域的家，到公領域的商業場所。"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground/10">
          {services.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="group relative bg-surface p-8 lg:p-12 hover:bg-background transition-colors duration-500"
            >
              <div className="flex items-start justify-between mb-8">
                <span className="font-serif text-5xl text-accent/40 group-hover:text-accent transition-colors duration-500">
                  {s.num}
                </span>
                <span className="text-[10px] tracking-[0.4em] text-foreground/40 mt-2">
                  {s.en}
                </span>
              </div>

              <h3 className="font-serif text-2xl lg:text-3xl mb-4 text-foreground">
                {s.title}
              </h3>
              <p className="text-foreground/60 text-sm leading-relaxed mb-8">
                {s.desc}
              </p>

              <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                {s.points.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2 text-xs tracking-wider text-foreground/70"
                  >
                    <span className="h-px w-3 bg-accent" />
                    {p}
                  </li>
                ))}
              </ul>

              <span className="absolute bottom-0 left-0 h-px w-0 bg-accent transition-all duration-700 group-hover:w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
