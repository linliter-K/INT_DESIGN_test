"use client";

import { useCallback, useEffect, useState } from "react";
import { createAdminUser, deleteAdminUser, fetchAdminUsers, toggleAdminUser } from "../actions";
import type { AdminUserView } from "../../lib/admin-users";

// 避開 0/O、1/l 這類容易唸錯、抄錯的字
const PW_CHARS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
function generatePassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => PW_CHARS[b % PW_CHARS.length]).join("");
}

const fmt = (t?: number) => (t ? new Date(t).toLocaleString("zh-TW") : "—");

export default function UsersPanel() {
  const [users, setUsers] = useState<AdminUserView[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<{ name: string; password: string } | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setUsers(await fetchAdminUsers());
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    run(async () => {
      await createAdminUser(name, password);
      // 密碼只在建立當下顯示一次，之後伺服器也只有雜湊，查不回來
      setCreated({ name, password });
      setName("");
      setPassword("");
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl">後台帳號</h2>
        <p className="mt-2 text-xs text-foreground/50 leading-relaxed">
          每位員工一組密碼，登入後台時輸入自己的密碼即可。停用後對方會立刻被登出。
          <br />
          管理者密碼（你自己的）設定在 Vercel 的 ADMIN_PASSWORD，不會出現在這裡；只有管理者能看到這一頁。
        </p>
      </div>

      <form onSubmit={add} className="bg-surface border border-white/5 p-5 space-y-4">
        <div className="text-[11px] tracking-[0.2em] text-accent">新增員工密碼</div>
        <div className="grid gap-4 md:grid-cols-[1fr_1.4fr_auto] md:items-end">
          <label className="block">
            <span className="block text-xs text-foreground/50 mb-1.5">員工名稱</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：小美"
              maxLength={30}
              className="w-full bg-background border border-white/10 focus:border-accent outline-none px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-foreground/50 mb-1.5">密碼（至少 8 字）</span>
            <div className="flex gap-2">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="flex-1 min-w-0 bg-background border border-white/10 focus:border-accent outline-none px-3 py-2 text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => setPassword(generatePassword())}
                className="px-3 py-2 text-xs border border-white/15 hover:border-accent whitespace-nowrap"
              >
                產生
              </button>
            </div>
          </label>
          <button
            type="submit"
            disabled={busy || !name.trim() || password.length < 8}
            className="px-5 py-2 text-xs tracking-[0.2em] border border-accent text-accent hover:bg-accent hover:text-background disabled:opacity-40"
          >
            {busy ? "處理中…" : "新增"}
          </button>
        </div>
      </form>

      {created && (
        <div className="border border-green-500/40 px-5 py-4 text-sm space-y-2">
          <div className="text-green-400">已新增「{created.name}」，請把密碼交給對方：</div>
          <div className="flex flex-wrap items-center gap-3">
            <code className="font-mono text-base bg-background px-3 py-1.5 select-all">{created.password}</code>
            <button
              onClick={() => navigator.clipboard?.writeText(created.password)}
              className="px-3 py-1.5 text-xs border border-white/15 hover:border-accent"
            >
              複製
            </button>
            <button onClick={() => setCreated(null)} className="text-xs text-foreground/50 hover:text-foreground">
              我記下來了
            </button>
          </div>
          <div className="text-xs text-foreground/50">這組密碼離開此頁後就看不到了，忘記只能刪掉重建。</div>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
      {users === null && !error && <p className="text-foreground/50">讀取中…</p>}
      {users?.length === 0 && <p className="text-foreground/50">還沒有員工帳號。</p>}

      {users && users.length > 0 && (
        <div className="bg-surface border border-white/5 divide-y divide-white/5">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4">
              <span className={`font-serif text-lg ${u.active ? "" : "text-foreground/40 line-through"}`}>{u.name}</span>
              <span
                className={`text-[10px] px-2 py-0.5 border ${
                  u.active ? "border-green-500/40 text-green-400" : "border-white/15 text-foreground/40"
                }`}
              >
                {u.active ? "啟用中" : "已停用"}
              </span>
              <span className="text-xs text-foreground/50">建立 {fmt(u.createdAt)}</span>
              <span className="text-xs text-foreground/50">上次登入 {fmt(u.lastLoginAt)}</span>
              <div className="ml-auto flex gap-2">
                <button
                  disabled={busy}
                  onClick={() => run(() => toggleAdminUser(u.id, !u.active))}
                  className="px-3 py-1.5 text-xs border border-white/15 hover:border-accent disabled:opacity-40"
                >
                  {u.active ? "停用" : "重新啟用"}
                </button>
                <button
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(`確定刪除「${u.name}」的帳號？刪除後無法復原。`)) run(() => deleteAdminUser(u.id));
                  }}
                  className="px-3 py-1.5 text-xs border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-40"
                >
                  刪除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
