# Plan: Fitur NOC Video Wall (`/wall`)

**Tanggal:** 10 Jul 2026
**Branch:** `feature/noc-wall`
**Status:** Siap eksekusi (menunggu konfirmasi user untuk mulai)

---

## Context

Project ini awalnya dibangun sebagai dashboard admin desa multi-halaman (9 menu terpisah: Beranda, Demografi, Keuangan, Pengaduan, Kinerja Divisi, BUMDes, Sosial, Keamanan, Jenna Analytic). Kebutuhan sebenarnya: **satu layar besar (TV/video wall)** yang menampilkan semua data sekaligus, non-interaktif, jalan 24/7 — seperti layar Network Operations Center (NOC). User menyebut ini "salah kaprah di awal".

**Tujuan:** menambah satu halaman video-wall baru yang sebagian besar aditif — tanpa mengubah 9 halaman yang sudah jalan. Halaman ini chrome-free (tanpa header/sidebar), auto-refresh, auto-rotasi antar "scene", dan tidak perlu login di TV.

### Keputusan desain (disepakati)
- **Layout HYBRID** — header + KPI strip + panel ops tetap; area tengah berganti scene otomatis.
- **Akses TANPA LOGIN** + token opsional via env (`WALL_ACCESS_TOKEN`). Diisi ⇒ wajib `/wall?key=<token>`; dikosongkan ⇒ terbuka. Bisa mulai terbuka lalu perketat tanpa ubah kode.
- **Panel ops penuh** (CPU/MEM/DISK + status DB/API + last-sync) — ciri khas NOC.
- **Semua 4 domain** masuk versi pertama.

---

## Temuan kunci (terverifikasi langsung ke source)

1. **Allowlist bypass 401** — `src/middleware/apiMiddleware.tsx:110-113`: `.onBeforeHandle` menolak 401 semua request tanpa `user`, KECUALI `/api/docs` dan `/api/noc/* method GET`. → Komponen chart lama TIDAK bisa reuse mentah (fetch endpoint ber-login → 401). Solusi: satu endpoint snapshot publik baru.

2. **⚠️ Kebocoran PII pre-existing (terverifikasi)** — allowlist blanket `/api/noc/* GET` saat ini membuka data warga tanpa login:
   - `noc.ts:778` `/latest-discussion` → `senderName` + `message` (isi diskusi + nama pengirim)
   - `noc.ts:126` `/active-divisions`, `noc.ts:173` `/latest-projects` → nama divisi/proyek
   Cukup `GET /api/noc/latest-discussion?idDesa=...` tanpa auth. **Keputusan: perbaiki** — perketat allowlist jadi HANYA `/api/noc/wall-snapshot`.

3. **Perketat allowlist AMAN (terverifikasi, bukan asumsi):**
   - **Konsumen frontend lokal** (8 pemanggil `apiClient.GET("/api/noc/...")`) semua lewat `api-client.ts:9` `credentials:"include"` → lolos via **session**, bukan via allowlist. Semua halaman di belakang catch-all `requireAuth:true` → user pasti login.
   - **Konsumen "server-side" di `index.ts`** (`/api/jenna/analytics` baris 28, `/api/noc/pengaduan` baris 48) TIDAK terdampak — mereka proxy ke **API eksternal** (`fetch(${VITE_JENNA_API_URL}/...)` dengan Bearer token sendiri) DAN registered langsung di root `app`, **di luar** `apiMiddleware`. Memperketat allowlist secara struktural tidak menyentuh mereka.
   - → Tidak ada halaman yang pecah.

4. **⚠️ Catatan terpisah (bukan bagian plan ini):** `app.get("/api/noc/pengaduan")` (`index.ts:48`) sudah publik tanpa auth karena registered di luar `apiMiddleware` — jalur berbeda, TIDAK tertutup oleh perubahan allowlist. Perlu keputusan user terpisah apakah data pengaduan Jenna dianggap sensitif.

