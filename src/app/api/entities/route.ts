import { guardApi } from "@/lib/auth";
import { getBranch, getEntitiesView, toView } from "@/lib/entities";
import { prisma } from "@/lib/prisma";
import { entityInputSchema, fieldErrors } from "@/lib/validation";

export async function GET() {
  const denied = await guardApi("viewer");
  if (denied) return denied;
  const branch = await getBranch();
  return Response.json(await getEntitiesView(branch));
}

export async function POST(req: Request) {
  const denied = await guardApi("admin");
  if (denied) return denied;
  const body = await req.json().catch(() => null);
  const parsed = entityInputSchema.safeParse(body);
  if (!parsed.success)
    return Response.json({ error: "Validasi gagal", fields: fieldErrors(parsed.error) }, { status: 422 });
  const created = await prisma.entity.create({ data: parsed.data });
  return Response.json(toView(created, await getBranch()), { status: 201 });
}
