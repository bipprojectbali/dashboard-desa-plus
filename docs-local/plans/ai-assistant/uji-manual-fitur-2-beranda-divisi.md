# Uji manual — Fitur 2 (penunjuk) di Beranda & Kinerja Divisi (F2-d)

> Lanjutan dari `uji-manual-fitur-2.md` (Keuangan). Berlaku setelah F2-d (commit `89b5d02`) di-merge ke `join`.
> Isi kolom **Hasil** dengan ✅ / ❌ dan tulis catatan bila ❌ (screenshot + langkah).
> Persiapan sama dengan `uji-manual-fitur-2.md` §0. Restart `bun run dev` setelah merge.

**Target baru**
- **Beranda** (`/`, izin `view-dashboard`, semua hanya ditunjuk): Surat minggu ini, Pengaduan aktif, Layanan selesai,
  Total penduduk, Grafik surat, Kepuasan, Progres divisi, Kalender & kegiatan, APBDes, SDGs.
- **Kinerja Divisi** (`/kinerja-divisi`, izin `view-kinerja-divisi`): Export PDF (hanya ditunjuk), Coba lagi (satu-satunya yang
  bisa diklik, hanya muncul saat error), Kegiatan, **Divisi Teraktif**, Dokumen, Progres, Diskusi, Acara.

## A. Beranda

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| A1 | Di Beranda, tanya *"tunjukkan total penduduk"* | Kursor muncul di tengah, meluncur ke kartu **Total Penduduk**, ring muncul lalu memudar | |
| A2 | *"di mana grafik APBDes?"* | Kursor ke kartu **APBDes** di Beranda (halaman tidak berpindah) | |
| A3 | *"tunjukkan skor SDGs"* | Kursor ke baris kartu **SDGs** (tunggu skeleton selesai memuat) | |
| A4 | Dari halaman lain (mis. Keuangan) tanya *"tunjukkan kalender kegiatan"* | Pindah ke Beranda lalu menunjuk kartu **Kalender & Kegiatan** | |
| A5 | *"Ringkas kondisi desa hari ini"* → klik label **Sumber: Beranda** | Kartu **Total Penduduk** ditunjuk **tanpa** request baru ke `/api/assistant/*` (cek tab Network) | |
| A6 | Login akun **tanpa** izin `view-dashboard` → minta menunjuk kartu Beranda | Ditolak dengan sopan; label Sumber Beranda tidak bisa diklik | |

## B. Kinerja Divisi

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| B1 | Dari Beranda tanya *"Siapa divisi teraktif?"* | Jawaban teks dari data, **tanpa** pindah halaman | |
| B2 | Lanjut *"tunjukkan divisi teraktif"* / *"di mana?"* | Pindah ke `/kinerja-divisi`, kursor ke kartu **Divisi Teraktif** | |
| B3 | *"tunjukkan grafik dokumen"*, *"panel diskusi"*, *"acara hari ini"*, *"progres kegiatan"* | Kursor ke kartu masing-masing | |
| B4 | *"tekan tombol Export PDF"* | Hanya ditunjuk (tidak ada unduhan); AI meminta Anda menekan sendiri | |
| B5 | Putus jaringan sebentar sampai muncul error + tombol **Coba lagi**, lalu tanya *"klik coba lagi"* | Tombol **Coba lagi** diklik, data dimuat ulang | |
| B6 | Dari halaman lain klik label **Sumber: Kinerja Divisi** pada jawaban | Pindah ke Kinerja Divisi dan menunjuk kartu **Divisi Teraktif** tanpa memanggil AI | |
| B7 | Aktifkan *Reduce motion* di OS lalu ulangi B2 | Sorot + gulir langsung, tanpa kursor meluncur | |

## C. Catatan yang perlu diputuskan

| # | Catatan |
|---|---|
| C1 | "Progres divisi" di Beranda adalah versi ringkas; peringkat lengkap ada di kartu **Divisi Teraktif** (Kinerja Divisi). AI diarahkan memakai Kinerja Divisi sebagai rujukan utama — perhatikan apakah AI kadang menunjuk kartu Beranda saat ditanya "divisi teraktif". |
| C2 | **`/wall`**: tombol AI juga ada di wall, tetapi kartu Beranda/Kinerja Divisi tidak ada di wall. Bila di wall diminta "tunjukkan divisi teraktif", dashboard akan **keluar dari `/wall`** ke `/kinerja-divisi`. Menunggu keputusan perilaku wall. |

## Catatan hasil uji

| Tanggal | Penguji | Langkah ❌ | Catatan / screenshot |
|---|---|---|---|
| | | | |
