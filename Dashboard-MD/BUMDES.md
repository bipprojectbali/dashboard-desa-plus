# BUMDES & UMKM Desa — UI & Functional Specification

Dokumen ini menjelaskan spesifikasi **UI, tata letak, gaya visual, responsivitas, serta ekspektasi data & interaksi** untuk halaman **BUMDes & UMKM Desa (Jenna Analytic Module)**. Dokumen ini menjadi kontrak desain antara **UI/UX, Frontend, dan Backend**.

---

## 1. Tujuan Halaman

Halaman **BUMDes & UMKM Desa** berfungsi sebagai dashboard monitoring:

* Aktivitas UMKM desa
* Performa penjualan produk unggulan
* Omzet BUMDes
* Stok & tren produk

Target pengguna:

* Kepala Desa
* Admin Desa
* Operator BUMDes

---

## 2. Tata Letak Keseluruhan (Layout)

### 2.1 Struktur Utama

Layout menggunakan pola **Dashboard Sidebar Layout**:

* **Sidebar kiri (fixed)**
* **Topbar/header (fixed)**
* **Main content (scrollable)**

Grid utama:

* Desktop: `12-column grid`
* Tablet: `8-column grid`
* Mobile: `4-column grid`

---

### 2.2 Sidebar

Komponen:

* Logo DESA + tagline
* Search bar ("cari apa saja")
* Menu navigasi vertikal

Menu aktif:

* **Bumdes & UMKM Desa** (highlight biru muda)

Perilaku:

* Collapsible pada layar kecil
* Ikon + label (label hidden di mobile)

---

### 2.3 Topbar

Komponen:

* Nama desa
* Nama & jabatan user
* Avatar user
* Ikon notifikasi (badge)
* Ikon pengaturan

Perilaku:

* Sticky
* Dropdown user menu

---

## 3. Komponen UI Utama

### 3.1 KPI Cards (Ringkasan Atas)

Menampilkan ringkasan metrik utama:

| KPI            | Deskripsi              |
| -------------- | ---------------------- |
| UMKM Aktif     | Jumlah UMKM beroperasi |
| UMKM Terdaftar | Total UMKM terdaftar   |
| Omzet          | Omzet BUMDes per bulan |
| Kategori UMKM  | Jumlah kategori aktif  |

Karakteristik:

* Card rounded
* Icon di kanan
* Angka besar (headline)

---

### 3.2 Update Penjualan Produk

Komponen:

* Section header berwarna biru gelap
* Button filter waktu:

  * "Minggu ini"
  * "Bulan ini"

Perilaku:

* Toggle data chart & tabel
* Default: Bulan ini

---

### 3.3 Produk Unggulan (Left Column)

Sub-komponen:

1. **Total Penjualan**

   * Nominal
   * Persentase perubahan

2. **Produk Aktif**

   * Jumlah produk
   * Jumlah kategori

3. **Total Transaksi**

   * Jumlah transaksi bulan berjalan

4. **Top 3 Produk Terlaris**

   * Ranking
   * Nama produk
   * Pelaku UMKM
   * Growth indicator

---

### 3.4 Detail Penjualan Produk (Right Column)

Bentuk:

* Tabel data

Kolom:

* Produk
* Penjualan bulan ini
* Bulan lalu
* Trend
* Volume
* Stok
* Aksi

Elemen khusus:

* Trend: arrow hijau/merah
* Stok: badge warna (aman / kritis)
* Aksi: tombol "Detail"

Filter:

* Dropdown filter kategori / stok

---

## 4. Gaya & Tema Visual

### 4.1 Warna

| Elemen     | Warna                     |
| ---------- | ------------------------- |
| Primary    | Biru tua (#183A63 approx) |
| Secondary  | Biru muda (#E6F0FF)       |
| Success    | Hijau (#22C55E)           |
| Danger     | Merah (#EF4444)           |
| Background | Abu muda / putih          |

---

### 4.2 Tipografi

* Font family: **Inter / Poppins / Sans-serif modern**
* Heading: Semi-bold
* Body text: Regular
* Angka KPI: Bold

Ukuran:

* H1: 24–28px
* H2: 18–20px
* Body: 14–16px

---

### 4.3 Spasi & Card

* Padding card: 16–20px
* Gap antar card: 16px
* Border radius: 12–16px
* Shadow ringan

---

## 5. Responsivitas

### Desktop

* Sidebar terbuka penuh
* Tabel full

### Tablet

* Sidebar collapse
* KPI card wrap

### Mobile

* Sidebar drawer
* KPI card stack
* Tabel menjadi card list

---

## 6. Interaksi & UX Behavior

* Hover effect pada card & row tabel
* Tooltip pada ikon & trend
* Loading skeleton saat fetch data
* Empty state ("Belum ada data")

---

## 7. Ekspektasi Data (Backend Contract)

### KPI API

```json
{
  "umkmAktif": 45,
  "umkmTerdaftar": 68,
  "omzet": 48000000,
  "kategori": 34
}
```

### Produk API

```json
{
  "produk": "Beras Premium Organik",
  "penjualanBulanIni": 8500000,
  "bulanLalu": 8500000,
  "trend": 10,
  "volume": "650 Kg",
  "stok": "850 Kg"
}
```

---

## 8. Catatan Implementasi Teknis

* Frontend: React + Vite
* State management: query-based (TanStack Query)
* Chart (jika ditambah): Recharts / Chart.js
* Format uang: Intl.NumberFormat("id-ID")

---

## 9. Acceptance Checklist

* [ ] Semua KPI muncul & valid
* [ ] Filter waktu berfungsi
* [ ] Trend naik/turun akurat
* [ ] Responsif mobile
* [ ] Empty & loading state tersedia

---

Dokumen ini bersifat **final reference** untuk implementasi halaman **BUMDes & UMKM Desa**.
