"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchInquiries, removeInquiry } from "../actions";
import type { Inquiry } from "../../lib/inquiries";
import { KIND_LABEL } from "../../lib/content/catalog";

export default function InquiriesPanel({ emailConfigured }: { emailConfigured: boolean }) {
  const [list, setList] = useState<Inquiry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchInquiries();
      setList(data);
      setOpenId((cur) => cur ?? data[0]?.id ?? null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    // 切到這個分頁時才去讀，避免每次進後台都抓全部詢問
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function remove(q: Inquiry) {
    if (!window.confirm(`確定刪除 ${q.name} 的詢問？刪除後無法復原。`)) return;
    try {
      await removeInquiry(q.id);
      setList((l) => l?.filter((x) => x.id !== q.id) ?? null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl">客戶詢問{list && `（${list.length}）`}</h2>
        <button onClick={load} className="px-3 py-1.5 text-xs border border-white/15 hover:border-accent">
          重新整理
        </button>
      </div>

      {!emailConfigured && (
        <p className="text-xs text-yellow-400/90 border border-yellow-500/30 px-4 py-3">
          Email 通知尚未設定（RESEND_API_KEY / INQUIRY_NOTIFY_EMAIL），詢問只會存在這裡。
        </p>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {list === null && !error && <p className="text-foreground/50">讀取中…</p>}
      {list?.length === 0 && <p className="text-foreground/50">目前還沒有詢問。</p>}

      {list?.map((q) => {
        const open = openId === q.id;
        return (
          <article key={q.id} className="bg-surface border border-white/5">
            <button
              onClick={() => setOpenId(open ? null : q.id)}
              className="w-full flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 text-left hover:bg-white/5"
            >
              <span className="font-serif text-lg">{q.name}</span>
              <span className="text-xs text-foreground/50">{new Date(q.createdAt).toLocaleString("zh-TW")}</span>
              {q.services.length > 0 && <span className="text-xs text-accent">{q.services.join("、")}</span>}
              {q.refs.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 border border-accent/40 text-accent">♡ {q.refs.length} 張參考圖</span>
              )}
              <span className="ml-auto text-foreground/40">{open ? "−" : "+"}</span>
            </button>

            {open && (
              <div className="px-5 pb-5 space-y-5 border-t border-white/10 pt-5">
                <dl className="grid grid-cols-[90px_1fr] gap-y-2 text-sm">
                  <dt className="text-foreground/50">電話</dt>
                  <dd><a href={`tel:${q.phone}`} className="hover:text-accent">{q.phone}</a></dd>
                  <dt className="text-foreground/50">Email</dt>
                  <dd><a href={`mailto:${q.email}`} className="hover:text-accent">{q.email}</a></dd>
                  {q.size && (<><dt className="text-foreground/50">坪數 / 地區</dt><dd>{q.size}</dd></>)}
                  {q.message && (<><dt className="text-foreground/50">需求說明</dt><dd className="whitespace-pre-wrap leading-relaxed">{q.message}</dd></>)}
                </dl>

                {q.refs.length > 0 && (
                  <div>
                    <div className="text-[11px] tracking-[0.2em] text-accent mb-3">參考清單</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                      {q.refs.map((r) => (
                        <a key={r.image} href={r.href} target="_blank" className="group block bg-background">
                          <div className="relative aspect-[4/3] overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={r.image} alt={r.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <div className="px-2 py-1.5">
                            <div className="text-xs truncate">{r.title}</div>
                            <div className="text-[10px] text-foreground/40 truncate">
                              {KIND_LABEL[r.kind] ?? "作品"}{r.subtitle ? ` · ${r.subtitle}` : ""}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button onClick={() => remove(q)} className="px-3 py-1.5 text-xs border border-red-500/40 text-red-400 hover:bg-red-500/10">
                    刪除這筆詢問
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
