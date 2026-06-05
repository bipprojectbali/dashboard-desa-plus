# Summary: Perbaikan Roles Page, Print Styles, dan Export Demografi

**Tanggal:** 5 Juni 2026
**Branch-branch:** `fix/admin-roles-page-stable-fetch`, `feat/print-styles-kinerja-keuangan`, `feat/demografi-pdf-export`
**Merged ke:** `stg`

---

## 1. Fix: Stabilkan fetchPermissions di Halaman Admin Roles

**Branch:** `fix/admin-roles-page-stable-fetch`
**File:** `src/routes/admin/roles.tsx`

### Masalah
Fungsi `fetchPermissions` memanggil state updater (`setMatrix`, `setFeatures`, `setRoles`, `setDirty`, `setError`, `setLoading`) tanpa memeriksa `mountedRef.current`. Ini menyebabkan React warning "Can't perform a React state update on an unmounted component" jika komponen di-unmount saat fetch masih berjalan. Selain itu, pesan error saat fetch gagal bersifat generik — tidak membaca body error dari server.

### Perubahan
- Tambah `if (!mountedRef.current) return` sebelum semua state update di `try` block
- Tambah `mountedRef.current` guard di `catch` dan `finally` block
- Saat `!res.ok`: parse body error dari server dulu (`res.json().catch(() => ({}))`), gunakan field `error` sebagai pesan — fallback ke pesan generik jika tidak ada
- Konsisten dengan `handleSave` yang sudah menerapkan pola yang sama

**Before:**
```ts
if (!res.ok) throw new Error("Gagal memuat data permission");
// ...
setMatrix(data.matrix); // tidak ada mountedRef.current check
} catch (err) {
    setError(...); // tidak ada check
} finally {
    if (!controller.signal.aborted) setLoading(false); // tidak ada check
}
```

**After:**
```ts
if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? "Gagal memuat data permission");
}
if (!mountedRef.current) return;
setMatrix(data.matrix);
} catch (err) {
    if (mountedRef.current) setError(...);
} finally {
    if (!controller.signal.aborted && mountedRef.current) setLoading(false);
}
```

> Catatan: Poin ketiga dari deskripsi (sync-noc dikunci untuk role user) sudah ada sebelumnya di line 100-101 (toggle guard) dan line 309-311 (checkbox disabled).

---

## 2. Feat: @media print Styles untuk Kinerja Divisi & Keuangan Anggaran

**Branch:** `feat/print-styles-kinerja-keuangan`
**File:** `src/index.css`

### Masalah
Tidak ada `@media print` styles sama sekali. Saat user mencetak halaman dari browser, sidebar, header, dan tombol aksi ikut tercetak sehingga hasil print tidak rapi.

### Perubahan
Tambah blok `@media print` di `src/index.css` (global CSS, berlaku untuk semua halaman):

```css
@media print {
  /* Sembunyikan chrome navigasi */
  .mantine-AppShell-header,
  .mantine-AppShell-navbar { display: none !important; }

  /* Reset offset sidebar & header agar konten full-width */
  .mantine-AppShell-main {
    padding-top: 0 !important;
    padding-left: 0 !important;
    --app-shell-header-height: 0px !important;
    --app-shell-navbar-width: 0px !important;
  }

  /* Sembunyikan tombol aksi (export, refresh, filter) */
  .mantine-Button-root,
  .mantine-ActionIcon-root { display: none !important; }

  /* Pastikan warna & background chart tetap muncul */
  * { print-color-adjust: exact; }
}
```

Selector menggunakan Mantine v8 class naming convention yang konsisten di seluruh app.

---

## 3. Feat: Export PDF Laporan Demografi & Pekerjaan

**Branch:** `feat/demografi-pdf-export`
**File:** `src/api/demografi.ts`, `src/components/demografi-pekerjaan.tsx`

### Masalah
Tidak ada endpoint export dan tidak ada tombol download laporan di halaman demografi. `buildPdfReport` tersedia di `src/utils/pdf-table.ts` tapi belum digunakan di konteks demografi.

### Perubahan

**`src/api/demografi.ts`** — endpoint baru `GET /api/demografi/export`:
- Fetch 6 sumber data secara paralel via `Promise.allSettled` + `withCache` (reuse cache yang sudah ada, tidak refetch jika data masih fresh)
- Sumber: summary, banjar, distribusi umur, pekerjaan, agama, sektor unggulan
- Bangun PDF 6 seksi menggunakan `buildPdfReport` (dynamic import)
- Return `application/pdf` dengan header `Content-Disposition: attachment`
- Dilindungi `apiMiddleware` (auth required)

**Seksi PDF:**
| # | Heading | Kolom |
|---|---|---|
| 1 | Ringkasan Kependudukan | Indikator, Jumlah |
| 2 | Data Per Banjar | Nama Banjar, Penduduk, KK, Miskin |
| 3 | Distribusi Kelompok Umur | Kelompok Umur, Jumlah |
| 4 | Demografi Pekerjaan | Jenis Pekerjaan, Jumlah |
| 5 | Distribusi Agama | Agama, Jumlah |
| 6 | Sektor Unggulan Desa | Sektor, Nilai |

**`src/components/demografi-pekerjaan.tsx`** — tombol "Download Laporan":
- Import `IconDownload` dari `@tabler/icons-react`
- Import `useAksesPrefs` dari `@/hooks/useAksesPrefs`
- `izinExportData` dari `useAksesPrefs()` sebagai permission gate (konsisten dengan `kinerja-divisi.tsx`)
- `handleExport`: anchor click ke `/api/demografi/export` dengan filename `laporan-demografi-YYYY-MM-DD.pdf`
- Tombol hanya muncul jika `izinExportData === true`
