# Plan: Wall KPI Strip — Ganti Data Hardcoded/Prisma-count ke Sumber API Live

## Masalah

Card teratas `/wall` (`KpiStrip`) baca dari `buildKpi()` yang pakai `prisma.*.count()` lokal → semua **0** karena DB lokal kosong. Halaman dashboard mengambil angka asli dari external API. Perlu samakan sumber agar wall menampilkan angka live yang sama dengan dashboard.

## Pemetaan Sumber

Reuse fungsi & cache key yang sudah dipakai halaman dashboard (tidak buat fetch baru bila sudah ada).

| Card | Angka target | Sumber (fungsi existing) | Field |
|---|---|---|---|
| **Warga** | 4.200 | `getDemografiSummary()` — `src/api/dashboard-cache.ts` | `summary.totalPenduduk` |
| **UMKM** | 9 | `desaExternalClient GET /api/ekonomi/umkm/dashboard/kpi` (sama dgn `src/api/bumdes.ts`) | `data.umkmAktif` |
| **Pengaduan** | 21 | `buildPengaduan()` / `mapPengaduanStats` (Jenna) | `stats.total` |
| **Kegiatan** | jml event mendatang | NOC `GET /api/noc/upcoming-events` (sama dgn `build-beranda.ts`) | `mapUpcomingEvents(...).length` |
| **Keamanan** | 1 | keamanan `cctv/stats` (`desaExternalClient`) | `laporanMingguIni` |
| **Dokumen** | — | **HAPUS card** | — |

## Perubahan File

### 1. `src/types/wall.ts`
`WallKpi`: hapus field `documents`. Field tetap angka agregat:

```ts
interface WallKpi {
  residents: number;
  umkm: number;
  complaints: number;
  activities: number;
  securityReports: number;
}
```

### 2. `src/api/wall-snapshot/build-kpi.ts` (rewrite total)
- Buang semua `prisma.*.count()`.
- Fetch paralel dari 5 sumber di atas (reuse loader ber-cache yang sama dengan dashboard).
- Tiap fetch dibungkus `.catch(() => 0)` agar satu sumber gagal tidak menol-kan seluruh strip.
- Ekstrak helper kecil untuk UMKM-aktif & laporan-keamanan bila belum ada fungsi reusable.

### 3. `src/components/wall/kpi-strip.tsx`
- Hapus entry `documents` dari `KPI_ITEMS` + import `IconFileText`.
- Grid `cols={6}` → `cols={5}`.

### 4. `__tests__/api/wall-snapshot.test.ts`
- `KPI_KEYS`: hapus `"documents"`.
- Assertion "kpi punya 6 key" → 5 key.

## Test

- Update `wall-snapshot.test.ts` (PII whitelist + jumlah key).
- Tambah unit test `build-kpi`: mock 5 sumber → assert mapping benar & fallback `0` saat salah satu throw.
- Jalankan `bun test` + `bun run check` sebelum lapor selesai.

## Catatan

- Semua angka lewat cache key yang sama dengan halaman dashboard → konsisten, tanpa double-fetch.
- Branch: `fix/wall-kpi-live-source`.
- **Tidak** deploy/commit/merge sampai user konfirmasi.
