# Plan — Widget Bumdes & UMKM Desa untuk `/wall` (NOC Video Wall)

## Tujuan
Tambah kategori widget **Bumdes & UMKM Desa** di galeri tambah-widget `/wall`, memakai
**data live API** yang sama persis dgn menu dashboard "Bumdes & UMKM Desa"
(`/api/ekonomi/umkm/dashboard/*` via `desaExternalClient`) — meniru pola slice
Keuangan yang sudah live.

## Konteks (hasil eksplor)
- Widget wall didaftarkan di `src/components/wall/widget-registry.tsx` + katalog id di
  `src/components/wall/wall-layout-utils.ts` (`ALL_WIDGET_IDS`, `WallCategory`, `DEFAULT_WIDGET_SIZE`).
- Data widget datang dari `WallSnapshot` (`src/types/wall.ts`), dirakit server-side di
  `src/api/wall-snapshot/index.ts` via builder per-domain (paralel, degradasi anggun → null).
- Referensi live: `buildKeuangan` (`build-keuangan.ts`) → source fetch + transform → slice.
- Endpoint UMKM live sudah terbukti dipakai (`build-kpi.ts` sudah GET `/api/ekonomi/umkm/dashboard/kpi`).
- Galeri: `widget-gallery.tsx` (label kategori) — perlu entri `bumdes`.

## Widget yang dibuat (mirror 4 seksi menu dashboard)
| Widget id | Judul | Sumber endpoint | Bentuk |
|---|---|---|---|
| `bumdes-kpi` | KPI Bumdes & UMKM | `/api/ekonomi/umkm/dashboard/kpi` | 4 stat: UMKM Aktif, Terdaftar, Omzet, Kategori Terbanyak |
| `bumdes-ringkasan` | Ringkasan Penjualan | `/api/ekonomi/umkm/dashboard/ringkasan-penjualan` | 3 stat + trend vs bulan lalu |
| `bumdes-top-produk` | Top Produk Terlaris | `/api/ekonomi/umkm/dashboard/top-produk` | list rank + revenue (empty state bila kosong) |
| `bumdes-detail` | Detail Penjualan Produk | `/api/ekonomi/umkm/dashboard/detail-penjualan` | tabel produk: bulan ini/lalu, trend, stok |

Period default wall = `monthly` (aggregate always-on, seperti keuangan pakai tahun terbaru).

## Langkah implementasi

### 1. Type slice — `src/types/wall.ts`
- Tambah `interface WallBumdes { kpi; ringkasan; topProduk[]; detail[] }` (angka agregat, tanpa PII).
- Tambah `bumdes: WallBumdes | null` ke `WallSnapshot`.

### 2. Source fetch — `src/api/sources/umkm-dashboard.ts` (baru)
- Fungsi fetch tiap endpoint umkm dashboard via `desaExternalClient` + `withCache` (TTL.BUMDES),
  pola identik `sources/apbdes.ts`. Return raw typed.

### 3. Builder — `src/api/wall-snapshot/build-bumdes.ts` (baru)
- `buildBumdes(): Promise<WallBumdes | null>` — Promise.all 4 fetch (period monthly),
  map ke slice. Null bila kpi utama gagal.

### 4. Wiring snapshot — `src/api/wall-snapshot/index.ts`
- Import `buildBumdes`, tambah `settle("bumdes", buildBumdes)` ke Promise.all + field `bumdes` di return.

### 5. Katalog widget — `src/components/wall/wall-layout-utils.ts`
- Tambah 4 id ke `ALL_WIDGET_IDS` (blok komentar `// Bumdes & UMKM`).
- Tambah `"bumdes"` ke union `WallCategory`.
- Tambah 4 entri ke `DEFAULT_WIDGET_SIZE` (kpi=`wide`, ringkasan=`lg`, top-produk=`tall`, detail=`wide`).

### 6. Body komponen — `src/components/wall/widgets/bumdes.tsx` (baru)
- 4 komponen Body (`BumdesKpiBody`, `BumdesRingkasanBody`, `BumdesTopProdukBody`, `BumdesDetailBody`)
  pakai `WALL_THEME`, `StatRow`, `formatM` — gaya konsisten dgn `widgets/keuangan.tsx`.

### 7. Registry — `src/components/wall/widget-registry.tsx`
- Import 4 Body, tambah 4 `WidgetDefinition` (category `"bumdes"`, `selectData: s => s?.bumdes?.…`).

### 8. Galeri label — `src/components/wall/widget-gallery.tsx`
- Tambah `bumdes: "Bumdes & UMKM Desa"` ke `CATEGORY_LABELS`.

### 9. Test
- Unit test builder (mock client → slice benar / null saat gagal) — pola test wall-snapshot existing.
- Test resolveLayout/registry tetap hijau dgn id baru.
- `bun test` harus lulus sebelum lapor selesai.

## File berubah/baru
- baru: `src/api/sources/umkm-dashboard.ts`, `src/api/wall-snapshot/build-bumdes.ts`,
  `src/components/wall/widgets/bumdes.tsx`, test terkait.
- edit: `src/types/wall.ts`, `src/api/wall-snapshot/index.ts`,
  `src/components/wall/wall-layout-utils.ts`, `src/components/wall/widget-registry.tsx`,
  `src/components/wall/widget-gallery.tsx`.

## Catatan
- Branch baru: `feature/wall-bumdes-widgets` (wajib per aturan global — jangan ke `main`/`stg`).
- Tidak ada perubahan schema/DB (murni proxy live API + cache).
- Data `Rp 0` / top-produk kosong = kondisi real API saat ini (bukan bug) — widget tampilkan empty state.
