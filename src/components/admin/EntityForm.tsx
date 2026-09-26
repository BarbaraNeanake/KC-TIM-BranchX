"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { BranchView, EntityView } from "@/lib/entities";
import {
  ICON_LABEL,
  LEVEL_LABEL,
  PAYMENT_STATUS_LABEL,
  PAYROLL_STATUS_LABEL,
  PRIORITY_LABEL,
} from "@/lib/constants";
import { formatDistance, haversineM } from "@/lib/geo";
import type { EntityIcon, EntityType, Priority } from "@/generated/prisma/enums";

const LocationPicker = dynamic(() => import("../map/LocationPicker"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-bg" />,
});

type FormState = Record<
  | "name" | "type" | "category" | "icon" | "address" | "lat" | "lng" | "priority" | "score" | "profile"
  | "employeeEstimate" | "payrollStatus" | "creditPotential" | "paymentStatus" | "turnoverEstimate"
  | "productFit" | "notes" | "picName",
  string
> & { isAnchor: boolean };

function toForm(e?: EntityView): FormState {
  const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));
  return {
    name: s(e?.name),
    type: e?.type ?? "COMPANY",
    category: s(e?.category),
    icon: e?.icon ?? "building",
    address: s(e?.address),
    lat: s(e?.lat),
    lng: s(e?.lng),
    priority: e?.priority ?? "MED",
    score: s(e?.score ?? 50),
    profile: s(e?.profile),
    employeeEstimate: s(e?.employeeEstimate),
    payrollStatus: s(e?.payrollStatus),
    creditPotential: s(e?.creditPotential),
    paymentStatus: s(e?.paymentStatus),
    turnoverEstimate: s(e?.turnoverEstimate),
    productFit: s(e?.productFit),
    notes: s(e?.notes),
    picName: s(e?.picName),
    isAnchor: e?.isAnchor ?? false,
  };
}

function Field(props: {
  name: string;
  label: string;
  hint?: string;
  wide?: boolean;
  errors: Record<string, string>;
  children: React.ReactNode;
}) {
  const err = props.errors[props.name];
  return (
    <div className={props.wide ? "sm:col-span-2" : ""}>
      <label htmlFor={props.name} className="mb-1 block text-[11.5px] font-semibold text-heading">
        {props.label}
      </label>
      {props.children}
      {err ? (
        <p className="mt-1 text-[11px] font-semibold text-danger">{err}</p>
      ) : (
        props.hint && <p className="mt-1 text-[11px] text-muted">{props.hint}</p>
      )}
    </div>
  );
}

