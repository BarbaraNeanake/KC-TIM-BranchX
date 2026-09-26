"use client";

import { useRef, useState } from "react";

type Result = {
  total?: number;
  create?: number;
  update?: number;
  dryRun?: boolean;
  error?: string;
  errors?: { row: number; name: string; fields: Record<string, string> }[];
};

export function CsvImport({ onDone }: { onDone: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [applied, setApplied] = useState(false);
  const [busy, setBusy] = useState(false);

  async function send(dryRun: boolean) {
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/entities/import${dryRun ? "?dryRun=1" : ""}`, { method: "POST", body: fd });
    const json: Result = await res.json().catch(() => ({ error: "Respons server tidak valid" }));
    setBusy(false);
    setResult(json);
    if (res.ok && !dryRun) {
      setApplied(true);
      setFile(null);
      if (input.current) input.current.value = "";
      onDone();
    }
  }

  const canApply = result?.dryRun && !result.errors?.length && !result.error;

  return (
    <section className="rounded-[20px] bg-surface p-4 shadow-[0_4px_20px_rgba(10,40,80,.06)]">
      <h2 className="text-[14.5px] font-bold text-heading">Import CSV (update massal)</h2>
      <p className="mb-3 mt-0.5 text-[11.5px] leading-relaxed text-muted">
        Mulai dari <b>Export CSV</b>, edit di Excel, lalu upload lagi. Baris dengan <code>id</code> yang ada akan
        diperbarui; baris tanpa <code>id</code> ditambahkan sebagai entitas baru. Entitas yang tidak ada di file tidak
        dihapus. Kolom <code>distanceM</code> &amp; <code>updatedAt</code> diabaikan. Satu baris invalid = tidak ada yang
        disimpan.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={input}
          type="file"
          accept=".csv,text/csv"
          aria-label="File CSV"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setResult(null);
            setApplied(false);
          }}
          className="max-w-full text-[12px] file:mr-2 file:rounded-lg file:border file:border-line file:bg-bg file:px-3 file:py-1.5 file:text-[12px] file:font-semibold file:text-ink"
        />
        <button
          type="button"
          disabled={!file || busy}
          onClick={() => send(true)}
          className="rounded-xl border border-line px-3.5 py-2 text-[12.5px] font-semibold hover:border-blue disabled:opacity-50"
        >
          {busy && !canApply ? "Memeriksa…" : "Periksa file"}
        </button>
        {canApply && (
          <button
            type="button"
            disabled={busy}
            onClick={() => send(false)}
            className="rounded-xl bg-navy px-3.5 py-2 text-[12.5px] font-bold text-white disabled:opacity-60 dark:bg-blue"
          >
            {busy ? "Menyimpan…" : `Terapkan (${result.create} baru, ${result.update} diperbarui)`}
          </button>
        )}
      </div>

      {result?.error && <p className="mt-3 text-[12px] font-semibold text-danger">{result.error}</p>}
      {canApply && (
        <p className="mt-3 text-[12px] text-blue">
          File valid: {result.total} baris — {result.create} entitas baru, {result.update} diperbarui.
        </p>
      )}
      {applied && result && !result.dryRun && (
        <p role="status" className="mt-3 text-[12px] font-semibold text-blue">
          Import berhasil: {result.create} ditambahkan, {result.update} diperbarui.
        </p>
      )}
      {!!result?.errors?.length && (
        <div className="mt-3 rounded-xl border border-danger/40 p-3 text-[12px]">
          <p className="mb-2 font-semibold text-danger">
            {result.errors.length} baris tidak valid — perbaiki lalu upload ulang. Tidak ada data yang disimpan.
          </p>
          <ul className="max-h-60 space-y-1 overflow-y-auto">
            {result.errors.map((err) => (
              <li key={err.row}>
                <b>Baris {err.row}</b>
                {err.name && ` (${err.name})`}:{" "}
                {Object.entries(err.fields)
                  .map(([f, m]) => `${f} — ${m}`)
                  .join("; ")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
