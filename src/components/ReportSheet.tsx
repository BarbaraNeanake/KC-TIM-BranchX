"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { EntityView } from "@/lib/entities";
import {
  DISCLAIMER,
  LEVEL_LABEL,
  PAYMENT_STATUS_LABEL,
  PAYROLL_STATUS_LABEL,
  PRIORITY_LABEL,
  TYPE_LABEL,
} from "@/lib/constants";
import { formatDistance } from "@/lib/geo";
import { ScoreGauge } from "./ScoreGauge";

type Props = {
  entity: EntityView | null;
  open: boolean;
  isAdmin: boolean;
  onClose: () => void;
};

export function ReportSheet({ entity: e, open, isAdmin, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const kv: [string, string][] = !e
    ? []
    : e.type === "COMPANY"
      ? [
          ["Estimasi karyawan", e.employeeEstimate != null ? `~${e.employeeEstimate.toLocaleString("id-ID")}` : "—"],
          ["Status payroll", e.payrollStatus ? PAYROLL_STATUS_LABEL[e.payrollStatus] : "—"],
          ["Potensi kredit usaha", e.creditPotential ? LEVEL_LABEL[e.creditPotential] : "—"],
          ["Prioritas lead", PRIORITY_LABEL[e.priority]],
        ]
      : [
          ["Status pembayaran", e.paymentStatus ? PAYMENT_STATUS_LABEL[e.paymentStatus] : "—"],
          ["Estimasi omzet", e.turnoverEstimate ? LEVEL_LABEL[e.turnoverEstimate] : "—"],
          ["Prioritas lead", PRIORITY_LABEL[e.priority]],
          ["Jarak ke cabang", formatDistance(e.distanceM)],
        ];
  if (e?.type === "COMPANY") kv.push(["Jarak ke cabang", formatDistance(e.distanceM)]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[900] bg-[rgba(4,20,40,.45)] transition-opacity duration-250 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
        aria-hidden
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="rp-name"
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-x-0 bottom-0 z-[950] mx-auto flex max-h-[86dvh] max-w-[560px] flex-col rounded-t-[22px] bg-surface shadow-[0_-10px_40px_rgba(0,0,0,.25)] transition-transform duration-300 ease-[cubic-bezier(.22,.9,.3,1)] ${open ? "translate-y-0" : "translate-y-full"}`}
      >
        {e && (
          <>
            <header className="relative flex items-center gap-2.5 border-b border-line px-[18px] pb-3.5 pt-5">
              <div className="absolute left-1/2 top-2 h-1 w-9 -translate-x-1/2 rounded-full bg-line" />
              <div className="min-w-0">
                <div className="mb-0.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted">
                  {TYPE_LABEL[e.type]}
                  {e.isAnchor && <span className="rounded bg-gold/20 px-1.5 py-px text-gold-dark">Anchor</span>}
                </div>
                <h2 id="rp-name" className="text-[15px] font-bold leading-snug text-heading">
                  {e.name}
                </h2>
                <p className="mt-px text-[11px] text-muted">
                  {e.category} · {e.address}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup laporan"
                className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-bg text-ink"
              >
                ✕
              </button>
            </header>
            <div className="overflow-y-auto px-[18px] pb-[calc(18px+env(safe-area-inset-bottom))] pt-4">
              <ScoreGauge score={e.score} />

              <h3 className="mb-1.5 mt-4 text-[11.5px] font-bold text-heading">
                Profil singkat {e.type === "COMPANY" ? "perusahaan" : "merchant"}
              </h3>
              <p className="text-[12.5px] leading-relaxed">{e.profile}</p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {kv.map(([l, n]) => (
                  <div key={l} className="rounded-xl border border-line px-3 py-2.5">
                    <div className="text-sm font-extrabold text-heading">{n}</div>
                    <div className="mt-px text-[10px] text-muted">{l}</div>
                  </div>
                ))}
              </div>

              {e.productFit && (
                <>
                  <h3 className="mb-1.5 mt-4 text-[11.5px] font-bold text-heading">Produk yang cocok</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {e.productFit.split(",").map((p) => (
                      <span key={p} className="rounded-full border border-line bg-bg px-2.5 py-1 text-[11px]">
                        {p.trim()}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {e.isAnchor && (
                <p className="mt-3 rounded-xl border border-dashed border-gold px-3 py-2 text-[11px] leading-relaxed text-muted">
                  Anchor di tepi radius — kemungkinan sudah dipegang di level korporat/wilayah. Koordinasikan sebelum pendekatan.
                </p>
              )}

              <h3 className="mb-1.5 mt-4 text-[11.5px] font-bold text-heading">Catatan follow-up RM</h3>
              <div className="rounded-xl border border-line px-3 py-2.5 text-[12px] leading-relaxed">
                {e.notes ? <p className="whitespace-pre-line">{e.notes}</p> : <p className="text-muted">Belum ada catatan.</p>}
                <p className="mt-1.5 text-[10.5px] text-muted">
                  PIC: {e.picName || "—"} · Diperbarui{" "}
                  {new Date(e.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>

              {isAdmin && (
                <Link
                  href={`/admin/${e.id}/edit`}
                  className="mt-3 inline-flex rounded-xl border border-line px-3 py-2 text-xs font-bold text-heading hover:border-blue"
                >
                  Edit data &amp; catatan →
                </Link>
              )}

              <p className="mt-4 rounded-xl bg-bg px-3 py-2.5 text-[10.5px] leading-relaxed text-muted">{DISCLAIMER}</p>
            </div>
          </>
        )}
      </section>
    </>
  );
}
