# Transisi Data ke API Live — Dashboard Desa Plus

> Tanggal: 20 Jul 2026 · Branch target: `feature/live-api-transition`

## Context

User ingin semua menu dashboard mengambil data **langsung dari Desa API (live)**, bukan dari DB lokal (Prisma). Investigasi `src/api/` menunjukkan pola campur: sebagian handler sudah `desaExternalClient` (live + cache), sebagian masih `prisma.*`, dan 2 komponen memanggil endpoint yang **tidak ada** (404). User minta 3 hal: (1) audit sumber data semua menu, (2) daftar komponen yang belum/tidak ada alamat API-nya, (3) transisi yang belum live ke API langsung.

Probe ke Desa API staging (`https://desa-darmasaba-stg.wibudev.com/api/docs/json`) memastikan hampir semua data lokal punya padanan endpoint live. Cache eksternal = `InMemoryCache` (`src/utils/cache.ts`, Map+TTL), bukan DB — jadi "live + withCache" tetap dihitung API langsung.

Keputusan user: chat Jenna akan **dihapus UI-nya** (tidak dipakai); komponen lain harus live jika ada API-nya; untuk yang tak ada API, cukup **dibuatkan daftar**.

---

## 1) AUDIT — Sumber Data per Handler `src/api`

| Komponen | Endpoint internal | Handler | Sumber | Status |
|---|---|---|---|---|
| dashboard-content | `/api/complaint/stats`, `/api/resident/stats`, `/api/complaint/service-weekly`, `/api/dashboard/sdgs` | complaint.ts, resident.ts, dashboard.ts | **Prisma** | 🔴 lokal |
| kinerja-divisi | `/api/noc/latest-projects` | noc.ts | live NOC + fallback DB | 🟡 hybrid |
| kinerja-divisi | `/api/event/today` | event.ts | **Prisma** | 🔴 lokal |
| pengaduan-layanan-publik | `/api/noc/pengaduan` | — | **ROUTE HILANG** | ⚫ 404 |
| jenna-analytic | `/api/jenna/analytics` | — | **ROUTE HILANG** | ⚫ 404 |
| demografi-pekerjaan | `/api/demografi/*` (9) | demografi.ts | desaExternalClient + cache | 🟢 live |
| keuangan-anggaran | `/api/demografi/apbdes/{id}` | demografi.ts | desaExternalClient + cache | 🟢 live |
| bumdes-page | `/api/bumdes/*` (7) | bumdes.ts | desaExternalClient + cache | 🟢 live |
| sosial-page | `/api/sosial/kesehatan/stats`, `/posyandu/find-many`, `/event-budaya/find-upcoming` | sosial.ts | desaExternalClient + cache | 🟢 live |
| sosial/health-records | `/api/sosial/kesehatan/riwayat-warga` | sosial.ts | desaExternalClient | 🟢 live |
| keamanan-page | `/api/keamanan/cctv/stats`, `/cctv/find-many`, `/laporan-publik/find-many` | keamanan.ts | desaExternalClient + cache | 🟢 live |

