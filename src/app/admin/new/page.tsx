import { EntityForm } from "@/components/admin/EntityForm";
import { requirePageRole } from "@/lib/auth";
import { getBranch } from "@/lib/entities";

export const metadata = { title: "Tambah entitas — Admin" };

export default async function NewEntityPage() {
  await requirePageRole("admin");
  return <EntityForm branch={await getBranch()} />;
}
