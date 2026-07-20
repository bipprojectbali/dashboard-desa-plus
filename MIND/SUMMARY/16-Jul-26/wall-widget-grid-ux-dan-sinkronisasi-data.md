# Wall Widget Grid — UX Polish & Sinkronisasi Data

**Tanggal:** 16 Juli 2026
**Branch:** `feature/wall-widget-grid` (belum push, belum merge)
**Halaman:** `/wall` (NOC video wall) + section "Video Wall" di `/admin/settings`

---

## Konteks Awal

Melanjutkan pekerjaan sebelumnya: `/wall` sudah diubah dari rotating-scene jadi grid widget
konfigurable dengan drag & drop. Edit inline di `/wall` (tombol "Atur" muncul untuk admin login)
+ section kedua di `/admin/settings`. Keduanya tulis ke DB singleton `wall_layout` (public read /
admin write). Sesi ini fokus ke **perbaikan UI/UX** dari hasil test lokal user + **audit sinkronisasi
data**.

---

## Perbaikan yang Sudah Selesai (commit)

### 1. `6415ca4` — Fix jam, mobile preview, tombol fullscreen
Tiga masalah dari screenshot user:
- **Jam hilang saat mode admin.** Akar: tombol "Atur" **menggantikan** `<LiveClock/>` (`actions ??
  clock`). Fix: tampilkan **Atur + jam bareng** di header. TV tetap lihat jam.
- **Admin mobile berantakan.** Preview `framed` di `/admin/settings` maksa `aspectRatio 16/9` →
  di HP 3 kolom hancur. Fix: `minWidth 680` + scroll horizontal (jadi mini-layar yang bisa digeser).
  Tombol toolbar pakai aksen **grape** biar selaras kartu admin (tak bentrok biru vs oranye).
- **Tombol "Layar penuh" tak keliatan.** Dari `opacity 0.4` teks putih → chip `variant="default"`
  bg kartu + border, `opacity 0.85`.

### 2. `ac31895` — Widget UX lebih kaya (proportion bar, KPI icon, summary row)
Widget bertipe daftar cuma angka mengambang di ruang kosong (susah dibaca dari jauh/TV).
- **Primitive baru `StatRow`** — dot status + label + **bar proporsi** + angka besar. Dipakai semua
  widget daftar (konsisten, nol duplikasi).
- **KPI strip** — tiap kartu: pita aksen kiri + ikon ber-tint + warna beda per metrik
  (Warga biru, UMKM hijau, Pengaduan oranye, Kegiatan ungu, Keamanan cyan, Dokumen abu).
- **Status Pengaduan / Laporan Keamanan / Kinerja Divisi** — bar proporsi + baris ringkasan
  (Total + Tingkat penyelesaian % / Perlu tindak lanjut / % Rampung).
- **Skor SDGs** — angka polos → bar progres 0–100 berwarna per ambang (≥80 hijau, ≥60 biru, <60 oranye).
- Token tema tambah `INFO`/`VIOLET`/`TRACK` + palet `WALL_CATEGORICAL`.

### 3. `481ba36` — Donut diperbesar + legenda
Masalah: `DonutChart` Mantine ukurannya **tetap**, abaikan `h="100%"` → cincin mungil nyangkut
di pojok, kartu kosong. Fix: komponen bersama `DonutBody` — donut 200px terpusat + total di tengah
+ legenda kanan (nama, nilai, persentase). Dipakai 4 donut: Sebaran Gender, Sebaran Agama, 2 Kepuasan.

### 4. `cf4022d` — Widget tanpa batas + grid responsif
Permintaan user: (1) buang batas 6 widget, (2) card responsif.
- **Batas dibuang:** `resolveLayout` tak cap lagi (fallback ke DEFAULT_LAYOUT cuma kalau kosong);
  `validateLayout` batas atas naik ke `WALL_MAX_SLOTS` (= jumlah katalog, 16); duplikat tetap ditolak.
  Rename `WALL_SLOTS/COLS/ROWS` → `WALL_DEFAULT_COUNT` (6, seed awal) + `WALL_MAX_SLOTS`.
- **Grid responsif:** dari fixed 3×2 → `auto-fill minmax(460px, 1fr)` (kolom ikut lebar layar) +
  `gridAutoRows minmax(300px, 1fr)`. Sedikit widget → melar; banyak → grid tumbuh & area scroll.
  Tombol "＋ Tambah" muncul sampai semua katalog terpasang.
- Test wall-layout ditulis ulang untuk semantik no-cap.

### 5. `0cdc547` — Label bar chart horizontal tak tumpah
Label kategori panjang (`KETERANGAN_TIDAK_MAMPU`, `Gambar`/`Dokumen`, `Guru`/`Wiraswasta`) nabrak
area bar. Fix: komponen bersama `HorizontalBar` — lebar sumbu-Y tetap (120px) + truncate ellipsis
(>16 char). Dipakai 3 widget: Surat Layanan per Tipe, Dokumen per Jenis, Pekerjaan Teratas.

