# QC Task IN_PROGRESS — PM Dashboard (Dashboard Desa Plus NOC)

> Diambil dari PM Dashboard (`pm-dashboard.wibudev.com`, project **"Dashboard desa plus NOC"**) via `.env.pm`, tanggal **24 Sep 2026**. Semua 12 task berstatus `IN_PROGRESS` dan bertema perbaikan tampilan **Safari** (data label, layout/padding, bug render). Reporter semua task: Inno Insani.

Setiap task di-QC dengan membaca kode komponen React aktual yang relevan (bukan widget "wall"/TV kiosk — task-task ini menyasar halaman utama dashboard di `src/routes/*` + `src/components/*`, karena judul mereferensikan menu seperti "Bumdes & UMKM Desa", "Keuangan & Anggaran", dll., dan widget wall-nya sudah punya data label lengkap sejak awal).

Legenda verdict:
- ✅ **VALID** — masalah dikonfirmasi ada di kode saat ini, permintaan masuk akal.
- ⚠️ **PARSIAL** — sebagian benar, sebagian perlu klarifikasi/scope ulang.
- ❓ **PERLU VERIFIKASI VISUAL** — tidak bisa dipastikan murni dari kode (butuh cek langsung di Safari).

---

## 1. Safari (Bumdes & UMKM Desa) — Detail Penjualan Produk
**ID:** `6be6109c-1c84-44d0-bfce-2dec47168abc` · **Kind:** TASK · **Priority:** MEDIUM

**Deskripsi asli:** Kolom "Aksi" (link "Detail") disarankan dihapus karena tidak diperlukan — tabel dashboard berfokus sebagai monitoring layout (ringkasan data).

**QC:**
- Kolom "Aksi" dengan tombol "Detail" memang ada — `src/components/umkm/sales-table.tsx:164-168` (header) & `:222-232` (button `onClick={() => onDetailClick?.(product)}`).
- Tombol ini men-trigger `SalesDetailModal` (`src/components/umkm/sales-detail-modal.tsx`) via `bumdes-page.tsx:194-197`.
- **Verdict: ✅ VALID.** Kolom & modal-nya benar ada dan sesuai deskripsi. Tapi ini keputusan produk (hapus fitur drill-down), bukan bug — perlu konfirmasi apakah modal detail memang dianggap tidak berguna, karena modal ini cukup kaya (ring progress stok, comparison bar, dll.) dan mungkin sayang dibuang total.

---

## 2. Safari (Keuangan & Anggaran) — Alokasi Anggaran Per Bidang (jt)
**ID:** `8da522e0-1531-4b37-8745-3f674c0eac8e` · **Kind:** BUG · **Priority:** MEDIUM

**Deskripsi asli:** Label kategori di kiri grafik terpotong sehingga nama bidang tidak terbaca utuh; perlu data label (angka/persentase) pada grafik & progress bar.

**QC:**
- Chart: `src/components/keuangan/allocation-chart.tsx` — horizontal `BarChart` dari Recharts.
- Sudah ADA truncation manual: `sector.length > 20 ? substring(0,17)+"..." : sector` (baris 46), dan `YAxis width={120}` dengan `fontSize: 11` (baris 99-106).
- **Tidak ada `<LabelList>`** atau anotasi angka pada bar — jadi klaim "tidak ada data label" **valid**.
- Klaim "label terpotong" **masuk akal secara teknis**: truncation 17 karakter untuk sektor APBDes yang namanya panjang ("Bidang Penyelenggaraan Pemerintahan Desa" dst.) kemungkinan masih terlalu panjang untuk lebar 120px @ fontSize 11, dan Safari's SVG rendering menangani overflow teks pada elemen `<text>` secara berbeda dari Chrome (Safari cenderung clip, Chrome membiarkan overflow terlihat) — pola ini SUDAH pernah ditemukan & diperbaiki di widget wall (`src/components/wall/horizontal-bar.tsx` — komentar baris 101-107 di `keuangan.tsx` menyebutkan eksplisit alasan yang sama: "tanpa itu, nama sektor panjang... melipat jadi beberapa baris dan tumpang tindih").
- **Verdict: ✅ VALID.** Root cause & solusi referensi sudah ada di codebase (widget `HorizontalBar` di wall), tinggal diterapkan ke halaman utama.

