# Plan — Sinkronisasi Widget `/wall` Pengaduan ke API Live

> Tanggal: 22 Jul 2026 · Halaman: `/wall` (widget pengaduan) · Branch target: `fix/wall-pengaduan-live`
> Ekstrak T2 dari `MIND/PLAN/wall-sync-dashboard-sources.md`, jadi plan mandiri (scope: pengaduan saja).
> **Konteks pemicu:** halaman dashboard `/pengaduan-layanan-publik` sudah 100% live via `/api/noc/pengaduan`
> (proxy Jenna, `src/index.ts:48-66`). Widget `/wall` pengaduan **masih `prisma.*` (data local)** → basi/beda.
> Tujuan: arahkan widget wall ke sumber yang **sama persis** dengan halaman dashboard.

---

## Konteks arsitektur (WAJIB dipahami)

`/wall` **TIDAK** fetch per-widget. Semua data dari satu endpoint `/api/noc/wall-snapshot` → dirakit
`buildWallSnapshot()` (`src/api/wall-snapshot/index.ts:40`) dari **builder per-domain** paralel +
degrade-to-null (`settle()` — satu builder gagal → slice `null` → panel kosong, wall tak 500).

Widget (`src/components/wall/widgets/pengaduan.tsx`) = **renderer bodoh**: baca slice dari snapshot via
`selectData` di `widget-registry.tsx`. **Konsekuensi: perbaikan ada di server (builder), bukan widget.**
Sinkron terjadi di `build-pengaduan.ts`, widget hampir tak disentuh.

Pola migrasi baku (dari beranda yang sudah live, `build-beranda.ts`):
```ts
async function fetchX(): Promise<WallX> {
  return withCache(`dashboard:<key>`, TTL.DASHBOARD, async () => {
    const res = await fetch(`${baseUrl}/api/...`, { headers: {...} });
    if (!res.ok) throw new Error("... error");
    const raw = (await res.json())?.data;
    return mapX(raw); // transform MURNI, diekstrak ke src/api/transforms/
  });
}
```

---

## Kondisi aktual (verified 22 Jul)

**`src/api/wall-snapshot/build-pengaduan.ts` (43 baris) — 100% prisma:**
| Slice | Sumber sekarang | Target (live) |
|---|---|---|
| `stats` | `prisma.complaint.count()` ×4 (BARU/DIPROSES/SELESAI) | `/api/noc/pengaduan` `.stats` |
| `trend7m` | `prisma.$queryRaw` INTERVAL 7 months | `/api/noc/pengaduan` `.trends` |
| `serviceByType` | `prisma.serviceLetter.groupBy` | `/api/noc/pengaduan` `.surat_terbanyak` |
| `kepuasan` | `prisma.satisfactionRating.findMany` | ❌ **HAPUS** (dup `beranda-kepuasan`) |

**Payload Jenna** (dikonfirmasi dari konsumen halaman dashboard `pengaduan-layanan-publik.tsx:47-70`):
```
.stats            { total, baru, diproses, selesai }   ⚠️ pakai "diproses", BUKAN "proses"
.trends           [{ bulan, count }]
.surat_terbanyak  [{ jenis, count }]
.pengajuan_terbaru / .musrenbang  → TAK dipakai wall (abaikan)
```

**Registry** (`widget-registry.tsx`): 4 widget pengaduan — `pengaduan-status`, `pengaduan-trend`,
`pengaduan-service-type`, `pengaduan-kepuasan`. Yang terakhir akan dihapus.

---

## ⚠️ Titik jebakan (mismatch — WAJIB ditangani transform)

1. **`diproses` vs `proses`** — payload Jenna `.stats.diproses`, tapi `WallPengaduan.stats` pakai `proses`
   (`types/wall.ts:35`) & widget `PengaduanStatusBody` baca `data.proses` (`widgets/pengaduan.tsx:15`).
   → transform WAJIB map `diproses → proses`. Kalau lupa, kolom "Diproses" selalu 0.
2. **`bulan` vs `month`** — `.trends[].bulan` → `trend7m[].month`.
3. **`jenis` vs `letterType`** — `.surat_terbanyak[].jenis` → `serviceByType[].letterType`.
4. **Sumber fetch** — proxy `/api/noc/pengaduan` (`src/index.ts:48`) hit `${VITE_JENNA_API_URL}/api/noc/pengaduan`
   dgn `Bearer VITE_JENNA_API_TOKEN`. Builder jalan server-side di proses yang sama → **panggil upstream
   Jenna langsung** (jangan fetch relative ke diri sendiri). Guard: `VITE_JENNA_API_URL`/`TOKEN` kosong →
   throw → slice null (empty-state). **Token via env, jangan hardcode.**

---

## Tugas

### T1 — Transform murni (BARU)

**File**: `src/api/transforms/noc-pengaduan.ts`
- `type JennaPengaduanRaw` = shape payload Jenna (`stats`, `trends`, `surat_terbanyak`).
- `mapPengaduanStats(raw)` → `{ total, baru, proses, selesai }` (map `diproses→proses`, null-safe `?? 0`).
- `mapPengaduanTrend(rows)` → `[{ month, count }]` (`bulan→month`, `Number(count)`); non-array → `[]`.
- `mapPengaduanService(rows)` → `[{ letterType, count }]` (`jenis→letterType`); non-array → `[]`.
- Semua fungsi murni, null/undefined-safe. Tanpa akses network/prisma. File kecil (<80 baris).

