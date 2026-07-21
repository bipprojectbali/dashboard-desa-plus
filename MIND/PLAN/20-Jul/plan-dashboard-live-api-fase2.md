# Plan — Dashboard Live API Fase 2 (Pengaduan & Surat via PLATFORM)

> Tanggal: 20 Jul 2026 · Branch target: `feature/dashboard-live-api-fase2` (sudah dibuat dari `feature/dashboard-live-api-fase1`)
> Status awal git: branch sudah ada & aktif, working tree bersih (kecuali 2 file MIND untracked — abaikan).
> Prasyarat baca: `MIND/PLAN/20-Jul/summary-dashboard-live-api-fase1.md` (source of truth Fase 1).

---

## 0. Context (kenapa)

Fase 1 memigrasi 4 card dashboard ke API live (Total Penduduk, SDGs, Divisi Teraktif, Kalender). **4 card sisa masih baca DB lokal Prisma dengan data seed basi**:

| Card | Endpoint internal | Sumber sekarang | File |
|---|---|---|---|
| Pengaduan Aktif | `/api/complaint/stats` | `prisma.complaint.count` | `src/api/complaint.ts` |
| Layanan Selesai | `/api/complaint/stats` | `prisma.complaint.count` | `src/api/complaint.ts` |
| Surat Minggu Ini | `/api/complaint/service-weekly` | `prisma.serviceLetter.count` | `src/api/complaint.ts` |
| Statistik Surat (ChartSurat) | `/api/complaint/service-trends` | `prisma.$queryRaw service_letter` | `src/api/complaint.ts` |

Fase 2 mengarahkan keempatnya ke **PLATFORM API** = `desa-platform-stg.wibudev.com`, auth **Bearer**. Ini API ketiga, beda dari:
- DESA API (`desaExternalClient`, no-auth) — dipakai Fase 1
- NOC muku.id (`nocExternalClient`, `x-api-key`)

**Outcome**: 4 card menampilkan angka live dari platform, konsisten pola Fase 1 (raw fetch + `withCache` + empty-state anti cache-poisoning), tanpa data seed basi.

---

## 1. Verifikasi live (SUDAH dilakukan read-only per 2026-07-20) — WAJIB dipatuhi

Endpoint platform sudah di-probe dengan Bearer token asli. **Ini mengoreksi rencana lama di summary Fase 1** (yang menyebut `ajukanpermohonan/findMany` — endpoint itu 404, JANGAN dipakai).

### `GET /api/noc/laporan?limit=1000` → 200
```
Response shape: { data: [...], total, page, limit }
Item keys:      id, kategori, status, priority, created_at, warga
Status values:  "baru" | "selesai" | "ditolak"   ← BUKAN BARU/DIPROSES/SELESAI
Data staging:   total=21 → baru=16, selesai=3, ditolak=2
Sample item:    { id, kategori:"infrastruktur", status:"baru", priority, created_at:"2026-07-02T06:21:09.176Z", warga:{...} }
```

### `GET /api/noc/surat?limit=1000` → 200
```
Response shape: { data: [...], total, page, limit }
Item keys:      id, jenis, status, nomor_surat, created_at, warga
Data staging:   total=11, semua Juli 2026, 10 item dalam 7 hari terakhir
jenis values:   sk-keh, SK-KEH, sk-penghasilan, sk-beda-nama, sk-usaha, sk-domisili, sl-izin-keramaian  (casing tak konsisten!)
Sample item:    { id, jenis:"sk-keh", status:"selesai", nomor_surat:"003/SK-KEH/VII/2026", created_at:"2026-07-20T04:16:59.289Z", warga:{ nama:"Bagas Banuna" } }
```

