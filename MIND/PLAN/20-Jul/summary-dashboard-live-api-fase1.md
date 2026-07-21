# Summary — Dashboard Live API Fase 1

> Tanggal: 20 Jul 2026 · Branch: `feature/dashboard-live-api-fase1` · Status: ✅ Done, pushed, belum merge

---

## Scope Fase 1

Empat card dashboard yang bisa langsung diganti tanpa keputusan redefinisi (padanan 1:1):
**Total Penduduk · SDGs · Divisi Teraktif · Kalender**

Card Surat Minggu Ini, Pengaduan Aktif, Layanan Selesai ditunda ke **Fase 2** (butuh Bearer Jenna di desa-platform-stg).

---

## Yang Dikerjakan

### Backend — 3 endpoint dimigrasi

#### 1. `src/api/dashboard.ts` — `/sdgs`
- **Sebelum:** `prisma.sdgsScore.findMany()`
- **Sesudah:** raw `fetch(DESA_API_URL + /api/landingpage/sdgsdesa/findMany)`
- Map: `title = name`, `score = Number(jumlah)`, `image = baseUrl + image.link` (URL absolut)
- `withCache("dashboard:sdgs", TTL.DASHBOARD)` — fn throw saat gagal, outer catch return `{ data: [] }` status 500
- Tidak pakai `desaExternalClient` karena path belum ada di `generated/desa-external.ts`

#### 2. `src/api/noc.ts` — `/active-divisions`
- **Sebelum:** `prisma.division.findMany({ villageId: idDesa })`
- **Sesudah:** `nocExternalClient.GET("/api/noc/active-divisions", { params: { query: { idDesa, limit } } })`
- `idDesa`: ubah dari `t.String()` required → `t.Optional(t.String())`, default `getEnv("NOC_VILLAGE_ID", "desa1")`
- Map NOC response `{ id, division, totalKegiatan }` → `{ id, name, activityCount, color }`
- `DIVISION_COLOR_MAP` statis per nama divisi (NOC external tidak kirim field `color`), fallback `#6B7280`
- `withCache("dashboard:active-divisions:idDesa", TTL.DASHBOARD)`
- `/api/division/` tidak disentuh (masih dipakai `division-list.tsx` di luar scope)

#### 3. `src/api/noc.ts` — `/upcoming-events`
- **Sebelum:** `prisma.event.findMany({ villageId: idDesa, startDate: { gte: now } })`
- **Sesudah:** `nocExternalClient.GET("/api/noc/upcoming-events", { params: { query: { idDesa, limit, filter } } })`
- `idDesa`: sama, optional + default `NOC_VILLAGE_ID`
- Map: `id, title, startDate, location ?? null, eventType ?? "EVENT"`
- `withCache("dashboard:upcoming-events:idDesa:filter", TTL.DASHBOARD)`
- Kontrak response internal dipertahankan — `activity-list.tsx` dan `event-card.tsx` tidak perlu berubah

---

### Frontend — 2 komponen diubah

#### 4. `src/components/dashboard-content.tsx` — Total Penduduk
- **Sebelum:** `apiClient.GET("/api/resident/stats")` → DB lokal (resident.count = 2)
- **Sesudah:** `apiClient.GET("/api/demografi/summary")` → proxy Desa API (`totalPenduduk = 4200`)
- Unwrap nested: `(res.data as {...})?.data?.summary?.totalPenduduk ?? 0`
- Field `poor` dihapus dari `DashboardStats.residents` (tidak ada di demografi/summary)

#### 5. `src/components/dashboard/division-progress.tsx`
- **Sebelum:** `apiClient.GET("/api/division/")` → DB lokal (externalActivityCount @default(0))
- **Sesudah:** `apiClient.GET("/api/noc/active-divisions")` — tidak kirim `idDesa`, server pakai default
- Shape response kompatibel, map `name` dan `activityCount` tidak berubah

---

### Pendukung

