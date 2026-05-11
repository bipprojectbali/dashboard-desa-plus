# feat/dashboard-prefs-functional

**Branch:** `feat/dashboard-prefs-functional`  
**Tanggal:** 2026-05-11  
**Commit:** `c467d51`

---

## Latar Belakang

Setting di tab **Umum** (`/pengaturan/umum`) memiliki 4 preferensi dashboard yang tersimpan ke DB tapi tidak punya consumer — `tampilkanGrid`, `refreshOtomatis`, `intervalRefresh`, dan `animasiTransisi` — sehingga perubahan yang disimpan user tidak berpengaruh apa-apa di UI. Selain itu, `formatTanggal` juga belum ditampilkan di tempat manapun.

---

## Perubahan

### 1. `src/store/i18n.ts` — Tambah 5 field baru ke `i18nStore`

| Field | Type | Default |
|-------|------|---------|
| `formatTanggal` | `"DD/MM/YYYY" \| "MM/DD/YYYY" \| "YYYY-MM-DD"` | `"DD/MM/YYYY"` |
| `refreshOtomatis` | `boolean` | `true` |
| `intervalRefresh` | `string` | `"1"` (30 detik) |
| `tampilkanGrid` | `boolean` | `true` |
| `animasiTransisi` | `boolean` | `true` |

Tambah `setDashboardPrefs()` untuk update keempat prefs sekaligus, `setFormatTanggal()`, dan helper `intervalToMs()` untuk konversi nilai string interval ke milidetik.

**Mapping interval:**

| Value | Durasi |
|-------|--------|
| `"1"` | 30 detik |
| `"2"` | 1 menit |
| `"3"` | 5 menit |
| `"4"` | 15 menit |

---

### 2. `src/hooks/useAutoRefresh.ts` — Hook baru

Memanggil `fetchFn` secara otomatis via `setInterval` berdasarkan `refreshOtomatis` dan `intervalRefresh` dari store. Tidak melakukan initial fetch — komponen tetap bertanggung jawab atas fetch pertama. Interval di-reset otomatis saat setting berubah karena membaca dari `useSnapshot(i18nStore)`.

---

### 3. `src/hooks/use-sidebar-fullscreen.ts` — Triple-click collapse

- Ubah threshold collapse dari **2 klik** menjadi **3 klik**
- Timeout reset click count diperlebar dari 300ms → 500ms agar klik ketiga masih terhitung

---

### 4. `src/components/pengaturan/umum.tsx` — Sync store

`setDashboardPrefs()` dan `setFormatTanggal()` kini dipanggil di tiga titik:

| Event | Aksi |
|-------|------|
| Load preferensi dari API | Sync semua 5 field ke store |
| Simpan berhasil | Sync ulang dari response server |
| Batal | Rollback ke `savedPrefs` |

---

### 5. `src/components/header.tsx` — Tampilkan tanggal

Menambah state `tanggal` yang dihitung ulang setiap kali `zonaWaktu` atau `formatTanggal` berubah menggunakan `Intl.DateTimeFormat`. Ditampilkan di bawah jam dalam format `11/05/2026 · Jakarta` (atau format lain sesuai pilihan).

---

### 6. `tampilkanGrid` — 4 komponen, 8 chart

Semua `<CartesianGrid>` dibungkus `{tampilkanGrid && ...}`:

| Komponen | Jumlah CartesianGrid |
|----------|---------------------|
| `demografi-pekerjaan.tsx` | 3 |
| `pengaduan-layanan-publik.tsx` | 2 |
| `jenna-analytic.tsx` | 1 |
| `keuangan-anggaran.tsx` | 2 |

Perubahan reaktif real-time — tidak perlu reload.

---

### 7. `refreshOtomatis + intervalRefresh` — 3 komponen

`useAutoRefresh(fetchData)` diterapkan ke:

- `demografi-pekerjaan.tsx` — sudah pakai `useCallback`, tinggal tambah hook
- `pengaduan-layanan-publik.tsx` — `fetchData` direfaktor dari `async function` di dalam `useEffect` menjadi `useCallback` agar bisa di-pass ke hook
- `keuangan-anggaran.tsx` — sudah pakai `useCallback`

**Tidak diterapkan ke:** `jenna-analytic.tsx` (data hardcoded statis), BUMDes, Sosial, Kinerja Divisi, Keamanan, Bantuan (tidak punya `fetchData`).

---

### 8. `src/components/layout/main-layout.tsx` — animasiTransisi + UX fix

- CSS `transition` di `AppShell.Main` di-toggle: aktif saat `animasiTransisi: true`, `none` saat false
- Hapus `cursor: pointer` di area konten utama — sebelumnya selalu terlihat seperti area klikable

---

## Status Setting Umum

| Setting | Status Sebelum | Status Sesudah |
|---------|----------------|----------------|
| Bahasa | ✅ Functional | ✅ Functional |
| Zona Waktu | ✅ Functional | ✅ Functional |
| Format Tanggal | ✅ Tersimpan, ❌ tidak ditampilkan | ✅ Ditampilkan di header |
| Refresh Otomatis | ✅ Tersimpan, ❌ tidak berfungsi | ✅ Polling aktif di 3 halaman |
| Interval Refresh | ✅ Tersimpan, ❌ tidak berfungsi | ✅ Menentukan durasi polling |
| Tampilkan Grid | ✅ Tersimpan, ❌ tidak berfungsi | ✅ Toggle 8 chart real-time |
| Animasi Transisi | ✅ Tersimpan, ❌ tidak berfungsi | ✅ Toggle CSS transition |

---

## Catatan

- Branch ini **belum di-merge ke `stg`**
- `jenna-analytic.tsx` tidak mendapat auto-refresh karena datanya masih hardcoded — perlu disambungkan ke API dulu
- Animasi transisi saat ini hanya menyentuh `AppShell.Main`; bisa diperluas ke perpindahan halaman (TanStack Router transition) jika diperlukan
