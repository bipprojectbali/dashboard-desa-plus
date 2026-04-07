# Ringkasan Perbaikan Linting & Type Safety (26 Maret 2026)

Berikut adalah detail perbaikan yang dilakukan untuk membersihkan semua error linting (Biome) dan error tipe data (TypeScript) pada proyek **darmasaba-dashboard-noc**.

## 1. Perbaikan Linting & Formatting (Biome)
- **Aksesibilitas (A11y)**:
    - `Breadcrumb`: Menghapus `role="link"` dan `tabIndex` pada `BreadcrumbPage` karena bukan merupakan elemen navigasi aktif.
    - `Carousel`: Menambahkan `role="region"` pada `<section>` dan menggunakan `biome-ignore` untuk `aria-roledescription` serta `role="group"` pada slide, sesuai dengan standar aksesibilitas carousel.
    - `InputOTP`: Menghapus `role="separator"` yang dekoratif untuk menghindari peringatan elemen semantik.
- **Keamanan & Praktik Terbaik**:
    - `Chart`: Menambahkan `biome-ignore` untuk penggunaan `dangerouslySetInnerHTML` yang aman saat menghasilkan variabel CSS dinamis untuk grafik.
    - `Sidebar`: Menambahkan `biome-ignore` untuk `document.cookie` yang digunakan secara terkontrol untuk persistensi status sidebar.
- **Organisasi Kode**:
    - Menjalankan `biome check --write` untuk merapikan format kode dan mengurutkan import secara otomatis di seluruh proyek.

## 2. Perbaikan Type Safety (TSC)
- **API Contract-First (Elysia)**:
    - Menambahkan definisi `response` schema di semua endpoint `src/api/*.ts`. Ini memperbaiki error `never` pada frontend saat menggunakan `openapi-fetch`.
    - Memperbaiki context `user` pada `src/api/profile.ts` dengan menyertakan `apiMiddleware` ke dalam instance Elysia lokal.
- **Frontend & Recharts**:
    - `ChartTooltipContent` & `ChartLegendContent`: Memperbaiki tipe props untuk `payload` dan `label` menggunakan `any[]` (dengan `biome-ignore`) agar kompatibel dengan library Recharts tanpa harus mengimpor tipe internal yang sangat kompleks.
    - `ChartAPBDes`: Memperbaiki tipe data `value` pada formatter Tooltip agar menerima `number | string | undefined`.
    - `DivisionList`: Memperbaiki pemetaan data API dengan casting yang tepat dari `unknown[]` ke tipe divisi yang diharapkan.
- **Utility Plugins**:
    - `dev-inspector-plugin.ts`: Menambahkan pengecekan `undefined` dan nullish coalescing pada pemrosesan baris kode untuk menghindari runtime error saat transformasi Vite.

## 3. Sinkronisasi Database & Environment
- **Prisma Seed**:
    - Memperbaiki `prisma/seed.ts` agar `banjarId` dan `divisionId` tidak pernah bernilai `undefined` saat proses seeding.
    - Mengekspor fungsi `runSeed` agar dapat dipanggil secara otomatis oleh `src/index.ts` saat berjalan di mode produksi.
- **Integrasi UI**:
    - `sonner.tsx`: Mengganti dependensi `next-themes` yang hilang dengan `useMantineColorScheme` bawaan Mantine UI untuk sinkronisasi mode gelap/terang yang lebih konsisten.

## Status Akhir
- **Biome Lint**: `0 errors, 0 warnings` (setelah suppressions yang disengaja).
- **TypeScript**: `0 errors` (hasil dari `bun x tsc --noEmit`).
- **API Types**: Diperbarui melalui `bun run gen:api`.