### T2 — Builder (EDIT)

**File**: `src/api/wall-snapshot/build-pengaduan.ts` — buang seluruh `prisma.*` + import prisma.
- Fetch 1× ke `${VITE_JENNA_API_URL}/api/noc/pengaduan` (Bearer token), bungkus
  `withCache("dashboard:pengaduan", TTL.DASHBOARD, ...)`.
- `if (!apiUrl || !token) throw` + `if (!res.ok) throw` → degrade-to-null via `settle()`.
- Return `{ stats: mapPengaduanStats(d), trend7m: mapPengaduanTrend(d.trends),
  serviceByType: mapPengaduanService(d.surat_terbanyak) }`. **Buang field `kepuasan`.**
- Import `withCache, TTL` dari `@/utils/cache` (pola `build-beranda.ts:2`).

### T3 — Buang slice `kepuasan` (dedup — dup `beranda-kepuasan`)

- **`src/types/wall.ts:38`** — hapus `kepuasan: Array<...>` dari `WallPengaduan`.
- **`widget-registry.tsx`** — hapus def `"pengaduan-kepuasan"` (`:158-164`) + import `PengaduanKepuasanBody` (`:39`).
- **`widgets/pengaduan.tsx:88-99`** — hapus komponen `PengaduanKepuasanBody` (dead setelah registry).
- **`wall-layout-utils.ts`** — hapus `"pengaduan-kepuasan"` dari `ALL_WIDGET_IDS` + `DEFAULT_WIDGET_SIZE`
  (bila ada). `resolveLayout` buang id tak-dikenal diam-diam → layout DB lama aman.
- **Verifikasi tak yatim**: pastikan tak ada konsumen lain `s.pengaduan.kepuasan` selain yang dihapus.

> Catatan: 3 widget tersisa (`status`, `trend`, `service-type`) — cukup untuk parity halaman dashboard.

### T4 — Test (WAJIB, rule global #3)

**File**: `__tests__/api/wall-pengaduan-live.test.ts` (BARU) — unit atas transform MURNI (jangan hit API):
- `mapPengaduanStats`: `{diproses:5}` → `proses:5` (map benar); field hilang → `0`; passthrough total/baru/selesai.
- `mapPengaduanTrend`: `{bulan,count}→{month,count}`; `Number()` coerce; `null/[]→[]`.
- `mapPengaduanService`: `{jenis,count}→{letterType,count}`; `null→[]`.
- (opsional) builder: mock fetch gagal → throw (biar `settle` → null → empty-state, bukan seed basi).

---

## Guardrails

- Branch `fix/wall-pengaduan-live` sebelum kode. Commit berkala per-T. **Jangan** merge/push/deploy tanpa
  perintah user.
- Tak ubah schema DB → tak ada migrasi. Token Jenna via env (`VITE_JENNA_API_URL`/`VITE_JENNA_API_TOKEN`),
  **jangan hardcode**.
- `noc.ts` sudah >500 baris — **jangan tambah handler di sana**. Transform baru ke `src/api/transforms/`.
- Cache: key `dashboard:pengaduan` baru (shape khusus wall) — satu penulis, tak poisoning key lain.
- `build-pengaduan.ts` tetap kecil (<60 baris) — hanya fetch + delegasi ke transform.

## Verifikasi (sebelum lapor selesai)

1. `bun test` hijau (suite existing 0 fail — cek `wall-snapshot.test.ts`, `wall-registry.test.ts`,
   `wall-dashboard-parity.test.ts` tak break oleh penghapusan `kepuasan`).
2. `bun run dev` → `/wall`: widget Status/Tren/Surat pengaduan tampil **angka sama** dengan halaman
   `/pengaduan-layanan-publik`. Katalog "Tambah Widget" tak lagi punya "Kepuasan (Pengaduan)".
3. Simulasi Jenna down (kosongkan `VITE_JENNA_API_TOKEN`) → 3 panel pengaduan empty-state, wall tak 500,
   tak tampil data prisma basi.
4. `bun run check` (Biome) lulus.

## Ringkasan file

| T | File | Aksi |
|---|---|---|
| T1 | `src/api/transforms/noc-pengaduan.ts` | BARU — 3 transform murni |
| T2 | `src/api/wall-snapshot/build-pengaduan.ts` | EDIT — prisma → fetch Jenna + delegasi transform |
| T3 | `src/types/wall.ts` | EDIT — buang `WallPengaduan.kepuasan` |
| T3 | `src/components/wall/widget-registry.tsx` | EDIT — buang def + import `pengaduan-kepuasan` |
| T3 | `src/components/wall/widgets/pengaduan.tsx` | EDIT — buang `PengaduanKepuasanBody` |
| T3 | `src/components/wall/wall-layout-utils.ts` | EDIT — buang id `pengaduan-kepuasan` (bila ada) |
| T4 | `__tests__/api/wall-pengaduan-live.test.ts` | BARU |