### Fakta penting
- ❌ `GET /api/noc/ajukanpermohonan/findMany` → **404 NOT_FOUND** (rencana lama salah).
- ❌ `GET /api/noc/docs/json` (platform) → **404** → tak bisa `bun run gen:api` untuk platform → **WAJIB raw `fetch`**, bukan openapi-fetch.
- Auth = header `Authorization: Bearer <token>`. Token asli sudah ada di `.env` sebagai `VITE_JENNA_API_TOKEN` (prefix `jenna_...`).

---

## 2. Keputusan user (TERKUNCI — jangan tanya ulang)

1. **Map status**: Pengaduan Aktif = `count(status==="baru")`; Layanan Selesai = `count(status==="selesai")`; `ditolak` tak masuk keduanya (ditampilkan di detail line saja).
2. **Token**: env **server-only baru** `PLATFORM_API_URL` + `PLATFORM_API_TOKEN` (TANPA prefix `VITE_`). Alasan: dipanggil server-side; `VITE_` meng-inline Bearer ke bundle frontend = bocor (rule keamanan #7/#12).
3. **Fallback**: **empty-state** saat API gagal (angka 0 / array kosong), **drop fallback Prisma**. Pola: fn `throw` di dalam `withCache` (biar tak ter-cache), outer `try/catch` return default kosong + `set.status=500`.
4. **Detail line Pengaduan Aktif**: `"{baru} baru, {ditolak} ditolak"` (bukan `"{baru} baru, {proses} diproses"` — `diproses` tak eksis di platform).

---

## 3. Pola referensi yang WAJIB diikuti (dari kode existing)

### 3a. Raw fetch + withCache + empty-state — `src/api/dashboard.ts:44` (handler `/sdgs`)
```ts
.get("/sdgs", async ({ set }) => {
  try {
    const data = await withCache("dashboard:sdgs", TTL.DASHBOARD, async () => {
      const response = await fetch(`${baseUrl}/api/landingpage/sdgsdesa/findMany`);
      if (!response.ok) throw new Error(`Desa API error: ${response.status}`);
      const json = await response.json();
      if (!json.success || !Array.isArray(json.data)) throw new Error("Invalid response");
      return json.data.map(/* transform */);
    });
    return { data };
  } catch (error) {
    logger.error({ error }, "Failed ...");
    set.status = 500;
    return { data: [] };            // ← empty-state di OUTER catch
  }
}, { response: { 200: t.Object({...}), 500: t.Object({ data: t.Array(...) }) } })
```
Kunci: throw di dalam fn `withCache` ⇒ hasil gagal TIDAK ter-cache (lihat `withCache` di `src/utils/cache.ts` — hanya cache jika `result != null`, dan throw membatalkan set). Empty-state hanya di outer catch.

### 3b. `withCache` — `src/utils/cache.ts`
```ts
withCache<T>(key, ttlMs, fn): Promise<T>   // TTL.DASHBOARD = 15*60*1000
```
Sudah di-import di `complaint.ts`? CEK — saat ini `complaint.ts` hanya import `prisma`, `logger`. **Tambah** `import { TTL, withCache } from "../utils/cache";`.

### 3c. `getEnv` — `src/utils/env.ts`
```ts
getEnv(key: string, defaultValue = ""): string   // baca import.meta.env lalu process.env
```

### 3d. Struktur test — `__tests__/api/dashboard-live.test.ts` (129 baris)
`import api from "@/api";` · `describe`/`it` dari `bun:test` · unit transform (fungsi murni) + integration auth guard (fetch ke `api.handle(new Request(...))` → expect 401 tanpa auth). Total suite existing: **118 test, 0 fail** — jangan pecahkan.

---

## 4. Perubahan file (detail eksekusi)

### FILE 1 (BARU) — `src/utils/platform-external-client.ts`
Client server-only, raw fetch + Bearer. ~50 baris.

```ts
import { getEnv } from "./env";

/**
 * Platform External Client — server-only.
 * Menarik data live dari Desa Platform (desa-platform-stg.wibudev.com) untuk
 * card pengaduan & surat dashboard (Fase 2). Auth = Bearer token.
 * TANPA prefix VITE_: dipanggil server-side, token tak boleh ter-bundle ke FE.
 * Platform tak expose OpenAPI (`/docs/json` 404) → raw fetch, bukan openapi-fetch.
 */
const PLATFORM_BASE_URL = getEnv("PLATFORM_API_URL", "https://desa-platform-stg.wibudev.com");
const PLATFORM_TOKEN = getEnv("PLATFORM_API_TOKEN", "");

export interface PlatformListResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
}

/**
 * GET ke Platform API, validasi bentuk `{ data: [...] }`.
 * Throw pada non-2xx atau payload invalid — pemanggil bungkus withCache
 * (fn throw ⇒ tak ter-cache) + outer catch → empty-state.
 */
export async function platformFetch<T = unknown>(path: string): Promise<PlatformListResponse<T>> {
  const response = await fetch(`${PLATFORM_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${PLATFORM_TOKEN}`, Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Platform API error: ${response.status}`);
  const json = (await response.json()) as PlatformListResponse<T>;
  if (!json || !Array.isArray(json.data)) throw new Error("Invalid response from Platform API");
  return json;
}
```

### FILE 2 (BARU) — `src/api/complaint-platform.ts`
Transform MURNI (tanpa network) — supaya bisa di-unit-test & handler tetap tipis (rule #8). ~110 baris.

```ts
/**
 * Transform murni untuk card pengaduan & surat dashboard (Fase 2).
 * Dipisah dari complaint.ts agar bisa diuji tanpa network.
 */