---

## 3. Safari - Demografi & Kependudukan (Pengelompokan Umur, Demografi Pekerjaan, Sektor Unggulan)
**ID:** `4a08aeb6-3106-4721-9067-bf76014ce5e8` · **Kind:** TASK · **Priority:** MEDIUM

**Deskripsi asli:** Tambahkan data label (angka/persentase) pada 3 chart tsb.

**QC** (`src/components/demografi-pekerjaan.tsx`):
- **Pengelompokan Umur** (baris 582-624): `BarChart` vertikal, tidak ada `<LabelList>`.
- **Demografi Pekerjaan** (baris 664-709): `BarChart` horizontal, tidak ada `<LabelList>`.
- **Sektor Unggulan** (baris 1079-1128): `BarChart` horizontal, tidak ada `<LabelList>`.
- **Verdict: ✅ VALID.** Ketiga chart memang tidak punya data label sama sekali, hanya mengandalkan `<Tooltip>` on-hover.

---

## 4. QC Safari (Demografi & Kependudukan) — Demografi Pekerjaan
**ID:** `6fa9e32d-217e-44bb-948e-aa94c33f67a1` · **Kind:** BUG · **Priority:** MEDIUM

**Deskripsi asli:** Label kategori "Pedagang/UMKM" terpotong jadi "edagang/UMKM" di sisi kiri. Perlu margin-left/padding.

**QC:** `src/components/demografi-pekerjaan.tsx:682-692` — `YAxis` untuk chart "Demografi Pekerjaan" pakai `width={90}`, **tanpa** truncation/ellipsis handling seperti yang dipakai di `allocation-chart.tsx` maupun `wall/horizontal-bar.tsx`. Nama pekerjaan panjang ("Pedagang/UMKM" = 13 karakter) pada lebar 90px + fontSize 12 sangat mungkin overflow ke kiri viewBox SVG, dan terpotong pada `overflow: hidden` bawaan `<svg>` — perilaku clipping ini dikenal berbeda antar-browser (Safari lebih ketat clip dibanding Chrome).
- **Verdict: ✅ VALID — bug paling konkret dari semua 12 task.** Root cause jelas & reproducible dari kode: lebar `YAxis` terlalu sempit + tidak ada text-anchor/truncate handling, tidak spesifik ke data tapi ke lebar container. Ini valid untuk SEMUA browser sebenarnya, bukan cuma Safari (mungkin di Chrome kelihatan "untung" karena overflow tidak diclip).

---

## 5. Safari (Jenna Analytic) — Interaksi Chatbot
**ID:** `172a10a2-83ee-405f-b7a3-5eb1ca675f79` · **Kind:** TASK · **Priority:** MEDIUM

**Deskripsi asli:** Tambahkan data label pada grafik & progress bar.

**QC** (`src/components/jenna-analytic.tsx`):
- Chart "Interaksi Chatbot" (baris 237-274): `BarChart`, tidak ada `<LabelList>`.
- "Jam Tersibuk" pakai `<Progress>` Mantine (baris 350-356) — sudah menampilkan `{item.percentage}%` sebagai teks terpisah di baris 346 (bukan di dalam progress bar, tapi di atasnya) — jadi utk progress bar sebenarnya **sudah ada** angka, hanya bar chart-nya yang belum.
- **Verdict: ✅ VALID** (untuk bar chart interaksi). Progress bar jam tersibuk sebagian sudah sesuai request — mungkin task ini overlap sebagian dengan yang sudah selesai.

---

## 6. Safari (Pengaduan & Layanan Publik) — Surat Terbanyak & Pengajuan Terbaru
**ID:** `cab96e9c-9ab1-40e4-bcb3-33a565eacb62` · **Kind:** TASK · **Priority:** MEDIUM

