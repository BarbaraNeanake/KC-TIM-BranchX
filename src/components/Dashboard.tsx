"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import type { BranchView, EntityView } from "@/lib/entities";
import {
  LEVEL_LABEL,
  PAYMENT_STATUS_LABEL,
  PAYROLL_STATUS_LABEL,
  PRIORITY_LABEL,
  statusLabel,
} from "@/lib/constants";
import { formatDistance } from "@/lib/geo";
import type { EntityType, PaymentStatus, PayrollStatus, Priority } from "@/generated/prisma/enums";
import type { Focus } from "./map/DashboardMap";
import { PriorityBadge } from "./PriorityBadge";
import { ReportSheet } from "./ReportSheet";

const DashboardMap = dynamic(() => import("./map/DashboardMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-[14px] bg-bg" />,
});

type TypeFilter = "ALL" | EntityType;
type PrioFilter = "ALL" | Priority;
type StatusFilter = "ALL" | PayrollStatus | PaymentStatus;
type SortKey = "score" | "distance" | "name";

const TYPE_CHIPS: [TypeFilter, string][] = [
  ["ALL", "Semua"],
  ["COMPANY", "Company"],
  ["MERCHANT", "Merchant"],
];
const PRIO_CHIPS: [PrioFilter, string][] = [
  ["ALL", "Semua prioritas"],
  ["HIGH", "Tinggi"],
  ["MED", "Sedang"],
  ["LOW", "Rendah"],
];