| File | Perubahan |
|------|-----------|
| `generated/api.ts` | `idDesa: string` → `idDesa?: string` pada `getApiNocActive-divisions` & `getApiNocUpcoming-events` |
| `.env.example` | Tambah `NOC_VILLAGE_ID="desa1"` + `NOC_API_KEY` |
| `.env` | Tambah `NOC_VILLAGE_ID=desa1` (tidak di-commit) |

---

## Status Card Dashboard Setelah Fase 1

| Card | Sumber | Status |
|------|--------|--------|
| Total Penduduk | `/api/demografi/summary` → DESA API | ✅ Live |
| SDGs | `sdgsdesa/findMany` → DESA API | ✅ Live |
| Divisi Teraktif | `/api/noc/active-divisions` → NOC external | ✅ Live |
| Kalender | `/api/noc/upcoming-events` → NOC external | ✅ Live |
| Tingkat Kepuasan | `responden/findMany` | ✅ Live (pre-existing) |
| Realisasi APBDes | `apbdes-data` → DESA API | ✅ Live (pre-existing) |
| Surat Minggu Ini | `prisma.serviceLetter.count()` | ❌ DB lokal → Fase 2 |
| Pengaduan Aktif | `prisma.complaint.count()` | ❌ DB lokal → Fase 2 |
| Layanan Selesai | `prisma.complaint.count()` | ❌ DB lokal → Fase 2 |
| Statistik Surat | `prisma.serviceLetter.groupBy()` | ❌ DB lokal → Fase 2 |

---

## Tests

File: `__tests__/api/dashboard-live.test.ts` — 11 test, semua hijau

| Kelompok | Kasus |
|----------|-------|
| Unit SDGs transform | URL absolut dari `baseUrl + image.link`; `Number(jumlah)` dari string dan number |
| Unit divisi colorMap | Nama dikenal → warna benar; nama tak dikenal → fallback `#6B7280`; `totalKegiatan → activityCount` |
| Auth guard | `GET /active-divisions` tanpa auth → 401; `GET /upcoming-events` tanpa auth → 401; `GET /active-divisions?idDesa=desa1` tanpa auth → 401 |
| `idDesa` optional | Kedua endpoint tanpa `idDesa` → bukan 400 atau 422 |

Total suite: **118 test, 0 fail**

---

## Keputusan Teknis Penting

1. **Anti cache-poisoning** — fn dalam `withCache` throw saat fetch gagal; `data:[]` hanya di outer catch (pola satisfaction-responden). Hindari `[]` ter-cache 15 menit saat API down.
2. **`idDesa` optional server-side** — frontend tidak perlu kirim; hardcode dihindari (rule 15). Nilai dari env `NOC_VILLAGE_ID`.
3. **colorMap statis** — NOC external tidak kirim field `color` pada live response. Sintesis lokal dengan fallback `#6B7280`.
4. **Tidak ubah `/api/division/`** — endpoint itu juga dipakai `division-list.tsx` (halaman kinerja-divisi). Blast radius > scope Fase 1.
5. **Tidak migrasi `resident.ts`** — `/api/demografi/summary` sudah ada dan proxy ke DESA API. Frontend langsung repoint ke sana, tidak perlu duplikat endpoint.

---

## Fase 2 (Ditunda)

Butuh **PLATFORM** (`desa-platform-stg.wibudev.com`) + Bearer Jenna (`VITE_JENNA_API_TOKEN`):

- **Pengaduan Aktif** — `GET /api/noc/laporan` → `count(status = "baru")`
- **Layanan Selesai** — `GET /api/noc/laporan` → `count(status = "selesai")`
- **Surat Minggu Ini** — `GET /api/noc/laporan` atau `ajukanpermohonan/findMany` → `count(createdAt dalam 7 hari)`
- **Statistik Surat (ChartSurat)** — `ajukanpermohonan/findMany` → group per bulan `createdAt`

Perlu konfirmasi redefinisi makna sebelum eksekusi (total laporan = 21: `baru=15`, `selesai=3`, sisanya status lain).
