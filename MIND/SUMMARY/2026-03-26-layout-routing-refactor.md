# Ringkasan Refaktor Layout dan Routing (26 Maret 2026)

Saya telah berhasil melakukan refaktor pada arsitektur layout dan routing untuk meningkatkan maintainability dan menghilangkan redundansi kode.

## Perubahan Utama

### 1. Unified Layout Component (`MainLayout`)
-   Membuat komponen baru `src/components/layout/main-layout.tsx`.
-   Memusatkan logika `AppShell`, `Sidebar`, dan `Header` ke dalam satu tempat.
-   Menggunakan hook `useSidebarFullscreen` secara global untuk mengelola state sidebar yang konsisten antar navigasi.

### 2. Konfigurasi Root Route
-   Memperbarui `src/routes/__root.tsx` untuk menggunakan `MainLayout`.
-   Menerapkan **Conditional Rendering**:
    -   Halaman publik (`/signin`, `/signup`) dirender secara polos tanpa layout sidebar.
    -   Semua halaman terproteksi lainnya secara otomatis dibungkus oleh `MainLayout`.

### 3. Implementasi Breadcrumbs Dinamis
-   Menambahkan komponen `Breadcrumbs` pada `src/components/header.tsx`.
-   Breadcrumbs digenerasi secara otomatis berdasarkan path URL saat ini dengan pemetaan label yang human-readable (contoh: `/pengaduan-layanan-publik` menjadi `Beranda / Pengaduan & Layanan Publik`).

### 4. Pembersihan Masif (Surgical Cleanup)
-   Menghapus boilerplate `AppShell`, `Sidebar`, `Header`, dan state terkait dari 13 file route:
    -   `src/routes/index.tsx`
    -   `src/routes/kinerja-divisi.tsx`
    -   `src/routes/pengaduan-layanan-publik.tsx`
    -   `src/routes/jenna-analytic.tsx`
    -   `src/routes/demografi-pekerjaan.tsx`
    -   `src/routes/keuangan-anggaran.tsx`
    -   `src/routes/bumdes.tsx`
    -   `src/routes/sosial.tsx`
    -   `src/routes/keamanan.tsx`
    -   `src/routes/bantuan.tsx`
    -   `src/routes/profile/index.tsx`
    -   `src/routes/profile/edit.tsx`
    -   `src/routes/pengaturan/route.tsx`

## Hasil Akhir
-   **Maintainability**: Perubahan pada layout (misal: ganti warna header) cukup dilakukan di satu file (`main-layout.tsx`).
-   **User Experience**: Navigasi antar halaman terasa lebih mulus karena layout tidak dirender ulang, dan state sidebar tetap terjaga.
-   **Code Quality**: Lolos pengecekan `lint` (Biome) dan `tsc` (TypeScript) tanpa error.
