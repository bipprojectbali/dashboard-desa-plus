# Testing Scope — Dashboard Desa Plus

Staging URL: `https://dashboard-desa-plus-stg.wibudev.com`

---

## Prioritas Urutan

| Urutan | Area | Alasan |
|---|---|---|
| 1 | Auth | Gate semua area lain |
| 2 | Wall | Paling banyak diubah di commit terakhir |
| 3 | Dashboard Beranda | Golden path paling sering dibuka |
| 4 | Kinerja Divisi + Export PDF | NOC sync + write (PDF) |
| 5 | Pengaduan & Layanan Publik | User-facing, ada form |
| 6 | Keuangan Anggaran | Data kritis, angka harus akurat |
| 7 | Admin Panel | Role-gated, banyak CRUD |
| 8 | Pengaturan | Write operations (password, sesi, undangan) |
| 9 | Sosial, Demografi, BUMDes, Keamanan, Jenna | Read-heavy |
| 10 | Profile, Users, Bantuan, Global Search | Low-risk |

---

## 1. Auth — `/signin`, `/signup`

- [x] Login dengan kredensial valid → redirect ke dashboard
- [x] Login dengan kredensial invalid → error message "Invalid email or password" tampil
- [x] Akses route protected tanpa login → redirect ke `/signin?redirect=%2F`
- [x] Logout → konfirmasi dialog muncul, setelah konfirmasi redirect ke `/signin`

---

## 2. Wall — `/wall`

> Area paling baru diubah (resize CCTV map, Status Sistem gauges, widget Laporan Publik, sosial widget).

- [x] Semua widget load tanpa error: beranda, bumdes, demografi, divisi, jenna, keamanan, keuangan, ops, pengaduan, sosial
- [x] Resize widget — CCTV map ikut resize, tidak overflow/blank
- [x] Resize widget — Status Sistem gauges tetap satu baris (CPU/MEM/DISK), tidak wrap/patah ✓ fix confirmed
- [x] Widget Laporan Publik render dengan benar
- [x] Widget sosial tersedia di gallery (Kesejahteraan, Beasiswa, Posyandu, dll)
- [x] Layout editor — tambah widget dari gallery, posisi tersimpan
- [x] Layout editor — widget persist setelah save + reload
- [x] Live clock berjalan (detik bergerak di header)
- [x] Viewport 2228px wide — layout tidak patah di layar besar

---

## 3. Dashboard Beranda — `/`

- [x] Semua stat card tampil data (Surat 11, Penduduk 4.200, Pengaduan 0, Layanan 0)
- [x] Chart APBDes render — year selector berfungsi (2026↔2025), data berubah sesuai tahun
- [x] Chart surat render (Statistik Pengajuan Surat 6 bulan terakhir)
- [x] Satisfaction chart render (Sangat Puas, Puas)
- [x] Divisi teraktif tampil (Kesejahteraan 39, Pemerintahan 21, dst)
- [x] Kalender kegiatan mendatang — empty state "Tidak ada kegiatan mendatang" ✓
- [x] SDGs card tampil di bagian bawah (skor 99.64, 78.65, 77.37, 52.62)

---

## 4. Kinerja Divisi — `/kinerja-divisi`

> Data read-only dari NOC API. Tidak boleh ada tombol create/edit/delete.

- [x] Division list tampil (Kesejahteraan 39, Pemerintahan 21, Perencanaan 12, Keuangan 6, Pelayanan 6)
- [x] Activity cards — progres kegiatan tampil via chart (Segera Dikerjakan 48.94%, Selesai 40.43%)
- [x] Discussion panel tampil pesan-pesan terbaru (Forum Komunikasi KBD, dst)
- [x] Event section tampil — "Acara Hari Ini" dengan empty state "Tidak ada acara hari ini" ✓
- [x] Document chart render (Jumlah Dokumen per jenis: Gambar, Dokumen)
- [x] Progress chart render (Progres Kegiatan donut chart)
- [⚠️] Export PDF — endpoint `/api/noc/export-activities` ada di backend tapi **tidak ada tombol di frontend**. Perlu di-wire ke UI.
- [x] Tidak ada tombol CRUD di halaman ini ✓

---

## 5. Pengaduan & Layanan Publik — `/pengaduan-layanan-publik`

- [x] KPI cards tampil (Total Pengaduan, Baru, Diproses, Selesai, Ditolak — semua 0, data staging)
- [x] Tren Pengaduan chart render (line chart 7 bulan)
- [x] Surat terbanyak chart render (bar chart per tipe SK)
- [x] Pengaduan Terbaru tampil (BARU, KADALUARSA — data dari NOC, read-only)
- [x] Musrenbang / Ajuan Ide Inovatif tampil (read-only dari NOC)
- [⚠️] Filter/sort pengaduan — **tidak ada** di halaman ini
- [⚠️] Innovation idea modal (`innovation-idea-modal.tsx`) — **komponen orphan**, tidak pernah dipakai di manapun di codebase

---

## 6. Keuangan Anggaran — `/keuangan-anggaran`

- [x] KPI cards tampil tanpa NaN (Total APBDes 31.0M, Realisasi 0%, Pemasukan 0.0jt, Pengeluaran 0.0jt)
- [x] Income/expense chart — empty state graceful "Belum ada data pemasukan dan pengeluaran" ✓
- [x] Alokasi Anggaran Per Bidang render
- [x] Laporan APBDes detail tampil (Pendapatan, Belanja per bidang dengan nilai rupiah)
- [x] Dana Bantuan dan Hibah tampil (Bantuan Keuangan Provinsi)
- [x] Year selector tampil (Tahun 2026)