export function EntityForm({ branch, initial }: { branch: BranchView; initial?: EntityView }) {
  const router = useRouter();
  const [f, setF] = useState<FormState>(() => toForm(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));
  const isCompany = f.type === "COMPANY";

  const coord = useMemo(() => {
    const lat = Number(f.lat.replace(",", "."));
    const lng = Number(f.lng.replace(",", "."));
    return f.lat && f.lng && Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  }, [f.lat, f.lng]);
  const distance = coord ? haversineM(branch, coord) : null;
  const pin = useMemo(
    () => ({ icon: f.icon as EntityIcon, type: f.type as EntityType, priority: f.priority as Priority, isAnchor: f.isAnchor }),
    [f.icon, f.type, f.priority, f.isAnchor],
  );

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setSaving(true);
    setServerError(null);
    const res = await fetch(initial ? `/api/entities/${initial.id}` : "/api/entities", {
      method: initial ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
      return;
    }
    const json = await res.json().catch(() => ({}));
    setErrors(json.fields ?? {});
    setServerError(json.error ?? "Gagal menyimpan.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const input = "w-full rounded-xl border border-line bg-bg px-3 py-2 text-[13px] text-ink outline-none focus:border-blue";
  const text = (name: keyof Omit<FormState, "isAnchor">, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input id={name} value={f[name]} onChange={(e) => set(name, e.target.value)} className={input} aria-invalid={!!errors[name]} {...extra} />
  );
  const select = (name: keyof Omit<FormState, "isAnchor">, options: Record<string, string>, placeholder?: string) => (
    <select id={name} value={f[name]} onChange={(e) => set(name, e.target.value)} className={input} aria-invalid={!!errors[name]}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {Object.entries(options).map(([v, l]) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
  );

  const card = "rounded-[20px] bg-surface p-4 shadow-[0_4px_20px_rgba(10,40,80,.06)]";

  return (
    <form onSubmit={submit} noValidate className="space-y-3.5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-[12px] font-semibold text-blue">← Kembali</Link>
        <h2 className="text-[15px] font-bold text-heading">{initial ? `Edit: ${initial.name}` : "Tambah entitas baru"}</h2>
      </div>
      {serverError && (
        <p role="alert" className="rounded-xl border border-danger/40 bg-surface px-3 py-2 text-[12.5px] font-semibold text-danger">
          {serverError}
          {Object.keys(errors).length > 0 && " — periksa field bertanda merah."}
        </p>
      )}

      <div className="grid gap-3.5 lg:grid-cols-2 lg:items-start">
        <div className="space-y-3.5">
          <section className={card}>
            <h3 className="mb-3 text-[13px] font-bold text-heading">Identitas</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field errors={errors} name="type" label="Tipe">
                <div className="flex gap-1.5" role="radiogroup" aria-label="Tipe">
                  {(["COMPANY", "MERCHANT"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={f.type === t}
                      onClick={() => set("type", t)}
                      className={`flex-1 rounded-xl border px-3 py-2 text-[12.5px] font-semibold ${
                        f.type === t ? "border-navy bg-navy text-white dark:border-blue dark:bg-blue" : "border-line text-muted"
                      }`}
                    >
                      {t === "COMPANY" ? "Company" : "Merchant"}
                    </button>
                  ))}
                </div>
              </Field>
              <Field errors={errors} name="icon" label="Ikon peta">{select("icon", ICON_LABEL)}</Field>
              <Field errors={errors} name="name" label="Nama" wide>{text("name", { required: true })}</Field>
              <Field errors={errors} name="category" label="Kategori" hint="mis. Rumah Sakit, Coffee Shop">{text("category")}</Field>
              <Field errors={errors} name="priority" label="Prioritas">{select("priority", PRIORITY_LABEL)}</Field>
              <Field errors={errors} name="address" label="Alamat" wide>{text("address")}</Field>
            </div>
          </section>

          <section className={card}>
            <h3 className="mb-3 text-[13px] font-bold text-heading">Skor &amp; potensi {isCompany ? "payroll" : "transaksi"}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field errors={errors} name="score" label={`Skor internal: ${f.score || "—"}`} hint="0–100, simulasi internal">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Number(f.score) || 0}
                    onChange={(e) => set("score", e.target.value)}
                    className="flex-1 accent-[var(--blue)]"
                    aria-label="Skor (slider)"
                  />
                  <input id="score" inputMode="numeric" value={f.score} onChange={(e) => set("score", e.target.value)} className={`${input} w-16`} />
                </div>
              </Field>
              {isCompany ? (
                <>
                  <Field errors={errors} name="employeeEstimate" label="Estimasi karyawan">{text("employeeEstimate", { inputMode: "numeric" })}</Field>
                  <Field errors={errors} name="payrollStatus" label="Status payroll">{select("payrollStatus", PAYROLL_STATUS_LABEL, "— pilih —")}</Field>
                  <Field errors={errors} name="creditPotential" label="Potensi kredit usaha">{select("creditPotential", LEVEL_LABEL, "— pilih —")}</Field>
                </>
              ) : (
                <>
                  <Field errors={errors} name="paymentStatus" label="Status pembayaran">{select("paymentStatus", PAYMENT_STATUS_LABEL, "— pilih —")}</Field>
                  <Field errors={errors} name="turnoverEstimate" label="Estimasi omzet">{select("turnoverEstimate", LEVEL_LABEL, "— pilih —")}</Field>
                </>
              )}
              <Field errors={errors} name="productFit" label="Produk yang cocok" hint="Pisahkan dengan koma, mis. Livin' Merchant, EDC, KUR" wide>
                {text("productFit")}
              </Field>
              <div className="sm:col-span-2">
                <label className="flex items-start gap-2 text-[12.5px]">
                  <input type="checkbox" checked={f.isAnchor} onChange={(e) => set("isAnchor", e.target.checked)} className="mt-0.5 accent-[var(--blue)]" />
                  <span>
                    <b className="text-heading">Anchor</b> — mall/entitas besar di tepi radius yang kemungkinan dipegang level korporat
                  </span>
                </label>
              </div>
              <Field errors={errors} name="profile" label="Profil singkat" wide>
                <textarea id="profile" rows={4} value={f.profile} onChange={(e) => set("profile", e.target.value)} className={input} />
              </Field>
            </div>
          </section>
        </div>

        <div className="space-y-3.5">
          <section className={card}>
            <h3 className="text-[13px] font-bold text-heading">Lokasi</h3>
            <p className="mb-3 text-[11.5px] text-muted">Klik peta atau geser pin. Bisa juga tempel koordinat dari Google Maps.</p>
            <div className="relative z-0 mb-3 h-[300px] overflow-hidden rounded-[14px] border border-line">
              <LocationPicker
                branch={branch}
                value={coord}
                pin={pin}
                onChange={(lat, lng) => setF((p) => ({ ...p, lat: String(lat), lng: String(lng) }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field errors={errors} name="lat" label="Latitude">{text("lat", { inputMode: "decimal", placeholder: "-6.19…" })}</Field>
              <Field errors={errors} name="lng" label="Longitude">
                {text("lng", {
                  inputMode: "decimal",
                  placeholder: "106.83…",
                  onPaste: (e) => {
                    // Tempel "-6.19, 106.83" dari Google Maps langsung ke dua kolom.
                    const m = e.clipboardData.getData("text").match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
                    if (m) {
                      e.preventDefault();
                      setF((p) => ({ ...p, lat: m[1], lng: m[2] }));
                    }
                  },
                })}
              </Field>
            </div>
            <p className={`mt-2 text-[11.5px] ${distance !== null && distance > branch.radiusM ? "font-semibold text-danger" : "text-muted"}`}>
              {distance === null
                ? "Belum ada koordinat."
                : `Jarak ke cabang: ${formatDistance(distance)}${distance > branch.radiusM ? " — di luar radius cabang" : ""}`}
            </p>
          </section>

          <section className={card}>
            <h3 className="mb-3 text-[13px] font-bold text-heading">Follow-up RM</h3>
            <div className="grid gap-3">
              <Field errors={errors} name="picName" label="PIC / RM">{text("picName")}</Field>
              <Field errors={errors} name="notes" label="Catatan">
                <textarea id="notes" rows={4} value={f.notes} onChange={(e) => set("notes", e.target.value)} className={input} />
              </Field>
            </div>
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 flex justify-end gap-2 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur">
        <Link href="/admin" className="rounded-xl border border-line px-4 py-2 text-[13px] font-semibold">Batal</Link>
        <button type="submit" disabled={saving} className="rounded-xl bg-navy px-5 py-2 text-[13px] font-bold text-white disabled:opacity-60 dark:bg-blue">
          {saving ? "Menyimpan…" : initial ? "Simpan perubahan" : "Tambah entitas"}
        </button>
      </div>
    </form>
  );
}
