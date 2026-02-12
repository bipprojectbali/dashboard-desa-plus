# KEAMANAN

Dokumen ini mendeskripsikan spesifikasi UI/UX dan ekspektasi teknis untuk modul **Keamanan Lingkungan Desa** pada sistem dashboard DESA. Dokumen ini menjadi acuan bersama bagi tim desain, frontend, dan backend.

---

## 1. Tujuan Halaman

Memberikan visibilitas real-time dan historis terhadap kondisi keamanan desa, meliputi:

* Status CCTV aktif
* Laporan kejadian keamanan
* Peta lokasi CCTV
* Monitoring tren dan respons kejadian

Target pengguna utama:

* Kepala Desa
* Perangkat Desa / Petugas Keamanan

---

## 2. Struktur Tata Letak (Layout)

### 2.1 Pola Umum

* **Layout dashboard dua kolom**

  * Kolom kiri: monitoring visual (peta)
  * Kolom kanan: daftar laporan keamanan
* Header KPI ringkas di bagian atas
* Semua konten dibungkus dalam **card container** dengan radius konsisten

Grid:

* Desktop: 12-column grid
* Tablet: 8-column grid
* Mobile: 1-column (stack vertikal)

---

## 3. Komponen UI

### 3.1 KPI Cards (Header)

1. **CCTV Aktif**

   * Value: `20`
   * Subtext: `Kamera Online`
   * Ikon: Kamera CCTV

2. **Laporan Keamanan**

   * Value: `15`
   * Subtext: `Minggu ini`
   * Ikon: Chat / laporan

Perilaku:

* Tooltip saat hover (penjelasan metrik)
* Klik opsional → navigasi ke halaman detail

---

### 3.2 Peta Keamanan CCTV

**Judul Card:** Peta Keamanan CCTV
**Subjudul:** Titik Lokasi CCTV

Isi:

* Embedded map (Google Maps / Mapbox)
* Marker lokasi CCTV

  * Hijau: aktif
  * Abu-abu: offline (future)

Kontrol:

* Toggle tampilan (grid / fullscreen)
* Zoom in / out

Interaksi:

* Klik marker → popup info CCTV

  * ID CCTV
  * Lokasi
  * Status
  * Waktu terakhir aktif

---

### 3.3 Daftar Laporan Keamanan

**Judul:** Laporan Keamanan Lingkungan

Item laporan (card list):

* Judul kejadian (contoh: *Pencurian Motor*)
* Timestamp relatif ("2 jam yang lalu")
* Tanggal & jam
* Lokasi kejadian
* Badge status: `Baru`

Perilaku:

* Scrollable container
* Klik item → detail laporan (modal / halaman baru)

---

## 4. Gaya & Tema Visual

### 4.1 Warna

* Primary: Navy Blue (`#1F3A5F` – perkiraan)
* Background: Light Blue / Off-white (`#F5F9FC`)
* Card: Putih
* Success: Hijau (status aktif)
* Alert: Merah muda / merah untuk laporan baru

### 4.2 Tipografi

* Font utama: Sans-serif modern (Inter / Poppins)
* Heading: Semi-bold
* Body text: Regular
* Angka KPI: Bold

Ukuran relatif:

* Heading: 16–18px
* Body: 13–14px
* KPI Value: 22–28px

### 4.3 Spasi & Elevasi

* Padding card: 16–20px
* Gap antar card: 16px
* Border radius: 12–16px
* Shadow ringan untuk card

---

## 5. Responsivitas

### Desktop

* Peta dan laporan tampil berdampingan

### Tablet

* KPI tetap horizontal
* Peta dan laporan bisa stack 2 baris

### Mobile

* Semua komponen stack vertikal
* Peta dalam mode scroll / fullscreen
* List laporan menjadi full-width

---

## 6. Ekspektasi Interaksi & UX

* Hover state pada card & list item
* Tooltip pada ikon KPI
* Loading skeleton saat data fetch
* Empty state bila tidak ada laporan
* Badge status real-time (baru / diproses / selesai – future)

---

## 7. Ekspektasi Data (Backend Contract)

### 7.1 KPI Summary

```json
{
  "cctvActive": 20,
  "securityReportsWeekly": 15
}
```

### 7.2 CCTV Locations

```json
[
  {
    "id": "CCTV-01",
    "lat": -8.5,
    "lng": 115.2,
    "status": "active",
    "lastSeen": "2025-10-06T14:30:00Z"
  }
]
```

### 7.3 Security Reports

```json
[
  {
    "id": "REP-001",
    "title": "Pencurian Motor",
    "reportedAt": "2025-10-06T15:30:00Z",
    "location": "Jl. Kecubung 20",
    "status": "new"
  }
]
```

---

## 8. Catatan Pengembangan Lanjutan

* Filter laporan berdasarkan jenis & waktu
* Integrasi snapshot CCTV
* Heatmap area rawan
* Role-based access (admin / petugas)

---

Dokumen ini wajib diperbarui bila terdapat perubahan UI atau kebutuhan data pada modul **Keamanan**.
