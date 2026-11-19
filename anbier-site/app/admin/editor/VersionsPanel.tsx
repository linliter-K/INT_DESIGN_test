"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchContentVersions, restoreContentVersion } from "../actions";
import type { ContentVersion } from "../../lib/content/store";
import type { SiteContent } from "../../lib/content/types";

const fmt = (t: number) => new Date(t).toLocaleString("zh-TW", { hour12: false });
const LABELS = ["目前版本", "上一個版本", "上上一個版本"];

export default function VersionsPanel({
  dirty,
  onRestored,
}: {
  dirty: boolean;
  onRestored: (content: SiteContent) => void;
}) {
  const [versions, setVersions] = useState<ContentVersion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setVersions(await fetchContentVersions());
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function restore(v: ContentVersion, label: string) {
    const warn = dirty ? "\n\n⚠️ 你目前有未儲存的變更，還原後會被捨棄。" : "";
    if (!window.confirm(`確定把網站還原成「${label}」（${fmt(v.savedAt)}）？${warn}`)) return;
    setBusy(v.id);
    setError(null);
    setDone(null);
    try {
      onRestored(await restoreContentVersion(v.id));
      setDone(`已還原成 ${fmt(v.savedAt)} 的版本，網站已更新`);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl">版本紀錄</h2>
        <p className="mt-2 text-xs text-foreground/50 leading-relaxed">
          每次「儲存並發布」都會留一版，最多保留最近 10 版。改壞了可以一鍵還原。
          <br />
          還原會把舊版當成新的一版發布，所以還原錯了也能再還原回來。
        </p>
      </div>

      {done && <p className="text-sm text-green-400">{done}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {versions === null && !error && <p className="text-foreground/50">讀取中…</p>}
      {versions?.length === 0 && <p className="text-foreground/50">還沒有儲存過的版本。</p>}

      {versions && versions.length > 0 && (
        <div className="bg-surface border border-white/5 divide-y divide-white/5">
          {versions.map((v, i) => {
            const label = LABELS[i] ?? `${i} 個版本前`;
            return (
              <div key={v.id} className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4">
                <span className={`text-sm w-28 ${i === 0 ? "text-accent" : i <= 2 ? "" : "text-foreground/60"}`}>
                  {label}
                </span>
                <span className="font-mono text-sm text-foreground/70">{fmt(v.savedAt)}</span>
                <div className="ml-auto">
                  {i === 0 ? (
                    <span className="text-[10px] px-2 py-0.5 border border-green-500/40 text-green-400">網站使用中</span>
                  ) : (
                    <button
                      disabled={busy !== null}
                      onClick={() => restore(v, label)}
                      className="px-4 py-1.5 text-xs border border-accent text-accent hover:bg-accent hover:text-background disabled:opacity-40"
                    >
                      {busy === v.id ? "還原中…" : "還原成這版"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
