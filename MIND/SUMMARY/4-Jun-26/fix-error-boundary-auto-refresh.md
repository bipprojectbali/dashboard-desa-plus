# Fix: ErrorBoundary, Error State Keamanan, Auto-Refresh Kinerja & Sosial

**Tanggal:** 4 Juni 2026
**Branch:** fix/error-boundary-auto-refresh

---

## Perubahan

### 1. `src/routes/__root.tsx` — ErrorBoundary global
- Tambah class component `ErrorBoundary` dengan `getDerivedStateFromError` dan `componentDidCatch`
- Fallback UI: Title merah "Terjadi Kesalahan", pesan error, tombol "Kembali ke Beranda"
- Wrap `<Outlet />` dan `<MainLayout>` di kedua branch `RootComponent` (public & protected)
- Sebelumnya: unhandled error di child component menyebabkan seluruh app crash tanpa pesan

### 2. `src/components/keamanan-page.tsx` — Error state & retry
- Tambah `error` state (`useState<string | null>(null)`)
- Refactor `fetchAll` inline menjadi `useCallback` dengan `setLoading(true)` + `setError(null)` di awal
- Tambah `catch` block yang set pesan error (sebelumnya hanya `finally`, error diabaikan)
- Tambah Alert merah dengan tombol "Coba lagi" di atas grid — konsisten dengan pola `sosial-page`
- Import tambahan: `Alert`, `Button`, `IconAlertCircle`, `IconRefresh`, `useCallback`

### 3. `src/components/kinerja-divisi.tsx` — Auto-refresh
- Tambah `import { useAutoRefresh } from "@/hooks/useAutoRefresh"`
- Tambah `useAutoRefresh(fetchData)` setelah `useEffect`
- Data kinerja divisi kini diperbarui otomatis sesuai setting `refreshOtomatis` & `intervalRefresh` dari admin

### 4. `src/components/sosial-page.tsx` — Auto-refresh
- Tambah `import { useAutoRefresh } from "@/hooks/useAutoRefresh"`
- Tambah `useAutoRefresh(fetchData)` setelah `useEffect`
- Data sosial kini diperbarui otomatis sesuai konfigurasi admin (sama dengan kinerja-divisi)

---

## Motivasi
- App bisa crash tanpa pesan jelas jika ada error di child component → ErrorBoundary mengisolasi error
- Halaman Keamanan tidak menampilkan UI saat fetch gagal → user bingung melihat halaman kosong
- Halaman Kinerja Divisi dan Sosial belum terhubung ke `useAutoRefresh` padahal hook sudah tersedia → data bisa stale
