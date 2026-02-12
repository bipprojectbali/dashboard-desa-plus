# PENGADUAN-2.md

## 1. Tujuan Halaman

Dashboard **Pengaduan Masyarakat** berfungsi untuk memantau, menganalisis, dan menindaklanjuti pengaduan warga secara real-time. Halaman ini mendukung **Light Mode** dan **Dark Mode** dengan struktur UI dan interaksi yang konsisten.

---

## 2. Struktur Komponen UI

### 2.1 Summary Cards (Statistik Utama)

Menampilkan ringkasan status pengaduan bulan berjalan.

**Komponen:**

* Total Pengaduan
* Baru (Belum diproses)
* Diproses (Sedang ditangani)
* Selesai (Terselesaikan)

**Elemen UI:**

* Angka utama (bold, besar)
* Label deskriptif
* Ikon status (chat, alert, clock, check)

**Interaksi:**

* Hover: efek elevasi + highlight border
* Click (opsional): filter dashboard berdasarkan status

---

### 2.2 Grafik Tren Pengaduan (Line Chart)

Menampilkan jumlah pengaduan per bulan.

**Komponen:**

* Sumbu X: Bulan
* Sumbu Y: Jumlah pengaduan
* Garis tren + titik data

**Interaksi:**

* Tooltip saat hover (bulan & jumlah)
* Toggle range waktu (bulanan/tahunan – opsional)

---

### 2.3 Surat Terbanyak (Horizontal Bar Chart)

Menunjukkan jenis surat/pengaduan yang paling sering diajukan.

**Contoh Data:**

* KTP
* KK
* Domisili
* Usaha
* Lainnya

**Interaksi:**

* Hover tooltip
* Click bar → filter daftar pengajuan

---

### 2.4 Pengajuan Terbaru (List)

Daftar pengaduan terbaru dari warga.

**Isi Item:**

* Nama pengaju
* Jenis pengaduan
* Waktu pengajuan
* Badge status: Baru / Diproses / Selesai

**Interaksi:**

* Click item → halaman detail
* Scrollable list

---

### 2.5 Ajuan Ide Inovatif (List)

Menampilkan ide/inisiatif warga untuk desa.

**Isi Item:**

* Nama pengaju
* Judul ide
* Kategori
* Tombol "Detail"

---

## 3. Tata Letak Keseluruhan (Layout)

**Desktop:**

* Grid 12 kolom
* Baris 1: 4 Summary Cards
* Baris 2: Line Chart (full width)
* Baris 3: 3 kolom (Bar Chart, Pengajuan Terbaru, Ide Inovatif)

**Tablet:**

* Summary card 2x2
* Chart full width
* List stack vertikal

**Mobile:**

* Semua komponen stacked
* Chart scroll horizontal

---

## 4. Gaya & Tema Visual

### 4.1 Light Mode

**Warna:**

* Background utama: #F6F9FC
* Card: #FFFFFF
* Primary: #2563EB (Blue)
* Text utama: #0F172A
* Text sekunder: #64748B
* Border: #E2E8F0

**Chart:**

* Line: Biru
* Bar: Biru tua
* Grid: Abu muda

---

### 4.2 Dark Mode

**Warna:**

* Background utama: #0B1220
* Card: #111827 / #0F172A
* Primary: #3B82F6
* Text utama: #E5E7EB
* Text sekunder: #9CA3AF
* Border: #1F2937

**Chart:**

* Line: Biru terang
* Bar: Biru medium
* Grid: Abu gelap

---

## 5. Tipografi

* Font utama: Inter / Poppins
* Heading: 600–700
* Body: 400–500
* Angka statistik: 700

---

## 6. Spasi & Radius

* Padding card: 16–24px
* Gap grid: 16–24px
* Border radius card: 12–16px
* Icon container: circle / rounded-full

---

## 7. Responsivitas

* Mobile-first
* Breakpoint umum: 640px, 768px, 1024px
* Chart auto-resize
* List menjadi full-width

---

## 8. Ekspektasi Data & Interaksi Backend

### 8.1 Contoh Data Summary

```json
{
  "total": 42,
  "baru": 14,
  "diproses": 14,
  "selesai": 14
}
```

### 8.2 Contoh Data Tren

```json
[
  { "bulan": "Apr", "jumlah": 30 },
  { "bulan": "Mei", "jumlah": 50 },
  { "bulan": "Jun", "jumlah": 42 }
]
```

---

## 9. Catatan Teknis

* Chart: Recharts / Chart.js / ECharts
* State: loading, empty, error
* Theme switch: CSS variable / Tailwind dark mode
* Konsistensi warna status di seluruh modul

---

Dokumen ini menjadi **UI Spec + UX Contract** untuk modul Pengaduan dan siap diturunkan ke desain Figma maupun implementasi Frontend.
