# Plan — Paritas Penuh `/wall` ↔ Dashboard (9 Menu)

> Tanggal: 22 Jul 2026 · Halaman: `/wall` · Branch target: `fix/wall-full-parity`
> **Menggantikan** `MIND/PLAN/wall-sync-dashboard-sources.md` (sebagian sudah usang — lihat §0.2).
> Fase 0 (audit dashboard) sudah dijalankan: audit paralel 6-agent atas menu 4–9, 22 Jul.

---

## §0 — Temuan audit (Fase 0, WAJIB dibaca agent berikutnya)

### 0.1 Sumber data tiap menu dashboard (hasil audit)

Ditelusuri komponen → endpoint → handler untuk **9 menu sidebar** (urutan sidebar,
`src/components/sidebar.tsx:31-65`):

| # | Menu (route) | Live /api? | Sumber | Sisa non-live |
|---|---|---|---|---|
| 1 | Beranda `/` | ✅ | shared loaders (NOC + Desa) | — |
| 2 | Kinerja Divisi `/kinerja-divisi` | ✅ | NOC `/api/noc/*` | — |
| 3 | Pengaduan `/pengaduan-layanan-publik` | ✅ | Jenna `/api/noc/pengaduan` | — |
| 4 | Analitik/Jenna `/jenna-analytic` | ✅ 7/7 | `/api/jenna/analytics` → NOC (`VITE_JENNA_API_URL`) | — |
| 5 | Demografi `/demografi-pekerjaan` | ✅ 13/13 | `/api/demografi/*` → Desa API | warna agama (kosmetik) |
| 6 | Keuangan `/keuangan-anggaran` | ✅ 10/11 | `/api/demografi/apbdes/{id}` → Desa `landingpage/apbdes/{id}` | trend `"+0%"` statis; fallback tahun `"2025"` |
| 7 | BUMDes `/bumdes` | ✅ 13/13 | `/api/bumdes/*` → Desa `ekonomi/umkm/*` | ambang stok (kosmetik) |
| 8 | Sosial `/sosial` | ⚠️ 16/19 | `/api/sosial/*` → Desa API | **Beasiswa 3 metric MOCK** + fallback hardcode menyesatkan |
| 9 | Keamanan `/keamanan` | ✅ 5/5 | `/api/keamanan/*` → Desa (CCTV + laporanpublik) | center peta hardcode (kosmetik) |

**Kesimpulan:** dashboard **hampir 100% live**. Satu-satunya data palsu sungguhan =
**Beasiswa** (menu Sosial). Sisanya kosmetik / fallback-saat-error. → §4 menuntaskan ini.

### 0.2 Status plan lama (sudah sebagian selesai — JANGAN kerjakan ulang)

Verifikasi git + baca builder aktual:

| Domain wall | Plan lama | STATUS AKTUAL |
|---|---|---|
| beranda | LIVE | ✅ live (`06f593e`) |
| pengaduan | 🔴 MIGRATE | ✅ **SUDAH** live via Jenna (`737fc5f`, `build-pengaduan.ts` + `transforms/noc-pengaduan.ts`) |
| divisi | 🔴 MIGRATE + rework % | ✅ **SUDAH** live 4 NOC fetcher (`18964bd`, `build-divisi.ts` + `transforms/noc-progres.ts`) |
| keuangan | 🔴 MIGRATE | 🔴 **MASIH prisma** (`build-keuangan.ts` → `prisma.budget/satisfactionRating/sdgsScore`) |
| demografi | 🔴 MIGRATE | 🔴 **MASIH prisma** (`build-demografi.ts` → `prisma.resident.*` + raw SQL) |
| keamanan | 🔴 MIGRATE | 🔴 **MASIH prisma** (`build-keamanan.ts` → `prisma.securityReport.count`) |

→ Sisa migrasi = **keuangan, demografi, keamanan** saja. Dedup katalog (T0 plan lama:
`keuangan-kepuasan`/`keuangan-sdgs`/`pengaduan-kepuasan`) **belum** dieksekusi — masih ada di
`widget-registry.tsx` & `wall-layout-utils.ts`. Tetap dikerjakan di sini (§1 T0).