5. **cpuPct saat ini = rata-rata sejak boot** (`system-stats.ts:31-40`, `os.cpus()` tick kumulatif) → di panel "LIVE" tampak statis. **Keputusan: perbaiki jadi live** (2 sample delta ~200ms).

6. Endpoint `*/stats` sudah ada & village-agnostic. Snapshot cukup mengkomposisi query prisma yang sama.

7. Test: `bun test __tests__/api` — pola `import api from "@/api"; api.handle(new Request(...))` sudah dipakai di `__tests__/api/noc.test.ts`.

8. `withCache(key, ttl, fn)` + TTL map (`src/utils/cache.ts:57-80`) sudah dipakai konsisten.

9. Auto-refresh: `useApiQuery(key, fn, {autoRefresh:true})` — interval global, silent, defaults valid tanpa login.

---

## Keputusan arsitektur: pisah 2 commit dalam 1 branch

Fitur wall (aditif) dan security fix allowlist (behavior change) **tidak saling butuh**. Pisahkan untuk isolasi blast-radius:

- **Commit A — fitur wall (aditif murni):** endpoint snapshot + allowlist eksplisit *ditambahkan di atas* blanket, tanpa menghapusnya. Wall jalan, nol risiko regresi.
- **Commit B — security fix:** perketat/hapus blanket allowlist + regression test kebocoran PII.

Kalau B bermasalah di prod → revert B saja, wall (A) tetap hidup.

---

## 1. Backend

### 1.1 Refactor — extract `computeSystemStats()` (NEW `src/utils/system-health.ts`) — TITIK REGRESI #1

Pindahkan logika murni dari `src/api/system-stats.ts:26-116` MINUS blok ActivityLog (butuh user) MINUS wrapper `{data}`. Export:

```ts
export interface SystemHealth {
  memPct; cpuPct; diskUsedPct; diskFreePct;
  db:{ok;latencyMs}; desaApi:{ok;latencyMs}; nocApi:{ok;latencyMs};
  lastSync:{type;status;startedAt}|null;
}
export async function pingEndpoint(url): Promise<{ok;latencyMs}>
export function sampleCpuPct(): Promise<number>   // 2 sample os.cpus() berjarak CPU_SAMPLE_MS (~200ms), const bernama
export async function computeSystemStats(): Promise<SystemHealth>
```

- **CPU live:** ganti rata-rata-sejak-boot dengan `cpuPct = (deltaTotal - deltaIdle)/deltaTotal * 100`.
- Edit `src/api/system-stats.ts`: panggil `computeSystemStats()`, hitung ulang `failed`, pertahankan tulis ActivityLog (guard `user?.id && health.db.ok`), return `{data: health}`. **Arah import: `system-stats.ts` → import dari `system-health.ts`** (bukan sebaliknya).
- **Konsekuensi disepakati:** output `/system/stats` TIDAK lagi byte-identik (CPU kini live = peningkatan akurasi). Regression test admin → assert **shape + range** (`cpuPct ∈ [0,100]`, semua field ada), bukan nilai persis.
- Latensi +~200ms terserap `withCache` (10s) di endpoint wall; endpoint admin on-demand.

### 1.2 Agregasi — NEW `src/api/wall-snapshot/` (SPLIT per-domain, hindari >300 baris)

```
src/api/wall-snapshot/
  index.ts            // buildWallSnapshot(): Promise.allSettled semua builder → rakit WallSnapshot; isWallAuthorized(token,key)
  build-kpi.ts        // 6 angka KPI (count lintas domain)
  build-pengaduan.ts  // stats + trend7m + serviceByType + kepuasan
  build-demografi.ts  // stats + gender/religion/ageGroups/occupationTop
  build-divisi.ts     // activities{total,counts,percentages} + documents
  build-keuangan.ts   // apbdes(budget lokal) + satisfaction + sdgs
  build-keamanan.ts   // 4 count status
```

