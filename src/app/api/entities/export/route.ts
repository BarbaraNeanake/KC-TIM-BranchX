import { guardApi } from "@/lib/auth";
import { entitiesToCsv } from "@/lib/csv";
import { getBranch, getEntitiesView } from "@/lib/entities";

export async function GET() {
  const denied = await guardApi("admin");
  if (denied) return denied;
  const rows = await getEntitiesView(await getBranch());
  const date = new Date().toISOString().slice(0, 10);
  return new Response(entitiesToCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="geomapping-entitas-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