**Deskripsi asli:** Optimalkan padding/tinggi di "Surat Terbanyak" & "Pengajuan Terbaru" agar ruang kosong hilang; tambahkan value angka pada "Surat Terbanyak".

**QC** (`src/components/pengaduan-layanan-publik.tsx`):
- "Surat Terbanyak" (baris 342-410): `BarChart` horizontal, height tetap 250, tidak ada `<LabelList>` untuk angka jumlah surat.
- "Pengajuan Terbaru" (baris 413-480): List `<Card>` per item — tinggi mengikuti jumlah data (`.slice(0,5)`), tidak ada scroll/skeleton height mismatch yang eksplisit terlihat bermasalah dari kode, tapi jika data < 5 item, `Card` parent (height 100%, tidak fixed) bisa menyisakan whitespace di bawah karena grid col sejajar dengan chart 300px+card lain yang tingginya beda.
- **Verdict: ✅ VALID untuk data label** (BarChart tanpa LabelList, dikonfirmasi). **⚠️ PARSIAL untuk padding/whitespace** — perlu screenshot pembanding untuk memastikan seberapa besar gap-nya, tapi secara struktural grid 3-kolom (`Grid.Col span 4`) dengan `h="100%"` pada card memang rawan whitespace tidak merata kalau child content pendek.

---

## 7. Pengaduan & Layanan Publik [Safari] — Tren Pengaduan & Surat Terbanyak
**ID:** `31a051e3-335e-46ba-a5ba-bb6eb8d79f9b` · **Kind:** TASK · **Priority:** MEDIUM

**Deskripsi asli:** Tambahkan data label pada 'Tren Pengaduan' (di atas titik koordinat, line chart) dan 'Surat Terbanyak' (di ujung kanan bar).

**QC:** Sama file dengan task #6.
- "Tren Pengaduan" (baris 264-337): `LineChart`, tidak ada `<LabelList>` di atas titik/dot.
- "Surat Terbanyak": sama seperti di atas, tidak ada label angka di ujung bar.
- **Verdict: ✅ VALID.** Ini **duplikat sebagian** dengan task #6 (sama-sama minta data label untuk "Surat Terbanyak") — perlu digabung / salah satu ditutup supaya tidak double-kerja.

---

## 8. Kinerja Divisi [Safari] — Divisi Teraktif & Jumlah Dokumen
**ID:** `cf91df5c-e984-450d-94e3-5b678258cccb` · **Kind:** TASK · **Priority:** MEDIUM

**Deskripsi asli:** Optimalkan padding/tinggi di "Divisi Teraktif" & "Jumlah Dokumen" agar whitespace kosong di bawah hilang.

**QC:**
- `DivisionList` (`src/components/kinerja-divisi/division-list.tsx`) — list max 5 item (`limit: "5"` di query, baris 15), `Card h="100%"` dengan `Stack gap="xs"`. Kalau data < 5 (atau card sejajar `DocumentChart`/`ProgressChart` yang tingginya beda), akan ada ruang kosong di bawah list karena `Stack` tidak `justify="center"`/`space-between`.
- `DocumentChart` (`document-chart.tsx`) — `ResponsiveContainer height={200}` fixed, dalam `Card h="100%"` yang disejajarkan dengan `DivisionList` & `ProgressChart` di grid 3 kolom (`kinerja-divisi.tsx:139-154`, span 3/5/4). Chart height 200 fixed sementara card tingginya mengikuti kolom tertinggi → berpotensi whitespace di bawah chart.
- **Verdict: ✅ VALID.** Struktur grid 3-kolom dengan card height berbeda-beda (list vs chart fixed-height) memang rawan menyisakan whitespace — konsisten dengan laporan.

---

## 9. Kinerja Divisi [Safari]
**ID:** `e1db08f3-6e67-42d6-8e4c-1df97e13b225` · **Kind:** TASK · **Priority:** MEDIUM

