"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAnalytics } from "../actions";
import type { AnalyticsReport } from "../../lib/analytics";
import { KIND_LABEL } from "../../lib/content/catalog";

// 品牌金 #b08a5b 彩度太低、在深色底上像灰色，圖表改用同色系但較飽和、通過色彩檢查的 #b8873f
const MARK = "#b8873f";
const RANGES = [7, 30, 90] as const;

function fmtDuration(sec: number) {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m ? `${m} 分 ${s} 秒` : `${s} 秒`;
}

const fmtNum = (n: number) => n.toLocaleString("zh-TW");

export default function AnalyticsPanel({ pageNames }: { pageNames: Record<string, string> }) {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (d: number) => {
    setLoading(true);
    setError(null);
    try {
      setReport(await fetchAnalytics(d));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(days);
  }, [days, load]);

  const pageName = (path: string) => pageNames[path] ?? path;
  const t = report?.totals;
  const conversion = t && t.visitors ? ((t.inquiries / t.visitors) * 100).toFixed(1) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl">網站數據</h2>
        <div className="flex items-center gap-2">
          <div className="flex border border-white/15" role="group" aria-label="時間範圍">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setDays(r)}
                aria-pressed={days === r}
                className={`px-3 py-1.5 text-xs ${days === r ? "bg-accent text-background" : "hover:text-accent"}`}
              >
                近 {r} 天
              </button>
            ))}
          </div>
          <button onClick={() => load(days)} className="px-3 py-1.5 text-xs border border-white/15 hover:border-accent">
            {loading ? "讀取中…" : "重新整理"}
          </button>
        </div>
      </div>

      {report && !report.connected && (
        <p className="text-xs text-yellow-400/90 border border-yellow-500/30 px-4 py-3 leading-relaxed">
          尚未連接 Upstash Redis：目前只是本機暫存的測試數據，重開伺服器就會清空。到 Vercel → Storage 接上 Upstash Redis 後才會開始正式記錄。
        </p>
      )}
      <p className="text-[11px] text-foreground/40">
        登入過後台的瀏覽器逛前台不會被計入，數據只算真正的訪客。不使用 cookie，不記錄個人資料。
      </p>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!report && !error && <p className="text-foreground/50">讀取中…</p>}

      {report && t && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Stat label="不重複訪客" value={fmtNum(t.visitors)} />
            <Stat label="瀏覽次數" value={fmtNum(t.pageviews)} />
            <Stat label="平均停留" value={fmtDuration(t.avgSeconds)} />
            <Stat label="點擊次數" value={fmtNum(t.clicks)} />
            <Stat label="加入參考清單" value={fmtNum(t.saves)} />
            <Stat label="詢問數" value={fmtNum(t.inquiries)} sub={conversion ? `轉換率 ${conversion}%` : undefined} />
          </div>

          <Card title="每日訪客">
            <DailyChart daily={report.daily} />
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="參考清單排行" hint="客人最常加入的圖片，可看出偏好的風格">
              {report.saves.length === 0 ? (
                <Empty />
              ) : (
                <ol className="space-y-2">
                  {report.saves.map((s, i) => (
                    <li key={s.name} className="flex items-center gap-3">
                      <span className="w-5 text-right text-xs text-foreground/40">{i + 1}</span>
                      <a href={s.href} target="_blank" className="relative w-12 h-12 shrink-0 bg-background overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.name} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      </a>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{s.title || "（未命名）"}</div>
                        <div className="text-[10px] text-foreground/40">{KIND_LABEL[s.kind as keyof typeof KIND_LABEL] ?? "作品"}</div>
                        <Bar value={s.value} max={report.saves[0].value} />
                      </div>
                      <span className="text-sm tabular-nums w-10 text-right">{s.value}</span>
                    </li>
                  ))}
                </ol>
              )}
            </Card>

            <Card title="熱門頁面" hint="瀏覽次數與平均停留時間">
              {report.pages.length === 0 ? (
                <Empty />
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] text-foreground/40 text-left">
                      <th className="font-normal pb-2">頁面</th>
                      <th className="font-normal pb-2 text-right">瀏覽</th>
                      <th className="font-normal pb-2 text-right">平均停留</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.pages.map((p) => (
                      <tr key={p.path} className="border-t border-white/5">
                        <td className="py-2 pr-3">
                          <div className="truncate max-w-[220px]">{pageName(p.path)}</div>
                          <Bar value={p.views} max={report.pages[0].views} />
                        </td>
                        <td className="py-2 text-right tabular-nums">{fmtNum(p.views)}</td>
                        <td className="py-2 text-right tabular-nums text-foreground/70 whitespace-nowrap">{fmtDuration(p.avgSeconds)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            <Card title="點擊排行" hint="訪客點了哪些按鈕與連結">
              <RankList items={report.clicks} />
            </Card>

            <div className="space-y-6">
              <Card title="流量來源" hint="從哪個網站點進來（直接輸入網址不列入）">
                <RankList items={report.referrers} />
              </Card>
              <Card title="裝置">
                <RankList
                  items={report.devices.map((d) => ({ ...d, name: d.name === "mobile" ? "手機" : "電腦 / 平板" }))}
                  percent
                />
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-surface border border-white/5 px-4 py-4">
      <div className="text-[11px] text-foreground/50">{label}</div>
      <div className="mt-1 font-serif text-2xl tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-foreground/50 mt-0.5">{sub}</div>}
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface border border-white/5 p-5">
      <h3 className="text-[11px] tracking-[0.2em] text-accent">{title}</h3>
      {hint && <p className="text-[11px] text-foreground/40 mt-1">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

const Empty = () => <p className="text-sm text-foreground/40">這段期間還沒有資料。</p>;

function Bar({ value, max }: { value: number; max: number }) {
  return (
    <div className="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${max ? (value / max) * 100 : 0}%`, background: MARK }} />
    </div>
  );
}

function RankList({ items, percent = false }: { items: { name: string; value: number }[]; percent?: boolean }) {
  if (items.length === 0) return <Empty />;
  const max = items[0].value;
  const sum = items.reduce((a, b) => a + b.value, 0);
  return (
    <ol className="space-y-2.5">
      {items.map((it) => (
        <li key={it.name}>
          <div className="flex justify-between gap-3 text-sm">
            <span className="truncate">{it.name}</span>
            <span className="tabular-nums shrink-0">
              {percent && sum ? `${Math.round((it.value / sum) * 100)}%` : fmtNum(it.value)}
            </span>
          </div>
          <Bar value={it.value} max={max} />
        </li>
      ))}
    </ol>
  );
}

function DailyChart({ daily }: { daily: AnalyticsReport["daily"] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...daily.map((d) => d.visitors));
  const shortDay = (d: string) => d.slice(5).replace("-", "/");
  const active = hover !== null ? daily[hover] : null;

  return (
    <div>
      <div className="flex items-baseline justify-between text-[11px] text-foreground/40 mb-2">
        <span>最高 {fmtNum(max)} 人</span>
        <span className="h-4 text-foreground/80">
          {active && (
            <>
              <span className="text-foreground/50">{active.day}　</span>
              <strong className="text-foreground font-medium">{fmtNum(active.visitors)}</strong> 位訪客 ·{" "}
              <strong className="text-foreground font-medium">{fmtNum(active.pageviews)}</strong> 次瀏覽
            </>
          )}
        </span>
      </div>
      <div className="relative h-40 border-b border-white/15">
        <div className="absolute inset-x-0 top-0 border-t border-dashed border-white/5" />
        <div className="absolute inset-0 flex items-end">
          {daily.map((d, i) => (
            // 整欄都是感應區，不必準確指到細細的柱子
            <button
              key={d.day}
              type="button"
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              aria-label={`${d.day} ${d.visitors} 位訪客，${d.pageviews} 次瀏覽`}
              className="flex-1 h-full flex items-end justify-center px-[1px] outline-none"
            >
              <span
                className="block w-full max-w-[18px] rounded-t-[4px] transition-opacity"
                style={{
                  height: `${(d.visitors / max) * 100}%`,
                  minHeight: d.visitors ? 2 : 0,
                  background: MARK,
                  opacity: hover === null || hover === i ? 1 : 0.45,
                }}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-foreground/40 mt-1.5">
        <span>{shortDay(daily[0].day)}</span>
        {daily.length > 2 && <span>{shortDay(daily[Math.floor(daily.length / 2)].day)}</span>}
        <span>{shortDay(daily[daily.length - 1].day)}</span>
      </div>
      <details className="mt-3 text-xs text-foreground/60">
        <summary className="cursor-pointer hover:text-accent">查看每日明細表</summary>
        <div className="max-h-60 overflow-y-auto mt-2">
          <table className="w-full">
            <thead>
              <tr className="text-foreground/40 text-left">
                <th className="font-normal py-1">日期</th>
                <th className="font-normal py-1 text-right">訪客</th>
                <th className="font-normal py-1 text-right">瀏覽</th>
              </tr>
            </thead>
            <tbody>
              {[...daily].reverse().map((d) => (
                <tr key={d.day} className="border-t border-white/5">
                  <td className="py-1">{d.day}</td>
                  <td className="py-1 text-right tabular-nums">{d.visitors}</td>
                  <td className="py-1 text-right tabular-nums">{d.pageviews}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
