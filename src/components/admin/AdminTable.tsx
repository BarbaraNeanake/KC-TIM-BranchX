"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { EntityView } from "@/lib/entities";
import { TYPE_LABEL, statusLabel } from "@/lib/constants";
import { formatDistance } from "@/lib/geo";
import type { EntityType, Priority } from "@/generated/prisma/enums";
import { PriorityBadge } from "../PriorityBadge";
import { ConfirmDialog } from "./ConfirmDialog";
import { CsvImport } from "./CsvImport";

type SortKey = "name" | "type" | "priority" | "score" | "distanceM" | "updatedAt";
const PRIO_RANK: Record<Priority, number> = { HIGH: 0, MED: 1, LOW: 2 };

export function AdminTable({ entities }: { entities: EntityView[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [type, setType] = useState<"ALL" | EntityType>("ALL");
  const [prio, setPrio] = useState<"ALL" | Priority>("ALL");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "score", dir: -1 });
  const [toDelete, setToDelete] = useState<EntityView | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = entities.filter(
      (e) =>
        (type === "ALL" || e.type === type) &&
        (prio === "ALL" || e.priority === prio) &&
        (!query || [e.name, e.category, e.address, e.picName ?? ""].some((s) => s.toLowerCase().includes(query))),
    );
    const val = (e: EntityView): string | number =>
      sort.key === "priority" ? PRIO_RANK[e.priority] : sort.key === "name" ? e.name.toLowerCase() : e[sort.key];
    return list.sort((a, b) => (val(a) < val(b) ? -1 : val(a) > val(b) ? 1 : 0) * sort.dir);
  }, [entities, q, type, prio, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === "score" || key === "updatedAt" ? -1 : 1 }));

  async function doDelete() {
    if (!toDelete) return;
    setBusy(true);
    const res = await fetch(`/api/entities/${toDelete.id}`, { method: "DELETE" });
    setBusy(false);
    setMsg(res.ok ? { ok: true, text: `"${toDelete.name}" dihapus.` } : { ok: false, text: "Gagal menghapus data." });
    setToDelete(null);
    router.refresh();
  }

  const th = (key: SortKey, label: string, cls = "") => (
    <th className={`px-3 py-2.5 font-semibold ${cls}`} aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button type="button" onClick={() => toggleSort(key)} className="inline-flex items-center gap-1 hover:text-heading">
        {label}
        <span className="text-[9px]">{sort.key === key ? (sort.dir === 1 ? "▲" : "▼") : "↕"}</span>
      </button>
    </th>
  );

  const sel = "rounded-xl border border-line bg-bg px-3 py-2 text-[12.5px] text-ink";

  return (
    <div className="space-y-3.5">
      <section className="rounded-[20px] bg-surface p-4 shadow-[0_4px_20px_rgba(10,40,80,.06)]">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama, kategori, alamat, PIC…"
            aria-label="Cari"
            className="min-w-[200px] flex-1 rounded-xl border border-line bg-bg px-3.5 py-2 text-[13px] outline-none focus:border-blue"
          />
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)} aria-label="Tipe" className={sel}>
            <option value="ALL">Semua tipe</option>
            <option value="COMPANY">Company</option>
            <option value="MERCHANT">Merchant</option>
          </select>
          <select value={prio} onChange={(e) => setPrio(e.target.value as typeof prio)} aria-label="Prioritas" className={sel}>
            <option value="ALL">Semua prioritas</option>
            <option value="HIGH">Tinggi</option>
            <option value="MED">Sedang</option>
            <option value="LOW">Rendah</option>
          </select>
          <div className="flex gap-2 sm:ml-auto">
            <a href="/api/entities/export" download className="rounded-xl border border-line px-3.5 py-2 text-[12.5px] font-semibold hover:border-blue">
              Export CSV
            </a>
            <Link href="/admin/new" className="rounded-xl bg-navy px-3.5 py-2 text-[12.5px] font-bold text-white hover:bg-navy-deep dark:bg-blue">
              + Tambah entitas
            </Link>
          </div>
        </div>
        {msg && (
          <p role="status" className={`mt-3 text-[12px] font-semibold ${msg.ok ? "text-blue" : "text-danger"}`}>
            {msg.text}
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-[20px] bg-surface shadow-[0_4px_20px_rgba(10,40,80,.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-[12.5px]">
            <thead className="border-b border-line bg-bg text-[11.5px] text-muted">
              <tr>
                {th("name", "Nama")}
                {th("type", "Tipe")}
                {th("priority", "Prioritas")}
                {th("score", "Skor", "text-right")}
                <th className="px-3 py-2.5 font-semibold">Status</th>
                {th("distanceM", "Jarak", "text-right")}
                <th className="px-3 py-2.5 font-semibold">PIC</th>
                {th("updatedAt", "Diperbarui")}
                <th className="px-3 py-2.5 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-0 hover:bg-bg/60">
                  <td className="max-w-[260px] px-3 py-2.5">
                    <div className="truncate font-bold text-heading">{e.name}</div>
                    <div className="truncate text-[11px] text-muted">
                      {e.category}
                      {e.isAnchor && " · Anchor"}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">{TYPE_LABEL[e.type]}</td>
                  <td className="px-3 py-2.5"><PriorityBadge priority={e.priority} /></td>
                  <td className="px-3 py-2.5 text-right font-bold tabular-nums">{e.score}</td>
                  <td className="px-3 py-2.5">{statusLabel(e)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatDistance(e.distanceM)}</td>
                  <td className="px-3 py-2.5">{e.picName || <span className="text-muted">—</span>}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted">
                    {new Date(e.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "2-digit" })}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right">
                    <Link href={`/admin/${e.id}/edit`} className="rounded-lg px-2 py-1 font-semibold text-blue hover:bg-bg">
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setToDelete(e)}
                      className="rounded-lg px-2 py-1 font-semibold text-danger hover:bg-bg"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <p className="px-4 py-6 text-center text-[12.5px] text-muted">Tidak ada data.</p>}
        <p className="border-t border-line px-4 py-2.5 text-[11px] text-muted">
          {rows.length} dari {entities.length} entitas
        </p>
      </section>

      <CsvImport onDone={() => router.refresh()} />

      <ConfirmDialog
        open={!!toDelete}
        title="Hapus entitas?"
        message={
          <>
            <b className="text-ink">{toDelete?.name}</b> beserta catatan RM-nya akan dihapus permanen. Tindakan ini tidak
            bisa dibatalkan.
          </>
        }
        busy={busy}
        onConfirm={doDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
