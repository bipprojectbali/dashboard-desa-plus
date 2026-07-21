# Summary — Dashboard Live API Fase 2 (Pengaduan & Surat via Platform)

> Tanggal: 20 Jul 2026 · Branch: `feature/dashboard-live-api-fase2`
> Dilanjutkan dari Fase 1 (SDGs, Divisi, Kalender, Penduduk → live).

---

## Apa yang Berubah

4 card dashboard yang masih baca Prisma/seed lokal dipindah ke **Platform API** (`desa-platform-stg.wibudev.com`, auth Bearer):

| Card | Sebelum | Sesudah |
|---|---|---|
| Pengaduan Aktif | `prisma.complaint.count()` | `GET /api/noc/laporan?limit=1000` |
| Layanan Selesai | `prisma.complaint.count()` | sama atas (di-split dari response) |
| Surat Minggu Ini | `prisma.serviceLetter.count()` | `GET /api/noc/surat?limit=1000` |
| ChartSurat (tren) | `prisma.$queryRaw service_letter` | sama atas (di-group per bulan) |

---

## File yang Dibuat / Diubah

| File | Aksi | Keterangan |
|---|---|---|
| `src/utils/platform-external-client.ts` | BARU | Raw fetch + Bearer, server-only, validasi `{ data: [] }` |
| `src/api/complaint-platform.ts` | BARU | Transform murni: `mapComplaintStats`, `countSuratWeekly`, `mapSuratTrends` |
| `src/api/complaint.ts` | EDIT | Swap 3 handler (`/stats`, `/service-weekly`, `/service-trends`) ke platformFetch + withCache |
| `src/components/dashboard-content.tsx` | EDIT | Field `proses` → `ditolak`; value Pengaduan Aktif = `baru` saja |
| `src/locales/id.ts` | EDIT | Tambah key `ditolak: "Ditolak"` di type + impl |
| `src/locales/en.ts` | EDIT | Tambah key `ditolak: "Rejected"` |
| `generated/api.ts` | EDIT | Schema `/api/complaint/stats` → `{ total, baru, selesai, ditolak }` |
| `.env.example` | EDIT | Tambah `PLATFORM_API_URL` + `PLATFORM_API_TOKEN` |
| `__tests__/api/dashboard-fase2.test.ts` | BARU | 21 test: unit transform + auth guard 3 endpoint |

---

## Keputusan Penting

- **Token server-only**: `PLATFORM_API_TOKEN` tanpa prefix `VITE_` — Bearer tidak boleh ter-bundle ke frontend.
- **Drop field `proses`**: Platform hanya kenal `baru | selesai | ditolak`. Field `proses`/`DIPROSES` dari Prisma dihapus total.
- **Pengaduan Aktif = `baru` saja**: bukan `baru + proses`. Detail line: `"{baru} baru, {ditolak} ditolak"`.
- **Drop fallback Prisma**: Saat Platform API gagal → empty-state (0 / []), bukan data basi. Pola: throw di dalam `withCache` fn → tidak ter-cache; outer catch → default kosong.
- **Endpoint `/api/noc/ajukanpermohonan/findMany` 404** — rencana lama di summary Fase 1 salah, tidak dipakai.

---

## Status Akhir Dashboard

Seluruh komponen dashboard utama sudah **100% live API** — tidak ada yang masih baca Prisma untuk data tampilan:

| Komponen | Sumber |
|---|---|
| Total Penduduk | DESA API |
| SDGs | DESA API |
| Divisi Teraktif / DivisionProgress | NOC muku.id |
| Kalender / ActivityList | NOC muku.id |
| ChartAPBDes | NOC muku.id |
| SatisfactionChart | NOC muku.id |
| Pengaduan Aktif, Layanan Selesai | Platform API ← Fase 2 |
| Surat Minggu Ini, ChartSurat | Platform API ← Fase 2 |

---

## Commit Log

```
fdd9c70 test(api): cover Fase 2 platform transforms + auth guard
390467e chore(env): add server-only PLATFORM_API_* vars
e53857b feat(dashboard): render ditolak, wire live complaint stats
fda2e49 feat(api): swap complaint stats/surat handlers to platform live
9465c3f feat(api): add platform client + complaint transforms (Fase 2)
```

---

## Yang Perlu Dilakukan Sebelum Merge

- [ ] Pastikan `.env` di server stg punya `PLATFORM_API_URL` + `PLATFORM_API_TOKEN`
- [ ] Verifikasi live: `/api/complaint/stats` → `{ total, baru, selesai, ditolak }` angka real
- [ ] Simulasi platform down → endpoint balas 0/[] bukan error loop
