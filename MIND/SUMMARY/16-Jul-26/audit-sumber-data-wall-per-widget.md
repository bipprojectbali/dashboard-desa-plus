# Audit Sumber Data Wall — Per Widget (External `/api` vs Prisma Lokal)

**Tanggal:** 16 Juli 2026
**Branch:** `feature/wall-widget-grid` (belum push, belum merge)
**Halaman:** `/wall` (NOC video wall)
**Sifat sesi:** DISKUSI + AUDIT (belum ada perubahan kode di sesi ini)

---

## Pertanyaan Pemicu (dari User)

Dua pertanyaan berurutan yang mengarahkan seluruh audit:

1. *"Dugaanku data pada `/wall` itu buat sendiri datanya, ga ambil dari `/api` lain.
   Aku mau semua widget datanya berdasarkan tampilan `src/api`/`src/components`, bukan
   buat baru. Salah dugaanku atau gimana?"*
2. Prinsip yang user tegaskan: *"Tujuan dashboard NOC ini menampilkan data dari banyak
   project. Jadi sudah pasti ambil datanya langsung dari `/api` project lain yang ingin
   ditampilkan — ga perlu ambil dari Prisma."*
3. *"Ada data yang ga ambil dari project/website lain — petakan mana yang sudah ambil
   langsung dari `/api` dan mana yang belum."*

---

## Jawaban Ringkas atas Dugaan User

- **BENAR:** wall punya lapisan query sendiri (`src/api/wall-snapshot/build-*.ts`) yang
  menembak Prisma langsung, **tidak** memanggil `/api` project lain. Logika endpoint
  kanonik diduplikasi di builder wall.
- **KELIRU:** datanya **bukan mock/karangan** — semua real dari DB via Prisma. Masalahnya
  bukan "data palsu", tapi **beda sumber** dari halaman kanonik.
- **Koreksi penting atas prinsip user:** tidak SEMUA data punya "project lain" sebagai
  sumber. Sebagian **dimiliki dashboard ini sendiri** (owned-here) → untuk itu, baca Prisma
  lokal justru BENAR, bukan pelanggaran prinsip.

---

## Metodologi Audit

- Workflow paralel 6 agent (satu per domain: KPI, Keuangan, Pengaduan, Demografi, Divisi,
  Keamanan). Tiap agent memetakan: sumber kanonik (external project API vs Prisma lokal),
  data ownership, endpoint persis, cache key, cara frontend fetch, sumber builder wall, dan
  verdict sinkron.
- **4 klaim paling menentukan diverifikasi ulang lewat grep langsung** (bukan sekadar
  laporan agent), karena hasil audit MENGOREKSI summary sesi lalu:

| # | Klaim | Hasil grep |
|---|---|---|
| 1 | APBDes halaman pakai eksternal, bukan `/api/dashboard/budget` | ✅ `chart-apbdes.tsx:30` → `apiClient.GET("/api/noc/apbdes-data")` |
| 2 | Pengaduan halaman pakai Jenna NOC eksternal | ✅ `pengaduan-layanan-publik.tsx:73` → `fetch("/api/noc/pengaduan")` |
| 3 | Tabel `complaint`/`serviceLetter` seed-only (0 write runtime) | ✅ grep `.create/.update/.upsert` (exclude seed) → KOSONG |
| 4 | Kinerja Divisi halaman pakai NOC eksternal; sync nulis ke `documentStat` bukan `document` | ✅ `kinerja-divisi.tsx:37` → `/api/noc/latest-projects`; `sync-noc.ts:288` → `documentStat.upsert` |

---

## PETA LENGKAP: Sudah Ambil dari `/api` Eksternal vs BELUM

> Kolom "Halaman kanonik" = sumber yang user LIHAT di halaman aslinya.
> Kolom "Wall sekarang" = yang dibaca `build-*.ts`.

