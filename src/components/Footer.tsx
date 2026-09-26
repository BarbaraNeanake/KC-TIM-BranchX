import { DISCLAIMER } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mx-auto max-w-3xl px-4 pb-8 pt-5 text-center text-[10.5px] leading-relaxed text-muted">
      <p>{DISCLAIMER}</p>
      <p className="mt-1">
        Data lokasi dari titik publik sekitar Cikini–Menteng · Peta © OpenStreetMap contributors · Internal — jangan
        disebarluaskan.
      </p>
    </footer>
  );
}