### 0.3 Gap struktural yang jadi inti request

1. **3 menu sidebar tak punya widget wall**: **Jenna, BUMDes, Sosial** (0 widget). → §3.
2. **Urutan wall ≠ urutan sidebar.** Katalog wall: beranda→keuangan→pengaduan→demografi→divisi→
   keamanan. Sidebar: beranda→divisi→pengaduan→jenna→demografi→keuangan→bumdes→sosial→keamanan.
   → §2 reorder ke urutan sidebar.
3. **Widget per-menu**: user minta "buatkan tampilan widget per-menu". Tiap menu baru dapat blok
   widget sendiri, dikelompokkan di galeri (`widget-gallery.tsx` sudah group per `WallCategory`).

---

## §Arsitektur (tak berubah dari plan lama — ringkas)

`/wall` **TIDAK** fetch per-widget. Satu endpoint `/api/noc/wall-snapshot` (`noc.ts:825`) →
`buildWallSnapshot()` (`wall-snapshot/index.ts:40`) merakit builder per-domain paralel + degrade-to-null
(`settle()`). Widget (`components/wall/widgets/*.tsx`) = renderer bodoh, baca slice via `selectData`
(`widget-registry.tsx`). **Samakan wall dgn dashboard = perbaiki builder di `src/api/wall-snapshot/`.**

Pola migrasi baku (dari `build-beranda.ts:50-66`) + transform murni diekstrak ke `src/api/transforms/`
(testable). `noc.ts` sudah **857 baris (over 500)** → **JANGAN tambah handler di sana**; proxy baru (bila
perlu) daftarkan langsung di `src/index.ts` (pola `/api/jenna/analytics` `src/index.ts:28`).

---

## §Keputusan terkunci (22 Jul — jangan tanya ulang)

1. **Cakupan** = **semua 9 menu, paritas penuh** (migrasi sisa + 3 menu baru + reorder).
2. **Mock dashboard** = **perbaiki semua** (Beasiswa, trend "+0%", fallback menyesatkan). → §4.
3. **Kedalaman widget menu baru** = **2 widget/menu** (rich tapi terkalibrasi wall — glance-first).
   Rekomendasi diterima: 1 widget/menu terlalu miskin utk data chart yang ada; 3 widget menyeret
   list teks-kecil yang tak terbaca dari jauh.
4. **divisi-kinerja** = persen (sudah dieksekusi di `18964bd`, `mapProgres`). Tak diubah.
5. **demografi-gender** = derive dari summary Desa (`lakiLaki`/`perempuan`) bila field ada saat runtime;
   absen → **hapus** widget (dashboard demografi tak tampilkan gender → non-blocking).

---

## §1 — T0: Dedup katalog (bersihkan dulu)

Buang 3 widget duplikat murni (dup dari beranda-kepuasan / beranda-sdgs).

**`components/wall/wall-layout-utils.ts`**
- Hapus dari `ALL_WIDGET_IDS`: `"keuangan-kepuasan"`, `"keuangan-sdgs"`, `"pengaduan-kepuasan"`.
  (Catatan: `"pengaduan-kepuasan"` sudah tak ada di registry pasca `737fc5f` — cek dulu; buang bila masih.)
- Hapus entri sepadan di `DEFAULT_WIDGET_SIZE`. `DEFAULT_LAYOUT` tak refer → aman.

**`components/wall/widget-registry.tsx`**
- Hapus definisi `keuangan-kepuasan` (`:122`), `keuangan-sdgs` (`:129`).
- Hapus import Body yatim: `KeuanganKepuasanBody`. **`KeuanganSdgsBody` TETAP** (dipakai `BerandaSdgsBody`).

**`components/wall/widgets/keuangan.tsx`**
- Hapus `KeuanganKepuasanBody` (dead). `KeuanganSdgsBody` & `KeuanganApbdesBody` TETAP.

**`types/wall.ts`**
- `WallKeuangan.satisfaction` & `.sdgs` (`:30-31`) → hapus (sisakan `apbdes`).

> `resolveLayout` (`wall-layout-utils.ts:144`) buang id tak-dikenal diam-diam → layout DB lama aman.

