# Dashboard Design Specification

Dokumen ini mendeskripsikan desain dashboard berdasarkan **Screenshot 2026-02-02 at 14.12.36.png**. Tujuannya sebagai acuan implementasi UI untuk `src/routes/noc/dashboard/route.tsx`.

---

## 1. Gambaran Umum

Dashboard merepresentasikan **Sistem Informasi Desa (DESA+)** dengan fokus pada:

* Monitoring layanan administrasi desa
* Statistik surat & pengaduan
* Tingkat kepuasan warga
* Aktivitas divisi & agenda desa

Gaya visual: **modern, clean, administratif**, dengan nuansa **biru pemerintah** dan kartu (card-based layout).

---

## 2. Struktur Layout

### 2.1 Layout Global

```
+--------------------------------------------------+
| Topbar / Header                                 |
+-----------+--------------------------------------+
| Sidebar   | Main Content (Dashboard)             |
|           |  - KPI Cards                         |
|           |  - Charts                            |
|           |  - Activity & Calendar               |
+-----------+--------------------------------------+
```

* **Sidebar**: fixed / sticky di kiri
* **Header**: fixed di atas konten utama
* **Main Content**: scrollable

---

## 3. Header (Topbar)

### Komponen

* Nama desa: `Desa Darmasaba`
* User info:

  * Nama: `I. B. Surya Prabhawa M.`
  * Role: `Kepala Desa`
* Ikon:

  * Notification (badge angka)
  * Theme / setting (opsional)
  * Avatar user (circle)

### Style

* Background: **Navy / Dark Blue**
* Text: putih
* Height: ±64px
* Shadow tipis ke bawah

---

## 4. Sidebar Navigation

### Elemen

* Logo **DESA+** di atas
* Search input: `cari apa saja`
* Menu navigasi:

  * Beranda (active)
  * Kinerja Divisi
  * Pengaduan & Layanan Publik
  * Jenna Analytic
  * Demografi & Kependudukan
  * Keuangan & Anggaran
  * Bumdes & UMKM Desa
  * Sosial
  * Keamanan
  * Bantuan
  * Pengaturan

### Style

* Background: putih
* Active state:

  * Background: biru muda
  * Text: biru tua
* Icon (opsional, outline style)
* Spacing antar menu: ±12–16px

---

## 5. KPI / Summary Cards (Row 1)

### Cards

1. **Surat Minggu Ini**

   * Value: `99`
   * Delta: `+12%`
2. **Pengaduan Aktif**

   * Value: `28`
   * Sub: `14 baru, 14 diproses`
3. **Layanan Selesai**

   * Value: `156`
   * Sub: `bulan ini`
   * Delta: `+8%`
4. **Kepuasan Warga**

   * Value: `87.2%`
   * Circular indicator

### Style

* Card background: putih
* Border radius: 12–16px
* Shadow: soft
* Icon di kanan atas card
* Grid: 4 kolom (desktop)

---

## 6. Statistik Pengajuan Surat (Bar Chart)

### Deskripsi

* Judul: `Statistik Pengajuan Surat`
* Subjudul: `Trend pengajuan surat 6 bulan terakhir`
* X-axis: Jan – Jun
* Y-axis: jumlah surat

### Style

* Bar color: navy / dark blue
* Background card: putih
* Axis minimal & clean

### Data Expectation

```ts
{
  month: string;
  total: number;
}
```

---

## 7. Tingkat Kepuasan (Donut Chart)

### Kategori

* Sangat Puas (hijau)
* Puas (biru)
* Cukup (kuning)
* Kurang (merah)

### Style

* Donut chart
* Legend di bawah
* Persentase di tengah (opsional)

---

## 8. Divisi Teraktif (Progress List)

### Item

* Kesejahteraan – 37 kegiatan
* Pemerintahan – 26 kegiatan
* Keuangan – 17 kegiatan
* Sekretaris Desa – 15 kegiatan

### Style

* Horizontal progress bar
* Warna bar: navy
* Background bar: abu-abu terang

---

## 9. Kalender & Kegiatan Mendatang

### Item

* 1 Oktober 2025 – Hari Kesaktian Pancasila
* 15 Oktober 2025 – Davest
* 19 Oktober 2025 – Rapat Koordinasi

### Style

* Card list
* Date kecil, title tebal

---

## 10. Warna & Tema

### Color Palette (Approx)

* Primary: `#1E3A5F` (navy)
* Secondary: `#3B82F6`
* Success: `#22C55E`
* Warning: `#FACC15`
* Danger: `#EF4444`
* Background: `#F5F8FB`

---

## 11. Typography

* Font utama: **Inter / Poppins / system-ui**
* Heading: semi-bold
* Body: regular
* Angka KPI: bold, besar

---

## 12. Responsiveness

* Desktop (>=1280px): layout penuh
* Tablet:

  * Sidebar collapsible
  * KPI cards jadi 2 kolom
* Mobile:

  * Sidebar drawer
  * KPI cards 1 kolom
  * Charts stack vertical

---

## 13. Interaksi & Behavior

* Sidebar menu: active state
* Hover card: shadow naik
* Chart: tooltip on hover
* Notification: clickable
* Data: async (API driven)

---

## 14. Catatan Implementasi

* Cocok untuk:

  * React + Vite
  * Mantine / Shadcn / MUI
  * ChartJS / Recharts / ECharts
* Gunakan layout berbasis **CSS Grid / Flexbox**

---

## 15. Scope Selanjutnya

* Dark mode
* Export laporan (PDF/Excel)
* Filter tanggal & divisi

---

> Dokumen ini menjadi acuan desain UI. Perubahan visual harus tetap konsisten dengan struktur ini.
