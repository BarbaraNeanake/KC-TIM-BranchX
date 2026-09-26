import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrasi lewat session pooler (5432); runtime app memakai DATABASE_URL (6543).
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