---

## §2 — Reorder katalog ikut urutan sidebar

Target urutan (`ALL_WIDGET_IDS`, `WallCategory` union, `CATEGORY_LABELS`):

```
beranda → divisi → pengaduan → jenna → demografi → keuangan → bumdes → sosial → keamanan → ops
```

**`wall-layout-utils.ts`**
- Susun ulang `ALL_WIDGET_IDS` per urutan di atas (grup Beranda→Ops). Urutan array = urutan galeri.
- `WallCategory` union: tambah `"jenna"`, `"bumdes"`, `"sosial"`; susun ulang agar terbaca.
- `DEFAULT_WIDGET_SIZE`: tambah entri widget baru (§3).

**`components/wall/widget-gallery.tsx`**
- `CATEGORY_LABELS`: tambah `jenna: "Analitik (Jenna)"`, `bumdes: "BUMDes"`, `sosial: "Sosial"`.
  Urutkan objek sesuai sidebar (galeri iterasi urutan insertion via `grouped` Map — insertion
  mengikuti urutan `available` = urutan `ALL_WIDGET_IDS`, jadi reorder §2 sudah cukup).

**`components/wall/wall-layout-utils.ts` — `DEFAULT_LAYOUT`**
- Update seed default agar wakil urut: `beranda-kpi, divisi-kinerja, pengaduan-status, jenna-kpi,
  demografi-stats, keuangan-apbdes, bumdes-kpi, sosial-kesehatan, keamanan-status, ops-panel`.
  (Wall 24/7 boot dgn 1 wakil/menu, urut sidebar.)

---

## §3 — Widget per-menu: migrasi sisa + 3 menu baru

### T1 — Keuangan (prisma → Desa live)

**`api/wall-snapshot/build-keuangan.ts`** — buang `prisma.*` + `FISCAL_YEAR`.
- `keuangan-apbdes`: reuse loader apbdes (ekstrak `fetchApbdes` dari `build-beranda.ts:87-106` ke
  **`api/wall-snapshot/loaders/apbdes.ts`** BARU; import di beranda + keuangan → satu penulis key `apbdes:all`).
- SHAPE: `mapApbdesList()[0].data` = `{category,anggaran,realisasi,percentage,color}`; `WallKeuangan.apbdes`
  + `KeuanganApbdesBody` (`widgets/keuangan.tsx`) baca `amount`. Map `anggaran→amount` (transform kecil),
  **atau** samakan `WallKeuangan.apbdes` shape ke beranda + update render (1 transform). Pilih saat implementasi.

### T2 — Demografi (prisma → Desa live)

**`api/wall-snapshot/build-demografi.ts`** — buang semua `prisma.*` + raw SQL.
- **stats**: reuse `getDemografiSummary()` (`dashboard-cache.ts:50`). Map `totalPenduduk→total`, `totalKK→heads`,
  `totalKemiskinan→poor`.
