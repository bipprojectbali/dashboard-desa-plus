# Summary: Export PDF, NOC Auth Fix, Health Records API

## Tanggal
2026-05-30

## Branch
`feat/export-pdf-noc-auth-sosial`

---

## Perubahan Utama

### 1. Export PDF — Kinerja Divisi, Pengaduan, Activity Log
- **`src/utils/pdf-table.ts`** *(baru)* — Utility PDF generation dengan `pdfkit`. Mendukung multi-section laporan (`buildPdfReport`) dan single-section (`buildPdfTable`). Baris tabel memakai tinggi dinamis via `doc.heightOfString()` sehingga teks panjang tidak overlap.
- **`src/api/noc.ts`** — Tambah endpoint `GET /noc/export-activities`: mengambil 5 sumber data (kegiatan, divisi, progres, dokumen, diskusi) dan menghasilkan PDF 5-seksi.
- **`src/api/complaint.ts`** — Tambah endpoint `GET /complaint/export`: PDF daftar pengaduan (Judul, Kategori, Status, Tanggal).
- **`src/api/activity-log.ts`** — Update endpoint `GET /activity-log/export` dari CSV ke PDF.
- **`src/components/kinerja-divisi.tsx`** — Tambah tombol "Export PDF" yang hanya tampil jika `izinExportData` aktif di preferensi akses.
- **`src/components/pengaduan-layanan-publik.tsx`** — Tambah tombol "Export PDF" dengan guard `izinExportData`.
- **`src/components/pengaturan/keamanan.tsx`** — Tombol download log diubah ke PDF, diproteksi dengan `izinExportData`.

### 2. NOC External API — Autentikasi
- **`.env`** — Tambah `NOC_API_KEY` (nilai di `.env` lokal, tidak di-commit).
- **`src/utils/noc-external-client.ts`** — Client sekarang mengirim header `x-api-key` otomatis di setiap request ke `darmasaba.muku.id`. Fix error "Unauthorized" saat sinkronisasi NOC.

### 3. Sosial API — Health Records
- **`src/api/sosial.ts`** *(baru)* — Endpoint `/sosial/banjars` dan `/sosial/health-records` dengan filter banjarId, tahun, pagination.
- **`src/components/sosial/health-records.tsx`** *(baru)* — Komponen tabel health records.
- **`src/components/sosial-page.tsx`** — Integrasi komponen health records.
- **`src/api/index.tsx`** — Mount plugin `sosial`.
- **`prisma/seeders/seed-health-records.ts`** *(baru)* — Seeder data health records.

### 4. TypeScript Fixes
- **`src/api/sosial.ts`** — Ganti `Parameters<typeof prisma.healthRecord.findMany>[0]["where"]` dengan `Prisma.HealthRecordWhereInput` dari `"generated/prisma"` (bukan `"@prisma/client"`).
- **`src/api/noc.ts`, `activity-log.ts`, `complaint.ts`** — Fix `Buffer` tidak kompatibel dengan `BodyInit`: konversi ke `ArrayBuffer` via `buffer.buffer.slice(...)`.

---

## File Baru
| File | Keterangan |
|---|---|
| `src/utils/pdf-table.ts` | PDF generation utility |
| `src/api/sosial.ts` | API sosial (banjars, health records) |
| `src/components/sosial/health-records.tsx` | Komponen health records |
| `prisma/seeders/seed-health-records.ts` | Seeder health records |

## File Diubah
| File | Perubahan |
|---|---|
| `src/api/noc.ts` | Export PDF endpoint + Buffer fix |
| `src/api/complaint.ts` | Export PDF endpoint + Buffer fix |
| `src/api/activity-log.ts` | CSV → PDF + Buffer fix |
| `src/api/index.tsx` | Mount sosial plugin |
| `src/utils/noc-external-client.ts` | Tambah x-api-key header |
| `src/components/kinerja-divisi.tsx` | Tombol Export PDF |
| `src/components/pengaduan-layanan-publik.tsx` | Tombol Export PDF |
| `src/components/pengaturan/keamanan.tsx` | Download log → PDF |
| `src/components/sosial-page.tsx` | Integrasi health records |
| `src/components/sosial/posyandu-schedule.tsx` | Update minor |
| `generated/api.ts`, `generated/schema.json` | Regenerate dari schema terbaru |
