# Summary Task — 9 Juni 2026

## Refactor: Stable Auto-Refresh Pattern — Semua Page

### Latar Belakang

Sebelumnya, beberapa page menggunakan tombol **Refresh** dan **Paksa Refresh** manual yang di-render di UI. Pattern ini menyebabkan:
- `handleForceRefresh` tidak stabil (deps berubah tiap render karena bergantung pada `fetchData`)
- `useAutoRefresh` kadang menerima fungsi yang beda referensi tiap render
- Double-fetch saat mount (effect dari deps + effect dari mount)
- Tombol refresh tampil di UI tanpa konsistensi antar halaman

### Solusi yang Diterapkan

Pattern baru menggunakan **stable ref** untuk memutus circular dependency, sehingga `handleForceRefresh` selalu stabil (deps `[]`):

```
fetchData (deps: filter/range) → fetchDataRef (disync via useEffect)
                                        ↓
handleForceRefresh (deps: []) ──── pakai fetchDataRef.current()
        ↓
useEffect([handleForceRefresh])  ← mount / F5 → cache-invalidate + fetch
        ↓
useAutoRefresh(handleForceRefresh) ← interval otomatis dari preferences
```

Untuk page yang punya **dua fetch** dengan deps berbeda (bumdes, keuangan), ditambahkan `didMount` ref agar effect deps-change tidak double-fire saat mount.

---

## File yang Diubah

### 1. `src/components/bumdes-page.tsx`
- Hapus tombol Refresh + Group wrapper, `refreshing` state, import `Button/Group/IconRefresh`
- Tambah `fetchStaticRef` + `fetchDetailRef` (dua fetch: static & detail)
- `handleForceRefresh` deps `[]`, pakai refs, call cache-invalidate
- Mount effect: `useEffect([handleForceRefresh])`
- `didMount` ref agar fetchStatic/fetchDetail effect skip saat mount
- `useAutoRefresh(handleForceRefresh)`

### 2. `src/components/demografi-pekerjaan.tsx`
- Hapus import `IconDownload`, tombol Download Laporan dikomentari
- Tambah `fetchRef` + `handleForceRefresh` (deps `[]`)
- Mount effect + `useAutoRefresh(handleForceRefresh)`
- Event listener `demografi-sync-complete` diupdate ke `handleForceRefresh`

### 3. `src/components/keuangan-anggaran.tsx`
- Hapus import `IconDownload`, tombol Download Laporan dikomentari
- Tambah `fetchRef` + `handleForceRefresh` (deps `[]`)
- `didMount` ref karena `fetchData` punya dep `t` (locale)
- Mount effect + `useAutoRefresh(handleForceRefresh)`

### 4. `src/components/kinerja-divisi.tsx`
- Hapus `Group` + tombol Refresh + tombol Export PDF dari JSX
- Hapus import `Group`, `IconDownload`, `IconRefresh` (tidak lagi dipakai di JSX utama)
- Tambah `fetchRef` + `handleForceRefresh` (deps `[]`)
- Mount effect + `useAutoRefresh(handleForceRefresh)`

### 5. `src/components/pengaduan-layanan-publik.tsx`
- Hapus import `IconDownload`, tombol Export PDF dikomentari
- Tambah `fetchRef` + `handleForceRefresh` (deps `[]`)
- Mount effect + `useAutoRefresh(handleForceRefresh)`

### 6. `src/components/keamanan-page.tsx`
- Hapus Group wrapper dengan tombol Refresh + Paksa Refresh
- Tambah `fetchAllRef` + update `handleForceRefresh` ke deps `[]`
- Mount effect diupdate ke `useEffect([handleForceRefresh])`
- `useAutoRefresh(handleForceRefresh)`
- Tombol "Coba lagi" di error Alert diupdate ke `onClick={handleForceRefresh}`

### 7. `src/components/sosial-page.tsx`
- Hapus import `Group`, hapus Group wrapper dengan tombol Refresh + Paksa Refresh
- Tambah `useRef` ke imports, `fetchDataRef` + update `handleForceRefresh` ke deps `[]`
- Mount effect diupdate ke `useEffect([handleForceRefresh])`
- `useAutoRefresh(handleForceRefresh)`
- Tombol "Coba lagi" di error Alert diupdate ke `onClick={handleForceRefresh}`

### 8. `src/components/jenna-analytic.tsx`
- Tambah `useRef` ke imports
- Di dalam hook `useJennaAnalytics`: tambah `fetchDataRef` + `handleForceRefresh` baru (dengan cache-invalidate ke `/api/jenna/cache-invalidate`)
- Mount effect dan `useAutoRefresh` dialihkan ke `handleForceRefresh`

### 9. `src/routes/admin/preferences.tsx`
- Minor cleanup: collapse inline props `Paper` yang tersebar ke multi-line (style/formatting)

### 10. `tasks-mvp.csv`
- Hapus 3 task: CRUD Complaint, CRUD Service Letter, CRUD Innovation Ideas
- Sederhanakan scope: Pagination API (hapus complaint), Search & Filter (fokus activity log), Notifikasi SSE (hapus complaint trigger)
