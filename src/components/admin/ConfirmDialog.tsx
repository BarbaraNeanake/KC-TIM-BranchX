"use client";

import { useEffect, useRef } from "react";

/** Dialog konfirmasi berbasis <dialog> (bukan window.confirm). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Hapus",
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      className="m-auto w-[min(92vw,380px)] rounded-2xl bg-surface p-5 text-ink shadow-2xl backdrop:bg-[rgba(4,20,40,.5)]"
    >
      <h2 className="text-[15px] font-bold text-heading">{title}</h2>
      <div className="mt-2 text-[13px] leading-relaxed text-muted">{message}</div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-xl border border-line px-4 py-2 text-[13px] font-semibold">
          Batal
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="rounded-xl bg-danger px-4 py-2 text-[13px] font-bold text-white disabled:opacity-60"
        >
          {busy ? "Memproses…" : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
