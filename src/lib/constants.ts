import type {
  EntityIcon,
  EntityType,
  Level,
  PaymentStatus,
  PayrollStatus,
  Priority,
} from "@/generated/prisma/enums";

export const DISCLAIMER =
  "Skor, status, dan estimasi pada dashboard ini adalah simulasi internal untuk lead scoring tim RM — bukan data resmi perusahaan terkait maupun hasil SLIK OJK.";

export const TYPE_LABEL: Record<EntityType, string> = {
  COMPANY: "Company",
  MERCHANT: "Merchant",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  HIGH: "Tinggi",
  MED: "Sedang",
  LOW: "Rendah",
};

export const PAYROLL_STATUS_LABEL: Record<PayrollStatus, string> = {
  BELUM_TERGARAP: "Belum Tergarap",
  PROSPEK_HANGAT: "Prospek Hangat",
  EXISTING_BANK_LAIN: "Existing Bank Lain",
  NASABAH_MANDIRI: "Nasabah Mandiri",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  BELUM_ADA: "Belum Ada",
  QRIS_BANK_LAIN: "QRIS Bank Lain",
  EDC_BANK_LAIN: "EDC Bank Lain",
  SUDAH_MANDIRI: "Sudah Mandiri",
};

export const LEVEL_LABEL: Record<Level, string> = {
  TINGGI: "Tinggi",
  SEDANG: "Sedang",
  RENDAH: "Rendah",
};

export const ICON_LABEL: Record<EntityIcon, string> = {
  building: "Gedung / kantor",
  hospital: "Rumah sakit",
  edu: "Pendidikan",
  media: "Media",
  food: "F&B",
  retail: "Ritel",
  gold: "Emas",
  mall: "Mal",
};

/** Isi <svg viewBox="0 0 24 24"> per ikon kategori (stroke, tanpa fill). */
export const ICON_SVG: Record<EntityIcon, string> = {
  building:
    '<path d="M4 21V4.5A1.5 1.5 0 0 1 5.5 3h8A1.5 1.5 0 0 1 15 4.5V21M4 21h16M9 7h1M9 11h1M9 15h1M12.5 7h1M12.5 11h1M12.5 15h1M15 21v-5h4v5" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
  hospital:
    '<path d="M4 21V6.5A1.5 1.5 0 0 1 5.5 5H10V3h4v2h4.5A1.5 1.5 0 0 1 20 6.5V21M4 21h16M12 8v6M9 11h6" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
  edu: '<path d="M2 9l10-5 10 5-10 5-10-5Z" stroke-width="1.8" fill="none" stroke-linejoin="round"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" stroke-width="1.8" fill="none"/>',
  media:
    '<rect x="3" y="5" width="18" height="14" rx="1.5" stroke-width="1.8" fill="none"/><path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4" stroke-width="1.4"/>',
  food: '<path d="M6 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3M8 12v9M16 21V3c2.2 1 3.5 3.5 3.5 7s-1.3 4-3.5 4" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  retail:
    '<path d="M5 8h14l-1.2 12.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9L5 8Z" stroke-width="1.8" fill="none" stroke-linejoin="round"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
  gold: '<path d="M7 4h10l4 5-9 11L3 9l4-5Z" stroke-width="1.8" fill="none" stroke-linejoin="round"/><path d="M3 9h18M9.5 4 8 9l4 11 4-11-1.5-5" stroke-width="1.4" fill="none" stroke-linejoin="round"/>',
  mall: '<path d="M3 10 5 4h14l2 6M4 10h16v11H4V10Z" stroke-width="1.8" fill="none" stroke-linejoin="round"/><path d="M9.5 21v-6h5v6M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" stroke-width="1.6" fill="none"/>',
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  HIGH: "var(--gold-dark)",
  MED: "var(--blue)",
  LOW: "var(--low)",
};

export function scoreBand(score: number) {
  if (score >= 75) return { label: "Sangat baik", color: "#F2A93B" };
  if (score >= 55) return { label: "Cukup baik", color: "#0F6BC4" };
  return { label: "Perlu verifikasi lanjutan", color: "#A7B4C6" };
}

export function statusLabel(e: {
  type: EntityType;
  payrollStatus: PayrollStatus | null;
  paymentStatus: PaymentStatus | null;
}): string {
  if (e.type === "COMPANY")
    return e.payrollStatus ? PAYROLL_STATUS_LABEL[e.payrollStatus] : "—";
  return e.paymentStatus ? PAYMENT_STATUS_LABEL[e.paymentStatus] : "—";
}