- **gender** (keputusan #5): dari summary `lakiLaki`/`perempuan`. **Probe runtime**: field absen → hapus widget.
- **age**: Desa `/api/kependudukan/distribusiumur/find-many` → `{rentangUmur,jumlah}→{range,count}`.
- **religion**: Desa `/api/kependudukan/distribusiagama/find-many` → `{agama,jumlah}→{label,count}`.
- **occupation**: Desa `/api/ekonomi/demografipekerjaan/find-many` → `{pekerjaan,jumlah}→{label,count}`,
  sort desc + take(10).
- Ekstrak transform → **`transforms/desa-demografi.ts`** BARU. Reuse cache key identik route `demografi.ts`
  (hindari poisoning) — shape sama → aman panggil `desaExternalClient` langsung bila route belum ekstrak loader.

### T3 — Keamanan (prisma → Desa live)

**`api/wall-snapshot/build-keamanan.ts`** — buang `prisma.securityReport.count`.
- Sumber dashboard: Desa `/api/keamanan/laporanpublik/find-many` (loader `keamanan.ts`, key
  `keamanan:laporan-publik:list`).
- SHAPE: status live title-case `'Baru'|'Proses'|'Selesai'`. `total=len`, `baru/diproses/selesai=count(status)`.
  Non-array→zeros. `WallKeamanan {total,baru,diproses,selesai}` TETAP → widget tak berubah.
- Ekstrak → **`transforms/desa-keamanan.ts`** BARU.
- **Opsional (paritas CCTV)**: dashboard keamanan juga tampilkan **CCTV aktif + laporan mingguan**
  (`/api/keamanan/cctv/stats`). Pertimbangkan widget `keamanan-cctv` (KPI CCTV online). → catat follow-up,
  bukan blocker (widget `keamanan-status` sudah cukup utk paritas laporan).

### T4 — Analitik/Jenna (BARU — 2 widget)

Sumber: `/api/jenna/analytics` (proxy `src/index.ts:28` → NOC). Payload: `stats{interaksiHariIni,
changeFromYesterday,jawabanOtomatis,belumDitindak,waktuRespon}`, `chartMingguan[]`, `topTopics[]`, `jamTersibuk[]`.

- **`types/wall.ts`**: `WallJenna { kpi:{...}; chartMingguan:Array<{label,value}> }` + `WallSnapshot.jenna`.
- **`api/wall-snapshot/build-jenna.ts`** BARU: `withCache("dashboard:jenna", TTL.DASHBOARD)`, fetch proxy
  (env kosong → throw → settle→null). Transform → **`transforms/noc-jenna.ts`** BARU (murni).
- **`api/wall-snapshot/index.ts`**: tambah `settle("jenna", buildJenna)` + field snapshot.
- **`components/wall/widgets/jenna.tsx`** BARU:
  - `JennaKpiBody` — 4 KPI (interaksi hari ini, jawaban otomatis %, belum ditindak, waktu respon).
    Reuse `kpi-strip.tsx` / `stat-row.tsx`.
  - `JennaChartBody` — bar interaksi mingguan (reuse `horizontal-bar.tsx` atau recharts existing).
- **`widget-registry.tsx`**: def `jenna-kpi`, `jenna-chart` (category `"jenna"`).
- **`wall-layout-utils.ts`**: id + `DEFAULT_WIDGET_SIZE` (`jenna-kpi:"wide"`, `jenna-chart:"wide"`).

### T5 — BUMDes (BARU — 2 widget)

Sumber: `/api/bumdes/kpi` + `/api/bumdes/top-produk` → Desa `ekonomi/umkm/*`.

- **`types/wall.ts`**: `WallBumdes { kpi:{umkmAktif,totalUmkm,omzetBulanan,kategoriTerbanyak}; topProduk:
  Array<{nama,terjual}> }` + `WallSnapshot.bumdes`.
- **`api/wall-snapshot/build-bumdes.ts`** BARU: 2 fetch paralel via `desaExternalClient`, `withCache`
  key reuse route bumdes bila ada (`bumdes:kpi`, `bumdes:top-produk`). Transform → **`transforms/desa-bumdes.ts`** BARU.
- **`components/wall/widgets/bumdes.tsx`** BARU: `BumdesKpiBody` (4 KPI + format Rp), `BumdesTopProdukBody`
  (bar top-3, `horizontal-bar.tsx`).
- Registry + layout-utils + `DEFAULT_WIDGET_SIZE` (`bumdes-kpi:"wide"`, `bumdes-top-produk:"wide"`).

### T6 — Sosial (BARU — 2 widget; Beasiswa dikecualikan, masih mock)

Sumber: `/api/sosial/kesehatan/stats` + `/api/sosial/pendidikan/stats` → Desa `kesehatan/*`, `pendidikan/*`.

- **`types/wall.ts`**: `WallSosial { kesehatan:{ibuHamil,balita,stunting,imunisasi}; pendidikan:{siswa,
  lembaga,pengajar} }` + `WallSnapshot.sosial`.
- **`api/wall-snapshot/build-sosial.ts`** BARU: 2 fetch paralel, `withCache`, transform →
  **`transforms/desa-sosial.ts`** BARU. **JANGAN** ikutkan Beasiswa (mock — tunggu §4 T-Beasiswa).
- **`components/wall/widgets/sosial.tsx`** BARU: `SosialKesehatanBody` (4 stat kesehatan),
  `SosialPendidikanBody` (siswa/lembaga/pengajar).
- Registry + layout-utils + `DEFAULT_WIDGET_SIZE` (`sosial-kesehatan:"lg"`, `sosial-pendidikan:"wide"`).

### T7 — (opsional) KPI-strip lintas-domain

`build-kpi.ts` masih `prisma.count()` ×6 (residents/umkm/complaints/activities/securityReports/documents).
Wall-only (tak ada padanan dashboard) → **biarkan** utk sesi ini, tapi catat: bila DB lokal tak seed →
strip nol. Follow-up: derive dari summary Desa + KPI Jenna/bumdes. **Non-blocker.**

---

## §4 — Perbaikan mock dashboard (keputusan #2: perbaiki semua)

Terpisah dari wall — integritas "semua data dari /api".

### T-Beasiswa (Sosial — mock murni)
- `components/sosial/beasiswa.tsx` render literal `45` / `"Rp 1.200.000.000"` / `"2025/2026"` (dipanggil
  tanpa prop `data` di `sosial-page.tsx`).
- **Cek endpoint Desa** utk beasiswa (pola `pendidikan/ringkasan`). Ada → proxy `/api/sosial/beasiswa/stats`
  (`api/sosial.ts`) + teruskan prop. Tak ada → **empty-state** (`—`), buang angka statis. Jangan biarkan mock.

### T-Fallback-Sosial (menyesatkan saat API down)
- `sosial-page.tsx` + `sosial/summary-cards.tsx` + `sosial/health-stats.tsx`: `defaultData` (87/342/12/8,
  92/88/86/14) tampil diam saat API null → **ganti ke `—`/`0`** agar kegagalan API terlihat.

### T-Keuangan-trend (kosmetik menyesatkan)
- `keuangan-anggaran.tsx:176` KPI Pemasukan `trend:"+0%"` literal → **hitung** delta realisasi vs periode
  sebelumnya, atau **buang** badge trend. Fallback subtitle tahun `"2025"` (`:161`) → nilai dinamis/netral.

---

## §5 — Test (WAJIB, rule #3)

**`__tests__/api/wall-live.test.ts`** BARU — unit atas transform MURNI (jangan hit API sungguhan):
- T1 `mapKeuanganApbdes`: `anggaran→amount`; `[]→[]`.
- T2 `mapDemografi*`: age `{rentangUmur,jumlah}→{range,count}`; religion; occupation sort+take10; gender dari summary.
- T3 `mapKeamanan`: title-case status count; non-array→zeros.
- T4 `mapJenna`: stats passthrough; `chartMingguan` shape.
- T5 `mapBumdes`: kpi passthrough; topProduk map + Number-coerce.
- T6 `mapSosial`: kesehatan/pendidikan field map; null→0.
- **Empty-state**: tiap builder gagal → slice `null`, snapshot tetap terkirim (bukan 500) — reuse pola `settle`.
- **Auth guard**: `/api/noc/wall-snapshot` tanpa key (bila token diset) → tolak (`isWallAuthorized`).

**`__tests__/` dashboard mock** (§4): assert Beasiswa render `—`/live saat tanpa data; fallback sosial `—`;
keuangan trend dihitung/absen.

---

## §6 — Guardrails

- Branch `fix/wall-full-parity` sebelum kode. Commit berkala per-T. **Jangan** merge/push/deploy tanpa perintah user.
- Tak ubah schema DB → tak ada migrasi. Token NOC/Desa/Jenna via env, jangan hardcode.
- `noc.ts` 857 baris (over 500) — **JANGAN tambah handler di sana**. Proxy baru → `src/index.ts` (pola Jenna).
  Transform baru → `transforms/` (kecil, murni). Builder → `wall-snapshot/`.
- Cache: satu penulis per key. Reuse key dashboard bila shape sama; key baru bila beda.
- File health: tiap `widgets/*.tsx` & `build-*.ts` jaga < limit (route/handler 150, util 200). Widget baru
  file terpisah per menu (jangan god-file).
- `gen:api` hanya bila kontrak endpoint internal berubah (T4-T6 tak tambah route publik → kemungkinan tak perlu).

---

## §7 — Verifikasi (sebelum lapor selesai)

1. `bun test` hijau (suite existing 0 fail).
2. `bun run check` (Biome) lulus.
3. `bun run dev` → `/wall`: 9 menu tampil widget LIVE, **urut sidebar**. Galeri "Tambah Widget" punya grup
   Jenna/BUMDes/Sosial; tak ada kepuasan/sdgs dobel.
4. Angka wall == angka halaman dashboard masing-masing (keuangan-apbdes, demografi, keamanan, jenna, bumdes, sosial).
5. Simulasi API down (kosongkan `NOC_API_KEY`/`VITE_JENNA_API_URL` / block Desa) → panel terkait empty-state,
   wall tak 500, tak tampil seed/mock basi.
6. `/jenna-analytic`, `/sosial`, `/keuangan-anggaran`: mock §4 hilang (Beasiswa live/empty; fallback `—`; trend nyata).

---

## §8 — Ringkasan file

| T | File | Aksi |
|---|---|---|
| T0 | `wall-layout-utils.ts` | EDIT — buang 2-3 id dedup |
| T0 | `widget-registry.tsx` | EDIT — buang def + import yatim |
| T0 | `widgets/keuangan.tsx` | EDIT — buang `KeuanganKepuasanBody` |
| T0 | `types/wall.ts` | EDIT — buang `WallKeuangan.satisfaction/sdgs` |
| §2 | `wall-layout-utils.ts` | EDIT — reorder `ALL_WIDGET_IDS` + `WallCategory` + `DEFAULT_LAYOUT` |
| §2 | `widget-gallery.tsx` | EDIT — `CATEGORY_LABELS` +jenna/bumdes/sosial |
| T1 | `wall-snapshot/build-keuangan.ts` | EDIT — prisma → Desa apbdes |
| T1 | `wall-snapshot/loaders/apbdes.ts` | BARU — ekstrak `fetchApbdes` (dedup) |
| T2 | `wall-snapshot/build-demografi.ts` | EDIT — prisma → Desa kependudukan/* + gender derive |
| T2 | `transforms/desa-demografi.ts` | BARU |
| T3 | `wall-snapshot/build-keamanan.ts` | EDIT — prisma → Desa laporanpublik |
| T3 | `transforms/desa-keamanan.ts` | BARU |
| T4 | `wall-snapshot/build-jenna.ts` + `transforms/noc-jenna.ts` + `widgets/jenna.tsx` | BARU ×3 |
| T5 | `wall-snapshot/build-bumdes.ts` + `transforms/desa-bumdes.ts` + `widgets/bumdes.tsx` | BARU ×3 |
| T6 | `wall-snapshot/build-sosial.ts` + `transforms/desa-sosial.ts` + `widgets/sosial.tsx` | BARU ×3 |
| T4-6 | `types/wall.ts`, `wall-snapshot/index.ts`, `widget-registry.tsx`, `wall-layout-utils.ts` | EDIT — daftarkan 6 widget baru |
| §4 | `components/sosial/beasiswa.tsx` + `api/sosial.ts` + `sosial-page.tsx` | EDIT — Beasiswa live/empty |
| §4 | `sosial/summary-cards.tsx`, `sosial/health-stats.tsx` | EDIT — fallback `—`/0 |
| §4 | `keuangan-anggaran.tsx` | EDIT — trend nyata + tahun dinamis |
| test | `__tests__/api/wall-live.test.ts` | BARU |

## §9 — Catatan non-blocking (dari audit, boleh diabaikan sesi ini)
- `keamanan-cctv` widget (paritas CCTV dashboard) — follow-up, bukan blocker.
- `build-kpi.ts` KPI-strip masih prisma (wall-only) — derive dari live = follow-up.
- Dead code prisma: `api/sosial.ts` `/banjars` & `/health-records`, `api/keamanan.ts` `/laporan-lokal*` —
  tak dipakai UI. Pertimbangkan hapus (di luar scope).
- Hardcode `DESA_APBDES_ID="cmk-apbdes-001"` di `keuangan-anggaran.tsx` — pindah ke config utk multi-desa.