export function Dashboard({
  branch,
  entities,
  isAdmin,
}: {
  branch: BranchView;
  entities: EntityView[];
  isAdmin: boolean;
}) {
  const [type, setType] = useState<TypeFilter>("ALL");
  const [prio, setPrio] = useState<PrioFilter>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("score");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [focus, setFocus] = useState<Focus>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const rows = entities.filter(
      (e) =>
        (type === "ALL" || e.type === type) &&
        (prio === "ALL" || e.priority === prio) &&
        (status === "ALL" || e.payrollStatus === status || e.paymentStatus === status) &&
        (!query ||
          e.name.toLowerCase().includes(query) ||
          e.category.toLowerCase().includes(query) ||
          e.address.toLowerCase().includes(query)),
    );
    const cmp: Record<SortKey, (a: EntityView, b: EntityView) => number> = {
      score: (a, b) => b.score - a.score,
      distance: (a, b) => a.distanceM - b.distanceM,
      name: (a, b) => a.name.localeCompare(b.name, "id"),
    };
    return rows.sort(cmp[sort]);
  }, [entities, type, prio, status, q, sort]);

  const selected = entities.find((e) => e.id === selectedId) ?? null;

  const select = useCallback((id: string) => {
    setSelectedId(id);
    setSheetOpen(true);
    setFocus((f) => ({ id, n: (f?.n ?? 0) + 1 }));
  }, []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const changeType = (t: TypeFilter) => {
    setType(t);
    // Status payroll & status pembayaran berbeda domain — reset bila tidak cocok.
    if (t === "COMPANY" && status in PAYMENT_STATUS_LABEL) setStatus("ALL");
    if (t === "MERCHANT" && status in PAYROLL_STATUS_LABEL) setStatus("ALL");
  };

  const hasFilter = type !== "ALL" || prio !== "ALL" || status !== "ALL" || q !== "";

  return (
    <>
      <div className="grid gap-3.5 px-4 pt-3.5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
        {/* Peta */}
        <section className="rounded-[20px] bg-surface p-4 shadow-[0_4px_20px_rgba(10,40,80,.06)] lg:sticky lg:top-4">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <div>
              <h2 className="text-[14.5px] font-bold text-heading">Peta zonasi radius 2 km</h2>
              <p className="text-[11.5px] text-muted">Cabang di pusat · cincin 0,5 / 1 / 1,5 / 2 km</p>
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-muted">
              {filtered.length} / {entities.length} titik
            </span>
          </div>
          <div className="relative z-0 h-[340px] overflow-hidden rounded-[14px] sm:h-[420px] lg:h-[calc(100dvh-190px)] lg:min-h-[460px]">
            <DashboardMap
              branch={branch}
              entities={filtered}
              selectedId={sheetOpen ? selectedId : null}
              focus={focus}
              onSelect={select}
            />
          </div>
          <Legend />
        </section>

        {/* Filter + daftar */}
        <section className="rounded-[20px] bg-surface p-4 shadow-[0_4px_20px_rgba(10,40,80,.06)]">
          <h2 className="text-[14.5px] font-bold text-heading">Daftar company &amp; merchant</h2>
          <p className="mb-3 text-[11.5px] text-muted">Ketuk salah satu untuk lihat laporan singkat &amp; skor kelayakan</p>

          <input
            type="search"
            value={q}
            onChange={(ev) => setQ(ev.target.value)}
            placeholder="Cari nama, kategori, atau alamat…"
            aria-label="Cari entitas"
            className="mb-2.5 w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 text-[13px] text-ink outline-none focus:border-blue"
          />
          <ChipRow items={TYPE_CHIPS} value={type} onChange={changeType} label="Tipe" />
          <ChipRow items={PRIO_CHIPS} value={prio} onChange={setPrio} label="Prioritas" />
          <div className="mb-3 flex gap-2">
            <select
              value={status}
              onChange={(ev) => setStatus(ev.target.value as StatusFilter)}
              aria-label="Filter status"
              className="min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 py-2 text-[12px] text-ink"
            >
              <option value="ALL">Semua status</option>
              {type !== "MERCHANT" && (
                <optgroup label="Status payroll (company)">
                  {Object.entries(PAYROLL_STATUS_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </optgroup>
              )}
              {type !== "COMPANY" && (
                <optgroup label="Status pembayaran (merchant)">
                  {Object.entries(PAYMENT_STATUS_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </optgroup>
              )}
            </select>
            <select
              value={sort}
              onChange={(ev) => setSort(ev.target.value as SortKey)}
              aria-label="Urutkan"
              className="rounded-xl border border-line bg-bg px-3 py-2 text-[12px] text-ink"
            >
              <option value="score">Skor tertinggi</option>
              <option value="distance">Terdekat</option>
              <option value="name">Nama A–Z</option>
            </select>
          </div>
          {hasFilter && (
            <button
              type="button"
              onClick={() => {
                setType("ALL");
                setPrio("ALL");
                setStatus("ALL");
                setQ("");
              }}
              className="mb-2.5 text-[11px] font-semibold text-blue"
            >
              Reset filter
            </button>
          )}

          <ul className="space-y-2">
            {filtered.map((e) => (
              <li key={e.id}>
                <EntityCard entity={e} active={sheetOpen && e.id === selectedId} onClick={() => select(e.id)} />
              </li>
            ))}
          </ul>
          {filtered.length === 0 && <p className="px-1 py-4 text-[12px] text-muted">Tidak ada hasil untuk filter ini.</p>}
        </section>
      </div>

      <ReportSheet entity={selected} open={sheetOpen && !!selected} isAdmin={isAdmin} onClose={closeSheet} />
    </>
  );
}

function ChipRow<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: [T, string][];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="mb-2.5 flex flex-wrap gap-1.5" role="group" aria-label={label}>
      {items.map(([v, l]) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`rounded-full border px-3 py-1.5 text-[11px] transition ${
            value === v
              ? "border-navy bg-navy text-white dark:border-blue dark:bg-blue"
              : "border-line bg-surface text-muted hover:border-blue"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function EntityCard({ entity: e, active, onClick }: { entity: EntityView; active: boolean; onClick: () => void }) {
  const first =
    e.type === "COMPANY"
      ? { n: e.employeeEstimate != null ? `~${e.employeeEstimate.toLocaleString("id-ID")}` : "—", l: "karyawan" }
      : { n: e.turnoverEstimate ? LEVEL_LABEL[e.turnoverEstimate] : "—", l: "omzet" };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[14px] border px-3.5 py-3 text-left transition hover:border-blue hover:shadow-[0_4px_14px_rgba(15,32,63,.08)] ${
        active ? "border-blue shadow-[0_4px_14px_rgba(15,32,63,.08)]" : "border-line"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-block size-2 shrink-0 border-[1.5px] border-muted ${e.type === "MERCHANT" ? "rounded-[2px]" : "rounded-full"}`}
              aria-label={e.type === "MERCHANT" ? "Merchant" : "Company"}
            />
            <h3 className="truncate text-[13px] font-bold text-heading">{e.name}</h3>
          </div>
          <p className="mt-px text-[10.5px] text-muted">
            {e.category}
            {e.isAnchor && " · Anchor"}
          </p>
        </div>
        <PriorityBadge priority={e.priority} />
      </div>
      <div className="mt-2 grid grid-cols-4 gap-2 text-[10.5px] text-muted">
        <Meta n={first.n} l={first.l} />
        <Meta n={String(e.score)} l="skor" />
        <Meta n={formatDistance(e.distanceM)} l="jarak" />
        <Meta n={statusLabel(e)} l="status" small />
      </div>
    </button>
  );
}

function Meta({ n, l, small }: { n: string; l: string; small?: boolean }) {
  return (
    <div className="min-w-0">
      <b className={`block truncate font-bold text-ink ${small ? "text-[11px]" : "text-[12.5px]"}`} title={n}>
        {n}
      </b>
      {l}
    </div>
  );
}

function Legend() {
  const dot = (c: string) => <i className="inline-block size-2 rounded-full" style={{ background: c }} />;
  return (
    <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5 text-[10.5px] text-muted">
      <span className="inline-flex items-center gap-1.5">{dot("var(--high)")}{PRIORITY_LABEL.HIGH}</span>
      <span className="inline-flex items-center gap-1.5">{dot("var(--med)")}{PRIORITY_LABEL.MED}</span>
      <span className="inline-flex items-center gap-1.5">{dot("var(--low)")}{PRIORITY_LABEL.LOW}</span>
      <span className="inline-flex items-center gap-1.5">
        <i className="inline-block size-2.5 rounded-full border-2 border-muted" />Company
      </span>
      <span className="inline-flex items-center gap-1.5">
        <i className="inline-block size-2.5 rounded-[3px] border-2 border-muted" />Merchant
      </span>
      <span className="inline-flex items-center gap-1.5">
        <i className="inline-block size-2.5 rounded-[3px] border-2 border-dashed border-muted" />Anchor
      </span>
      <span className="inline-flex items-center gap-1.5">{dot("#003D79")}Cabang</span>
    </div>
  );
}
