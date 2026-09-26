import { Dashboard } from "@/components/Dashboard";
import { Footer } from "@/components/Footer";
import { StatsGuide } from "@/components/StatsGuide";
import { TopBar } from "@/components/TopBar";
import { requirePageRole } from "@/lib/auth";
import { getBranch, getEntitiesView } from "@/lib/entities";

export default async function HomePage() {
  const session = await requirePageRole("viewer");
  const branch = await getBranch();
  const entities = await getEntitiesView(branch);

  const companies = entities.filter((e) => e.type === "COMPANY");
  const merchants = entities.length - companies.length;
  const employees = companies.reduce((s, e) => s + (e.employeeEstimate ?? 0), 0);
  const high = entities.filter((e) => e.priority === "HIGH").length;
  const untapped = companies.filter((e) => e.payrollStatus === "BELUM_TERGARAP").length;
  const highMerchant = entities.filter((e) => e.type === "MERCHANT" && e.priority === "HIGH").length;
  const radiusKm = (branch.radiusM / 1000).toLocaleString("id-ID");
  const fmt = (n: number) => n.toLocaleString("id-ID");

  const stats = [
    { n: fmt(entities.length), l: "Entitas", d: `Company + merchant dalam radius ${radiusKm} km` },
    { n: `~${fmt(employees)}`, l: "Est. karyawan", d: "Total perkiraan karyawan semua company (potensi payroll)" },
    { n: fmt(high), l: "Prioritas tinggi", d: "Company & merchant yang didatangi lebih dulu" },
    { n: fmt(untapped), l: "Belum tergarap", d: "Company tanpa payroll di bank mana pun" },
    { n: fmt(merchants), l: "Merchant", d: "Toko, kafe, pasar & mal yang dipetakan" },
  ];

  // Jumlah per prioritas & status untuk panel keterangan.
  const counts: Record<string, number> = {};
  for (const e of entities) {
    for (const k of [e.priority, e.payrollStatus, e.paymentStatus]) if (k) counts[k] = (counts[k] ?? 0) + 1;
  }

  return (
    <div className="mx-auto max-w-[1280px]">
      <header className="rounded-b-[26px] bg-gradient-to-br from-navy to-navy-deep px-5 pb-6 pt-[calc(18px+env(safe-area-inset-top))] text-white">
        <TopBar role={session.role} current="dashboard" />
        <div className="lg:flex lg:items-end lg:justify-between lg:gap-8">
          <div className="max-w-2xl">
            <h1 className="mb-1.5 text-xl font-extrabold leading-tight lg:text-2xl">
              Peta Potensi Company, Payroll &amp; Merchant
            </h1>
            <p className="mb-3.5 text-[13px] leading-relaxed text-[#CFE0F2]">
              {branch.name} · {branch.address}. Pemetaan radius {radiusKm} km untuk targeting presisi dan lead scoring
              tim RM.
            </p>
          </div>
          <ul className="flex flex-col gap-[7px] text-[12.5px] text-[#E7F0FA] lg:mb-3.5 lg:shrink-0">
            <Bullet>
              <b className="text-white">
                {companies.length} company &amp; {merchants} merchant
              </b>{" "}
              dalam radius {radiusKm} km
            </Bullet>
            <Bullet>
              Estimasi <b className="text-white">~{fmt(employees)} karyawan</b> berpotensi payroll
            </Bullet>
            <Bullet>
              <b className="text-white">{untapped} company</b> belum tergarap,{" "}
              <b className="text-white">{highMerchant} merchant</b> prioritas tinggi
            </Bullet>
          </ul>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-2 px-4 pt-4 sm:grid-cols-5" aria-label="Ringkasan">
        {stats.map((s) => (
          <div key={s.l} className="rounded-[14px] bg-surface px-2 py-2.5 text-center shadow-[0_2px_10px_rgba(10,40,80,.06)]">
            <div className="text-base font-extrabold text-heading lg:text-lg">{s.n}</div>
            <div className="mt-0.5 text-[10px] font-semibold leading-tight text-ink lg:text-[11.5px]">{s.l}</div>
            <div className="mt-1 text-[9px] leading-snug text-muted lg:text-[10.5px]">{s.d}</div>
          </div>
        ))}
      </section>
      <StatsGuide counts={counts} />

      <Dashboard branch={branch} entities={entities} isAdmin={session.role === "admin"} />
      <Footer />
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-[7px]">
      <span className="shrink-0 font-extrabold text-gold">✓</span>
      <span>{children}</span>
    </li>
  );
}
