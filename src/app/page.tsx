import { Dashboard } from "@/components/Dashboard";
import { Footer } from "@/components/Footer";
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
    { n: fmt(entities.length), l: "Entitas" },
    { n: `~${fmt(employees)}`, l: "Est. karyawan" },
    { n: fmt(high), l: "Prioritas tinggi" },
    { n: fmt(untapped), l: "Belum tergarap" },
    { n: fmt(merchants), l: "Merchant" },
  ];

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
          <div key={s.l} className="rounded-[14px] bg-surface px-1.5 py-2.5 text-center shadow-[0_2px_10px_rgba(10,40,80,.06)]">
            <div className="text-base font-extrabold text-heading lg:text-lg">{s.n}</div>
            <div className="mt-0.5 text-[9.5px] leading-tight text-muted lg:text-[11px]">{s.l}</div>
          </div>
        ))}
      </section>

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
