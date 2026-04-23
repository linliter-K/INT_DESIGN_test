"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { projects } from "../data/projects";
import SectionHeading from "./SectionHeading";

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-28 lg:py-40 px-6 lg:px-12">
      <div className="max-w-[1400px] mx-auto">
        <SectionHeading
          kicker="SELECTED WORKS"
          title="近期作品"
          subtitle="從住宅到商業空間，每個案子都是一次關於生活方式的提案。以下為 AMB 近期部分作品選粹。"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {projects.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                delay: (i % 3) * 0.1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
            <Link
              href={`/projects/${p.id}`}
              className="group block relative overflow-hidden bg-surface"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={p.cover}
                  alt={p.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

                {/* category badge */}
                <span className="absolute top-5 left-5 px-3 py-1 text-[10px] tracking-[0.3em] border border-foreground/30 text-foreground/80 backdrop-blur-sm">
                  {p.category}
                </span>

                {/* hover reveal overlay */}
                <div className="absolute inset-0 flex items-end">
                  <div className="w-full p-6 lg:p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-accent text-[10px] tracking-[0.4em] mb-2">
                      {p.year} · {p.location}
                    </p>
                    <h3 className="font-serif text-2xl lg:text-3xl text-foreground mb-1">
                      {p.title}
                    </h3>
                    <p className="text-xs tracking-[0.2em] text-foreground/60 italic">
                      {p.titleEn}
                    </p>
                    <div className="mt-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <span className="text-[10px] tracking-[0.3em] text-accent">
                        VIEW PROJECT
                      </span>
                      <span className="h-px w-8 bg-accent" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Link
            href="/projects"
            className="group flex items-center gap-3 text-sm tracking-[0.3em] text-foreground/70 hover:text-accent transition-colors"
          >
            查看所有作品
            <span className="h-px w-10 bg-current transition-all duration-500 group-hover:w-16" />
          </Link>
        </div>
      </div>
    </section>
  );
}
