# Summary of Changes - June 2, 2026

## Overview
Redesign komponen Riwayat Kesehatan di halaman `/sosial` — dari satu tabel "Rekam Medis" internal menjadi tiga tab berbasis data posyandu yang dikonsumsi langsung dari Desa API eksternal.

## Key Changes

### `src/components/sosial/health-records.tsx` (Major Refactor)
- **Judul** diubah dari "Rekam Medis Warga" → "Riwayat Kesehatan Warga"
- **Arsitektur**: dipecah menjadi tiga sub-komponen mandiri (`IbuHamilTab`, `BalitaTab`, `PenderitaTab`) yang masing-masing fetch data sendiri dari Desa API
- **Tab Ibu Hamil**: fetch dari `DESA_API/api/kesehatan/ibuhamil/find-many`, kolom nama, posyandu/banjar, usia kehamilan, HPHT, taksiran lahir, status (AKTIF/MELAHIRKAN/KEGUGURAN)
- **Tab Balita**: fetch dari `DESA_API/api/kesehatan/balita/find-many`, kolom nama+ortu, posyandu/banjar, tanggal lahir, JK, BB/TB, status stunting, kelengkapan imunisasi
- **Tab Penderita Penyakit**: fetch dari `DESA_API/api/kesehatan/grafikkepuasan/find-many`, kolom nama, banjar, JK, penyakit, tanggal
- **Filter banjar** berlaku global: filter di header component diteruskan ke semua tab; tiap tab filter data secara client-side (ibu hamil & balita) atau query-param (penderita penyakit)
- Pagination client-side untuk tab Ibu Hamil dan Balita (10 per halaman)
- Shared helpers: `TableSkeleton`, `EmptyState`, `tableStyles`, `fmtDate`
- Filter tahun dihapus (tidak relevan untuk data posyandu)

### `src/api/sosial.ts`
- Fix: `import { Prisma }` → `import type { Prisma }` (type-only import, menghindari bundling runtime Prisma di server)

### `generated/api.ts` + `generated/schema.json`
- Tambah definisi endpoint `GET /api/admin/sync/logs?type=&limit=` ke OpenAPI schema yang di-generate — endpoint ini sudah ada di backend sejak feat/sync-scheduler-synclog

### `src/utils/pdf-table.ts`
- Minor formatting: rapikan signature `buildPdfReport` ke satu baris (tidak ada perubahan logika)

### `tasks-post-mvp.csv`
- File baru: backlog tugas post-MVP mencakup 50+ task terstruktur untuk semua modul (beranda, kinerja divisi, pengaduan, jenna, demografi, keuangan, bumdes, sosial, keamanan, bantuan, pengaturan, admin)

## Git Workflow
1. **Branch Created**: `feat/sosial-health-posyandu-tabs`
2. **Merge**: Merged into `stg` branch

## Next Steps
- [ ] Deploy ke staging via `/deploy-stg` untuk verifikasi tab Ibu Hamil, Balita, dan Penderita Penyakit berjalan dengan Desa API
- [ ] Verify filter banjar berfungsi untuk semua tiga tab
- [ ] Implementasi task post-MVP dari `tasks-post-mvp.csv` secara bertahap sesuai prioritas dan tanggal mulai
