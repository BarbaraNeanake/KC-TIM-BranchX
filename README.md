# Branch Geo-Mapping Dashboard — KCP Jakarta Taman Ismail Marzuki

Tool internal tim RM/ODP Bank Mandiri KCP Jakarta Taman Ismail Marzuki: peta interaktif Company/Institusi dan Merchant dalam radius 2 km dari cabang, dengan estimasi potensi payroll (company), potensi transaksi (merchant), dan lead scoring.

> **Disclaimer:** skor, status, dan estimasi di aplikasi ini adalah **simulasi internal** — bukan data resmi perusahaan terkait maupun hasil SLIK OJK.

## Fitur

- **Dashboard `/`**: hero + stat pills, peta Leaflet/OSM dengan pin cabang dan cincin 500/1000/1500/2000 m. Pin company berbentuk lingkaran, merchant kotak membulat, anchor berborder putus-putus. Warna border mengikuti prioritas. Filter tipe / prioritas / status / pencarian berlaku ke peta **dan** daftar. Klik kartu atau pin → pulse, peta di-pan, lalu bottom sheet laporan (gauge skor, profil, field sesuai tipe, jarak ke cabang, catatan RM).
- **Admin `/admin`**: tabel yang bisa di-sort, di-filter, dan dicari; tambah/edit/hapus dengan dialog konfirmasi; form kondisional per tipe; mini-map untuk klik atau geser pin (bisa juga tempel `lat, lng` dari Google Maps); import/export CSV.
- **Login**: seluruh app di balik password. `VIEWER_PASSWORD` = hanya lihat, `ADMIN_PASSWORD` = bisa edit.
- Dark mode mengikuti `prefers-color-scheme`. Layout mobile-first.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Prisma 7 + SQLite (dev) · react-leaflet · Zod · Plus Jakarta Sans

## Menjalankan secara lokal

Prasyarat: Node.js 20+.

```bash
npm install                 # juga menjalankan `prisma generate`
cp .env.example .env        # lalu isi ADMIN_PASSWORD, VIEWER_PASSWORD, SESSION_SECRET
npm run db:migrate          # buat/terapkan migrasi ke prisma/dev.db
npm run db:seed             # isi data awal (1 cabang, 12 company, 15 merchant)
npm run dev                 # http://localhost:3000
```

Buat `SESSION_SECRET` (minimal 32 karakter acak) dengan:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Perintah lain:

| Perintah | Fungsi |
|---|---|
| `npm run db:studio` | Buka Prisma Studio (GUI database) |
| `npm run db:seed` | **Reset** data ke isi awal. Menghapus semua entitas & catatan RM, jadi jangan dipakai di produksi. |
| `npm run build` / `npm start` | Build & jalankan mode produksi |
| `npm run lint` | ESLint |

## Data

- Model ada di `prisma/schema.prisma`: `Entity` (company & merchant dalam satu tabel, kolom khusus-tipe nullable) dan `Branch` (konfigurasi cabang).
- Jarak ke cabang **tidak disimpan**. Jarak dihitung dengan haversine (`src/lib/geo.ts`) setiap kali data dibaca.
- Validasi form, API, dan CSV memakai satu skema Zod: `src/lib/validation.ts`.
- `prisma/seed-data.ts` hanya dipakai untuk isi awal. Setelah itu, sumber kebenaran ada di database dan perubahan dilakukan lewat `/admin`.
- **TODO:** koordinat cabang `[-6.1905, 106.8386]` masih perkiraan dan perlu diverifikasi manual di Google Maps. Koreksi lewat Prisma Studio (tabel `Branch`).

### Import / export CSV

1. `/admin` → **Export CSV**. Delimiter `;` dengan UTF-8 BOM, supaya langsung rapi di Excel berlocale Indonesia.
2. Edit di Excel, lalu simpan sebagai CSV.
3. `/admin` → pilih file → **Periksa file** (dry-run) → **Terapkan**.

