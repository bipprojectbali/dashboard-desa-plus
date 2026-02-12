# KINERJA-DIVISI-2

## 1. Tujuan Halaman

Halaman **Kinerja Divisi** berfungsi sebagai dashboard operasional untuk memantau progres pekerjaan lintas divisi perangkat desa secara real-time, mencakup status tugas, arsip digital, kegiatan, diskusi internal, dan statistik pendukung.

Halaman ini dipakai oleh:

* Kepala Desa
* Sekretaris Desa
* Kepala Divisi
* Admin Operasional

---

## 2. Struktur Tata Letak (Overall Layout)

### Pola Layout

* **Dashboard berbasis Card + Grid**
* Scroll vertikal satu halaman
* Tidak ada sidebar khusus (diasumsikan sudah ada global sidebar)

### Urutan Section (Top → Bottom)

1. Grafik Progres Tugas per Divisi
2. Ringkasan Tugas per Divisi (Sekretariat, Keuangan, Sosial, Humas)
3. Arsip Digital Perangkat Desa
4. Kartu Progres Kegiatan (Event / Program)
5. Statistik Dokumen & Progres Kegiatan
6. Diskusi Internal
7. Agenda / Acara Hari Ini

---

## 3. Komponen UI

### 3.1 Grafik Progres Tugas per Divisi

**Tipe:** Grouped Bar Chart

**Data:**

* Divisi: Sekretariat, Keuangan, Sosial, Humas
* Status:

  * Selesai
  * Berjalan
  * Tertunda

**Interaksi:**

* Hover tooltip menampilkan jumlah tugas
* Legend clickable (toggle series)

---

### 3.2 Card Ringkasan Divisi

Setiap divisi memiliki satu card berisi daftar tugas.

**Struktur Card:**

* Judul divisi
* List tugas:

  * Nama tugas
  * Badge status: `selesai | proses | tertunda`

**Status Badge:**

* Hijau: Selesai
* Kuning: Proses
* Merah: Tertunda

---

### 3.3 Arsip Digital Perangkat Desa

**Tipe:** Action Card / Button Card

**Item:**

* Surat Keputusan
* Laporan Keuangan
* Dokumentasi
* Notulensi Rapat

**Interaksi:**

* Klik membuka modul arsip
* Role-based access (view / upload)

---

### 3.4 Progres Kegiatan / Program

**Tipe:** Progress Card

**Isi:**

* Nama kegiatan
* Progress bar horizontal
* Tanggal
* Badge status (selesai)

---

### 3.5 Statistik Dokumen

#### a. Jumlah Dokumen

**Tipe:** Bar Chart

* Kategori: Gambar, Dokumen

#### b. Progres Kegiatan

**Tipe:** Pie Chart

**Status:**

* Selesai
* Dikerjakan
* Segera Dikerjakan
* Dibatalkan

---

### 3.6 Diskusi Internal

**Tipe:** List Card

**Isi:**

* Judul diskusi
* Pengirim
* Timestamp

**Interaksi:**

* Klik membuka thread diskusi

---

### 3.7 Agenda / Acara Hari Ini

**Tipe:** Informational Card

**State:**

* Empty state: "Tidak ada acara hari ini"

---

## 4. Gaya & Tema Visual

### 4.1 Warna

* Background utama: `#0F172A` / `#111827`
* Card: `#1E293B`
* Primary accent: Biru tua
* Success: Hijau
* Warning: Kuning
* Danger: Merah

### 4.2 Tipografi

* Font utama: **Inter / Poppins**
* Heading: Semi-bold
* Body: Regular
* Angka & statistik: Medium

### 4.3 Spasi & Radius

* Padding card: 16–24px
* Gap grid: 16–20px
* Border radius: 12–16px

---

## 5. Responsivitas

### Desktop

* Multi-column grid (2–4 kolom)

### Tablet

* Grid 2 kolom
* Grafik full-width

### Mobile

* Semua card 1 kolom
* Chart di-scroll horizontal bila perlu

---

## 6. Ekspektasi Interaksi & Data

### 6.1 State Management

* Filter status tugas
* Sinkronisasi real-time (polling / websocket)

### 6.2 Contoh Struktur Data

```json
{
  "division": "Keuangan",
  "tasks": [
    { "title": "Laporan APBDes", "status": "selesai" },
    { "title": "Verifikasi Dana", "status": "tertunda" }
  ]
}
```

---

## 7. Acceptance Criteria

* Semua status warna konsisten
* Chart sesuai data backend
* Empty state ditampilkan bila data kosong
* Mobile friendly tanpa overflow

---

## 8. Catatan Implementasi

* Chart library: Chart.js / Recharts / ECharts
* Dark mode default
* Akses berbasis role (viewer, editor, admin)

---

**Status Dokumen:** Final Draft
**Digunakan untuk:** Implementasi Frontend & Kontrak API
