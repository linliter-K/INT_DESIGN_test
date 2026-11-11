"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { CatalogItem } from "../lib/content/types";
import { CATALOG_PATH, type CatalogKind } from "../lib/content/catalog";
import SaveButton from "./SaveButton";

const ALL = "全部";

export default function CatalogGrid({
  kind,
  items,
  categoryOrder,
}: {
  kind: CatalogKind;
  items: CatalogItem[];
  categoryOrder: string[];
}) {
  // 沒有材質的分類不顯示按鈕，免得訪客點進去一片空白
  const categories = [ALL, ...categoryOrder.filter((c) => items.some((m) => m.category === c))];
  const [active, setActive] = useState(ALL);
  const shown = active === ALL ? items : items.filter((m) => m.category === active);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-12">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`px-5 py-2 text-xs tracking-[0.3em] border transition-colors duration-300 ${
              active === c
                ? "bg-accent text-background border-accent"
                : "border-white/15 text-foreground/70 hover:border-accent hover:text-accent"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
      >
        <AnimatePresence mode="popLayout">
          {shown.map((m) => (
            <motion.article
              layout
              key={m.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="group bg-surface flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden">
                {m.image && (
                  <Image
                    src={m.image}
                    alt={m.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                  />
                )}
                {m.image && (
                  <SaveButton
                    item={{ kind, image: m.image, title: m.name, subtitle: m.category, href: CATALOG_PATH[kind] }}
                  />
                )}
                <span className="absolute top-4 left-4 px-3 py-1 text-[10px] tracking-[0.3em] border border-foreground/30 text-foreground/90 bg-background/40 backdrop-blur-sm">
                  {m.category}
                </span>
              </div>
              <div className="p-6 flex flex-col gap-4 flex-1">
                <div>
                  <h3 className="font-serif text-2xl text-foreground">{m.name}</h3>
                  <p className="text-[10px] tracking-[0.3em] text-foreground/40 italic mt-1">
                    {m.nameEn}
                  </p>
                </div>
                <p className="text-sm text-foreground/65 leading-relaxed">
                  {m.description}
                </p>
                {m.features.length > 0 && (
                  <ul className="flex flex-wrap gap-x-4 gap-y-2">
                    {m.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-xs tracking-wider text-foreground/70"
                      >
                        <span className="h-px w-3 bg-accent" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                {m.usage && (
                  <div className="mt-auto pt-4 border-t border-white/10">
                    <div className="text-[10px] tracking-[0.4em] text-accent mb-1">
                      {kind === "material" ? "適用位置" : "適用空間"}
                    </div>
                    <p className="text-xs text-foreground/70">{m.usage}</p>
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
