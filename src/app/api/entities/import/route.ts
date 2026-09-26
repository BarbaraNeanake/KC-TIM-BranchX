import { guardApi } from "@/lib/auth";
import { parseCsv } from "@/lib/csv";
import { prisma } from "@/lib/prisma";
import { entityInputSchema, fieldErrors, type EntityInput } from "@/lib/validation";

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_ROWS = 2000;

// POST multipart (field "file"). `?dryRun=1` hanya memvalidasi & menghitung.
// Semua-atau-tidak-sama-sekali: satu baris invalid = tidak ada yang ditulis.
// Baris dengan `id` yang ada di DB -> update; selain itu -> create.
// Entitas yang tidak ada di CSV TIDAK dihapus.
export async function POST(req: Request) {
  const denied = await guardApi("admin");
  if (denied) return denied;
  const dryRun = new URL(req.url).searchParams.get("dryRun") === "1";

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "File CSV tidak ditemukan" }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "File terlalu besar (maks 2 MB)" }, { status: 413 });

  const parsed = parseCsv(await file.text());
  if (parsed.data.length === 0) return Response.json({ error: "CSV kosong" }, { status: 400 });
  if (parsed.data.length > MAX_ROWS)
    return Response.json({ error: `Maksimal ${MAX_ROWS} baris per import` }, { status: 400 });

  const existingIds = new Set(
    (await prisma.entity.findMany({ select: { id: true } })).map((e) => e.id),
  );

  const errors: { row: number; name: string; fields: Record<string, string> }[] = [];
  const creates: EntityInput[] = [];
  const updates: { id: string; data: EntityInput }[] = [];

  parsed.data.forEach((raw, i) => {
    const row = i + 2; // +1 header, +1 penomoran mulai 1 (sesuai Excel)
    const result = entityInputSchema.safeParse(raw);
    if (!result.success) {
      errors.push({ row, name: raw.name ?? "", fields: fieldErrors(result.error) });
      return;
    }
    const id = raw.id?.trim();
    if (id && existingIds.has(id)) updates.push({ id, data: result.data });
    else creates.push(result.data);
  });

  const summary = { total: parsed.data.length, create: creates.length, update: updates.length };
  if (errors.length) return Response.json({ ...summary, errors }, { status: 422 });
  if (dryRun) return Response.json({ ...summary, dryRun: true });

  await prisma.$transaction([
    ...updates.map((u) => prisma.entity.update({ where: { id: u.id }, data: u.data })),
    ...creates.map((data) => prisma.entity.create({ data })),
  ]);
  return Response.json(summary);
}
