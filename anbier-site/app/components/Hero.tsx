"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative h-screen min-h-[700px] w-full overflow-hidden"
    >
      {/* Background image with Ken Burns */}
      <div className="absolute inset-0 animate-kenburns">
        <Image
          src="/placeholder/residence_41051206052025.jpg"
          alt="AMB hero"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* Gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/50 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />

      {/* Vertical text on side */}
      <div className="hidden lg:block absolute left-12 top-1/2 -translate-y-1/2 [writing-mode:vertical-rl] text-xs tracking-[0.5em] text-foreground/50">
        INTERIOR · ARCHITECTURE · SPACE
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 lg:px-24 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1], delay: 0.4 }}
          className="max-w-3xl"
        >
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-accent text-xs tracking-[0.5em] mb-6"
          >
            — AMB INTERIOR DESIGN
          </motion.p>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light leading-[1.05] text-foreground mb-8">
            在光影之間
            <br />
            <span className="text-accent italic">雕塑</span>生活
          </h1>

          <p className="text-foreground/70 text-base md:text-lg max-w-xl leading-relaxed tracking-wide mb-10">
            以工業風的沉穩骨架，承載現代生活的輕盈。
            AMB 艾柏設計相信，空間不只是容器，而是敘事本身。
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#portfolio"
              className="group relative px-8 py-4 overflow-hidden border border-accent/50 text-sm tracking-[0.3em]"
            >
              <span className="relative z-10 group-hover:text-background transition-colors duration-500">
                探索作品
              </span>
              <span className="absolute inset-0 bg-accent -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            </a>
            <a
              href="#contact"
              className="px-8 py-4 text-sm tracking-[0.3em] text-foreground/80 hover:text-accent transition-colors"
            >
              預約諮詢 →
            </a>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.4em] text-foreground/50">
          SCROLL
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-accent to-transparent"
        />
      </motion.div>
    </section>
  );
}