---

## 7. Admin Panel — `/admin/*`

> Hanya bisa diakses role `admin`. Test dengan akun admin.

- [x] `/admin` — dashboard stats tampil (15 users, 3 admin, v0.1.61, CPU 8%, MEM 22%, DISK 60%)
- [x] `/admin/users` — list 15 user tampil dengan email, role, status, tanggal
- [x] `/admin/roles` — halaman accessible, role & permission tampil
- [x] `/admin/apikey` — 2 key ada (Development Key, Production Key), "Create New API Key" form buka dengan calendar picker
- [x] `/admin/audit-log` — 321 log tampil, filter by user/action, Export CSV, banyak `health-check-failed` desa-api (API intermittent)
- [x] `/admin/system-health` — PostgreSQL ONLINE 5ms, Desa API ONLINE 61ms, NOC API ONLINE 25ms, last sync success
- [x] `/admin/settings` — halaman accessible
- [x] `/admin/preferences` — halaman accessible
- [x] `/admin/help` — halaman accessible
- [⚠️] Non-admin access control — tidak ditest (butuh akun non-admin terpisah)

---

## 8. Pengaturan — `/pengaturan/*`

- [x] `/pengaturan/umum` — halaman accessible, Bahasa, Format Tanggal, Zona Waktu tampil; dropdown language & date format tersedia
- [x] `/pengaturan/keamanan` — Ubah Password modal ✓ buka & form tampil (Password Lama + Baru + Konfirmasi); Sesi Aktif modal ✓ buka ("Sesi Aktif & Perangkat Terdaftar")
- [⚠️] `/pengaturan/keamanan` — validasi password lama salah: form muncul tapi Simpan button tidak terdeteksi di snapshot (layout bisa nested/hidden); tidak bisa verify error message
- [⚠️] `/pengaturan/notifikasi` — toggle switch muncul (11 switch) tapi click intercepted oleh `<span>` overlay; Mantine Switch tidak actionable via click(); fungsionalitas toggle perlu diverifikasi manual
- [x] `/pengaturan/akses-dan-tim` — Undang Modal ✓ (Generate Link dengan email opsional + role); Kelola Role Modal ✓ (15 user tampil dengan role selector per user)
- [⚠️] `/pengaturan/sinkronisasi` — **routing bug**: navigate ke `/pengaturan/sinkronisasi` redirect ke `/admin/preferences` (Preferensi Global Dashboard), bukan halaman sinkronisasi NOC

---

## 9. Read-Heavy Modules

### Sosial — `/sosial`

- [x] Summary cards tampil (data numerik: 11, 26, 17, 10, 73, 88, dll)
- [x] Kalender Event Budaya render (26 SVG charts total di halaman)
- [x] Health records tampil (Riwayat Kesehatan Warga section)
- [x] Health stats render (Statistik Kesehatan heading)
- [x] Sections Posyandu, Pendidikan, Kesejahteraan Masyarakat, Jadwal Posyandu semua load

### Demografi Pekerjaan — `/demografi-pekerjaan`

- [x] Data demografi tampil (23 SVG charts)
- [x] Sections: Pengelompokan Umur, Demografi Pekerjaan, Dinamika Penduduk, Distribusi Agama, Data per Banjar, Sektor Unggulan

### BUMDes — `/bumdes`

- [x] Summary cards tampil (Total Penjualan Rp 0, staging data kosong)
- [x] Top 3 Produk Terlaris render (21 SVG charts)
- [x] Detail Penjualan Produk section tampil
- [x] Header toggle (Minggu ini / Bulan ini) berfungsi
- [⚠️] Sales detail modal — tidak ada row di tabel (staging data kosong, tidak bisa test klik modal)

### Keamanan — `/keamanan`

- [x] Data keamanan tampil: Peta Keamanan CCTV, Daftar CCTV, Laporan Publik (20 SVG charts)

### Jenna Analytic — `/jenna-analytic`

- [x] Analitik render dari Jenna API: Interaksi Chatbot, Topik Pertanyaan Terbanyak, Jam Tersibuk (11 charts)
- [x] No error, no empty state crash — data tampil normal

---

## 10. Profile, Users, Bantuan, Global Search

- [x] `/profile` — data profil tampil (Admin Desa Darmasaba, nicoarya20@gmail.com, ADMIN)
- [x] `/profile/edit` — form tampil, Simpan Perubahan klik → redirect ke `/profile` (no explicit save toast; silent save)
- [⚠️] `/users` — **halaman stub**: hanya tampil "This page demonstrates fetching data from the API and using dynamic routes" + tip text — belum diimplementasi
- [⚠️] `/users/$id` — tidak bisa test karena `/users` halaman stub, tidak ada links ke user detail
- [x] `/bantuan` — tampil Pusat Bantuan, Panduan Memulai, Video Tutorial, FAQ, Dokumentasi, Kontak Dukungan
- [x] Global search (Ctrl+K) — dialog buka, ketik "anggaran" → hasil "Keuangan & Anggaran" muncul, klik → navigate ke `/keuangan-anggaran` ✓

---

## Catatan Umum

- **NOC models (Activity, Document, Discussion, Event)** — read-only, data dari sync NOC API. Tidak boleh ada form CRUD untuk model-model ini di UI.
- **Fallback behavior** — tiap area yang bergantung ke API eksternal (NOC API, Desa API) harus punya fallback graceful (empty state atau data cache lokal), bukan crash/blank.
- **Empty state** — modul dengan data kosong harus render empty state yang wajar, bukan error atau angka aneh (sesuai konvensi project: gunakan 0 sebagai fallback).
