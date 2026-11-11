"use client";

import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import type { SiteContent } from "../lib/content/types";

export default function Services({
  services,
}: {
  services: SiteContent["services"];
}) {
  return (
    <section id="services" className="py-28 lg:py-40 px-6 lg:px-12 bg-surface">
      <div className="max-w-[1400px] mx-auto">
        <SectionHeading
          kicker={services.kicker}
          title={services.title}
          subtitle={services.subtitle}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground/10">
          {services.items.map((s, i) => (
            <motion.div
              key={`${s.num}-${i}`}
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