- Setiap builder dibungkus `try/catch → null`; orchestrator pakai `Promise.allSettled` → satu query gagal tidak men-500-kan wall (degradasi anggun).
- Komposisi (prisma langsung, query sama dgn endpoint existing):
  - KPI/Pengaduan ← `complaint.ts` (`/stats`, `/trends` 7 bln, `/service-weekly`, `/service-stats`)
  - Demografi ← `resident.ts` (`/stats`, `/demographics`)
  - Divisi ← `division.ts` (`/activities/stats`, `/documents/stats`)
  - UMKM ← `umkm.ts` (`/lokal/stats`) — hanya total
  - Keamanan ← `keamanan.ts` (`/laporan-lokal/stats`)
  - Keuangan ← `dashboard.ts` (`/budget` fiscalYear 2025, `/satisfaction`, `/sdgs`) — **budget LOKAL**, bukan external APBDes (hindari call lambat/gagal blokir wall)
  - System ← `computeSystemStats()`
- Flatten `{_count:{_all}}` → number di builder. **Tanpa field PII.**

### 1.3 Route — EDIT `src/api/noc.ts` (tambah 1 GET)

```ts
.get("/wall-snapshot", async ({ query, set }) => {
  const token = process.env.WALL_ACCESS_TOKEN;   // unset ⇒ terbuka
  if (!isWallAuthorized(token, query.key)) {
    set.status = 403;
    return { success:false, error:"Forbidden", data:null };
  }
  const data = await withCache("wall:snapshot", TTL.WALL, buildWallSnapshot);
  return { success:true, data };
}, {
  query: t.Object({ key: t.Optional(t.String()) }),
  response: {...},
  detail: { summary:"Public NOC wall snapshot (no PII)" },
})
```

- Tambah `WALL: 10_000` ke `TTL` di `src/utils/cache.ts` (cache server ~10s di bawah refetch klien ~30s → batasi beban DB saat banyak TV).
- `WALL_ACCESS_TOKEN` **server-only** (BUKAN `VITE_`/`BUN_PUBLIC_`). `isWallAuthorized = !token || key === token`.

### 1.4 Perketat allowlist — EDIT `src/middleware/apiMiddleware.tsx` (TITIK REGRESI #2 — commit B)

```ts
// SEBELUM (baris ~110-113):
if (url.pathname.startsWith("/api/noc/") && request.method === "GET") return;
// SESUDAH:
if (url.pathname === "/api/noc/wall-snapshot" && request.method === "GET") return;
```

