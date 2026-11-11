"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import RichText from "./RichText";
import type { SiteContent } from "../lib/content/types";

export default function About({ about }: { about: SiteContent["about"] }) {
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
              src={about.image}
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
              {about.kicker}
            </span>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] mb-8">
            <RichText text={about.title} />
          </h2>

          <div className="space-y-5 text-foreground/70 leading-relaxed mb-12">
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10">
            {about.stats.map((s, i) => (
              <motion.div
                key={i}
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
