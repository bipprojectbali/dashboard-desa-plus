# Task: Implementasi Sinkronisasi Data (Mirroring) NOC API

**Status**: Ready to Start
**Prioritas**: Tinggi
**Kategori**: Integrasi Data / Backend
**Deskripsi**: Membangun mekanisme pengunduhan data berkala dari API eksternal `darmasaba.muku.id` ke database lokal untuk mendukung performa dashboard yang cepat dan tangguh.

## 📋 Tahapan Implementasi

### 1. Persiapan Lingkungan & Client
- [x] Verifikasi variabel `NOC_API_URL` di `.env` sudah mengarah ke `https://darmasaba.muku.id/api/noc/docs/json`.
- [x] Buat file `src/utils/noc-external-client.ts` untuk fetcher khusus ke API eksternal (menggunakan `openapi-fetch`).
- [x] Pastikan type-safe: Generate types dari OpenAPI eksternal (jika strukturnya berbeda dengan internal).

### 2. Pembangunan Skrip Sinkronisasi (`scripts/sync-noc.ts`)
- [x] Inisialisasi Prisma Client di dalam skrip.
- [x] Implementasi fungsi `syncActiveDivisions()`:
    - [x] Fetch data dari `/active-divisions`.
    - [x] Lakukan `upsert` ke tabel `Division` (mapping `id` eksternal ke internal).
- [x] Implementasi fungsi `syncLatestProjects()`:
    - [x] Fetch data dari `/latest-projects`.
    - [x] Lakukan `upsert` ke tabel `Activity`.
- [x] Implementasi fungsi `syncUpcomingEvents()`:
    - [x] Fetch data dari `/upcoming-events`.
    - [x] Simpan ke tabel `Event`.
- [ ] Implementasi fungsi `syncDiagramDocuments()`:
    - [ ] Fetch data dari `/diagram-jumlah-document`.
    - [ ] Update statistik di tabel `Document` (atau cache table terkait).
- [x] Implementasi fungsi `syncLatestDiscussion()`:
    - [x] Fetch data dari `/latest-discussion`.
    - [x] Simpan ke tabel `Discussion` (kaitkan dengan user lokal jika memungkinkan).

### 3. Penanganan Integritas Data (Prisma Schema Updates)
- [x] Perbarui `prisma/schema.prisma` untuk menambahkan field pendukung sinkronisasi pada model-model berikut:
    - [x] **Model Division**: Tambahkan `externalId String? @unique` dan `villageId String? @default("darmasaba")`.
    - [x] **Model Activity**: Tambahkan `externalId String? @unique` dan `villageId String? @default("darmasaba")`.
    - [x] **Model Event**: Tambahkan `externalId String? @unique` dan `villageId String? @default("darmasaba")`.
    - [x] **Model Document**: Tambahkan `externalId String? @unique` dan `villageId String? @default("darmasaba")`.
    - [x] **Model Discussion**: Tambahkan `externalId String? @unique` dan `villageId String? @default("darmasaba")`.
- [x] Jalankan migrasi database: `bun x prisma migrate dev --name add_noc_sync_fields`.
- [x] Verifikasi file `generated/prisma/index.d.ts` telah terupdate dengan field baru.

### 4. Otomatisasi & CLI
- [x] Tambahkan script di `package.json`: `"sync:noc": "bun scripts/sync-noc.ts"`.
- [x] Buat mekanisme logging sederhana untuk memantau keberhasilan/kegagalan sinkronisasi (`src/utils/logger.ts`).
- [ ] (Opsional) Setup GitHub Action atau local cron job untuk menjalankan sinkronisasi setiap 30 menit.

### 5. Verifikasi & Pengujian
- [ ] Jalankan `bun run sync:noc` secara manual dan cek database (PostgreSQL).
- [ ] Verifikasi endpoint internal `/api/noc/*` mengembalikan data yang sudah tersinkronisasi.
- [ ] Cek tampilan pada UI `/kinerja-divisi` apakah data sudah muncul dengan benar.

## 📝 Catatan Teknis
- Gunakan **Transaction** di Prisma jika melakukan update massal untuk menjaga konsistensi data.
- Pastikan penanganan error yang baik: Jika API eksternal down, skrip tidak boleh merusak data lokal yang sudah ada.
- Simpan timestamp `lastSyncedAt` untuk monitoring kesehatan data.

---
*Task ini dibuat berdasarkan analisa integrasi NOC API tanggal 30 Maret 2026.*
