# Branch Geo-Mapping Dashboard — KCP Jakarta Taman Ismail Marzuki

Tool internal tim RM/ODP Bank Mandiri KCP Jakarta Taman Ismail Marzuki: peta interaktif Company/Institusi dan Merchant dalam radius 2 km dari cabang, dengan estimasi potensi payroll (company), potensi transaksi (merchant), dan lead scoring.

> **Disclaimer:** skor, status, dan estimasi di aplikasi ini adalah **simulasi internal** — bukan data resmi perusahaan terkait maupun hasil SLIK OJK.

## Fitur

- **Dashboard `/`**: hero + stat pills, peta Leaflet/OSM dengan pin cabang dan cincin 500/1000/1500/2000 m. Pin company berbentuk lingkaran, merchant kotak membulat, anchor berborder putus-putus. Warna border mengikuti prioritas. Filter tipe / prioritas / status / pencarian berlaku ke peta **dan** daftar. Klik kartu atau pin → pulse, peta di-pan, lalu bottom sheet laporan (gauge skor, profil, field sesuai tipe, jarak ke cabang, catatan RM).
- **Admin `/admin`**: tabel yang bisa di-sort, di-filter, dan dicari; tambah/edit/hapus dengan dialog konfirmasi; form kondisional per tipe; mini-map untuk klik atau geser pin (bisa juga tempel `lat, lng` dari Google Maps); import/export CSV.
- **Login**: seluruh app di balik password. `VIEWER_PASSWORD` = hanya lihat, `ADMIN_PASSWORD` = bisa edit.
- Dark mode mengikuti `prefers-color-scheme`. Layout mobile-first.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Prisma 7 + PostgreSQL (Supabase) · react-leaflet · Zod · Plus Jakarta Sans

## Menjalankan secara lokal

Prasyarat: Node.js 20+.

```bash
npm install                 # juga menjalankan `prisma generate`
cp .env.example .env        # isi DATABASE_URL, DIRECT_URL (Supabase), ADMIN_PASSWORD, VIEWER_PASSWORD, SESSION_SECRET
npx prisma migrate deploy   # buat tabel di database
npm run db:seed             # isi data awal (1 cabang, 12 company, 15 merchant) — hanya untuk DB kosong
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

- Cookie sesi `httpOnly`, ditandatangani HMAC-SHA256 dengan `SESSION_SECRET`. Sesi hilang saat browser ditutup dan maksimal berlaku 8 jam (`SESSION_TTL_S` di `src/lib/session.ts`).
- Menutup semua tab app lalu membukanya lagi = wajib login ulang (`TabSessionGuard`: penanda per tab di `sessionStorage`; tab baru ikut sah selama masih ada tab app lain yang terbuka, dicek via `BroadcastChannel`).
- `src/proxy.ts` (pengganti middleware di Next 16) mengarahkan pengguna yang belum login ke `/login`. Setiap halaman dan API route juga memverifikasi role sendiri (`src/lib/auth.ts`).
- Viewer: hanya `GET`. Admin: `/admin`, mutasi API, dan export CSV.
- Password bersama per role cukup untuk v1. Untuk skala lebih besar, pertimbangkan akun per RM (mis. Supabase Auth / SSO kantor) supaya ada audit trail per orang.

## Database (Supabase / PostgreSQL)

- `DATABASE_URL` = **transaction pooler** (port 6543, `?pgbouncer=true`) — dipakai aplikasi saat runtime, termasuk di Vercel.
- `DIRECT_URL` = **session pooler** (port 5432) — dipakai Prisma CLI untuk migrasi (`prisma.config.ts`). Tidak perlu di Vercel.
- Ambil keduanya dari Supabase → **Connect → ORMs → Prisma**. Password yang mengandung simbol (`@ # / ?`) harus di-URL-encode.
- Ubah schema: edit `prisma/schema.prisma` → `npm run db:migrate -- --name <nama>` → commit folder `prisma/migrations/`.

## Deploy ke Vercel

1. Import repo GitHub di Vercel.
2. Isi **Environment Variables** (Production & Preview): `DATABASE_URL` (pooler 6543), `ADMIN_PASSWORD`, `VIEWER_PASSWORD`, `SESSION_SECRET`.
3. Build command bawaan (`next build`) sudah cukup; `postinstall` menjalankan `prisma generate`.
4. Setiap ada migrasi baru, terapkan dari lokal: `npx prisma migrate deploy` (memakai `DIRECT_URL` di `.env`).
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
