"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { logout } from "@/app/login/actions";
import { isTabLoggedIn, markTabLoggedIn } from "@/lib/tabSession";

const noopSubscribe = () => () => {};
const CHANNEL = "gm_tab_auth";
const PING_TIMEOUT_MS = 400;

/**
 * Konten halaman hanya tampil bila tab ini sah:
 * - tab yang login lewat /login (penanda di sessionStorage), atau
 * - tab baru selagi masih ada tab app lain yang terbuka (ditanya via BroadcastChannel).
 * Bila semua tab app sudah ditutup lalu app dibuka lagi -> logout -> /login.
 */
export function TabSessionGuard({ children }: { children: React.ReactNode }) {
  // Server & render pertama: "pending" (sessionStorage belum bisa dibaca).
  const initial = useSyncExternalStore(
    noopSubscribe,
    () => (isTabLoggedIn() === false ? "check" : "ok"),
    () => "pending",
  );
  const [resolved, setResolved] = useState<"ok" | "denied" | null>(null);
  const status = initial === "check" ? (resolved ?? "checking") : initial;

  // Tab baru tanpa penanda: tanya tab lain dulu.
  useEffect(() => {
    if (status !== "checking") return;
    if (typeof BroadcastChannel === "undefined") {
      setTimeout(() => setResolved("denied"), 0);
      return;
    }
    const ch = new BroadcastChannel(CHANNEL);
    const timer = setTimeout(() => setResolved("denied"), PING_TIMEOUT_MS);
    ch.onmessage = (e) => {
      if (e.data !== "pong") return;
      clearTimeout(timer);
      markTabLoggedIn();
      setResolved("ok");
    };
    ch.postMessage("ping");
    return () => {
      clearTimeout(timer);
      ch.close();
    };
  }, [status]);

  // Tab sah menjawab pertanyaan tab baru.
  useEffect(() => {
    if (status !== "ok" || typeof BroadcastChannel === "undefined") return;
    const ch = new BroadcastChannel(CHANNEL);
    ch.onmessage = (e) => {
      if (e.data === "ping") ch.postMessage("pong");
    };
    return () => ch.close();
  }, [status]);

  useEffect(() => {
    if (status === "denied") void logout();
  }, [status]);

  if (status !== "ok") {
    return (
      <div className="flex min-h-dvh items-center justify-center text-[12px] text-muted">
        {status === "denied" ? "Sesi berakhir, mengalihkan ke halaman login…" : "Memuat…"}
      </div>
    );
  }
  return <>{children}</>;
}
