import { DISCLAIMER } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mx-auto max-w-3xl px-4 pb-8 pt-6 text-center text-[10.5px] leading-relaxed text-muted">
      <p className="mb-2">
        <span className="inline-block rounded-full border border-gold/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-dark dark:text-gold">
          Internal Use Only - KC Taman Ismail Marzuki
        </span>
      </p>
      <p>
        <span className="font-semibold text-ink">Developed</span> September 2026 ·{" "}
        <span className="font-semibold text-ink">Field Observation &amp; Public Information</span>
      </p>
      <p>Prospect data requires validation before acquisition activity.</p>
      <p className="mt-2">{DISCLAIMER}</p>
      <p className="mt-1">Peta © OpenStreetMap contributors</p>
      <p className="mt-3 border-t border-line pt-3 font-semibold">© 2026 KC Taman Ismail Marzuki — BranchX ODP 351</p>
    </footer>
  );
}
