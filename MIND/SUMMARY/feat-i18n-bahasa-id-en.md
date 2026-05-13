# feat/i18n-bahasa-id-en

**Branch:** `feat/i18n-bahasa-id-en`
**Dibuat dari:** `feat/settings-preferences-functional`
**Tanggal:** 2026-05-11
**Commits:**
- `284071e` — implementasi bahasa aplikasi (ID/EN) di halaman pengaturan umum
- `c3ac3a3` — terapkan i18n ke seluruh UI settings dan sidebar
- `6805b54` — terapkan i18n ke breadcrumb dan header

---

## Latar Belakang

Fitur ganti bahasa (Indonesia / English) di halaman **Pengaturan > Umum** sudah bisa menyimpan preferensi ke DB, namun belum punya efek nyata ke tampilan UI. Tujuan: saat user pilih English, seluruh UI langsung berubah bahasa tanpa reload.

---

## Arsitektur i18n

Pendekatan minimal tanpa library tambahan — memanfaatkan **Valtio** yang sudah ada di project:

```
src/
├── locales/
│   ├── id.ts          # Teks Bahasa Indonesia + definisi tipe TranslationKeys
│   └── en.ts          # Teks English (implements TranslationKeys)
├── store/
│   └── i18n.ts        # Valtio proxy store { lang: "id" | "en" }
└── hooks/
    └── useTranslate.ts # Hook: useSnapshot(i18nStore) → translations[lang]
```

**Cara kerja:**
- `i18nStore` adalah Valtio proxy — reactive saat `lang` berubah
- `useTranslate()` return seluruh objek terjemahan untuk bahasa aktif
- Ganti bahasa di dropdown → `setLang()` → semua komponen yang pakai `useTranslate()` re-render otomatis
- Saat mount, `umum.tsx` sync bahasa dari DB ke store via `setLang()`
- Klik Batal → reset bahasa ke nilai tersimpan di DB

---

## Cakupan i18n

### Translation Keys (src/locales/id.ts & en.ts)

| Section | Jumlah Keys | Keterangan |
|---------|-------------|------------|
| `common` | 10 | Batal, Simpan, toast, Administrator, Pengguna |
| `breadcrumb` | 17 | Semua route path → label |
| `sidebar` | 17 | Menu utama + submenu pengaturan |
| `umum` | 9 | Label pengaturan tampilan & dashboard |
| `notifikasi` | 14 | Section title + 11 switch label |
| `keamanan` | 11 | Section title, switch, action button |
| `akses` | 13 | Section title, label, button |
| `sinkronisasi` | 24 | Judul, status, pesan error/sukses, button |

**Total: ~115 translation keys**

### Komponen yang Diupdate

| File | Perubahan |
|------|-----------|
| `src/components/sidebar.tsx` | Menu items + submenu Settings |
| `src/components/header.tsx` | Breadcrumb + role label (Pengguna/User) |
| `src/components/pengaturan/umum.tsx` | Semua label + sync lang ke store |
| `src/components/pengaturan/notifikasi.tsx` | Section, switch, button, toast |
| `src/components/pengaturan/keamanan.tsx` | Section, switch, button, toast |
| `src/components/pengaturan/akses-dan-tim.tsx` | Section, label, button, toast |
| `src/components/pengaturan/sinkronisasi.tsx` | Semua teks statik + pesan dinamis |

---

## Perilaku Ganti Bahasa

| Aksi | Efek |
|------|------|
| Pilih "English" di dropdown | UI langsung berubah (reaktif, tanpa reload) |
| Klik Batal | Bahasa kembali ke nilai yang tersimpan di DB |
| Klik Simpan | Bahasa tersimpan ke DB, toast muncul dalam bahasa aktif |
| Reload halaman | Bahasa dimuat dari DB, di-sync ke store |

---

## Catatan

- Branch ini **belum di-merge ke `stg`**
- Dibuat di atas `feat/settings-preferences-functional` (settings fungsional)
- Untuk extend ke halaman lain (dashboard, kinerja divisi, dll): tambah keys baru di `id.ts`/`en.ts`, pakai `useTranslate()` di komponen target
- `labelMap` di header dipindah keluar dari `.map()` loop — performa lebih baik
