import { guardApi } from "@/lib/auth";
import { getBranch, toView } from "@/lib/entities";
import { prisma } from "@/lib/prisma";
import { entityInputSchema, fieldErrors } from "@/lib/validation";

type Ctx = RouteContext<"/api/entities/[id]">;

const notFound = () => Response.json({ error: "Data tidak ditemukan" }, { status: 404 });

export async function GET(_req: Request, ctx: Ctx) {
  const denied = await guardApi("viewer");
  if (denied) return denied;
  const { id } = await ctx.params;
  const e = await prisma.entity.findUnique({ where: { id } });
  return e ? Response.json(toView(e, await getBranch())) : notFound();
}

export async function PUT(req: Request, ctx: Ctx) {
  const denied = await guardApi("admin");
  if (denied) return denied;
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = entityInputSchema.safeParse(body);
  if (!parsed.success)
    return Response.json({ error: "Validasi gagal", fields: fieldErrors(parsed.error) }, { status: 422 });
  if (!(await prisma.entity.findUnique({ where: { id }, select: { id: true } }))) return notFound();
  const updated = await prisma.entity.update({ where: { id }, data: parsed.data });
  return Response.json(toView(updated, await getBranch()));
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const denied = await guardApi("admin");
  if (denied) return denied;
  const { id } = await ctx.params;
  const { count } = await prisma.entity.deleteMany({ where: { id } });
  return count ? new Response(null, { status: 204 }) : notFound();
}
