# Jenna Analytic – Dashboard Design Specification

Dokumen ini menjelaskan desain halaman **Jenna Analytic** berdasarkan screenshot (11 Feb 2026). Dokumen ini menjadi acuan implementasi UI/UX, data, dan interaksi untuk halaman analitik chatbot desa.

---

## 1. Tujuan Halaman

Jenna Analytic berfungsi sebagai **dashboard analitik chatbot layanan desa**, berfokus pada:

* Volume interaksi warga
* Performa jawaban otomatis
* Respons manual & waktu respons
* Pola pertanyaan dan jam sibuk

Target user utama:

* Kepala Desa
* Admin pelayanan
* Operator chatbot

---

## 2. Tata Letak Keseluruhan (Layout)

### 2.1 Struktur Global

```
+------------------------------------------------------+
| Topbar / Header                                      |
+-------------+----------------------------------------+
| Sidebar     | Main Content                           |
|             | - KPI Cards (Row)                      |
|             | - Bar Chart Interaksi                  |
|             | - Topik Terbanyak + Jam Tersibuk       |
+-------------+----------------------------------------+
```

* Sidebar: fixed kiri
* Header: fixed atas
* Main content: scroll vertical

---

## 3. Header (Topbar)

### Komponen

* Judul: `Desa Darmasaba`
* User Info:

  * Nama: `I. B. Surya Prabhawa M.`
  * Role: `Kepala Desa`
* Ikon:

  * Notification (badge angka merah)
  * Theme toggle / setting
  * Avatar (lingkaran)

### Gaya

* Background: Navy / Biru Tua
* Text: Putih
* Tinggi: ±64px
* Shadow: subtle

---

## 4. Sidebar Navigation

### Elemen

* Logo DESA+
* Search input: `cari apa saja`
* Menu:

  * Beranda
  * Kinerja Divisi
  * Pengaduan & Layanan Publik
  * **Jenna Analytic (active)**
  * Demografi & Kependudukan
  * Keuangan & Anggaran
  * Bumdes & UMKM Desa
  * Sosial
  * Keamanan
  * Bantuan
  * Pengaturan

### Gaya

* Background: Putih
* Active state:

  * Background biru muda
  * Border kiri / highlight
* Spacing menu: 12–16px

---

## 5. KPI Cards (Ringkasan Atas)

### Daftar KPI

1. **Interaksi Hari Ini**

   * Value: `61`
   * Delta: `+15% dari kemarin`

2. **Jawaban Otomatis**

   * Value: `87%`
   * Sub: `53 dari 61 interaksi`

3. **Belum Ditindak**

   * Value: `8`
   * Sub: `Perlu respon manual`

4. **Waktu Respon**

   * Value: `2.3 sec`
   * Sub: `Rata-rata`

### Gaya

* Card putih
* Radius: 14–16px
* Icon di kanan
* Shadow lembut
* Grid 4 kolom (desktop)

---

## 6. Grafik Interaksi Chatbot

### Deskripsi

* Tipe: Bar Chart
* Judul: `Interaksi Chatbot`
* X-axis: Hari (Sen–Min)
* Y-axis: Jumlah interaksi

### Gaya

* Warna bar: Navy / Biru tua
* Grid minimal
* Tooltip saat hover

### Data Expectation

```ts
{
  day: 'Sen' | 'Sel' | 'Rab' | 'Kam' | 'Jum' | 'Sab' | 'Min';
  total: number;
}
```

---

## 7. Topik Pertanyaan Terbanyak

### Deskripsi

* Tipe: Ranked list
* Isi:

  * Cara mengurus KTP – 89x
  * Syarat Kartu Keluarga – 76x
  * Jadwal Posyandu – 64x
  * Pengaduan jalan rusak – 52x
  * Info program bansos – 48x

### Gaya

* Card putih
* Item list rounded
* Count di kanan

### Data

```ts
{
  topic: string;
  count: number;
}
```

---

## 8. Jam Tersibuk

### Deskripsi

* Menampilkan distribusi interaksi berdasarkan waktu

| Waktu         | Persentase |
| ------------- | ---------- |
| Pagi (08–12)  | 30%        |
| Siang (12–16) | 40%        |
| Sore (16–20)  | 20%        |
| Malam (20–08) | 10%        |

### Gaya

* Horizontal bar / progress
* Label kiri, persentase kanan

---

## 9. Warna & Tema

### Palette

* Primary (Navy): `#1E3A5F`
* Secondary: `#3B82F6`
* Success: `#22C55E`
* Warning: `#FACC15`
* Danger: `#EF4444`
* Background App: `#F5F8FB`

---

## 10. Tipografi

* Font: Inter / Poppins / system-ui
* Heading: Semi-bold
* Body: Regular
* KPI number: Bold, besar

---

## 11. Spasi & Grid

* Padding card: 16–24px
* Gap grid: 20–24px
* Line-height body: 1.5

---

## 12. Responsivitas

### Tablet

* KPI jadi 2 kolom
* Chart full width

### Mobile

* Sidebar jadi drawer
* KPI 1 kolom
* Chart & list stack vertical

---

## 13. Interaksi & Perilaku

* Hover card: shadow meningkat
* Tooltip chart
* KPI clickable (future drill-down)
* Data async dari API

---

## 14. Catatan Implementasi Teknis

* Framework: React + Vite
* UI: Mantine / Shadcn / MUI
* Chart: Recharts / Chart.js
* State: TanStack Query / SWR

---

## 15. Pengembangan Lanjutan

* Filter tanggal
* Export CSV
* Drill-down per topik
* Alert SLA respon

---

> Dokumen ini bersifat **design & data contract** antara UI, frontend, dan backend.
