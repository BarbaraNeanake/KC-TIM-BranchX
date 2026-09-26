import { scoreBand } from "@/lib/constants";

// Panel penjelasan angka ringkasan & tolak ukur yang dipakai di dashboard.
// Pakai <details> supaya bisa dibuka-tutup tanpa JavaScript.

type Counts = Record<string, number>;

export function StatsGuide({ counts }: { counts: Counts }) {
  const c = (k: string) => <b className="tabular-nums text-ink">{counts[k] ?? 0}</b>;
  const band = (s: number) => scoreBand(s).color;

  return (
    <details className="group mx-4 mt-2 rounded-[14px] bg-surface text-[12px] leading-relaxed shadow-[0_2px_10px_rgba(10,40,80,.06)]">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-[12px] font-semibold text-heading [&::-webkit-details-marker]:hidden">
        <span className="flex size-4 items-center justify-center rounded-full border border-current text-[10px]">i</span>
        Keterangan angka &amp; tolak ukur
        <span className="ml-auto text-muted transition group-open:rotate-180">▾</span>
      </summary>

      <div className="grid gap-4 border-t border-line px-4 pb-4 pt-3 md:grid-cols-2 lg:grid-cols-3">
        <Block title="Prioritas lead (Tinggi / Sedang / Rendah)">
          <p className="text-muted">
            Urutan siapa yang didatangi RM lebih dulu. <b className="text-ink">Diisi manual oleh admin/RM</b>, bukan
            dihitung otomatis. Pertimbangannya:
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted">
            <li>Skor internal (lihat di bawah)</li>
            <li>Besar potensi: jumlah karyawan (company) atau omzet (merchant)</li>
            <li>Status: yang belum tergarap / belum punya alat bayar diutamakan</li>
            <li>Kemudahan akses: jarak ke cabang, keputusan bisa diambil di lokasi</li>
            <li>Anchor (mal besar di tepi radius) umumnya Rendah karena dipegang level korporat</li>
          </ul>
          <p className="mt-1 text-muted">
            Saat ini: Tinggi {c("HIGH")} · Sedang {c("MED")} · Rendah {c("LOW")}
          </p>
        </Block>

        <Block title="Skor internal (0–100)">
          <p className="text-muted">Nilai kelayakan simulasi, ditampilkan sebagai gauge di laporan:</p>
          <ul className="mt-1 space-y-0.5">
            <Row dot={band(80)} label="75–100 · Sangat baik" desc="potensi besar & peluang masuk jelas" />
            <Row dot={band(60)} label="55–74 · Cukup baik" desc="layak digarap, perlu pendekatan" />
            <Row dot={band(40)} label="0–54 · Perlu verifikasi lanjutan" desc="data/peluang belum meyakinkan" />
          </ul>
        </Block>

        <Block title="Status payroll (company)">
          <ul className="space-y-0.5">
            <Row label="Belum Tergarap" count={c("BELUM_TERGARAP")} desc="belum teridentifikasi punya payroll di bank mana pun — target utama" />
            <Row label="Prospek Hangat" count={c("PROSPEK_HANGAT")} desc="sudah ada kontak/ketertarikan, tinggal ditindaklanjuti" />
            <Row label="Existing Bank Lain" count={c("EXISTING_BANK_LAIN")} desc="payroll di bank lain — peluang take-over" />
            <Row label="Nasabah Mandiri" count={c("NASABAH_MANDIRI")} desc="sudah payroll Mandiri — fokus cross-sell" />
          </ul>
        </Block>

        <Block title="Status pembayaran (merchant)">
          <ul className="space-y-0.5">
            <Row label="Belum Ada" count={c("BELUM_ADA")} desc="masih tunai, belum punya QRIS/EDC — target utama" />
            <Row label="QRIS Bank Lain" count={c("QRIS_BANK_LAIN")} desc="sudah non-tunai via QRIS bank lain" />
            <Row label="EDC Bank Lain" count={c("EDC_BANK_LAIN")} desc="pakai mesin EDC bank lain" />
            <Row label="Sudah Mandiri" count={c("SUDAH_MANDIRI")} desc="sudah merchant Mandiri — jaga & tingkatkan volume" />
          </ul>
        </Block>

        <Block title="Estimasi karyawan / omzet / potensi kredit">
          <p className="text-muted">
            Perkiraan dari observasi lapangan & informasi publik (ukuran gedung, layanan, jam operasi), bukan data resmi
            perusahaan. Omzet dan potensi kredit dinilai kualitatif: Tinggi / Sedang / Rendah.
          </p>
        </Block>

        <Block title="Jarak ke cabang">
          <p className="text-muted">
            Dihitung otomatis dari koordinat (garis lurus/haversine), bukan jarak tempuh jalan. Cincin peta: 0,5 / 1 /
            1,5 / 2 km.
          </p>
        </Block>
      </div>
    </details>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 text-[12px] font-bold text-heading">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, desc, dot, count }: { label: string; desc: string; dot?: string; count?: React.ReactNode }) {
  return (
    <li className="flex gap-1.5">
      {dot && <i className="mt-[5px] inline-block size-2 shrink-0 rounded-full" style={{ background: dot }} />}
      <span className="text-muted">
        <b className="text-ink">{label}</b>
        {count !== undefined && <> ({count})</>} — {desc}
      </span>
    </li>
  );
}