| Widget wall | Halaman kanonik ambil dari | Wall sekarang | Status |
|---|---|---|---|
| **Demografi** — agama, umur, pekerjaan | 🌐 Desa API `/api/kependudukan/*`, `/api/ekonomi/*` | 🗄️ Prisma `resident` | ❌ BELUM |
| **Demografi** — total/KK/miskin | 🌐 Desa API `/api/kependudukan/dashboard/summary` | 🗄️ Prisma `resident` count | ❌ BELUM |
| **Demografi** — gender | ⚠️ tak ada sumber eksternal (halaman pun tak punya widget gender) | 🗄️ Prisma `resident` | 🟡 tetap lokal (terpaksa) |
| **Kepuasan Layanan** (2 donut) | 🌐 Desa/NOC `/api/landingpage/responden` | 🗄️ Prisma `satisfactionRating` | ❌ BELUM (`external-satisfaction.ts` dibuat tapi **belum di-wire**) |
| **APBDes** | 🌐 Desa API via `/api/noc/apbdes-data` | 🗄️ Prisma `budget` (fiscalYear 2025) | ❌ BELUM — *komentar kode salah klaim "sama dg dashboard"* |
| **Pengaduan** — stats, tren, surat | 🌐 Jenna NOC `/api/noc/pengaduan` | 🗄️ Prisma `complaint`/`serviceLetter` (**seed-only, 0 write runtime**) | ❌ BELUM — angka = data seed statis |
| **Kinerja Divisi** — status kegiatan | 🌐 NOC `/api/noc/latest-projects` | 🗄️ Prisma `activity` | ❌ BELUM — lokal cuma map SELESAI/BERJALAN, tertunda/dibatalkan selalu 0 |
| **Kinerja Divisi** — dokumen per jenis | 🌐 NOC `/api/noc/diagram-jumlah-document` (dynamic groupBy) | 🗄️ Prisma `document` (**seed-only** + hardcode 2 tipe) | ❌ BELUM — sync NOC nulis `documentStat`, wall baca `document` (seed) |
| **KPI strip** (6 angka) | campur: residents/umkm/complaints/activities/documents → eksternal; securityReports → lokal | 🗄️ semua Prisma count lokal | ❌ BELUM (5 dari 6) |
| **Keamanan** — status laporan | 🗄️ Prisma lokal (`securityReport` — dibuat di sini via POST) | 🗄️ Prisma lokal (live, no cache) | ✅ SUDAH BENAR (cuma beda cache timing) |
| **SDGs** | 🗄️ Prisma lokal (`sdgsScore` — owned here, tak ada eksternal) | 🗄️ Prisma lokal | ✅ SUDAH BENAR |

---

## Kesimpulan atas Kekhawatiran User

Kekhawatiran **valid dan lebih parah dari dugaan awal**. **9 dari 11** widget masih baca
Prisma lokal padahal halaman kanoniknya tarik dari project lain. Yang paling kritis:

- **Pengaduan & Dokumen** baca tabel **seed-only** (0 write runtime, 0 sync) → angkanya
  **data demo statis**, bukan sekadar "beda sumber". Ini penyebab paling timpang.
- **APBDes** — komentar `build-keuangan.ts` **salah klaim** "query sama dengan dashboard".
  Halaman asli tarik Desa API eksternal (`/api/noc/apbdes-data`).
- **Kinerja Divisi** — tiga-cara divergen: wall baca `document` (seed, 2 tipe hardcode),
  `division.ts` replikasi bug 2-tipe tapi dead code, halaman live baca NOC-external→
  `documentStat`→`document.groupBy` (dynamic). Status kegiatan lokal juga cacat: `sync-noc.ts`
  cuma map ke SELESAI/BERJALAN → TERTUNDA/DIBATALKAN selalu 0.

---

## Yang MEMANG Benar Tetap Lokal (bukan pelanggaran prinsip)

Data **dimiliki dashboard ini sendiri**, tak ada project lain sebagai sumber:

- **Keamanan laporan lokal** — dibuat di sini via `POST /api/keamanan/laporan-lokal`
  (reportNumber `RPT-<timestamp>`). DB ini *adalah* sumbernya. Tak ada mirror/sync eksternal.
- **SDGs** — tak ada API eksternal; data di-seed di dashboard ini.
- **Gender demografi** — TERPAKSA lokal: Desa API terbukti tak menyediakan breakdown gender
  (5 route diprobe live: `distribusijeniskelamin`/`distribusigender`/`jeniskelamin`/
  `distribusikelamin`/`gender` → semua 404). Satu-satunya sinyal gender eksternal =
  `lakiLaki`/`perempuan` per-pekerjaan di `/api/ekonomi/demografipekerjaan` (occupation-scoped,
  bukan seluruh populasi → akan undercount kalau dipaksa jadi donut gender).

---

## Catatan Mapping Field (untuk implementasi nanti)

