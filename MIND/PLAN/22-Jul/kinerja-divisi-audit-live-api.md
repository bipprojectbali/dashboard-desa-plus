# Plan FINAL — Kinerja Divisi ke API Live

> Tanggal: 21 Jul 2026 · Halaman: `/kinerja-divisi` · Branch target: `feature/kinerja-divisi-live-api`
> Lanjutan `MIND/PLAN/20-Jul/transisi-data-api-live.md` (yang fokus Beranda). Semua keputusan sudah TERKUNCI via diskusi user 21-Jul.

---

## Audit final (7 widget, sudah diverifikasi probe NOC live real)

| # | Widget | Sumber sekarang | Aksi |
|---|---|---|---|
| 1 | Program Kegiatan (4 card) | `/api/noc/latest-projects` 🟢 | — (sudah live) |
| 2 | Divisi Teraktif | `/api/division/` (Prisma) 🔴 | **T1** repoint ke NOC |
| 3 | Jumlah Dokumen | `/api/noc/diagram-jumlah-document` 🟢 | — |
| 4 | Progres Kegiatan | `/api/noc/diagram-progres-kegiatan` 🟢 | — |
| 5 | Diskusi | `/api/noc/latest-discussion` (Prisma) 🔴 | **T3** swap ke NOC live |
| 6 | Acara Hari Ini | `/api/event/today` (Prisma) 🔴 | **T2** repoint ke NOC |
| 7 | Arsip Digital (×4) | label statis, tanpa API ⚫ | **T4** HAPUS |

---

## Keputusan user (TERKUNCI — jangan tanya ulang)

1. **Divisi Teraktif** → samakan dengan Beranda: pakai `/api/noc/active-divisions`
   (persis `src/components/dashboard/division-progress.tsx:32`).
2. **Acara Hari Ini** → samakan dengan Beranda: pakai `/api/noc/upcoming-events`
   (persis `src/components/dashboard/activity-list.tsx:15`). Konsekuensi: saat NOC kosong → empty-state
   ("Tidak ada kegiatan mendatang"), sama seperti Beranda sekarang.
3. **Diskusi** → migrasi ke NOC live (`GET /api/noc/latest-discussion` di darmasaba.muku.id, ada di NOC docs).
4. **Arsip Digital** → **hapus** (tak ada endpoint sumbernya).

---

## T1 — Divisi Teraktif → `/api/noc/active-divisions` (FE-only)

**File**: `src/components/kinerja-divisi/division-list.tsx`
- Ganti `fetchDivisionList`:
  ```ts
  const { data } = await apiClient.GET("/api/noc/active-divisions");
  // response item: { id, name, activityCount, color }
  return (data?.data ?? []).map((d) => ({ name: d.name, count: d.activityCount || 0 }));
  ```
- Hapus interface `DivisionApiResponse` lama (`_count`) → tak relevan lagi.
- Handler server `/api/noc/active-divisions` **sudah live + empty-state** (`noc.ts:135`), tak disentuh.
- **Efek**: tampil 5 divisi live (Kesejahteraan 80…Pelayanan 16); seed Pembangunan/Pemberdayaan hilang.
  Identik Beranda "Divisi Teraktif".

## T2 — Acara Hari Ini → `/api/noc/upcoming-events` (buang jalur Prisma)

**File A**: `src/components/kinerja-divisi.tsx`
- `fetchKinerjaOverview`: buang `apiClient.GET("/api/event/today")`. Sisakan `latest-projects` saja.
- Hapus `EventData`, `todayEvents`, `formattedEvents`, dan blok fallback `<Card>"Tidak ada acara hari ini"`.
- Section 4 render **`<EventCard />` polos** (tanpa prop `agendas`) ⇒ EventCard pakai jalur live sendiri.
- `KinerjaOverview` jadi `{ activities }` saja; `EMPTY_OVERVIEW` ikut disesuaikan.

**File B**: `src/components/kinerja-divisi/event-card.tsx`
- Saat ini fetch `upcoming-events?filter=today`. Samakan dengan Beranda (ActivityList pakai `limit:"10"` tanpa
  `filter`, judul "Kegiatan Mendatang"). **Keputusan tampilan**: pertahankan "Acara Hari Ini" ⇒ tetap `filter:"today"`,
  ATAU ubah jadi "Kegiatan Mendatang" seperti Beranda (`limit:"10"`). → **default: tetap `filter:"today"`** (judul widget
  tetap "Acara Hari Ini"); prop `agendas` jadi opsional murni. Empty-state existing sudah OK.