// English 3-huruf, indeks = getUTCMonth(). Mirror lama TO_CHAR('Mon') Postgres
// supaya label XAxis ChartSurat tak berubah. Deterministik, tak ikut locale.
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;

export interface ComplaintStats { total: number; baru: number; selesai: number; ditolak: number; }
export interface TrendPoint { month: string; count: number; }
export const EMPTY_COMPLAINT_STATS: ComplaintStats = { total: 0, baru: 0, selesai: 0, ditolak: 0 };

export interface PlatformLaporan { status?: string; }
export interface PlatformSurat { created_at?: string; }

/** baru/selesai/ditolak dari laporan platform. Aktif=baru, Selesai=selesai (keputusan user). */
export function mapComplaintStats(rows: PlatformLaporan[], total?: number): ComplaintStats {
  let baru = 0, selesai = 0, ditolak = 0;
  for (const r of rows) {
    if (r.status === "baru") baru++;
    else if (r.status === "selesai") selesai++;
    else if (r.status === "ditolak") ditolak++;
  }
  return { total: total ?? rows.length, baru, selesai, ditolak };
}

/** Jumlah surat sejak awal minggu berjalan (Minggu 00:00 lokal). Pertahankan makna lama. */
export function countSuratWeekly(rows: PlatformSurat[], now: Date = new Date()): number {
  const startOfWeek = new Date(now);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  let count = 0;
  for (const r of rows) {
    if (!r.created_at) continue;
    if (new Date(r.created_at) >= startOfWeek) count++;
  }
  return count;
}

