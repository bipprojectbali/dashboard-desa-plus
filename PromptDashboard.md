Buat halaman dashboard admin modern untuk sistem pemerintahan desa bernama **Darmasaba Dashboard NOC**.

Gunakan stack berikut:

Frontend:

* React 19
* Bun runtime
* Vite
* TailwindCSS
* Mantine UI
* Mantine Charts atau Recharts
* Tabler Icons
* TanStack Router
* Dayjs

UI harus modular dengan reusable components.

Gunakan **TailwindCSS sebagai styling utama** dengan warna dari konfigurasi berikut:

Primary:
darmasaba-navy (#1E3A5F)

Secondary:
darmasaba-blue (#3B82F6)

Success:
#22C55E

Warning:
#FACC15

Danger:
#EF4444

Background:
#F5F8FB

Dashboard harus memiliki **Light Mode dan Dark Mode**.

Dark Mode Color Rules:
background: #0F172A
card: #1E293B
border: #334155
text: #E2E8F0

Card style:

* rounded-xl
* soft shadow
* padding besar
* border subtle
* smooth hover animation

Gunakan grid layout responsive.

---

SECTION 1 — PROGRAM KEGIATAN

Buat 4 card horizontal di bagian atas yang menampilkan kegiatan desa.

Setiap card memiliki:

* header biru
* progress bar kegiatan
* tanggal kegiatan
* badge status

Data card:

1.

Judul: Rakor 2025
Tanggal: 3 Juli 2025
Progress: 90%
Status: selesai

2.

Judul: Pemutakhiran Indeks Desa
Tanggal: 3 Juli 2025
Progress: 85%
Status: selesai

3.

Judul: Mengurus Akta Cerai Warga
Tanggal: 3 Juli 2025
Progress: 80%
Status: selesai

4.

Judul: Pasek 7 Desa Adat
Tanggal: 3 Juli 2025
Progress: 92%
Status: selesai

Progress bar:

* rounded
* warna warning
* animasi smooth

Status badge:

* success color

---

SECTION 2 — GRID DASHBOARD

Layout:

3 column grid.

Left column (sidebar style):
Divisi Teraktif

List item card dengan arrow icon.

Data:

Kesejahteraan — 37 kegiatan
Pemerintahan — 26 kegiatan
Keuangan — 17 kegiatan
Sekretaris Desa — 15 kegiatan
Tata Usaha TK — 14 kegiatan
Perangkat Kewilayahan — 12 kegiatan
Pelayanan — 10 kegiatan
Perencanaan — 9 kegiatan
Tata Usaha & Umum — 7 kegiatan

Setiap item:

* rounded
* hover effect
* arrow icon kanan

---

Middle column:

Jumlah Dokumen

Gunakan **Bar Chart**.

Kategori:

* Gambar
* Dokumen

Nilai:

* Gambar: 300
* Dokumen: 310

Gunakan:
Recharts atau Mantine Charts.

---

Right column:

Progres Kegiatan

Gunakan **Pie Chart**.

Data:

Selesai — 83.33%
Dikerjakan — 16.67%
Segera Dikerjakan — 0%
Dibatalkan — 0%

Legend harus berwarna.

---

SECTION 3 — DISCUSSION PANEL

Judul: Diskusi

Tampilkan list diskusi internal staf.

Item card memiliki:

* icon chat
* judul pesan
* nama pengirim
* tanggal

Contoh data:

"Kepada Pelayanan, mohon di cek..."
Pengirim: I.B Surya Prabhawa Manu
Tanggal: 12 Apr 2025

"Kepada staf perencanaan @suar..."
Pengirim: Ni Nyoman Yuliani
Tanggal: 14 Jun 2025

"ijin atau mohon kepada KBD sar..."
Pengirim: Ni Wayan Martini
Tanggal: 12 Apr 2025

---

SECTION 4 — ACARA HARI INI

Card sederhana.

Jika tidak ada acara tampilkan:

"Tidak ada acara hari ini"

---

SECTION 5 — ARSIP DIGITAL PERANGKAT DESA

Grid 2 column.

Menu arsip:

Surat Keputusan
Dokumentasi
Laporan Keuangan
Notulensi Rapat

Setiap item berupa card clickable dengan:

* icon dokumen
* border
* hover effect

---

DESIGN STYLE

Gunakan gaya:

Modern Government Dashboard
Clean UI
Soft shadow
Rounded-xl
Spacing besar
Minimalistic

---

RESPONSIVE RULES

Desktop:
12 column grid

Tablet:
6 column grid

Mobile:
single column stack

---

COMPONENT STRUCTURE

src/components/dashboard

activity-card.tsx
division-list.tsx
document-chart.tsx
progress-chart.tsx
discussion-panel.tsx
event-card.tsx
archive-card.tsx

src/pages

dashboard.tsx

---

CODE QUALITY

Gunakan:

* React hooks
* reusable components
* Mantine components jika perlu
* Tailwind utility classes
* dark mode support
* responsive layout
* clean TypeScript

---

Output:

* Halaman dashboard lengkap
* Semua komponen reusable
* Chart sudah bekerja
* Layout identik dengan desain dashboard modern pemerintahan