**Demografi (external Desa → `WallDemografi` di `src/types/wall.ts`):**
- `stats.total` ← `summary.data.summary.totalPenduduk`
- `stats.heads` ← `summary.data.summary.totalKK` (beda definisi: lokal = count `isHeadOfHousehold`)
- `stats.poor` ← `summary.data.summary.totalKemiskinan`
- `religion[]` ← `distribusiagama.data[]` map `{agama→label, jumlah→count}`
- `ageGroups[]` ← `distribusiumur.data[]` map `{rentangUmur→range, jumlah→count}`
  — **bucket mismatch:** eksternal pre-binned (5–6 bucket), wall SQL 7 bucket fixed → tak 1:1
- `occupationTop[]` ← `demografipekerjaan.data[]` map `{pekerjaan→label, (lakiLaki+perempuan)→count}`
  — eksternal tak punya agregat `jumlah`; caller harus sum L+P lalu sort desc + slice(0,10)

**Pengaduan (external Jenna `/api/noc/pengaduan` → `WallPengaduan`):**
- Response shape: `{stats:{total,baru,diproses,selesai}, trends[], surat_terbanyak[], pengajuan_terbaru[], musrenbang[]}`
- **Field mismatch:** eksternal `diproses`/`bulan`/`jenis` vs wall `proses`/`month`/`letterType`
- **PII:** `musrenbang[].nama_pengusul` = PII → WAJIB di-drop kalau daftar itu ikut ditampilkan di wall publik

**Kepuasan:** `external-satisfaction.ts` sudah implement `buildSatisfaction()` (external NOC
responden + fallback lokal + reuse cache key `dashboard:satisfaction:responden`) — tinggal
di-wire ke `build-keuangan.ts` / `build-pengaduan.ts`.

**Cache key kanonik yang bisa di-reuse:** `demografi:summary`, `demografi:religion`,
`demografi:age`, `demografi:occupation`, `dashboard:satisfaction:responden`,
`apbdes:cmk-apbdes-001`, `keamanan:stats`, `bumdes:kpi:${period}`.

---

## Prinsip Desain yang Harus Dijaga saat Migrasi

Builder wall terpisah itu **fitur, bukan bug** — jangan dibongkar total. Yang dijaga:

1. **Degradasi anggun:** `index.ts` bungkus tiap builder dengan `settle()` → 1 query gagal
   jadi `null`, panel lain tetap render. Wall = layar TV, harus tahan banting.
2. **Bebas PII:** wall publik. Query agregat/count saja. Endpoint kanonik kadang balikin
   field PII (`nama_pengusul`, `reportedBy`) yang TAK BOLEH muncul di TV.
3. **Reuse cache key kanonik** supaya angka byte-identik + tak dobel-fetch ke NOC/Desa.
4. **Fallback lokal** kalau sumber eksternal mati (pola `external-satisfaction.ts`).

→ Arah yang disepakati implisit: **Opsi A** — builder wall tetap ada, tapi baca dari sumber
+ cache key yang SAMA dengan endpoint kanonik. BUKAN Opsi B (fetch HTTP self-call + hapus
builder), karena Opsi B kehilangan degradasi anggun & berisiko bocor PII.

---

## Status & Langkah Berikutnya (BELUM dikerjakan)

- Sesi ini murni **diskusi + audit** — nol perubahan kode.
- `external-satisfaction.ts` masih untracked (`??`), **belum di-wire** ke mana pun.
- **Keputusan yang belum diambil:** lanjut susun rencana implementasi migrasi per-widget,
  atau bahas dulu lebih jauh. User terakhir diminta memilih; belum dijawab.
- Kandidat urutan kerja (kalau lanjut): (1) wire kepuasan yang sudah jadi → (2) demografi
  eksternal → (3) pengaduan Jenna → (4) divisi NOC + fix dokumen dynamic → (5) APBDes → (6)
  KPI strip → keamanan/SDGs biarkan lokal.

---

## Aturan Kerja yang Berlaku (dari CLAUDE.md global)
- Sudah di branch `feature/wall-widget-grid` (fitur baru wajib branch).
- Test wajib hijau sebelum lapor selesai.
- **JANGAN push/deploy** kecuali user perintah eksplisit di pesan yang sama.
- Pre-Push Guarantee Report sebelum tiap push.
- JANGAN Playwright kecuali user minta "buka browser".
- Commit: `<type>(<scope>): <desc>` English imperative, akhiri `Co-Authored-By: Claude`.
