import { AdminTable } from "@/components/admin/AdminTable";
import { requirePageRole } from "@/lib/auth";
import { getBranch, getEntitiesView } from "@/lib/entities";

export const metadata = { title: "Admin — Branch Geo-Mapping" };

export default async function AdminPage() {
  await requirePageRole("admin");
  const entities = await getEntitiesView(await getBranch());
  return <AdminTable entities={entities} />;
}