- Konsekuensi: `latest-discussion`/`active-divisions`/`latest-projects` (+ GET noc lain) kembali wajib auth. **Terverifikasi aman** — semua konsumen frontend kirim sesi (§temuan #3).
- **Asumsi tersisa (reversibel):** tak ada konsumen eksternal non-frontend yang mengandalkan GET noc publik. Bila ada, tambah path-nya eksplisit. Verifikasi saat implementasi: cek Network `/kinerja-divisi` masih 200.
- Snapshot wall tetap publik lewat entry eksplisit — decoupled dari nasib endpoint noc lain.

### 1.5 Tipe bersama — NEW `src/types/wall.ts`

Satu sumber kebenaran `WallSnapshot` (server + klien). Semua slice domain **nullable** agar partial-failure hanya mematikan satu panel. Field: `generatedAt`, `kpi{6 angka}`, `keuangan{apbdes,satisfaction,sdgs}`, `pengaduan{stats,trend7m,serviceByType,kepuasan}`, `demografi{stats,gender,religion,ageGroups,occupationTop}`, `divisi{activities,documents}`, `keamanan{4 count}`, `system:SystemHealth`.

---

## 2. Routing / chrome / auth (frontend)

- EDIT `src/routes/__root.tsx:126`: tambah `"/wall"` ke array `isPublicRoute` → render bare `<Outlet/>` tanpa `MainLayout`. (opsional: `PAGE_TITLES["/wall"]`).
- EDIT `src/middleware/authMiddleware.tsx`: sisipkan SEBELUM catch-all (sebelum baris 84): `{ match:(p)=>p.startsWith("/wall"), requireAuth:false }` → TV tidak di-redirect ke `/signin`.
- NEW `src/routes/wall.tsx` (tipis): `createFileRoute("/wall")` + `validateSearch` menangkap `?key`. `routeTree.gen.ts` regen otomatis — jangan edit tangan.

---

## 3. Komponen UI — NEW `src/components/wall/`

Satu fetch di level page; slice di-prop-drill ke widget bodoh (tidak self-fetch → hindari N request publik). File kecil (≤300 baris).

```
wall/
  wall-page.tsx        // force dark, 1 fetch, fullscreen overlay (fallback)
  wall-shell.tsx       // grid tetap
  wall-header.tsx · live-clock.tsx · kpi-strip.tsx (6 tile) · ops-panel.tsx · status-light.tsx · gauge.tsx
  scenes/keuangan-scene.tsx · scenes/pengaduan-scene.tsx · scenes/demografi-kinerja-scene.tsx
  use-scene-rotation.ts  // pure nextSceneIndex + hook, SCENE_INTERVAL_MS ~20s
  wall-theme.ts          // token dark bernama
```

- **Force dark:** nested `<MantineProvider forceColorScheme="dark">` (scoped, restore auto saat unmount). Token: `PAGE_BG #11192D`, `CARD #1E293B`, `BORDER #334155`, `TEXT #E2E8F0`, accent darmasaba-blue.
- **Fetch:** `useApiQuery(["wall","snapshot"], () => fetchWallSnapshot(key), {autoRefresh:true})`; `fetchWallSnapshot` = plain typed `fetch(${VITE_PUBLIC_URL}/api/noc/wall-snapshot[?key=])`. Pakai tipe `WallSnapshot` bersama (hindari kopling `generated/api.ts` sebelum `gen:api`).
- **Reuse:** Mantine `Card/RingProgress/Progress/SimpleGrid`, `@mantine/charts` (`BarChart/LineChart/DonutChart`, sudah terpasang).
- **JANGAN reuse `src/components/dashboard/*`** (self-fetch endpoint ber-login → 401 + N request). Widget wall = baru, prop-driven, ukuran TV.
- **Fullscreen:** kiosk browser = utama (`chromium --kiosk http://host/wall`, didokumentasikan). Overlay klik `requestFullscreen()` di app hanya fallback. Jangan over-engineer di app.

---

## 4. Data flow

`wall.tsx` → baca `?key` → 1× `useApiQuery` → GET publik `/api/noc/wall-snapshot` (cache server 10s) → `WallShell` terima seluruh `WallSnapshot` → `kpi→KpiStrip`, `system→OpsPanel`, slice scene aktif → scene. Refetch klien 30s di atas cache 10s; slice nullable jaga panel tidak blank saat partial fail.

---

## 5. Test (`bun test`, semua di `__tests__/api/`)

- **`wall-snapshot.test.ts`:** GET `/api/noc/wall-snapshot` → 200 `success:true` (bukti NO 401); `data.kpi` punya 6 key; `data.system` punya field health; **assertion PII WHITELIST (bukan blacklist)** — setiap objek slice hanya boleh punya key yang di-whitelist `WallSnapshot`; tolak jika ada key tak dikenal (blacklist `nik/nama` lolos untuk `occupationTop`/nama divisi; whitelist menutup itu). `WALL_ACCESS_TOKEN` di-set + tanpa `?key` → 403, `?key` benar → 200.
- **`noc-allowlist.test.ts`** (regresi kebocoran PII): GET `/api/noc/latest-discussion?idDesa=desa1` tanpa auth → **401** (bukti allowlist diperketat); GET `/api/noc/wall-snapshot` tanpa auth → **200** (wall tetap publik).
- **`system-health.test.ts`:** `computeSystemStats()` → `memPct/cpuPct ∈ [0,100]`, `diskFreePct === 100-diskUsedPct`, `db.ok` boolean. CPU live: dua panggilan boleh beda — assert range, bukan nilai. DB nyata `SELECT 1` (jangan tukar engine; `TEST_DATABASE_URL` bila ada).
- **`wall-scene.test.ts`:** `nextSceneIndex` wrap 2→0 (count 3), handle 0/1, tak pernah negatif. Pure.
- **`wall-token.test.ts`:** truth-table `isWallAuthorized`. Pure.
- Assert bentuk, bukan angka pasti (mirip `noc.test.ts`).

---

## 6. Verifikasi end-to-end

1. `git checkout -b feature/noc-wall`
2. `bun run check` bersih · `bun test __tests__/api` hijau
3. `bun run dev` → buka `/wall` (incognito): TANPA redirect `/signin`, TANPA chrome; Network: GET `/api/noc/wall-snapshot` → 200 (bukan 401), tak ada call protected lain; jam jalan, LIVE pulsing, KPI+OpsPanel render, CPU gauge bergerak antar refresh; tunggu ~40s → scene berputar.
4. `WALL_ACCESS_TOKEN=secret` restart → `/wall` 403, `/wall?key=secret` 200, unset → terbuka.
5. **Regresi allowlist (kritis):** login sebagai user → buka `/kinerja-divisi` → Network `latest-discussion`/`latest-projects` masih 200 (lolos via sesi); lalu incognito GET `/api/noc/latest-discussion?idDesa=desa1` → 401 (kebocoran tertutup).
6. Regresi lain: `/system/stats` (admin) shape tetap (nilai CPU kini live); `/`, `/keuangan-anggaran`, `/pengaduan-layanan-publik` masih ber-chrome.

---

## 7. Risiko / edge case

- **Perketat allowlist (regresi #2):** GET noc lain kembali wajib auth. Aman untuk frontend (semua kirim sesi), asumsi: tak ada konsumen eksternal non-frontend. Mitigasi: verifikasi Network `/kinerja-divisi` (§6.5) + reversibel.
- **Refactor system-stats (regresi #1):** CPU kini live → output tak byte-identik (disepakati). Test admin assert shape+range.
- API partial fail → slice nullable + `allSettled` → empty state, tak crash. Empty data → 0/empty-state (aturan: no mock).
- APBDes external dikecualikan (pakai budget lokal) agar tak blokir wall.
- Fullscreen: kiosk browser utama; overlay app fallback (butuh gesture user).
- `routeTree.gen.ts` auto-regen; jangan edit tangan.
- Token: `WALL_ACCESS_TOKEN` server-side; `?key` = soft kiosk secret, bocor ke log/history/Referer — acceptable untuk data agregat (didokumentasikan).
- **`/api/noc/pengaduan` (`index.ts:48`) tetap publik** setelah plan ini — jalur di luar `apiMiddleware`, TIDAK tertutup perubahan allowlist. Keputusan terpisah user.
- `CHANGELOG.md` + `.env.example` (`WALL_ACCESS_TOKEN`) diupdate sebelum deploy (bukan sekarang). Tak ada migrasi DB (read-only).

---

## Constraint proyek (CLAUDE.md)

Branch `feature/noc-wall`, commit berkala, **tunggu konfirmasi user sebelum merge**. Test wajib & hijau sebelum lapor. File health (route ≤150, komponen ≤300). No hardcode (token/URL dari env, threshold jadi const bernama). No PII di log/snapshot. Biome `bun run check`.

---

## File kritis

**Edit:** `src/api/noc.ts`, `src/api/system-stats.ts`, `src/middleware/apiMiddleware.tsx` (perketat allowlist), `src/utils/cache.ts`, `src/routes/__root.tsx`, `src/middleware/authMiddleware.tsx`

**Baru:** `src/utils/system-health.ts`, `src/api/wall-snapshot/` (index + 6 builder), `src/types/wall.ts`, `src/routes/wall.tsx`, `src/components/wall/*`, `__tests__/api/wall-*.test.ts`, `__tests__/api/system-health.test.ts`, `__tests__/api/noc-allowlist.test.ts`
