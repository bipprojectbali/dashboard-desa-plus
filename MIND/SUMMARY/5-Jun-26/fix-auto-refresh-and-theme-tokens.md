# Fix: Auto-Refresh Integration & Theme-Aware Color Tokens

**Tanggal:** 5 Juni 2026
**Branch:** `fix/auto-refresh-and-theme-tokens`
**Merged ke:** `stg`

---

## Masalah

Beberapa halaman dashboard tidak menghormati preferensi admin (`refreshOtomatis` + `intervalRefresh` di `i18nStore`) dan satu halaman keuangan menggunakan ~30+ warna hex hardcoded yang tidak ikut menyesuaikan saat tema gelap/terang berubah.

Halaman yang terdampak:
- `bumdes-page.tsx` — `fetchStatic` & `fetchDetail` tidak terhubung ke `useAutoRefresh`
- `jenna-analytic.tsx` — custom hook `useJennaAnalytics` hanya fetch sekali
- `keamanan-page.tsx` — `fetchAll` ter-`useCallback` tapi belum dipasang ke `useAutoRefresh`
- `keuangan-anggaran.tsx` — warna hex hardcoded di JSX (`#1E293B`, `#22C55E`, `#EF4444`, dst.)

---

## Akar Masalah

- Hook `useAutoRefresh` sudah tersedia di `src/hooks/useAutoRefresh.ts` dan sudah dipakai oleh `sosial-page`, `dashboard-content`, `kinerja-divisi`, `pengaduan-layanan-publik`, `demografi-pekerjaan`. Tapi beberapa halaman terlewat saat refactor pertama.
- `keuangan-anggaran.tsx` ditulis dengan ternary `dark ? "#..." : "#..."` di JSX, tidak memakai token palette Mantine (`darmasaba-*`, `green.5`, `red.5`, dll.), sehingga semua nilai bypass theme.

---

## Perubahan

### 1. `src/components/bumdes-page.tsx`
- Import `useCallback` + `useAutoRefresh`
- `fetchStatic` dibungkus `useCallback([selectedRange])`, dipanggil via `useEffect` + disambungkan ke `useAutoRefresh(fetchStatic)`
- `fetchDetail` dibungkus `useCallback([kategoriId, umkmId, selectedRange])`, dipanggil via `useEffect` + disambungkan ke `useAutoRefresh(fetchDetail)`

### 2. `src/components/jenna-analytic.tsx`
- Import `useCallback` + `useAutoRefresh`
- Refactor hook `useJennaAnalytics`: pindahkan fetch ke `fetchData = useCallback(async ...)`, panggil initial via `useEffect`, sambungkan `useAutoRefresh(fetchData)`
- Reset `error` ke `null` saat fetch berhasil agar state pulih jika request berikutnya OK

### 3. `src/components/keamanan-page.tsx`
- Import `useAutoRefresh`
- Tambah `useAutoRefresh(fetchAll)` setelah initial fetch effect

### 4. `src/components/keuangan-anggaran.tsx`
Ganti seluruh warna hex hardcoded ke token Mantine + CSS vars.

- Ganti `useMantineColorScheme` → `useComputedColorScheme("light")` + `useMantineTheme()` untuk akses palette
- Recharts colors derived dari theme di atas component:
  - `incomeColor` = `theme.colors.green[5]`
  - `expenseColor` = `theme.colors.red[5]`
  - `barColor` = `theme.colors["darmasaba-blue"][5]`
  - `gridStroke`, `axisTick`, `tooltipBg`, `tooltipBorder` dipilih dari `theme.colors.dark/gray` sesuai mode
- Mantine JSX:
  - Card bg: `"#1E293B"/"white"` → `"dark.6"/"white"`, borderColor pakai `var(--mantine-color-dark-4)/white`
  - ThemeIcon: `color="#1E3A5F"` → `color="darmasaba-navy.7"`
  - Pendapatan card: `"#064E3B"/"#DCFCE7"` → `"green.9"/"green.1"`, `c="#22C55E"` → `c="green.5"`
  - Belanja card: `"#7F1D1D"/"#FEE2E2"` → `"red.9"/"red.1"`, `c="#EF4444"` → `c="red.5"`
  - Saldo: `"#22C55E"/"#EF4444"` → `"green.5"/"red.5"`
  - Bantuan card bg: `"#334155"/"#F1F5F9"` → `"dark.4"/"gray.1"`
  - Border separators: `var(--mantine-color-{green/red/dark/gray}-N)`
  - Box-shadow inline → `var(--mantine-shadow-xs)`
  - `<TrendingUp color="#22C55E" />` → `color="var(--mantine-color-green-5)"`

---

## Verifikasi

- `grep -nE "#[0-9A-Fa-f]{3,8}" src/components/keuangan-anggaran.tsx` → 0 hit (semua hex sudah hilang)
- `bunx biome check` pada 4 file: tidak ada error baru yang di-introduce oleh perubahan ini
- Pola `useAutoRefresh(fetchFn)` di `bumdes-page`, `jenna-analytic`, `keamanan-page` konsisten dengan pola di `sosial-page.tsx`

---

## Dampak

- Halaman BUMDes, Jenna Analytic, dan Keamanan kini ikut interval auto-refresh sesuai preferensi admin (`refreshOtomatis` + `intervalRefresh`)
- Halaman Keuangan Anggaran sekarang konsisten dengan tema gelap/terang dan dapat di-rebrand cukup dengan mengubah palette `darmasaba-*` di `createTheme()` tanpa menyentuh komponen
