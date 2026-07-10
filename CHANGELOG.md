# Changelog

All notable changes to this project will be documented in this file.

## [0.1.47] - 2026-07-10

### Fixed
- Menu "Riwayat Kesehatan Warga" kini benar-benar tampil di STG. Pada v0.1.46 endpoint sudah benar tetapi browser mengambil data langsung dari Desa API sehingga diblokir CORS (tidak ada header `Access-Control-Allow-Origin`) dan tetap muncul "Gagal memuat data". Kini data dilewatkan proxy internal server (`/api/sosial/kesehatan/riwayat-warga`) sehingga bebas CORS — pola sama seperti perbaikan Posyandu & Pendidikan sebelumnya.

## [0.1.46] - 2026-07-10

### Fixed
- Menu "Riwayat Kesehatan Warga" di halaman Sosial kini menampilkan data dengan benar. Sebelumnya tab Ibu Hamil gagal memuat ("Gagal memuat data ibu hamil") dan tab Penderita Penyakit salah mengambil data dari endpoint grafik kepuasan. Ketiga tab (Ibu Hamil, Balita, Penderita Penyakit) beserta daftar banjar kini dimuat dari satu endpoint tunggal `/api/kesehatan/riwayatwarga/find-many`; filter per-banjar dan paginasi dilakukan di sisi klien.
- Card empty state pada menu Keuangan (APBDes) dan Kinerja Divisi (aktivitas & acara) kini memiliki latar yang sesuai di dark mode. Warna card sumber dana di Keuangan juga diperbaiki agar terbaca di light mode.
- Jarak sumbu dan margin grafik tren pengaduan serta grafik surat terbanyak dirapikan agar label tidak terpotong.

## [0.1.44] - 2026-07-09

### Fixed
- Bagian "Top 3 Produk Terlaris" di menu BumDes & UMKM Desa kini menampilkan pesan "Belum ada data produk terlaris" beserta ikon saat data kosong. Sebelumnya area tersebut tampil kosong tanpa keterangan apa pun.

## [0.1.43] - 2026-07-09

### Fixed
- Grafik Tingkat Kepuasan di dashboard kini menampilkan data responden asli di STG. Sebelumnya browser mengambil data langsung dari NOC API sehingga terblokir CORS dan jatuh ke data seed DB — semua segmen tampil dengan label "Puas". Kini data dilewatkan proxy internal server (`/api/dashboard/satisfaction-responden`) sehingga bebas CORS dan label rating tampil benar.
- Teks tooltip pada semua grafik (donut & bar) kini terbaca di dark mode. Sebelumnya warna teks item tooltip mengikuti default gelap Recharts sehingga tidak terlihat di atas latar gelap.

## [0.1.42] - 2026-07-08

### Fixed
- Data jadwal Posyandu dan ringkasan Pendidikan di halaman Sosial kini tampil di STG. Sebelumnya kedua komponen mengambil data langsung dari Desa API di browser, tetapi Desa API tidak mengirim header CORS sehingga response diblokir browser dan data jatuh ke kondisi kosong (0). Kini keduanya melewati proxy internal server (`/api/sosial/*`) sehingga bebas CORS dan mendapat cache.

## [0.1.41] - 2026-07-08

### Added
- Cache data API global (TanStack Query): data diambil sekali lalu disimpan, sehingga berpindah halaman tidak lagi memicu fetch ulang dan skeleton. Skeleton kini hanya muncul saat kunjungan pertama; kembali ke halaman menampilkan data cache secara instan lalu diperbarui diam-diam di latar belakang.
- Efek transisi "glitch" halus antar halaman (menggantikan fade), menghormati preferensi `prefers-reduced-motion` dan toggle Animasi Transisi.

### Changed
- Migrasi 22 komponen (dashboard, demografi, keuangan, BUMDes, keamanan, sosial, kinerja divisi, pengaduan, jenna) ke pola data-fetching berbasis cache.

### Fixed
- Menghapus pemanggilan `cache-invalidate` saat halaman dibuka (BUMDes, keamanan, sosial, jenna) yang membuat data selalu diambil ulang dari awal setiap kunjungan.

## [Unreleased]

### Changed
- Migrated Telegram notification hook from shell script (`.sh`) to TypeScript (`.ts`) using Bun for better reliability and maintenance.
- Updated `.gemini/settings.json` to use the new TypeScript hook and increased timeout to 10 seconds.

### Removed
- Deleted `.gemini/hooks/telegram-notify.sh`.
