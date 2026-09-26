import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { branchSeed, companySeed, merchantSeed } from "./seed-data";

async function main() {
  // Seed bersifat reset: hapus semua lalu isi ulang. Jangan jalankan di
  // database produksi yang sudah berisi catatan RM.
  await prisma.entity.deleteMany();
  await prisma.branch.deleteMany();

  await prisma.branch.create({ data: branchSeed });
  const entities = [...companySeed, ...merchantSeed];
  for (const data of entities) {
    await prisma.entity.create({ data });
  }

  console.log(
    `Seed selesai: 1 cabang, ${companySeed.length} company, ${merchantSeed.length} merchant.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
