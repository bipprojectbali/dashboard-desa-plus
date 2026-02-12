# SOSIAL.md

Dokumen ini mendeskripsikan spesifikasi UI/UX, tata letak, gaya visual, serta ekspektasi data & interaksi untuk **Halaman Sosial Desa**. Digunakan sebagai acuan bersama antara UI/UX Designer, Frontend Developer, dan Backend/API.

---

## 1. Tujuan Halaman

Halaman **Sosial** berfungsi sebagai dashboard monitoring:

* Kesehatan masyarakat (ibu hamil, balita, stunting)
* Aktivitas Posyandu
* Pendidikan desa
* Beasiswa
* Event sosial & budaya

Fokus utama: **ringkas, informatif, real-time friendly**, dan mudah dipahami perangkat desa.

---

## 2. Tata Letak Keseluruhan

### Struktur Global

* **Sidebar kiri (persisten)**

  * Navigasi utama aplikasi desa
  * Menu aktif: `Sosial`

* **Topbar**

  * Nama desa
  * Profil user (Kepala Desa)
  * Notifikasi
  * Toggle tema (opsional)

* **Main Content Area (scrollable)**

  * Grid berbasis card
  * Layout desktop: 2–3 kolom
  * Mobile: 1 kolom (stack)

---

## 3. Komponen UI

### 3.1 Statistik Kesehatan (Summary Cards)

**Tipe:** KPI Cards

| Komponen         | Deskripsi                        |
| ---------------- | -------------------------------- |
| Ibu Hamil Aktif  | Total ibu hamil aktif saat ini   |
| Balita Terdaftar | Total balita tercatat            |
| Alert Stunting   | Jumlah kasus/peringatan stunting |
| Posyandu Aktif   | Jumlah posyandu yang aktif       |

**Elemen UI:**

* Angka besar (headline)
* Label kecil
* Ikon kontekstual

---

### 3.2 Statistik Kesehatan (Progress Bar)

Menampilkan capaian dalam bentuk **horizontal progress bar**:

* Imunisasi Lengkap
* Pemeriksaan Rutin
* Gizi Baik
* Target Stunting

**Behavior:**

* Persentase dinamis
* Warna bar menyesuaikan status (normal / warning)

---

### 3.3 Jadwal Posyandu

**Tipe:** List Card

Setiap item menampilkan:

* Nama Posyandu
* Tanggal
* Jam kegiatan

**Interaksi (opsional):**

* Klik item → detail jadwal
* Filter berdasarkan wilayah / tanggal

---

### 3.4 Pendidikan

**Tipe:** Informational List

#### Data Siswa

* TK / PAUD
* SD
* SMP
* SMA

#### Info Sekolah

* Jumlah lembaga pendidikan
* Jumlah tenaga pengajar

Layout sederhana, fokus ke angka.

---

### 3.5 Beasiswa Desa

**Tipe:** Highlight Card

* Jumlah penerima beasiswa
* Total dana tersalurkan
* Tahun ajaran

Digunakan sebagai **headline informasi bantuan pendidikan**.

---

### 3.6 Kalender Event Budaya

**Tipe:** Event List

Setiap event:

* Nama kegiatan
* Tanggal
* Lokasi

**Interaksi:**

* Klik → detail event
* Potensi integrasi kalender

---

## 4. Gaya & Tema Visual

### Warna

* **Primary:** Biru navy (#1F3A5F – estimasi)
* **Secondary:** Biru muda / abu terang
* **Success:** Hijau
* **Warning:** Oranye / Merah (stunting alert)

### Font

* Sans-serif modern (Inter / Poppins)
* Hierarki jelas:

  * Judul card
  * Angka utama
  * Label kecil

### Spasi & Bentuk

* Padding card: 16–24px
* Border radius: 12–16px
* Shadow ringan (soft elevation)

---

## 5. Responsivitas

### Desktop

* Grid 2–3 kolom
* Semua card terlihat tanpa overflow horizontal

### Tablet

* Grid 2 kolom

### Mobile

* 1 kolom (stack)
* KPI cards jadi swipe / vertical list

---

## 6. Ekspektasi Interaksi & Data

### Interaksi Umum

* Hover state pada card
* Click-through ke halaman detail
* Data auto-refresh (optional)

### Ekspektasi API (contoh)

```json
{
  "ibu_hamil": 87,
  "balita": 342,
  "alert_stunting": 12,
  "posyandu_aktif": 8,
  "kesehatan": {
    "imunisasi": 92,
    "pemeriksaan": 88,
    "gizi": 86,
    "stunting": 14
  }
}
```

---

## 7. Acceptance Checklist

* [ ] Semua data tampil konsisten
* [ ] Tidak ada overflow di mobile
* [ ] Progress bar sesuai persentase
* [ ] Event & jadwal dapat diklik
* [ ] Alert stunting terlihat jelas

---

**Catatan:**
Dokumen ini bersifat living document dan dapat diperluas ke modul detail (kesehatan, pendidikan, bantuan sosial).
