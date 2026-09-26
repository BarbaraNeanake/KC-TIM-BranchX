import Papa from "papaparse";
import type { EntityView } from "./entities";

// Kolom CSV = nama field DB, supaya mudah dipetakan balik saat import.
// `distanceM` & `updatedAt` hanya informasi (diabaikan saat import).
export const CSV_COLUMNS = [
  "id",
  "name",
  "type",
  "category",
  "icon",
  "address",
  "lat",
  "lng",
  "priority",
  "score",
  "profile",
  "employeeEstimate",
  "payrollStatus",
  "creditPotential",
  "paymentStatus",
  "turnoverEstimate",
  "productFit",
  "isAnchor",
  "notes",
  "picName",
  "distanceM",
  "updatedAt",
] as const;

/** Delimiter `;` + BOM agar langsung terbuka rapi di Excel locale Indonesia. */
export function entitiesToCsv(rows: EntityView[]): string {
  const data = rows.map((e) =>
    CSV_COLUMNS.map((c) => {
      if (c === "distanceM") return Math.round(e.distanceM);
      const v = e[c as keyof EntityView];
      return v === null || v === undefined ? "" : v;
    }),
  );
  return "﻿" + Papa.unparse({ fields: [...CSV_COLUMNS], data }, { delimiter: ";" });
}

export function parseCsv(text: string) {
  return Papa.parse<Record<string, string>>(text.replace(/^﻿/, ""), {
    header: true,
    skipEmptyLines: "greedy",
    delimitersToGuess: [";", ",", "\t"],
    transformHeader: (h) => h.trim(),
  });
}
