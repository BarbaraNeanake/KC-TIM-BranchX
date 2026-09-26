"use client";

import { useActionState } from "react";
import { markTabLoggedIn } from "@/lib/tabSession";
import { login } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} onSubmit={markTabLoggedIn} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      <label className="block text-xs font-semibold text-heading" htmlFor="password">
        Password akses
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        className="w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-blue"
      />
      {state?.error && (
        <p role="alert" className="text-xs font-semibold text-danger">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-navy py-2.5 text-sm font-bold text-white transition hover:bg-navy-deep disabled:opacity-60 dark:bg-blue"
      >
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
