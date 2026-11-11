"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="space-y-6">
      <label className="block">
        <span className="block text-[10px] tracking-[0.4em] text-accent mb-3">PASSWORD</span>
        <input
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="w-full bg-transparent border-b border-white/20 focus:border-accent outline-none py-3 text-foreground transition-colors"
        />
      </label>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 text-xs tracking-[0.4em] border border-accent text-accent hover:bg-accent hover:text-background transition-colors disabled:opacity-50"
      >
        {pending ? "驗證中…" : "進入後台"}
      </button>
    </form>
  );
}
