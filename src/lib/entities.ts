import "server-only";
import { prisma } from "./prisma";
import { haversineM } from "./geo";
import type { Branch, Entity } from "@/generated/prisma/client";

/** Entity yang sudah dilengkapi jarak ke cabang & tanggal dalam ISO string
 *  (aman dikirim ke client component). */
export type EntityView = Omit<Entity, "createdAt" | "updatedAt"> & {
  distanceM: number;
  createdAt: string;
  updatedAt: string;
};
export type BranchView = Pick<Branch, "name" | "address" | "lat" | "lng" | "radiusM">;

export async function getBranch(): Promise<BranchView> {
  const b = await prisma.branch.findFirst({ orderBy: { createdAt: "asc" } });
  if (!b)
    throw new Error("Data cabang belum ada. Jalankan `npm run db:seed`.");
  return { name: b.name, address: b.address, lat: b.lat, lng: b.lng, radiusM: b.radiusM };
}

export function toView(e: Entity, branch: BranchView): EntityView {
  return {
    ...e,
    distanceM: haversineM(branch, e),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

export async function getEntitiesView(branch: BranchView): Promise<EntityView[]> {
  const rows = await prisma.entity.findMany({
    orderBy: [{ score: "desc" }, { name: "asc" }],
  });
  return rows.map((e) => toView(e, branch));
}
