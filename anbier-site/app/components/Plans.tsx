"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import SaveButton from "./SaveButton";
import type { Plan, PlansSection } from "../lib/content/types";

function PlanTitle({ plan }: { plan: Plan }) {
  return (
    <>
      <h3 className="font-serif text-2xl lg:text-[1.75rem] leading-tight text-foreground">{plan.name}</h3>
      {plan.tagline && (
        <p className="mt-1 text-xs text-foreground/75 leading-relaxed">{plan.tagline}</p>
      )}
      {plan.audience && (
        <div className="mt-2 text-[11px] tracking-[0.15em] text-accent">{plan.audience}</div>
      )}
    </>
  );
}

function PlanPrice({ plan }: { plan: Plan }) {
  if (!plan.price) return null;
  return (
    <div className="mt-3 flex items-end gap-2 whitespace-nowrap">
      <span className="font-serif text-6xl leading-none text-foreground">{plan.price}</span>
      <span className="font-serif text-2xl leading-none text-foreground mb-1">{plan.priceUnit}</span>
    </div>
  );
}

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  return (
    <motion.article
      id={`plan-${plan.id}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.1 }}
      className="group relative flex flex-col bg-surface border border-white/5 hover:border-accent/30 transition-colors duration-500 scroll-mt-28 snap-start shrink-0 w-[85vw] sm:w-[70vw] md:w-auto"
    >
      {plan.image && (
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={plan.image}
            alt={plan.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 85vw"
            className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
          />
          {/* 標題壓在圖上，底部要夠暗才讀得清楚 */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 via-45% to-transparent to-90%" />
          <SaveButton
            item={{
              kind: "plan",
              image: plan.image,
              title: plan.name,
              subtitle: `${plan.price} ${plan.priceUnit}`,
              href: `/#plan-${plan.id}`,
            }}
          />
          <div className="absolute left-6 right-6 lg:left-8 lg:right-8 bottom-4 [text-shadow:0_1px_8px_rgba(0,0,0,0.65)]">
            <div className="min-w-0">
              <PlanTitle plan={plan} />
            </div>
            <PlanPrice plan={plan} />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 px-6 lg:px-8 pt-5 pb-6 lg:pb-8">
        {!plan.image && (
          <div>
            <div className="min-w-0">
              <PlanTitle plan={plan} />
            </div>
            <PlanPrice plan={plan} />
          </div>
        )}

        {plan.highlights.length > 0 && (
          <div className={`${plan.image ? "" : "mt-6 "}grid grid-cols-3 border-y border-white/10 divide-x divide-white/10`}>
            {plan.highlights.map((h, i) => (
              <div key={i} className="px-2 py-3 text-center text-xs leading-snug text-foreground/85">
                {h}
              </div>
            ))}
          </div>
        )}

        <dl className="mt-6 space-y-3.5">
          {plan.items.map((it, i) => (
            <div key={i} className="grid grid-cols-[4.5rem_1fr] gap-3 text-sm">
              <dt className="flex items-start gap-2 text-accent whitespace-nowrap">
                <span className="mt-[0.6rem] h-px w-2.5 bg-accent shrink-0" />
                {it.label}
              </dt>
              <dd className="text-foreground/70 leading-relaxed">{it.desc}</dd>
            </div>
          ))}
        </dl>

        {/* mt-auto 讓不同長度的卡片底部對齊 */}
        <div className="mt-auto pt-6 space-y-3">
          {plan.extras && (
            <div className="bg-background/60 border-l border-accent/50 px-4 py-3 text-xs leading-relaxed">
              <span className="text-foreground/90 mr-2">選配與另估</span>
              <span className="text-foreground/55">{plan.extras}</span>
            </div>
          )}
          {plan.note && <p className="text-[11px] leading-relaxed text-foreground/40">{plan.note}</p>}
        </div>
      </div>

      <span className="absolute bottom-0 left-0 h-px w-0 bg-accent transition-all duration-700 group-hover:w-full" />
    </motion.article>
  );
}

export default function Plans({ plans }: { plans: PlansSection }) {
  if (!plans.items.length) return null;

  return (
    <section id="plans" className="py-28 lg:py-40 px-6 lg:px-12 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <SectionHeading kicker={plans.kicker} title={plans.title} subtitle={plans.subtitle} />

        {/* 手機橫向滑動，避免 5 張長卡片把首頁拉得太長 */}
        <div className="-mx-6 px-6 md:mx-0 md:px-0 flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-px-6 md:scroll-px-0 pb-4 md:pb-0">
          {plans.items.map((p, i) => (
            <PlanCard key={p.id || i} plan={p} index={i} />
          ))}
        </div>
        <p className="md:hidden mt-2 text-[10px] tracking-[0.3em] text-foreground/40">← 左右滑動查看更多方案</p>
      </div>
    </section>
  );
}
