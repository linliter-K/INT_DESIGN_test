"use client";

import { motion } from "framer-motion";

type Props = {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
};

export default function SectionHeading({
  kicker,
  title,
  subtitle,
  align = "left",
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className={`mb-16 ${align === "center" ? "text-center" : ""}`}
    >
      {kicker && (
        <div
          className={`flex items-center gap-4 mb-6 ${
            align === "center" ? "justify-center" : ""
          }`}
        >
          <span className="h-px w-10 bg-accent" />
          <span className="text-accent text-xs tracking-[0.5em]">{kicker}</span>
        </div>
      )}
      <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] text-foreground mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-foreground/60 text-base md:text-lg max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
