# Uji manual — Fitur 2 (penunjuk) di BUMDes, Sosial, Keamanan & Jenna Analytic (F2-f)

> Lanjutan `uji-manual-fitur-2.md` (Keuangan) dan `uji-manual-fitur-2-beranda-divisi.md` (F2-d).
> Berlaku setelah F2-f (commit `0259075` + `c26b38a`) di-merge ke `join`. Restart `bun run dev`.
> Login sebagai user dengan izin modul terkait; buka panel asisten. Isi **Hasil** dengan ✅ / ❌.

**Target baru (38)** — `[klik]` = boleh diklik AI (elemen tampilan murni)
- **BUMDes** `/bumdes` (`view-bumdes`): tampilan, rentang Minggu Ini [klik], rentang Bulan Ini [klik], KPI UMKM aktif,
  KPI UMKM terdaftar, KPI omzet, KPI kategori terbanyak, produk unggulan, top produk, detail penjualan, filter.
- **Sosial** `/sosial` (`view-sosial`): Coba lagi (hanya ditunjuk), KPI ibu hamil, KPI balita, KPI stunting, KPI posyandu,
  statistik kesehatan, posyandu, pendidikan, beasiswa, kesejahteraan, kalender event, riwayat kesehatan,
  tab Ibu Hamil [klik], tab Balita [klik], tab Penyakit [klik].
- **Keamanan** `/keamanan` (`view-keamanan`): Coba lagi (hanya ditunjuk), KPI CCTV aktif, KPI laporan, peta, daftar CCTV, laporan.
- **Jenna Analytic** `/jenna-analytic` (`view-jenna-analytic`): KPI interaksi, KPI otomatis, KPI belum ditindak,
  KPI waktu respon, grafik interaksi, topik pertanyaan, jam tersibuk (semua hanya ditunjuk).

## A. BUMDes & UMKM

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| A1 | Dari halaman lain: *"tunjukkan omzet UMKM"* | Pindah ke `/bumdes`, kursor menunjuk kartu **Omzet** | |
| A2 | *"tampilkan data bulan ini"* | Kursor ke tombol **Bulan Ini** lalu tombol ditekan; data berganti rentang | |
| A3 | *"minggu ini"* | Sama, untuk tombol **Minggu Ini** | |
| A4 | *"tunjukkan filter penjualan"* | Hanya ditunjuk; filter tidak berubah | |
| A5 | *"tunjukkan produk terlaris"* / *"detail penjualan"* | Kartu ditunjuk | |

## B. Sosial

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| B1 | *"tunjukkan alert stunting"* | Kartu **Stunting** ditunjuk | |
| B2 | *"tampilkan riwayat balita"* | Tab **Balita** ditekan | |
| B3 | *"tab penyakit"* / *"tab ibu hamil"* | Tab terkait ditekan | |
| B4 | *"tunjukkan jadwal posyandu"*, *"pendidikan"*, *"beasiswa"*, *"kalender event"*, *"kesejahteraan"* | Kartu masing-masing ditunjuk | |
| B5 | (Saat data error) *"klik coba lagi"* | Asisten **hanya menunjuk**, tidak menekan (tombol ini memicu proses di server) | |

## C. Keamanan

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| C1 | *"tunjukkan peta CCTV"*, *"daftar CCTV"*, *"laporan keamanan"*, *"CCTV aktif"* | Masing-masing ditunjuk; tidak ada klik | |
| C2 | (Saat data error) *"klik coba lagi"* | Hanya ditunjuk | |
| C3 | Tampilan halaman Keamanan secara umum (peta, kartu laporan) | **Tidak berubah** dibanding sebelum F2-f (halaman sempat dipecah jadi beberapa komponen) | |

## D. Jenna Analytic

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| D1 | *"tunjukkan grafik interaksi"*, *"topik pertanyaan"*, *"jam tersibuk"*, *"waktu respon"* | Kartu masing-masing ditunjuk | |

## E. Izin

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| E1 | User **tanpa** `view-keamanan` meminta *"tunjukkan peta CCTV"* atau *"buka halaman keamanan"* | Ditolak dengan sopan, tidak pindah halaman | |

## Catatan

- Label **Sumber** untuk modul-modul ini belum bisa diklik — tool datanya (tahap 2) belum ada; AI tetap bisa menunjuk kartu.
- Pemilih berbasis data (kategori/UMKM di BUMDes, Banjar di Sosial) **hanya ditunjuk**, belum bisa dipilih AI.
- `/wall` belum menerapkan aturan #40 (F2-w belum dikerjakan).

## Catatan hasil uji

| Tanggal | Penguji | Langkah ❌ | Catatan / screenshot |
|---|---|---|---|
| | | | |