Handler DB lokal yang **bukan** bagian 9 menu (di luar scope, tetap lokal by-design): auth, admin, apikey, invitation, ip-whitelist, *-preferences, activity-log, sync-log, profile, wall-snapshot/*, search, division, umkm, bantuan, system-stats.

---

## 2) DAFTAR — Data TANPA Padanan Desa API (tidak bisa live)

Deliverable list yang diminta user. Item berikut **tidak ada** endpoint sumbernya, jadi tetap lokal / empty-state:

| Data | Dipakai di | Alasan tak ada API |
|---|---|---|
| **Jenna analytics** (interaksiHariIni, chartMingguan, topTopics, jamTersibuk) | jenna-analytic | Tak ada logging chat; `/jenna/chat` cuma stub balas teks statis. Tak ada model/endpoint. |
| **Status pengaduan** (baru/diproses/selesai) | pengaduan, dashboard-content | `pengaduanmasyarakat/find-many` live TAPI item tak punya field `status`. |
| **Service letter count mingguan** (surat masuk minggu ini) | dashboard-content | `pelayanansuratketerangan/find-many` hanya katalog jenis surat (nama+deskripsi), bukan pengajuan ber-tanggal. |
| **Musrenbang / aspirasi** | pengaduan (`musrenbang[]`) | 0 endpoint musrenbang/aspirasi di Desa API. |
| **securityReport lokal** (`/keamanan/laporan-lokal`) | (tidak dirender keamanan-page) | Fitur input operator internal; `laporanpublik` publik sudah live & dipakai. |

---

## 3) TRANSISI — Handler yang Dimigrasi ke Desa API Live

Semua mengikuti pola existing di `demografi.ts`/`sosial.ts`: `withCache(key, TTL, async () => { const r = await desaExternalClient.GET(path); if (r.error) throw…; return r.data?.data })`, dengan **fallback** ke Prisma bila API gagal (pola `noc.ts:175 latest-projects`).

### a. `src/api/dashboard.ts` — `/sdgs`
- Ganti `prisma.sdgsScore.findMany` → `desaExternalClient.GET("/api/landingpage/sdgsdesa/findMany")`.
- Map: `{ title: name, score: jumlah, image: image?.link ?? null }`. Bungkus `withCache("dashboard:sdgs", TTL.DASHBOARD)`, fallback Prisma.
- ⚠️ Perlu tambah path `sdgsdesa/findMany` ke `generated/desa-external.ts` (lihat catatan generated di bawah).

### b. `src/api/resident.ts` — `/stats`
- Ganti 3×`prisma.count` → `desaExternalClient.GET("/api/kependudukan/dashboard/summary")`.
- Map: `total = data.summary.totalPenduduk`, `heads = totalKK`, `poor = totalKemiskinan`. Cache + fallback Prisma.

### c. `src/api/event.ts` — `/today` & `/`
- Ganti `prisma.event.findMany` → `desaExternalClient.GET("/api/desa/kegiatandesa/find-many")`.
- Map item: `{ title: judul, startDate: tanggal, location: lokasi, … }`. `/today` filter `tanggal` = hari ini di server. Cache + fallback Prisma.

### d. `src/api/complaint.ts` — `/stats` & `/service-weekly`
- `/stats`: `desaExternalClient.GET("/api/inovasi/layananonlinedesa/pengaduanmasyarakat/find-many")`. `total = meta.total`; karena tak ada status → **rekomendasi**: `baru = total, diproses = 0, selesai = 0` (jujur: API tak track status). Fallback Prisma.
- `/service-weekly`: tak ada sumber live (lihat bagian 2) → **tetap Prisma** (dicatat sebagai lokal).

### e. **BARU** route `/pengaduan` (di `src/api/noc.ts` atau file baru `src/api/pengaduan.ts`)
Frontend `pengaduan-layanan-publik.tsx` butuh shape: `{ stats, trends[], surat_terbanyak[], pengajuan_terbaru[], musrenbang[] }`.
- Fetch `pengaduanmasyarakat/find-many` + `jenispengaduan/find-many`.
- `stats.total` = meta.total; breakdown → total/0/0 (tanpa status).
- `trends` = groupBy bulan dari `createdAt`.
- `surat_terbanyak` = count per `jenisPengaduan.nama`.
- `pengajuan_terbaru` = map item terbaru (`kategori = jenisPengaduan.nama`, `status = "baru"`, `created_at`).
- `musrenbang` = `[]` (tak ada sumber).
- Bungkus `withCache`, mount di `src/api/index.tsx` bila file baru.

### f. Jenna — hapus, bukan migrasi
- User hapus **UI chat** di `src/components/help-page.tsx` (blok chat) + hentikan pemakaian `/api/jenna/chat`.
- `jenna-analytic.tsx`: tak ada sumber data. Opsi minimal agar tidak 404: buat `/api/jenna/analytics` balas struktur valid **nol/kosong** (empty-state), ATAU hapus komponen bila memang tak dipakai. **Perlu konfirmasi apakah jenna-analytic masih ditampilkan** — diselesaikan saat implementasi sesuai arahan user (chat dihapus).

### Catatan `generated/desa-external.ts`
Path baru (`sdgsdesa`, `kegiatandesa`, `pengaduanmasyarakat`; `kependudukan/dashboard/summary` sudah ada) yang belum ada di types harus ditambah. Idealnya `bun run gen:api` regen dari OpenAPI; bila endpoint tak lengkap di schema generated, pakai pola raw `fetch(\`${DESA_API_URL}${path}\`)` seperti `dashboard.ts:97 satisfaction-responden` (sudah dipakai untuk endpoint di luar generated).

---

## Constraint & Aturan Kerja
- **Branch baru** `feature/live-api-transition` sebelum kode (aturan global #2). Commit berkala, jangan merge tanpa konfirmasi.
- **Test wajib** (aturan #3): `bun test` untuk tiap handler yang diubah — assert mapping + fallback. Ikuti runner existing.
- Fallback Prisma tetap dipertahankan → tidak ada breaking bila API down.
- Tidak ubah schema DB (tak ada migrasi). Tidak deploy/push tanpa perintah eksplisit.

---

## Verifikasi
1. `bun test` — semua handler migrasi hijau.
2. `bun run dev`, cek tiap endpoint via curl: `/api/resident/stats`, `/api/dashboard/sdgs`, `/api/event/today`, `/api/complaint/stats`, `/api/noc/pengaduan`, `/api/jenna/analytics` → 200 + shape benar.
3. Matikan sementara `DESA_API_URL` (atau simulasi error) → pastikan fallback Prisma jalan, tak 500.
4. `bun run check` (Biome) lulus.