/** Group surat per bulan (kronologis) untuk ChartSurat. Casing jenis tak relevan. */
export function mapSuratTrends(rows: PlatformSurat[]): TrendPoint[] {
  const counts = new Map<number, number>(); // key: year*12 + month
  for (const r of rows) {
    if (!r.created_at) continue;
    const d = new Date(r.created_at);
    if (Number.isNaN(d.getTime())) continue;
    const key = d.getUTCFullYear() * 12 + d.getUTCMonth();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => a[0] - b[0]).map(([key, count]) => ({ month: MONTH_SHORT[key % 12], count }));
}
```

### FILE 3 (EDIT) — `src/api/complaint.ts`
Tiga handler di-swap. **Handler lain (`/recent`, `/trends`, `/service-stats`, `/innovation-ideas`, `/export`) JANGAN disentuh** — tak dipakai 4 card dashboard.

**Tambah import di atas** (setelah import existing):
```ts
import { TTL, withCache } from "../utils/cache";
import { platformFetch } from "../utils/platform-external-client";
import {
  countSuratWeekly, EMPTY_COMPLAINT_STATS, mapComplaintStats, mapSuratTrends,
  type PlatformLaporan, type PlatformSurat,
} from "./complaint-platform";
```

**3a. Handler `/stats`** (existing line ~9-46) — ganti isi async + response schema:
```ts
.get("/stats", async ({ set }) => {
  try {
    const data = await withCache("dashboard:complaint:stats", TTL.DASHBOARD, async () => {
      const json = await platformFetch<PlatformLaporan>("/api/noc/laporan?limit=1000");
      return mapComplaintStats(json.data, json.total);
    });
    return { data };
  } catch (error) {
    logger.error({ error }, "Failed to fetch complaint stats from platform");
    set.status = 500;
    return { data: EMPTY_COMPLAINT_STATS };
  }
}, {
  response: {
    200: t.Object({ data: t.Object({ total: t.Number(), baru: t.Number(), selesai: t.Number(), ditolak: t.Number() }) }),
    500: t.Object({ data: t.Object({ total: t.Number(), baru: t.Number(), selesai: t.Number(), ditolak: t.Number() }) }),
  },
  detail: { summary: "Get complaint statistics (live platform)" },
})
```
> Perubahan kontrak: field `proses` → `ditolak`. Ini memicu update FILE 4, 5, 6.

**3b. Handler `/service-weekly`** (existing line ~248-278) — ganti isi:
```ts
.get("/service-weekly", async ({ set }) => {
  try {
    const data = await withCache("dashboard:surat:weekly", TTL.DASHBOARD, async () => {
      const json = await platformFetch<PlatformSurat>("/api/noc/surat?limit=1000");
      return { count: countSuratWeekly(json.data) };
    });
    return { data };
  } catch (error) {
    logger.error({ error }, "Failed to fetch weekly surat from platform");
    set.status = 500;
    return { data: { count: 0 } };
  }
}, {
  response: {
    200: t.Object({ data: t.Object({ count: t.Number() }) }),
    500: t.Object({ data: t.Object({ count: t.Number() }) }),
  },
  detail: { summary: "Get surat count for current week (live platform)" },
})
```
> Kontrak `{ data: { count } }` TETAP → konsumen `dashboard-content.tsx` (weeklyService) tak berubah.

**3c. Handler `/service-trends`** (existing line ~168-198) — ganti isi:
```ts
.get("/service-trends", async ({ set }) => {
  try {
    const data = await withCache("dashboard:surat:trends", TTL.DASHBOARD, async () => {
      const json = await platformFetch<PlatformSurat>("/api/noc/surat?limit=1000");
      return mapSuratTrends(json.data);
    });
    return { data };
  } catch (error) {
    logger.error({ error }, "Failed to fetch surat trends from platform");
    set.status = 500;
    return { data: [] };
  }
}, {
  response: {
    200: t.Object({ data: t.Array(t.Object({ month: t.String(), count: t.Number() })) }),
    500: t.Object({ data: t.Array(t.Any()) }),
  },
  detail: { summary: "Get surat trends per month (live platform)" },
})
```
> Kontrak `{ data: [{month,count}] }` TETAP → `chart-surat.tsx` tak berubah.

### FILE 4 (EDIT) — `src/components/dashboard-content.tsx`
Sesuaikan field `proses` → `ditolak`. Titik ubah (baris existing):
- **Type `DashboardStats.complaints`** (cari `complaints:` di type sekitar line 10-17): `{ total: number; baru: number; selesai: number; ditolak: number }` (ganti `proses` → `ditolak`).
- **`fetchDashboardStats` default** (line ~39): `|| { total: 0, baru: 0, proses: 0, selesai: 0 }` → `{ total: 0, baru: 0, selesai: 0, ditolak: 0 }`.
- **`EMPTY_STATS`** (line ~53): `complaints: { total: 0, baru: 0, proses: 0, selesai: 0 }` → `{ total: 0, baru: 0, selesai: 0, ditolak: 0 }`.
- **Card Pengaduan Aktif** (line ~87-88):
  ```tsx
  value={stats.complaints.baru}                                   // dulu: baru + proses
  detail={`${stats.complaints.baru} ${t.dashboard.baru}, ${stats.complaints.ditolak} ${t.dashboard.ditolak}`}
  ```
- **Card Layanan Selesai** (line ~95): `value={stats.complaints.selesai}` TETAP.

### FILE 5 (EDIT) — i18n
- `src/locales/id.ts` — di objek `dashboard`, tambah: `ditolak: "Ditolak",` (key `baru` sudah ada; `diproses` biarkan — dipakai halaman lain).
- `src/locales/en.ts` — di objek `dashboard`, tambah: `ditolak: "Rejected",`.
- Pastikan struktur `t.dashboard.ditolak` valid di kedua locale (tipe locale biasanya di-infer — samakan bentuk kedua file).

### FILE 6 (EDIT) — `generated/api.ts`
Update response schema `/api/complaint/stats` (blok mulai line ~623) agar `data` = `{ total, baru, selesai, ditolak }` (drop `proses`).
- Coba `bun run gen:api` dulu (regen dari Elysia). Jika endpoint internal ter-reflect otomatis → cukup itu.
- Jika tidak, edit manual blok tsb: ganti properti `proses` → `ditolak` pada schema response 200 (dan 500 jika ada). Cari juga `service-weekly`/`service-trends` (line ~708, ~742) — kontraknya tak berubah, tapi pastikan tetap valid.

### FILE 7 (EDIT) — env
- `.env.example` — tambah blok (setelah blok Jenna):
  ```
  # Platform API (server-side, Bearer) — Pengaduan & Surat live (Fase 2)
  PLATFORM_API_URL="https://desa-platform-stg.wibudev.com"
  PLATFORM_API_TOKEN="your-platform-bearer-token-here"
  ```
- `.env` lokal (JANGAN commit) — tambah:
  ```
  PLATFORM_API_URL=https://desa-platform-stg.wibudev.com
  PLATFORM_API_TOKEN=<salin nilai dari VITE_JENNA_API_TOKEN yang sudah ada di .env>
  ```

### FILE 8 (BARU) — `__tests__/api/dashboard-fase2.test.ts`
Ikuti gaya `dashboard-live.test.ts`. Import transform dari `@/api/complaint-platform` + `api from "@/api"`.

Kasus wajib:
1. **mapComplaintStats** — input `[16×{status:"baru"}, 3×{status:"selesai"}, 2×{status:"ditolak"}]`, total=21 → `{ total:21, baru:16, selesai:3, ditolak:2 }`. Status tak dikenal diabaikan.
2. **mapComplaintStats total fallback** — `total` undefined → `total = rows.length`.
3. **countSuratWeekly** — `now` fixed (mis. `new Date("2026-07-20T00:00:00Z")`), item `created_at` dalam vs luar minggu → hitung benar; batas `startOfWeek` inklusif.
4. **mapSuratTrends** — item lintas 2 bulan (mis. Jun + Jul) → `[{month:"Jun",...},{month:"Jul",...}]` kronologis; `created_at` invalid/kosong di-skip; casing `jenis` tak memengaruhi.
5. **empty-state** — `mapComplaintStats([])` → `EMPTY_COMPLAINT_STATS` (semua 0); `countSuratWeekly([])`→0; `mapSuratTrends([])`→`[]`.
6. **Integration auth guard** — `api.handle(new Request("http://localhost/api/complaint/stats"))` tanpa auth → status **401** (juga `service-weekly`, `service-trends`). Ikuti persis pola auth-guard di `dashboard-live.test.ts`.

> JANGAN hit platform sungguhan di test (network flaky). Semua unit atas fungsi murni.

---

## 5. Urutan eksekusi & commit (berkala, rule #9)

1. FILE 1 + FILE 2 → commit `feat(api): add platform client + complaint transforms (Fase 2)`
2. FILE 3 → commit `feat(api): swap complaint stats/surat handlers to platform live`
3. FILE 4 + FILE 5 + FILE 6 → commit `feat(dashboard): render ditolak, wire live complaint stats`
4. FILE 7 → commit `chore(env): add server-only PLATFORM_API_* vars` (JANGAN commit `.env`)
5. FILE 8 → commit `test(api): cover Fase 2 platform transforms + auth guard`

---

## 6. Verifikasi (end-to-end) — WAJIB sebelum lapor selesai

1. `bun test` — suite baru hijau + suite existing (118 test) tetap 0 fail. **Blocker jika ada fail.**
2. `bun run check` (Biome) lulus.
3. `bun run dev` + Bearer platform di `.env`, cek via sesi auth:
   - `/api/complaint/stats` → `{data:{total:21,baru:16,selesai:3,ditolak:2}}` (angka sesuai staging saat plan ditulis; boleh berubah jika data platform berubah).
   - `/api/complaint/service-weekly` → `{data:{count:<~10>}}`.
   - `/api/complaint/service-trends` → `{data:[{month:"Jul",count:<~11>}]}`.
4. **Simulasi platform down** (kosongkan `PLATFORM_API_TOKEN` atau set `PLATFORM_API_URL` invalid) → ketiga endpoint balas default kosong (0/[]), **bukan 500 loop, bukan angka Prisma basi**; pastikan `[]` tak ter-cache (fn throw sebelum `withCache` set).
5. Dashboard UI: Pengaduan Aktif=16 detail "16 baru, 2 ditolak"; Layanan Selesai=3; Surat Minggu Ini≈10; ChartSurat 1 bar (Jul).

---

## 7. Guardrails (aturan global)

- Branch: `feature/dashboard-live-api-fase2` (SUDAH dibuat & aktif). JANGAN commit ke main.
- JANGAN `git push` / merge / deploy tanpa perintah eksplisit user.
- Tidak ada perubahan schema DB → tidak ada migrasi Prisma.
- Rule keamanan: `.env` JANGAN di-stage. Token JANGAN hardcode / JANGAN pakai prefix `VITE_`.
- File health (rule #8): `complaint.ts` cek ukuran — saat ini ~280 baris; swap ini net-neutral (ganti isi handler, tak nambah handler). `complaint-platform.ts` ~110 baris OK.
- Test wajib hijau sebelum lapor selesai (rule #3).
```

---

## Ringkasan file
| # | File | Aksi |
|---|---|---|
| 1 | `src/utils/platform-external-client.ts` | BARU — client Bearer server-only |
| 2 | `src/api/complaint-platform.ts` | BARU — transform murni (testable) |
| 3 | `src/api/complaint.ts` | EDIT — swap 3 handler (`/stats`, `/service-weekly`, `/service-trends`) |
| 4 | `src/components/dashboard-content.tsx` | EDIT — field `proses`→`ditolak`, value & detail card |
| 5 | `src/locales/{id,en}.ts` | EDIT — key `dashboard.ditolak` |
| 6 | `generated/api.ts` | EDIT/regen — schema `/api/complaint/stats` |
| 7 | `.env.example` + `.env` | EDIT — `PLATFORM_API_URL` + `PLATFORM_API_TOKEN` |
| 8 | `__tests__/api/dashboard-fase2.test.ts` | BARU — unit transform + auth guard |
