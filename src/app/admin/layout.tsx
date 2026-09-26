import { Footer } from "@/components/Footer";
import { TabSessionGuard } from "@/components/TabSessionGuard";
import { TopBar } from "@/components/TopBar";
import { requirePageRole } from "@/lib/auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await requirePageRole("admin");
  return (
    <TabSessionGuard>
      <div className="mx-auto max-w-[1280px]">
        <header className="rounded-b-[26px] bg-gradient-to-br from-navy to-navy-deep px-5 pb-5 pt-[calc(18px+env(safe-area-inset-top))] text-white">
          <TopBar role={session.role} current="admin" />
          <h1 className="text-lg font-extrabold">Kelola Data Entitas</h1>
          <p className="text-[12.5px] text-[#CFE0F2]">Tambah, edit, hapus, atau update massal lewat CSV.</p>
        </header>
        <main className="px-4 pt-4">{children}</main>
        <Footer />
      </div>
    </TabSessionGuard>
  );
}
