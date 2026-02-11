# Keuangan & Anggaran – Dashboard Design Specification

Dokumen ini menjelaskan spesifikasi desain halaman **Keuangan & Anggaran** berdasarkan screenshot (11 Feb 2026). Dokumen ini berfungsi sebagai **design system + data contract** untuk implementasi frontend dan backend.

---

## 1. Tujuan Halaman

Halaman **Keuangan & Anggaran** bertujuan untuk:

* Menampilkan ringkasan APBDes
* Memantau realisasi anggaran
* Membandingkan pemasukan vs pengeluaran
* Melihat alokasi anggaran per sektor
* Transparansi laporan keuangan desa

Target pengguna:

* Kepala Desa
* Bendahara Desa
* Admin Keuangan

---

## 2. Tata Letak Keseluruhan

### 2.1 Struktur Layout Global

```
+------------------------------------------------------+
| Topbar / Header                                      |
+-------------+----------------------------------------+
| Sidebar     | Main Content                           |
|             | - KPI Keuangan                         |
|             | - Grafik Pemasukan vs Pengeluaran      |
|             | - Alokasi Anggaran + Dana Bantuan      |
|             | - Laporan APBDes                       |
+-------------+----------------------------------------+
```

* Sidebar: fixed kiri
* Header: fixed atas
* Konten utama: scroll vertikal

---

## 3. Header (Topbar)

### Komponen

* Nama aplikasi: `Desa Darmasaba`
* User info:

  * Nama: `I. B. Surya Prabhawa M.`
  * Role: `Kepala Desa`
* Ikon:

  * Notifikasi (badge)
  * Pengaturan / tema
  * Avatar user

### Gaya

* Background: Navy / Biru Tua
* Text: Putih
* Tinggi: ±64px

---

## 4. Sidebar Navigation

### Menu Aktif

* **Keuangan & Anggaran** (active)

Menu lain mengikuti standar global dashboard.

### Gaya

* Background: Putih
* Active state: Biru muda + indicator kiri
* Spacing item: 12–16px

---

## 5. KPI Keuangan (Ringkasan Atas)

### KPI Cards

1. **Total APBDes**

   * Value: `5.2M`
   * Sub: Tahun 2025

2. **Realisasi**

   * Value: `68%`
   * Sub: `3.5M dari 5.2M`

3. **Pemasukan**

   * Value: `580jt`
   * Sub: Bulan ini
   * Delta: `+8%`

4. **Pengeluaran**

   * Value: `520jt`
   * Sub: Bulan ini

### Gaya

* Card putih
* Border radius: 14–16px
* Icon lingkaran kanan
* Shadow lembut

---

## 6. Grafik Pemasukan vs Pengeluaran

### Deskripsi

* Tipe: Line Chart (2 series)
* Judul: `Pemasukan vs Pengeluaran`
* X-axis: Bulan (Apr – Okt)
* Y-axis: Nilai (juta rupiah)

### Warna

* Pemasukan: Hijau
* Pengeluaran: Merah

### Interaksi

* Tooltip hover
* Legend clickable (show/hide series)

### Data

```ts
{
  month: string;
  income: number; // juta
  expense: number; // juta
}
```

---

## 7. Alokasi Anggaran Per Sektor

### Deskripsi

* Tipe: Horizontal Bar Chart
* Sektor:

  * Pembangunan
  * Kesehatan
  * Pendidikan
  * Sosial
  * Kebudayaan
  * Teknologi

### Gaya

* Bar: Navy
* Label kiri

### Data

```ts
{
  sector: string;
  amount: number; // juta
}
```

---

## 8. Dana Bantuan & Hibah

### Deskripsi

* Tipe: List / Card
* Item:

  * Dana Desa (DD) – 1.8M – *cair*
  * Alokasi Dana Desa (ADD) – 950jt – *cair*
  * Bagi Hasil Pajak – 450jt – *cair*
  * Hibah Provinsi – 300jt – *proses*

### Gaya

* Status badge:

  * Cair: Hijau
  * Proses: Kuning

### Data

```ts
{
  source: string;
  amount: number;
  status: 'cair' | 'proses';
}
```

---

## 9. Laporan APBDes

### Struktur

#### Pendapatan

* Dana Desa – Rp 1.8M
* Alokasi Dana Desa – Rp 480jt
* Bagi Hasil Pajak & Retribusi – Rp 300jt
* Pendapatan Asli Desa – Rp 200jt
* Hibah Bantuan – Rp 300jt

**Total Pendapatan: Rp 3M**

#### Belanja

* Penyelenggaraan Pemerintah – Rp 425jt
* Pembangunan Desa – Rp 850jt
* Pembinaan Kemasyarakatan – Rp 320jt
* Pemberdayaan Masyarakat – Rp 380jt
* Penanggulangan Bencana – Rp 180jt

**Total Belanja: Rp 2.1M**

### Gaya

* Layout dua kolom
* Pendapatan: teks hijau
* Belanja: teks merah

---

## 10. Warna & Tema

### Palette

* Primary (Navy): `#1E3A5F`
* Success (Hijau): `#22C55E`
* Danger (Merah): `#EF4444`
* Secondary: `#3B82F6`
* Background App: `#F5F8FB`

---

## 11. Tipografi

* Font: Inter / Poppins / system-ui
* Heading: Semi-bold
* Body: Regular
* Nilai angka: Bold

---

## 12. Spasi & Grid

* Padding card: 16–24px
* Gap antar section: 24–32px
* Line-height: 1.5

---

## 13. Responsivitas

### Tablet

* KPI jadi 2 kolom
* Chart full width

### Mobile

* Sidebar jadi drawer
* KPI 1 kolom
* Grafik scroll horizontal jika perlu

---

## 14. Interaksi & Perilaku

* Hover card: shadow naik
* Tooltip chart
* Badge status dinamis
* Data async via API

---

## 15. Catatan Implementasi Teknis

* Framework: React + Vite
* UI Kit: Mantine / Shadcn / MUI
* Chart: Recharts / Chart.js
* Data: TanStack Query

---

## 16. Pengembangan Lanjutan

* Filter per tahun / bulan
* Export laporan (PDF / Excel)
* Drill-down transaksi
* Audit log perubahan

---

> Dokumen ini menjadi referensi utama implementasi halaman **Keuangan & Anggaran**.