Aturan import:
- Baris dengan `id` yang sudah ada akan di-update. Baris tanpa `id` atau dengan `id` yang tidak dikenal dibuat sebagai entitas baru.
- Entitas yang tidak ada di file **tidak** dihapus.
- Satu baris invalid membatalkan seluruh import. Nomor baris dan field yang salah ditampilkan.
- Kolom `distanceM` dan `updatedAt` diabaikan.
- Angka desimal boleh memakai koma (`-6,19`). Kalau Excel mengubah `-6.1905` menjadi `-61905`, import akan menolaknya. Format kolom `lat`/`lng` sebagai **Text** di Excel.

## Keamanan (v1)

- Cookie sesi `httpOnly`, ditandatangani HMAC-SHA256 dengan `SESSION_SECRET`, berlaku 12 jam.
- `src/proxy.ts` (pengganti middleware di Next 16) mengarahkan pengguna yang belum login ke `/login`. Setiap halaman dan API route juga memverifikasi role sendiri (`src/lib/auth.ts`).
- Viewer: hanya `GET`. Admin: `/admin`, mutasi API, dan export CSV.
- Password bersama per role cukup untuk v1. Untuk skala lebih besar, pertimbangkan akun per RM (mis. Supabase Auth / SSO kantor) supaya ada audit trail per orang.

## Pindah ke Supabase (PostgreSQL)

Schema sengaja hanya memakai fitur yang ada di SQLite **dan** PostgreSQL.

1. Buat project di Supabase. Salin connection string dari **Connect → ORMs → Prisma**. Pakai URL *pooler* (port 6543, `?pgbouncer=true`) untuk runtime, dan URL *direct/session* (port 5432) untuk migrasi.
2. Pasang adapter Postgres:
   ```bash
   npm install @prisma/adapter-pg pg
   npm uninstall @prisma/adapter-better-sqlite3
   ```
3. Di `prisma/schema.prisma`, ubah `provider = "sqlite"` menjadi `provider = "postgresql"`.
4. Di `src/lib/prisma.ts`, ganti adapter:
   ```ts
   import { PrismaPg } from "@prisma/adapter-pg";
   const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
   ```
5. Hapus folder `prisma/migrations/` (migrasi SQLite tidak kompatibel dengan Postgres). Set `DATABASE_URL` ke URL direct (5432), lalu:
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed        # opsional, hanya untuk DB kosong
   ```
6. Untuk runtime/deploy, set `DATABASE_URL` ke URL pooler (6543).

## Deploy ke Vercel

SQLite tidak cocok di Vercel (filesystem read-only/ephemeral), jadi lakukan langkah Supabase di atas terlebih dahulu.

1. Push repo ke GitHub, lalu import project di Vercel.
2. Isi **Environment Variables**: `DATABASE_URL` (URL pooler Supabase), `ADMIN_PASSWORD`, `VIEWER_PASSWORD`, `SESSION_SECRET`.
3. Build command bawaan (`next build`) sudah cukup, karena `postinstall` menjalankan `prisma generate`.
4. Terapkan migrasi ke database produksi dari lokal: `DATABASE_URL=<url-direct> npx prisma migrate deploy`.
5. Karena berisi lead scoring internal, pertimbangkan juga **Vercel Deployment Protection** sebagai lapisan tambahan.

## Struktur

```
prisma/            schema, migrasi, seed
src/proxy.ts       proteksi login (Next 16 "proxy", dulu middleware)
src/app/           halaman: / (dashboard), /login, /admin, /admin/new, /admin/[id]/edit
src/app/api/       entities (CRUD), entities/export, entities/import
src/components/    Dashboard, ReportSheet, map/ (Leaflet, client-only), admin/
src/lib/           prisma, auth/session, validation (Zod), csv, geo, constants
reference/         desain referensi awal (HTML statis)
```
