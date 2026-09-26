import Link from "next/link";
import { logout } from "@/app/login/actions";
import type { Role } from "@/lib/session";
import { BrandLogo } from "./BrandLogo";

/** Baris atas di dalam hero: logo, role, navigasi, logout. */
export function TopBar({ role, current }: { role: Role; current: "dashboard" | "admin" }) {
  const link = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold transition ${
        active ? "bg-white/15 text-white" : "text-[#CFE0F2] hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <div className="mb-4 flex items-center gap-2">
      <Link href="/" aria-label="Dashboard">
        <BrandLogo />
      </Link>
      <nav className="ml-auto flex items-center gap-1">
        {link("/", "Dashboard", current === "dashboard")}
        {role === "admin" && link("/admin", "Admin", current === "admin")}
        <span className="ml-1 hidden rounded-full border border-white/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold sm:inline">
          {role}
        </span>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold text-[#CFE0F2] hover:bg-white/10 hover:text-white"
          >
            Keluar
          </button>
        </form>
      </nav>
    </div>
  );
}
