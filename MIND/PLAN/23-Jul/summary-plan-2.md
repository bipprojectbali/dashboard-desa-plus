# Summary: Wall KPI Strip — Ganti Sumber ke API Live

**Branch:** `fix/wall-kpi-live-source`
**Tanggal:** 2026-07-23
**Status:** ✅ Merged ke `stg`

---

## Masalah yang Diselesaikan

`KpiStrip` di `/wall` sebelumnya membaca dari `buildKpi()` yang pakai `prisma.*.count()` lokal → semua angka **0** karena DB lokal kosong. Sekarang mengambil dari sumber yang sama dengan halaman dashboard.

---

## Perubahan

### `src/types/wall.ts`
- Hapus field `documents` dari interface `WallKpi` (card dihilangkan)

### `src/api/wall-snapshot/build-kpi.ts` _(rewrite total)_
Ganti 6 `prisma.*.count()` dengan 5 fetch paralel dari sumber live:

| Field | Sumber | Detail |
|---|---|---|
| `residents` | `getDemografiSummary()` | `summary.totalPenduduk` |
| `umkm` | `desaExternalClient GET /api/ekonomi/umkm/dashboard/kpi` | `data.umkmAktif` |
| `complaints` | `buildPengaduan()` | `stats.total` |
| `activities` | `nocExternalClient GET /api/noc/upcoming-events` | `.length` event mendatang |
| `securityReports` | `desaExternalClient GET /api/keamanan/cctv/stats` | `laporanMingguIni` |

Setiap fetch dibungkus `.catch(() => 0)` — satu sumber gagal tidak menol-kan seluruh strip.
Cache key reuse: `dashboard:upcoming-events:*` dan `keamanan:cctv:stats` berbagi cache dengan builder lain.

### `src/components/wall/kpi-strip.tsx`
- Hapus entry `documents` + import `IconFileText`
- Grid `cols={6}` → `cols={5}`

### `__tests__/api/wall-snapshot.test.ts`
- `KPI_KEYS`: hapus `"documents"`
- Nama test: "6 key" → "5 key"

### `__tests__/api/build-kpi.test.ts` _(baru)_
6 unit test dengan `mock.module`:
- Mapping benar: 5 sumber → field WallKpi yang tepat
- Tidak ada field `documents`
- Fallback `0` saat masing-masing dari 4 sumber throw/error

---

## Hasil Test

```
11 pass, 0 fail
- build-kpi.test.ts: 6 pass
- wall-snapshot.test.ts: 5 pass
```

---

## Commit

```
feat(wall): ganti KPI dari prisma.count() ke sumber API live
5b10d09
```
