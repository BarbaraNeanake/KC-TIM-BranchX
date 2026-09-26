import { z } from "zod";
import {
  EntityIcon,
  EntityType,
  Level,
  PaymentStatus,
  PayrollStatus,
  Priority,
} from "@/generated/prisma/enums";

const vals = <T extends Record<string, string>>(e: T) =>
  Object.values(e) as [T[keyof T], ...T[keyof T][]];

/** "" / null / undefined -> undefined; lainnya diteruskan. */
const emptyToUndef = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : v;

/** Terima angka dengan koma desimal (Excel locale Indonesia). */
const num = (v: unknown) => {
  if (typeof v === "string") {
    const s = v.trim();
    if (s === "") return undefined;
    return Number(s.replace(",", "."));
  }
  return v;
};

const LAT_MSG = "Latitude harus -90..90 (cek format desimal, mis. -6.1905)";
const LNG_MSG = "Longitude harus -180..180 (cek format desimal, mis. 106.8386)";

const optionalText = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().trim().max(2000).optional(),
);

export const entityInputSchema = z
  .object({
    name: z.string({ error: "Nama wajib diisi" }).trim().min(2, "Nama minimal 2 karakter").max(200),
    type: z.enum(vals(EntityType), { error: "Pilih tipe" }),
    category: z.string({ error: "Kategori wajib diisi" }).trim().min(2, "Kategori wajib diisi").max(120),
    icon: z.enum(vals(EntityIcon), { error: "Pilih ikon" }),
    address: z.string({ error: "Alamat wajib diisi" }).trim().min(3, "Alamat wajib diisi").max(300),
    lat: z.preprocess(
      num,
      z.number({ error: "Latitude wajib angka" }).min(-90, LAT_MSG).max(90, LAT_MSG),
    ),
    lng: z.preprocess(
      num,
      z.number({ error: "Longitude wajib angka" }).min(-180, LNG_MSG).max(180, LNG_MSG),
    ),
    priority: z.enum(vals(Priority), { error: "Pilih prioritas" }),
    score: z.preprocess(
      num,
      z
        .number({ error: "Skor wajib angka" })
        .int("Skor harus bilangan bulat")
        .min(0, "Skor 0–100")
        .max(100, "Skor 0–100"),
    ),
    profile: z.string({ error: "Profil wajib diisi" }).trim().min(1, "Profil wajib diisi").max(2000),

    employeeEstimate: z.preprocess(
      (v) => num(emptyToUndef(v)),
      z.number().int("Harus bilangan bulat").min(0).optional(),
    ),
    payrollStatus: z.preprocess(
      emptyToUndef,
      z.enum(vals(PayrollStatus)).optional(),
    ),
    creditPotential: z.preprocess(emptyToUndef, z.enum(vals(Level)).optional()),

    paymentStatus: z.preprocess(
      emptyToUndef,
      z.enum(vals(PaymentStatus)).optional(),
    ),
    turnoverEstimate: z.preprocess(
      emptyToUndef,
      z.enum(vals(Level)).optional(),
    ),
    productFit: optionalText,

    isAnchor: z.preprocess((v) => {
      if (typeof v === "string")
        return ["true", "1", "ya", "yes", "y"].includes(v.trim().toLowerCase());
      return v ?? false;
    }, z.boolean()),

    notes: optionalText,
    picName: optionalText,
  })
  .superRefine((d, ctx) => {
    const need = (field: keyof typeof d, msg: string) => {
      if (d[field] === undefined)
        ctx.addIssue({ code: "custom", path: [field], message: msg });
    };
    if (d.type === "COMPANY") {
      need("employeeEstimate", "Estimasi karyawan wajib untuk company");
      need("payrollStatus", "Status payroll wajib untuk company");
      need("creditPotential", "Potensi kredit wajib untuk company");
    } else {
      need("paymentStatus", "Status pembayaran wajib untuk merchant");
      need("turnoverEstimate", "Estimasi omzet wajib untuk merchant");
    }
  })
  // Buang field milik tipe lain supaya data tetap bersih di DB.
  .transform((d) => {
    const base = {
      ...d,
      productFit: d.productFit ?? null,
      notes: d.notes ?? null,
      picName: d.picName ?? null,
    };
    return d.type === "COMPANY"
      ? {
          ...base,
          employeeEstimate: d.employeeEstimate ?? null,
          payrollStatus: d.payrollStatus ?? null,
          creditPotential: d.creditPotential ?? null,
          paymentStatus: null,
          turnoverEstimate: null,
        }
      : {
          ...base,
          employeeEstimate: null,
          payrollStatus: null,
          creditPotential: null,
          paymentStatus: d.paymentStatus ?? null,
          turnoverEstimate: d.turnoverEstimate ?? null,
        };
  });

export type EntityInput = z.output<typeof entityInputSchema>;

/** Ubah ZodError jadi { field: pesan } untuk ditampilkan di form. */
export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "_");
    out[key] ??= issue.message;
  }
  return out;
}