**Deskripsi asli:** Tambahkan data label (angka/persentase) pada grafik & progress bar.

**QC** (`src/components/kinerja-divisi/*`):
- `ProgressChart` (donut, baris 61-87): tidak ada label persentase di dalam segmen pie, tapi **sudah** ada legend dengan angka `{item.value.toFixed(2)}%` di `Stack` bawahnya (baris 88-106) — jadi ini **sebagian sudah terpenuhi**.
- `DocumentChart` (bar chart, baris 63-97): tidak ada `<LabelList>` untuk jumlah dokumen.
- `ActivityCard` — perlu dicek terpisah (belum dibaca detail), kemungkinan progress bar aktivitas sudah punya angka via `Progress` value props tapi tanpa teks % — sama pola dengan Jenna.
- **Verdict: ✅ VALID untuk DocumentChart** (bar tanpa label). **⚠️ PARSIAL untuk donut** — legend sudah menampilkan %, request "pada grafik" mungkin minta label langsung di slice pie, bukan cuma legend.

---

## 10. Beranda [Safari] — Statistik Pengajuan Surat & Tingkat Kepuasan Layanan
**ID:** `27b8db60-a48b-4538-8ed8-7e5d0cfe54c0` · **Kind:** TASK · **Priority:** MEDIUM

**Deskripsi asli:** Tambahkan data label (angka/persentase) pada grafik & progress bar.

**QC** (`src/components/dashboard/chart-surat.tsx` & `satisfaction-chart.tsx`):
- `ChartSurat` — `BarChart` (baris 104-135), tidak ada `<LabelList>`.
- `SatisfactionChart` — `PieChart` donut (baris 98-129), tidak ada label di slice, tapi punya legend dengan warna+nama saja (baris 131-145), **tanpa angka/persentase** di legend sekalipun (beda dengan `ProgressChart` di kinerja-divisi yang setidaknya sudah taruh angka di legend).
- **Verdict: ✅ VALID**, dan untuk `SatisfactionChart` masalahnya lebih parah dari #9 (legend bahkan tidak punya angka sama sekali, murni warna+nama) — prioritas pantas dinaikkan.

---

## 11. Safari Beranda - APBDes
**ID:** `bd031a9a-712e-4380-8703-6fc0e6e0789d` · **Kind:** TASK · **Priority:** MEDIUM

**Deskripsi asli:** Sederhanakan tampilan "realisasi rendah, perlu perhatian khusus" — tambah icon alert, hilangkan background hijau, ganti warna yang kurang sesuai.

**QC:**
- String "Realisasi rendah, perlu perhatian khusus" dikonfirmasi ada di `src/locales/id.ts:606` (key `statusRendah`) dan dipakai di `src/components/dashboard/chart-apbdes.tsx:56-69` (`getStatusMessage`).
- Fungsi `getStatusMessage` mengembalikan `{ text, color: "red" }` untuk kondisi realisasi < 60%. Warna badge/background di `ApbdesSummary` (baris 152-167) pakai `backgroundColor: dark ? "rgba(72, 187, 120, 0.1)" : mantine-color-${statusMessage.color}-0` — **ini bug nyata**: untuk kondisi `dark` mode, background HARDCODE `rgba(72, 187, 120, 0.1)` yang merupakan warna **hijau**, padahal `statusMessage.color` sudah benar "red" untuk kasus realisasi rendah. Jadi klaim "background hijau padahal harusnya alert/warning" **valid dan match persis** dengan bug di kode: baris 157-159 selalu pakai hijau di dark mode, mengabaikan `statusMessage.color`.
- Tidak ada icon alert (`IconArrowDownRight` dipakai tapi bukan alert icon khusus, hanya panah).
- **Verdict: ✅ VALID — bug konkret ditemukan** (hardcoded green background di dark mode untuk status apa pun, termasuk status rendah/merah).

---