**Status verifikasi semua commit:** test pass (72), build hijau (~2404 modul), typecheck wall clean,
biome clean.

---

## Audit Sinkronisasi Data (IN PROGRESS — belum di-commit)

User lapor "ada yang ga sinkron". Ditelusuri via 2 agent paralel bandingin builder wall
(`src/api/wall-snapshot/build-*.ts`) vs endpoint kanonik halaman utama.

**Kesimpulan: semua data dari DB via Prisma (BUKAN mock).** Tapi ada **beda sumber** yang bikin
tak sinkron dengan halaman:

| Metrik | Wall ambil dari | Halaman utama ambil dari | Akibat |
|---|---|---|---|
| **Kepuasan Layanan** (2 donut) | tabel lokal `satisfactionRating` | **NOC eksternal** `/api/dashboard/satisfaction-responden` (primary), lokal fallback | Beda saat NOC ada data |
| **Demografi** (Warga, Gender/Agama, Ringkasan, Umur, Pekerjaan) | tabel lokal `resident` | **NOC eksternal** `/api/demografi/*` | Wall tampil 2 warga, halaman bisa ribuan |
| **Laporan Keamanan** | query lokal **live (tanpa cache)** | query lokal **ber-cache** `withCache("keamanan:stats")` | Beda sesaat sampai TTL |

**Sudah MATCH (aman):** APBDes, SDGs, Status Pengaduan, Tren 7 Bulan, Surat Layanan per Tipe,
Kinerja Divisi (activity counts), KPI count.

**Catatan bug bersama (bukan khusus wall):** bar "Dokumen per Jenis" hardcode cuma tipe
`"Gambar"`/`"Dokumen"` — dokumen `"PDF"` dll tak kehitung. Halaman divisi (`division.ts`) juga sama.

**Penting:** wall SENGAJA pakai DB lokal (komentar `build-keuangan.ts`: "hindari call eksternal
lambat/gagal yang bisa blokir wall").

### Keputusan User (via AskUserQuestion)
1. **Kepuasan & Demografi → samakan ke NOC eksternal.** Wall panggil sumber yang sama dg halaman.
2. **Cache-kan Laporan Keamanan wall** (bungkus `withCache` yang sama).
3. Tipe dokumen — **jangan dulu** (tidak dipilih user).

### Rencana Implementasi (sedang dikerjakan saat interupsi)
Prinsip: **reuse cache key yang sama** dg endpoint kanonik supaya angka byte-identik + tak dobel
fetch ke NOC.

- **`external-satisfaction.ts` (SUDAH DIBUAT):** `buildSatisfaction()` — responden NOC (cache key
  `dashboard:satisfaction:responden`, sama dg dashboard.ts) → fallback lokal `satisfactionRating`
  dg alias kategori seed lama. Mirror `fetchSatisfaction` di `satisfaction-chart.tsx`.
- **Demografi eksternal (BELUM):** helper reuse cache key `demografi:summary`/`religion`/`age`/
  `occupation` (sama dg `demografi.ts`). Map shape eksternal → tipe wall.
  - Summary: `summary.totalPenduduk/totalKK/totalKemiskinan`.
  - Religion: `agama`/`jumlah`. Age: `rentangUmur`/`jumlah`. Occupation: `pekerjaan`/`jumlah`
    (atau `lakiLaki`+`perempuan`).
  - **Gender: TIDAK ada sumber eksternal** (halaman demografi tak tampilkan gender) → **tetap lokal**.
- **Keamanan (BELUM):** bungkus query `build-keamanan.ts` dg `withCache("keamanan:stats", TTL.KEAMANAN)`
  — persis key & TTL `keamanan.ts` → share cache, angka sama.

**Yang perlu dicek saat lanjut:** field name persis dari response NOC eksternal (summary/religion/
age/occupation) — mapping di `demografi-pekerjaan.tsx:163-244` jadi acuan fallback field.

---

## Aturan Kerja yang Berlaku (dari CLAUDE.md global)
- Branch fitur baru wajib (sudah di `feature/wall-widget-grid`).
- Test wajib, hijau sebelum lapor selesai.
- **JANGAN push/deploy** kecuali user perintah eksplisit di pesan yang sama.
- Pre-Push Guarantee Report sebelum tiap push.
- JANGAN Playwright kecuali user minta "buka browser".
- Commit: `<type>(<scope>): <desc>` English imperative, akhiri `Co-Authored-By: Claude`.

## Status Akhir Sesi
- **5 commit UI/UX tertahan** (belum push): `6415ca4`, `ac31895`, `481ba36`, `cf4022d`, `0cdc547`.
- **Sinkronisasi data: baru mulai** — `external-satisfaction.ts` dibuat, demografi & keamanan belum,
  belum di-commit, belum test.
