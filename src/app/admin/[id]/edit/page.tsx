import { notFound } from "next/navigation";
import { EntityForm } from "@/components/admin/EntityForm";
import { requirePageRole } from "@/lib/auth";
import { getBranch, toView } from "@/lib/entities";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Edit entitas — Admin" };

export default async function EditEntityPage({ params }: PageProps<"/admin/[id]/edit">) {
  await requirePageRole("admin");
  const { id } = await params;
  const entity = await prisma.entity.findUnique({ where: { id } });
  if (!entity) notFound();
  const branch = await getBranch();
  return <EntityForm branch={branch} initial={toView(entity, branch)} />;
}