## 12. Safari Beranda - SDG's Desa
**ID:** `f0657bb5-23ed-40dc-aa8f-a19e1151d133` · **Kind:** BUG · **Priority:** MEDIUM

**Deskripsi asli:** Gambar SDG's Desa tidak muncul di Safari browser.

**QC:**
- Gambar SDGs di-fetch dari Desa API eksternal (`src/api/dashboard.ts:42-96`, endpoint `/api/dashboard/sdgs`) yang meng-construct URL absolut `${baseUrl}${item.image.link}` mengarah ke `https://desa-darmasaba-stg.wibudev.com/api/img/*.webp` (domain **berbeda** dari frontend `dashboard-desa-plus-stg.wibudev.com`).
- Dicoba `curl` langsung ke image URL: **200 OK**, `content-type: image/webp`, tapi **tidak ada header `Access-Control-Allow-Origin`** sama sekali pada response gambar (hanya ada CORS headers untuk API JSON, bukan untuk static image endpoint `/api/img/*`).
- Frontend render pakai Mantine `<Image>` di dalam `<AspectRatio>` (`src/components/dashboard-content.tsx:159-166`) — plain `<img>` tag cross-origin biasanya tidak butuh CORS utk *render* (CORS hanya relevan untuk `fetch`/`canvas`), JADI ini kemungkinan **bukan murni CORS**.
- Kandidat penyebab paling mungkin: Safari's Intelligent Tracking Prevention (ITP) memblokir load resource cross-site tertentu, ATAU format WebP dari CDN yang di-generate dengan encoder yang tidak didukung penuh oleh versi Safari tertentu (WebP di Safari kadang punya masalah dengan lossless/animated variant, meski basic lossy webp sudah didukung sejak Safari 14).
- **Verdict: ❓ PERLU VERIFIKASI VISUAL LANGSUNG DI SAFARI.** Tidak bisa dipastikan 100% dari kode/curl saja — deskripsi bug (gambar tidak muncul) plausible tapi root cause perlu direproduksi di Safari asli (cek Network tab: apakah request gagal, di-block, atau format tidak didukung).

---

## Ringkasan QC

| # | Task | Kind | Verdict |
|---|------|------|---------|
| 1 | Bumdes — Hapus kolom Aksi/Detail | TASK | ✅ Valid (keputusan produk) |
| 2 | Keuangan — Alokasi Anggaran label terpotong + data label | BUG | ✅ Valid |
| 3 | Demografi — data label 3 chart | TASK | ✅ Valid |
| 4 | Demografi Pekerjaan — label "Pedagang/UMKM" terpotong | BUG | ✅ Valid (paling konkret) |
| 5 | Jenna — data label interaksi chatbot | TASK | ✅ Valid |
| 6 | Pengaduan — padding + data label Surat Terbanyak | TASK | ✅ Valid + ⚠️ Padding perlu screenshot |
| 7 | Pengaduan — data label Tren Pengaduan & Surat Terbanyak | TASK | ✅ Valid (duplikat sebagian #6) |
| 8 | Kinerja Divisi — padding Divisi Teraktif & Jumlah Dokumen | TASK | ✅ Valid |
| 9 | Kinerja Divisi — data label | TASK | ✅ Valid (donut parsial) |
| 10 | Beranda — data label Surat & Kepuasan | TASK | ✅ Valid |
| 11 | Beranda APBDes — background hijau salah warna | TASK | ✅ Valid (bug kode dikonfirmasi) |
| 12 | Beranda — gambar SDGs tidak muncul di Safari | BUG | ❓ Perlu verifikasi visual |

**11 dari 12 task terkonfirmasi valid dari pembacaan kode**, 1 task (SDG's image) butuh reproduksi manual di Safari karena root cause-nya di luar kontrol kode aplikasi (kemungkinan CDN/ITP/format image eksternal).

**Catatan duplikasi:** Task #6 dan #7 tumpang-tindih untuk "data label Surat Terbanyak" — sebaiknya salah satu ditutup sebagai duplikat setelah dikerjakan.
