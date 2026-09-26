import { BrandLogo } from "@/components/BrandLogo";
import { DISCLAIMER } from "@/lib/constants";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Masuk — Branch Geo-Mapping" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-navy to-navy-deep px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center text-white">
          <BrandLogo className="mb-4 h-12" />
          <h1 className="text-lg font-extrabold">Branch Geo-Mapping Dashboard</h1>
          <p className="mt-1 text-xs text-[#CFE0F2]">KCP Jakarta Taman Ismail Marzuki · internal RM/ODP</p>
        </div>
        <div className="rounded-2xl bg-surface p-5 shadow-2xl">
          <LoginForm next={typeof next === "string" ? next : "/"} />
        </div>
        <p className="mt-5 text-center text-[10.5px] leading-relaxed text-[#9FB6D3]">
          Berisi lead scoring internal. Jangan bagikan password. {DISCLAIMER}
        </p>
      </div>
    </main>
  );
}
