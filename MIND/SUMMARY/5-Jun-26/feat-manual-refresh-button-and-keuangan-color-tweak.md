# Feat: Tombol Refresh Manual & Tweak Warna Card Keuangan

**Tanggal:** 5 Juni 2026
**Branch:** `feat/manual-refresh-and-keuangan-color-tweak`
**Merged ke:** `stg`

---

## Latar Belakang

Setelah integrasi `useAutoRefresh` (lihat [[fix-auto-refresh-and-theme-tokens]]), admin tetap butuh cara untuk **memaksa refresh** data di luar interval otomatis. Selain itu, hasil rendering card di `keuangan-anggaran` pada dark mode dengan token Mantine (`dark.6`, `dark.4`, `var(--mantine-color-dark-4)`) menghasilkan kontras yang kurang sesuai dengan palette brand Darmasaba, sehingga perlu di-pin ke warna spesifik.

---

## Perubahan

### 1. Tombol Refresh Manual

Tambah tombol `Refresh` (variant `light`, size `xs`, ikon `IconRefresh`) di header tiga halaman. Tombol memanggil `fetchData`/`fetchAll` yang sudah ada (sama dengan yang dipakai `useAutoRefresh`) dan state `loading` dipakai untuk indikator spinner.

- **`src/components/keamanan-page.tsx`**
  - Tambah `<Group justify="flex-end">` berisi tombol Refresh di atas konten utama.
- **`src/components/sosial-page.tsx`**
  - Import `Group` dari `@mantine/core`.
  - Tambah `<Group justify="flex-end">` berisi tombol Refresh di atas konten utama.
- **`src/components/kinerja-divisi.tsx`**
  - Restruktur `<Group justify="flex-end">` agar selalu render (tidak lagi conditional pada `izinExportData`).
  - Tombol Refresh selalu tampil; tombol Export PDF hanya tampil bila `izinExportData` true.
  - `gap="xs"` agar dua tombol rapat.

### 2. Tweak Warna `keuangan-anggaran.tsx`

Pin beberapa warna kembali ke hex agar konsisten dengan palette brand:

- `barColor` (Recharts) sekarang aman terhadap palette yang belum terdaftar:
  - `theme.colors["darmasaba-blue"][5]` → `theme.colors["darmasaba-blue"]?.[5] ?? theme.colors.blue[5]`
- 5 buah card (Pendapatan/Belanja, Tren Anggaran, Kinerja Anggaran, Belanja per Kategori, Sumber Dana):
  - Background dark: `"dark.6"` → `"#1E293B"`
  - Border dark: `"var(--mantine-color-dark-4)"` → `"#374b6aff"`
- Card "Sumber Dana" (item per fund):
  - Background: `dark ? "dark.4" : "gray.1"` → `"#1e3a5f"` (sama untuk light & dark)

> Catatan: ini sebagian melawan arah refactor di [[fix-auto-refresh-and-theme-tokens]] yang mengganti hex → token Mantine. Alasannya: hasil visual `dark.6`/`dark.4` tidak match dengan desain brand Darmasaba untuk card keuangan. Token Mantine tetap dipakai di tempat lain (`green.5`, `red.5`, `darmasaba-navy.7`, dst.).

---

## Verifikasi

- Pola tombol Refresh (variant, size, ikon, handler, loading) konsisten di tiga halaman.
- `kinerja-divisi`: render path saat `izinExportData = false` tetap valid (Group tampil dengan satu tombol).
- `keuangan-anggaran`: `barColor` tidak lagi crash bila key `darmasaba-blue` belum terdaftar di theme.

---

## Dampak

- Admin bisa refresh data secara manual di halaman Keamanan, Sosial, dan Kinerja Divisi tanpa menunggu interval `useAutoRefresh`.
- Card keuangan tampil dengan warna brand yang fixed di dark mode, tidak terpengaruh perubahan palette Mantine default.
