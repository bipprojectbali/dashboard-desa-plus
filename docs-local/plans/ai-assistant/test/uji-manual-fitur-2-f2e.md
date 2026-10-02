# Uji manual — Fitur 2 (penunjuk) di Pengaduan & Demografi (F2-e)

> Berlaku setelah F2-e (commit `f9f0246`…`46fa11e`) di-merge ke `join`. Restart `bun run dev`.
> Kedua halaman **dipecah** (refactor) sebelum diberi penanda — cek juga tampilannya tidak berubah (§C).
> Isi **Hasil** dengan ✅ / ❌.

**Target baru (21)** — semua hanya ditunjuk (tidak ada yang diklik/dipilih AI)
- **Pengaduan** `/pengaduan-layanan-publik` (`view-pengaduan`): Coba lagi (hanya saat error), KPI total, KPI baru, KPI diproses,
  KPI selesai, KPI ditolak, tren, surat terbanyak, pengajuan terbaru, ide inovatif.
- **Demografi** `/demografi-pekerjaan` (`view-demografi`): Coba lagi (hanya saat error), KPI penduduk, KPI KK, KPI kelahiran,
  KPI kemiskinan, umur, pekerjaan, dinamika, agama, pemilih tahun agama, banjar, sektor.

## A. Pengaduan & Layanan Publik

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| A1 | Dari halaman lain: *"tunjukkan total pengaduan"* | Pindah ke halaman Pengaduan, kursor menunjuk kartu **Total** | |
| A2 | *"Mana grafik tren pengaduan?"*, *"Di mana surat terbanyak?"*, *"Tunjukkan pengajuan terbaru"*, *"Tunjukkan ide inovatif"* | Kartu masing-masing disorot | |
| A3 | Tanya *"ada berapa pengaduan aktif?"* → klik label **Sumber: Pengaduan…** | Pindah + menunjuk kartu **Total**, tanpa request baru ke `/api/assistant/*` | |
| A4 | (Saat data error) *"klik coba lagi"* | AI hanya menunjuk / menolak, tidak menekan | |
| A5 | User **tanpa** `view-pengaduan` minta menunjuk kartu Pengaduan | Ditolak dengan sopan | |

## B. Demografi & Kependudukan

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| B1 | *"Tunjukkan jumlah penduduk"*; coba juga KK, kelahiran/kematian, kemiskinan | Kartu KPI terkait ditunjuk | |
| B2 | *"Tunjukkan distribusi agama"*, *"umur"*, *"pekerjaan"*, *"banjar"*, *"sektor unggulan"*, *"dinamika penduduk"* | Kartu disorot | |
| B3 | *"Mana pilihan tahun agama?"* (hanya ada bila data > 1 tahun) | Dropdown ditunjuk | |
| B4 | *"Ganti tahun agama ke 2024"* | AI **tidak** mengganti; Anda memilih sendiri | |
| B5 | Tanya *"banjar dengan penduduk terbanyak?"* → klik label **Sumber: Demografi…** | Pindah + menunjuk kartu **Total Penduduk** tanpa memanggil AI | |

## C. Regresi tampilan setelah refactor

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| C1 | Buka Pengaduan & Demografi di mode **terang** dan **gelap** | Tampilan sama seperti sebelum F2-e (grid, kartu, grafik, teks) | |
| C2 | Muat ulang saat data lambat / gagal | Skeleton & pesan error/empty tampil seperti sebelumnya | |
| C3 | `/wall` | Tidak berubah | |

## Catatan

- `demografi.tahun-agama` sengaja **tidak** bisa dipilih AI: aksi `pilih` tahun saat ini memvalidasi terhadap tahun APBDes, bukan tahun data agama.
  Bila ingin bisa dipilih, perlu jenis `pilih` baru yang memuat tahun dari data agama.
- Kartu **ide inovatif** menampilkan nama pengusul, tetapi hanya ditunjuk sebagai kartu; tidak ada nama/teks warga yang dikirim ke AI.

## Catatan hasil uji

| Tanggal | Penguji | Langkah ❌ | Catatan / screenshot |
|---|---|---|---|
| | | | |
