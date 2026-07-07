# Changelog

All notable changes to this project will be documented in this file.

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