**File C**: `src/api/event.ts` + `src/api/index.tsx` + `generated/api.ts`
- Setelah T2, `/api/event/*` **tak dipanggil FE mana pun** (grep confirm: hanya dipakai di kinerja-divisi.tsx:40).
  → **Hapus** `event.ts` + unmount `.use(event)` di `index.tsx:90` + import `index.tsx:18` (buang dead code, rule #17).
- **WAJIB** `bun run gen:api` setelah hapus — `generated/api.ts:810,827` masih deklarasi `/api/event/` & `/api/event/today`.
  Regen supaya generated types sinkron (tanpa ini, `apiClient` masih expose path yg sudah mati).
- Urutan aman: buang caller (File A) → hapus handler+mount (File C) → `gen:api` → `bun run check`. Cek grep sebelum hapus.

## T3 — Diskusi → NOC live (server swap + transform)

> **Shape live SUDAH DIPROBE (bukan tebakan).** `GET /api/noc/latest-discussion?idDesa=desa1&limit=6` → HTTP 200,
> `data[2]`, item keys **persis** `{id,title,desc,date,user,group}`. Sample:
> `{"id":"cmqq11k...","title":"Pelaksana Kewilayahan (KBD) ","desc":"Forum komunikasi KBD","date":"23 Jun 2026","user":"I. B. Surya Prabhawa Manuaba,...","group":"Dinas"}`.
> ⚠️ `generated/noc-external.ts:247` mengetik response endpoint ini `content?: never` (body eksternal untyped) →
> `nocExternalClient.GET` balikin `never`/`undefined` di tipe. **Konsekuensi**: cast hasil ke interface `NocDiscussionRaw`
> manual (pola sama seperti `active-divisions` yang juga cast `res?.data?.divisi as NocDivisionRaw[]`, `noc.ts:150-151`).
> Transform tetap ditulis di atas shape terprobe, bukan tebakan.

**File A**: `src/api/noc.ts` handler `/latest-discussion` (`noc.ts:787`)
- Ganti `prisma.discussion.findMany` → `nocExternalClient.GET("/api/noc/latest-discussion", { params:{ query:{ idDesa, limit } } })`
  bungkus `withCache(\`dashboard:latest-discussion:${idDesa}\`, TTL.DASHBOARD, …)`, empty-state `{ data: [] }` saat gagal.
  Cast: `const raw = (res?.data as any)?.data as NocDiscussionRaw[]; if (!Array.isArray(raw)) throw …`.
- **Transform** (shape live TERPROBE `{id,title,desc,date,user,group}` → kontrak FE existing):
  ```ts
  { id, message: d.desc || d.title, senderName: d.user || "Anonymous",
    senderImage: null, divisionName: d.group || "General", createdAt: d.date }
  ```
  Ekstrak ke `src/api/transforms/noc-discussions.ts` (fungsi murni, testable) — konsisten pola `noc-divisions.ts`/`noc-events.ts`.
- Kontrak response 200 handler **tetap** `{id,message,senderName,senderImage,divisionName,createdAt}` → FE tak berubah struktural.

**File B**: `src/components/kinerja-divisi/discussion-panel.tsx`
- `createdAt` live = string "23 Jun 2026" (bukan ISO). `formatDate` pakai `new Date("23 Jun 2026")` → NaN.
  → longgarkan `formatDate`: jika `Number.isNaN(Date)` → tampilkan string apa adanya (sudah ada `try/catch`, tapi
  `new Date("23 Jun 2026")` tak throw, hanya Invalid). Tambah guard `isNaN` → return raw string.

## T4 — Hapus Arsip Digital

- `src/components/kinerja-divisi.tsx`: hapus `archiveData`, Section 5 (Grid ArchiveCard), import `ArchiveCard`.
- Hapus file `src/components/kinerja-divisi/archive-card.tsx` + entry di `kinerja-divisi/index.ts`.
- i18n: hapus `suratKeputusan`, `laporanKeuangan`, `notulensiRapat` dari blok `kinerjaDivisi` di `id.ts`+`en.ts`
  (type + impl). **JANGAN hapus `dokumentasi`** — dipakai di blok lain (`en.ts:397`, `id.ts:392`).

---

## Test (wajib, rule #3) — `__tests__/api/kinerja-live.test.ts` (BARU)
- **T1 map divisi** — ⚠️ `mapActiveDivisions` **BELUM diuji**. `dashboard-live.test.ts:46` pakai fungsi `mapDivisi`
  **duplikat lokal**, bukan import fungsi asli → tak ada safety-net. Test baru **WAJIB** `import { mapActiveDivisions }
  from "@/api/transforms/noc-divisions"` dan assert: `{id,division,totalKegiatan}` → `{id,name,activityCount,color}`,
  `name=division`, `activityCount=totalKegiatan`, color dari `DIVISION_COLOR_MAP` (fallback `#6B7280`).
- **T3 transform** `mapDiscussions` (import dari `@/api/transforms/noc-discussions`): input shape terprobe
  `{id,title,desc,date,user,group}` → assert `message=desc` (fallback `title`), `senderName=user` (fallback "Anonymous"),
  `divisionName=group` (fallback "General"), `senderImage=null`, `createdAt=date`; `[]`→`[]`.
- **Auth guard**: `api.handle(Request("/api/noc/latest-discussion"))` tanpa auth → 401 (ikut pola `dashboard-live.test.ts`).
- **Empty-state**: NOC error → handler balas `{data:[]}`, bukan 500 loop.
- **Jangan** hit NOC sungguhan (network flaky) — unit atas fungsi murni.

## Konflik dengan plan 20-Jul (WAJIB dibaca agent berikutnya)
- `MIND/PLAN/20-Jul/transisi-data-api-live.md` **§3c** merencanakan migrasi `event.ts` → **DESA API**
  (`kegiatandesa/find-many`). Plan 21-Jul ini malah **menghapus** `event.ts` (Acara Hari Ini pakai NOC
  `upcoming-events`, samakan dgn Beranda — keputusan user 21-Jul). **21-Jul menang.** ⇒ Item **§3c plan 20-Jul BATAL/basi** —
  jangan ada yang mengerjakannya. (§3a SDGs, §3b resident, §3d complaint di plan 20-Jul di luar scope halaman ini.)

## Guardrails
- Branch `feature/kinerja-divisi-live-api` sebelum kode. Commit berkala. **Jangan** merge/push/deploy tanpa perintah.
- Tak ubah schema DB → tak ada migrasi. Token NOC via env (`x-api-key`), jangan hardcode.
- `noc.ts` sudah **938 baris** (over hard-limit 500). T3 hanya swap isi handler existing (net-neutral, transform
  diekstrak ke file transforms) — **jangan tambah handler baru**. Pecah `noc.ts` dicatat sebagai chore terpisah.

## Verifikasi (sebelum lapor selesai)
1. `bun test` hijau (suite existing tetap 0 fail).
2. `bun run dev`: Divisi Teraktif = 5 divisi live; Diskusi = item NOC (sender "I. B. Surya…", divisi "Dinas");
   Acara Hari Ini = data NOC / empty; Arsip Digital hilang.
3. Simulasi NOC down (kosongkan `NOC_API_KEY`) → 3 widget empty-state, tak 500, tak seed basi.
4. `bun run check` (Biome) lulus.

## Ringkasan file
| T | File | Aksi |
|---|---|---|
| T1 | `src/components/kinerja-divisi/division-list.tsx` | EDIT — endpoint → `/api/noc/active-divisions` |
| T2 | `src/components/kinerja-divisi.tsx` | EDIT — buang `/api/event/today`+prop; `<EventCard/>` polos; buang Arsip (T4) |
| T2 | `src/components/kinerja-divisi/event-card.tsx` | (kecil) — prop `agendas` opsional; tetap `filter:"today"` |
| T2 | `src/api/event.ts` + `src/api/index.tsx` | HAPUS handler + unmount (dead code) — cek grep dulu |
| T3 | `src/api/transforms/noc-discussions.ts` | BARU — transform murni |
| T3 | `src/api/noc.ts` (`/latest-discussion`) | EDIT — prisma → nocExternalClient + withCache + empty-state |
| T3 | `src/components/kinerja-divisi/discussion-panel.tsx` | EDIT kecil — `formatDate` guard string live |
| T4 | `src/components/kinerja-divisi/archive-card.tsx` + `index.ts` | HAPUS |
| T4 | `src/locales/{id,en}.ts` | EDIT — hapus 3 key arsip (sisakan `dokumentasi`) |
| test | `__tests__/api/kinerja-live.test.ts` | BARU |
