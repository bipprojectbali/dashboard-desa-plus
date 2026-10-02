# Uji manual — Panel tidak menutupi halaman & jawaban Markdown

> Berlaku setelah branch `fix/assistant-panel-ui` (commit `de32657`, `0c4c541`, `7df7a46`) di-merge ke `join`.
> Jalankan `bun install` (paket baru `react-markdown`, `remark-gfm`) lalu restart `bun run dev`. Isi **Hasil** dengan ✅ / ❌.

## A. Panel memberi ruang (Opsi A)

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| A1 | Buka `/keamanan`, buka panel Jenna (mode normal) | Halaman **bergeser/menyempit** ke kiri; kolom **Laporan Publik** tetap terlihat utuh, tidak tertutup panel | |
| A2 | Lihat header saat panel terbuka | Panel mulai **di bawah header**; jam, nama, avatar, dan ikon header terlihat & bisa diklik | |
| A3 | *"tunjukkan laporan publik"* / *"tunjukkan daftar laporan keamanan"* | Kursor & sorotan mendarat di kartu yang terlihat penuh | |
| A4 | Tutup panel | Halaman kembali selebar semula dengan animasi halus | |
| A5 | Mode **perbesar** | Halaman tidak bergeser; menunjuk tetap memakai "Kembali ke chat" (P6) | |
| A6 | `/wall` dan `/profile` | `/wall` sama seperti sebelumnya; `/profile` panel di bawah header dan konten bergeser | |
| A7 | Matikan *animasi transisi* (pengaturan) atau aktifkan *Reduce motion* | Geser tanpa animasi | |
| A8 | Laptop ±1366px, sidebar terbuka + panel terbuka | Konten menyempit (±626px). Catat halaman yang terasa terlalu padat | |
| A9 | Jendela browser < 992px | Panel kembali **melayang** menutupi halaman (perilaku lama, disengaja) | |

## B. Jawaban Markdown

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| B1 | *"Bisa jelaskan tren 7 bulan di tampilan ini?"* (di Pengaduan) | `**...**` tampil **tebal** tanpa tanda bintang; daftar `-` jadi butir | |
| B2 | Minta jawaban berbentuk tabel | Tabel rapi berbingkai; bila lebar, bisa digulir ke samping di dalam bubble | |
| B3 | Perhatikan saat jawaban masih mengalir | Format muncul bertahap tanpa kedip berlebihan | |
| B4 | Klik tombol **salin** | Yang tersalin teks asli (dengan tanda Markdown) | |
| B5 | Pesan Anda sendiri berisi `**halo**` | Bubble Anda tetap teks biasa (tidak dirender) | |
| B6 | Mode terang & gelap | Teks, tabel, kode terbaca di kedua mode | |

## Catatan hasil uji

| Tanggal | Penguji | Langkah ❌ | Catatan / screenshot |
|---|---|---|---|
| | | | |
