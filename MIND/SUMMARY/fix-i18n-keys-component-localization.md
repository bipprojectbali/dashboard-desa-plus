# Fix: i18n Keys & Component Localization

## Tanggal
2026-05-21

## Branch
`fix/i18n-keys-component-localization`

## Ringkasan
Perbaikan missing translation keys dan localization hardcoded strings di beberapa komponen. Semua perubahan merupakan bagian dari sesi analisis & verifikasi implementasi fitur pengaturan preferensi, i18n multi-section, dan help page.

---

## Perubahan yang Dianalisis (sudah committed sebelumnya)

### 1. Prisma Schema — Model Preferensi Baru
- Tambah model `UmumPreference` dengan 7 field (bahasa, zonaWaktu, formatTanggal, refreshOtomatis, intervalRefresh, tampilkanGrid, animasiTransisi)
- Tambah model `KeamananPreference` dengan 4 field (twoFactorAuth, biometrikLogin, ipWhitelist, logAktivitas)
- Relasi balik di model `User`: `umumPreference` dan `keamananPreference`

### 2. API Routes — Preferences Endpoint
- `src/api/umum-preferences.ts`: Elysia plugin prefix `/umum-preferences`, GET (upsert+return) dan PUT (update+return data), dilindungi `apiMiddleware`
- `src/api/keamanan-preferences.ts`: Elysia plugin prefix `/keamanan-preferences`, pola identik
- `src/api/index.tsx`: Mount kedua plugin di bawah `notificationPreferences`

### 3. UmumSettings Component
- `src/components/pengaturan/umum.tsx`: Ganti semua `defaultValue`/`defaultChecked` ke `useState`, tambah `savedPrefs`/`loading`/`saving`, `useEffect` fetch GET, `handleSave` PUT, `handleBatal` reset ke savedPrefs, `isDirty` disable tombol, Select format tanggal (3 opsi), `disabled={!refreshOtomatis}` pada Interval Refresh

### 4. Locales — 10 Section Baru (~253 keys)
- `src/locales/id.ts`: Export `TranslationKeys` type + nilai ID untuk: dashboard, kinerjaDivisi, pengaduanLayanan, bumdes, keuanganAnggaran, demografiPekerjaan, jennaAnalytic, sosial, keamanan (extended, bukan section baru), help (64 keys termasuk guide steps, FAQ, dokumentasi, Jenna greeting)
- Konten panjang (guide steps, doc content) menggunakan separator `\n`

### 5. Help Page Translations
- `src/components/help-page.tsx`: Tambah `useTranslate()`, ganti semua hardcoded strings dengan `t.help.*`, Jenna greeting via `useState` initial value (tidak reaktif saat bahasa berubah mid-chat)

### 6. Keamanan Preferences Plugin
- Return `{ data: pref }` di PUT (bukan `{ success: true }` seperti spec) — keputusan disengaja agar konsisten dengan semua endpoint lain dan frontend bisa update state langsung

---

## Perubahan yang Dicommit Sekarang

### src/locales/id.ts & en.ts
- Tambah keys yang sebelumnya missing di `kinerjaDivisi`: `divisiTeraktif`, `tidakAdaDataDivisi`
- Tambah keys sosial event budaya: `eventBudaya1Nama/Tanggal/Lokasi`, `eventBudaya2*`, `eventBudaya3*` (ID & EN)

### src/components/kinerja-divisi/activity-card.tsx
- Pindahkan logika `statusLabel` dari parent ke dalam komponen
- Gunakan `useTranslate()` langsung di `ActivityCard` — prop `statusLabel` dihapus

### src/components/kinerja-divisi.tsx
- Hapus prop `statusLabel` yang tidak lagi diperlukan

### src/components/kinerja-divisi/division-list.tsx
- Fix translation key: `t.dashboard.divisiTeraktif` → `t.kinerjaDivisi.divisiTeraktif`
- Fix: `t.dashboard.tidakAdaDataDivisi` → `t.kinerjaDivisi.tidakAdaDataDivisi`

### src/components/sosial/event-calendar.tsx
- Ganti hardcoded event budaya default dengan `t.sosial.eventBudaya*` — responsive terhadap bahasa

### src/routes/admin/ & src/routes/profile/ (formatting)
- `apikey.tsx`, `route.tsx`, `users.tsx`, `profile/index.tsx`, `profile/route.tsx`, `signup.tsx`: Reformatting JSX (line wrapping) tanpa perubahan logic

### package.json
- Reformatting indentasi (spasi → tab) tanpa perubahan versi atau dependencies

---

## Keputusan Teknis

| Topik | Keputusan |
|---|---|
| Format tanggal `DD MMM YYYY` | Tidak ditambahkan — `FormatTanggal` type belum support, perlu update store + date formatting logic |
| Guide steps `whiteSpace: pre-wrap` | Dibiarkan — implementasi `split("\n")` + ThemeIcon numbered list lebih baik UX |
| PUT keamanan-preferences return value | `{ data: pref }` bukan `{ success: true }` — konsisten dengan semua endpoint preferences lain |
