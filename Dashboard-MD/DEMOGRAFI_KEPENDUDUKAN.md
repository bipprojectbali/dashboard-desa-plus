# Demografi & Kependudukan – Dashboard Design Specification

Dokumen ini menjelaskan spesifikasi desain halaman **Demografi & Kependudukan** berdasarkan screenshot (11 Feb 2026). Dokumen ini berfungsi sebagai **design + data contract** untuk implementasi frontend dan backend.

---

## 1. Tujuan Halaman

Halaman **Demografi & Kependudukan** digunakan untuk:

* Monitoring kondisi penduduk desa secara ringkas
* Analisis umur, pekerjaan, agama
* Distribusi penduduk per wilayah (banjar)
* Dinamika penduduk (lahir, meninggal, migrasi)

Target user:

* Kepala Desa
* Admin Kependudukan
* Perencana Desa

---

## 2. Tata Letak Keseluruhan

### 2.1 Struktur Layout

```
+------------------------------------------------------+
| Topbar / Header                                      |
+-------------+----------------------------------------+
| Sidebar     | Main Content                           |
|             | - KPI Kependudukan                     |
|             | - Grafik Umur & Pekerjaan              |
|             | - Agama + Data per Banjar              |
|             | - Statistik Dinamika                   |
+-------------+----------------------------------------+
```

* Sidebar: fixed di kiri
* Header: fixed di atas
* Konten utama: scroll vertikal

---

## 3. Header (Topbar)

### Komponen

* Judul aplikasi: `Desa Darmasaba`
* User info:

  * Nama: `I. B. Surya Prabhawa M.`
  * Role: `Kepala Desa`
* Ikon:

  * Notifikasi (badge)
  * Toggle tema
  * Avatar user

### Gaya

* Background: Biru tua / Navy
* Teks: Putih
* Tinggi: ±64px

---

## 4. Sidebar Navigation

### Menu

* Beranda
* Kinerja Divisi
* Pengaduan & Layanan Publik
* Jenna Analytic
* **Demografi & Kependudukan (active)**
* Keuangan & Anggaran
* Bumdes & UMKM Desa
* Sosial
* Keamanan
* Bantuan
* Pengaturan

### Gaya

* Background: Putih
* Active state: biru muda + indicator kiri
* Spacing menu: 12–16px

---

## 5. KPI Kependudukan (Row Atas)

### KPI Cards

1. **Total Penduduk**

   * Value: `5.634`
   * Sub: Aktif terdaftar

2. **Kepala Keluarga**

   * Value: `1.354`
   * Sub: Total KK

3. **Kelahiran**

   * Value: `23`
   * Sub: Tahun ini

4. **Kemiskinan**

   * Value: `324`
   * Delta: `-10% dari tahun lalu`

### Gaya

* Card putih
* Border radius: 14–16px
* Icon lingkaran di kanan
* Shadow lembut

---

## 6. Grafik Pengelompokan Umur

### Deskripsi

* Tipe: Bar Chart
* X-axis:

  * 17–25 thn
  * 26–35 thn
  * 36–45 thn
  * 46–55 thn
  * 56–65 thn
  * 65+ thn
* Y-axis: jumlah penduduk

### Gaya

* Warna bar: Navy
* Grid minimal
* Tooltip saat hover

### Data

```ts
{
  ageRange: string;
  total: number;
}
```

---

## 7. Demografi Pekerjaan

### Deskripsi

* Tipe: Bar Chart
* Kategori:

  * Sipil
  * Guru
  * Petani
  * Pedagang
  * Wiraswasta

### Gaya

* Warna bar: Navy
* Tinggi chart medium

### Data

```ts
{
  job: string;
  total: number;
}
```

---

## 8. Distribusi Agama

### Deskripsi

* Tipe: Pie / Donut Chart
* Kategori:

  * Hindu – 4.234
  * Islam – 856
  * Kristen – 412
  * Buddha – 202

### Gaya

* Warna berbeda per agama
* Legend di sekitar chart

### Data

```ts
{
  religion: string;
  total: number;
}
```

---

## 9. Data per Banjar

### Deskripsi

* Tipe: Table
* Kolom:

  * Banjar
  * Penduduk
  * KK
  * Miskin

### Contoh Data

* Banjar Darmasaba
* Banjar Manesa
* Banjar Cabe
* Banjar Penenjoan
* Banjar Baler Pasar
* Banjar Bucu

### Gaya

* Table bersih
* Header bold
* Angka miskin berwarna merah

### Data

```ts
{
  banjar: string;
  population: number;
  kk: number;
  poor: number;
}
```

---

## 10. Statistik Dinamika Penduduk

### KPI Mini Cards

* Kelahiran: `23`
* Kematian: `12`
* Pindah Masuk: `45`
* Pindah Keluar: `32`

### Gaya

* Card kecil
* Icon panah / lokasi
* Warna indikator:

  * Hijau (positif)
  * Merah (negatif)

---

## 11. Warna & Tema

### Palette

* Primary (Navy): `#1E3A5F`
* Secondary: `#3B82F6`
* Success: `#22C55E`
* Warning: `#FACC15`
* Danger: `#EF4444`
* Background App: `#F5F8FB`

---

## 12. Tipografi

* Font: Inter / Poppins / system-ui
* Heading: Semi-bold
* Body: Regular
* Angka KPI: Bold, besar

---

## 13. Spasi & Grid

* Padding card: 16–24px
* Gap antar grid: 20–24px
* Line-height: 1.5

---

## 14. Responsivitas

### Tablet

* KPI jadi 2 kolom
* Grafik stack vertikal

### Mobile

* Sidebar jadi drawer
* Semua konten 1 kolom
* Table scroll horizontal

---

## 15. Interaksi & Perilaku

* Tooltip pada chart
* Hover row table
* Filter data (future)
* Data async via API

---

## 16. Catatan Implementasi Teknis

* Framework: React + Vite
* UI Kit: Mantine / Shadcn / MUI
* Chart: Recharts / Chart.js / ECharts
* Data: TanStack Query

---

## 17. Pengembangan Lanjutan

* Filter per tahun
* Drill-down per banjar
* Export PDF / Excel
* Heatmap kependudukan

---

> Dokumen ini menjadi referensi utama implementasi halaman **Demografi & Kependudukan**.
