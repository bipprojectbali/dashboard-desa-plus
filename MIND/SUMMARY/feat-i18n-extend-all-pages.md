# feat/i18n-extend-all-pages

**Branch:** `nico/19-mei-26/i18n-extend-all-pages`
**Dibuat dari:** `nico/18-mei-26/typed-desa-api-client`
**Tanggal:** 2026-05-19
**Target merge:** `stg`

---

## Latar Belakang

Melanjutkan pekerjaan dari `feat/i18n-bahasa-id-en` yang sudah mengimplementasikan sistem i18n (ID/EN) untuk halaman Settings dan Sidebar. Branch ini memperluas cakupan i18n ke **seluruh halaman fitur** dashboard — sehingga saat user pilih English di Pengaturan, semua halaman ikut berubah bahasa.

---

## Arsitektur (Tidak Berubah)

```
src/
├── locales/
│   ├── id.ts          # TranslationKeys type + nilai Bahasa Indonesia
│   └── en.ts          # Nilai English (implements TranslationKeys)
├── store/
│   └── i18n.ts        # Valtio proxy store { lang: "id" | "en" }
└── hooks/
    └── useTranslate.ts # Hook: useSnapshot(i18nStore) → translations[lang]
```

Setiap komponen cukup tambah `const t = useTranslate()` dan ganti string hardcoded dengan `t.<section>.<key>`.

---

## Perluasan Translation Keys

| Section baru | Jumlah Keys | Halaman |
|---|---|---|
| `dashboard` | 27 | Beranda — KPI cards, chart labels, kalender |
| `kinerjaDivisi` | 15 | Kinerja Divisi + 6 sub-komponen |
| `pengaduanLayanan` | 16 | Pengaduan & Layanan Publik |
| `bumdes` | 28 | BUMDes & UMKM (5 sub-komponen) |
| `keuanganAnggaran` | 27 | Keuangan & Anggaran |
| `demografiPekerjaan` | 20 | Demografi & Kependudukan |
| `jennaAnalytic` | 23 | Jenna Analytics |
| `sosial` | 22 | Sosial (6 sub-komponen) |
| `keamanan` (extended) | +11 | Keamanan — CCTV, peta, laporan publik |
| `help` | 64 | Pusat Bantuan — guide, FAQ, docs, Jenna chat |

**Total keys ditambahkan: ~253 keys baru**
**Total seluruh keys (akumulasi): ~368 keys**

---

## Komponen yang Diupdate

### Beranda
| File | Perubahan |
|---|---|
| `src/components/dashboard-content.tsx` | KPI cards, label statistik |
| `src/components/dashboard/chart-apbdes.tsx` | Label chart APBDes, status text |
| `src/components/dashboard/chart-surat.tsx` | Title, subtitle, empty state |
| `src/components/dashboard/division-progress.tsx` | Title, kegiatan label |
| `src/components/dashboard/satisfaction-chart.tsx` | Title, kategori kepuasan |
| `src/components/dashboard/activity-list.tsx` | Title, empty state |

### Kinerja Divisi
| File | Perubahan |
|---|---|
| `src/components/kinerja-divisi.tsx` | Status badge, header |
| `src/components/kinerja-divisi/activity-card.tsx` | Label aktivitas, status |
| `src/components/kinerja-divisi/discussion-panel.tsx` | Title, empty state |
| `src/components/kinerja-divisi/division-list.tsx` | Title, empty state |
| `src/components/kinerja-divisi/document-chart.tsx` | Title, empty state |
| `src/components/kinerja-divisi/event-card.tsx` | Title, empty state |
| `src/components/kinerja-divisi/progress-chart.tsx` | Title |

### BUMDes & UMKM
| File | Perubahan |
|---|---|
| `src/components/bumdes-page.tsx` | Header |
| `src/components/umkm/header-toggle.tsx` | Toggle labels |
| `src/components/umkm/summary-cards.tsx` | KPI card titles & subtitles |
| `src/components/umkm/top-products.tsx` | Title, suffix label |
| `src/components/umkm/produk-unggulan.tsx` | Title, terjual label |
| `src/components/umkm/sales-table.tsx` | Header, kolom, status stok |

### Halaman Lain
| File | Perubahan |
|---|---|
| `src/components/pengaduan-layanan-publik.tsx` | KPI cards, chart, tabel |
| `src/components/keuangan-anggaran.tsx` | Label bulan, chart title, laporan |
| `src/components/demografi-pekerjaan.tsx` | KPI cards, semua label chart |
| `src/components/jenna-analytic.tsx` | Semua label analitik Jenna |
| `src/components/sosial-page.tsx` + 6 sub-komponen | Health stats, jadwal posyandu, pendidikan, beasiswa, kalender event |
| `src/components/keamanan-page.tsx` | KPI CCTV, peta, daftar laporan |
| `src/components/help-page.tsx` | Panduan, FAQ, dokumentasi, Jenna chat, jam kerja |

### Config & Locale
| File | Perubahan |
|---|---|
| `src/config/support.ts` | Hapus `jamKerja`/`waktuRespon` (dipindah ke locale) |
| `src/locales/id.ts` | Tambah 10 section baru, type + nilai ID |
| `src/locales/en.ts` | Tambah nilai English untuk semua section baru |

---

## Catatan Implementasi

- **`sosial` section**: Komponen `HealthStats` punya `defaultData` (fallback) — labelnya juga di-translate, bukan hanya data dari API
- **`keamanan` section**: Merge ke section yang sudah ada (bukan duplicate) — section `keamanan` sebelumnya hanya punya keys settings (autentikasi, password, dll), kini ditambah keys untuk halaman CCTV/laporan
- **`help` content strings**: Konten panjang (guide steps, FAQ, docs) disimpan di locale dengan `\n` separator — ditampilkan di `ScrollArea` dengan `whiteSpace: pre-wrap`
- **`useState` greeting Jenna**: Initial greeting menggunakan `t.help.jennaGreeting` saat mount — tidak reaktif jika bahasa diubah saat chat sedang terbuka (acceptable, chat history tidak di-reset)
- **`support.ts`**: `jamKerja` dan `waktuRespon` dihapus dari config karena sudah pindah ke locale. `email` dan `whatsapp` tetap di config (tidak language-specific)

---

## Tidak Termasuk dalam Scope

- Halaman **Sign In** — form login (sudah di-handle di branch sebelumnya)
- Halaman **Pengaturan** (Settings) — sudah selesai di `feat/i18n-bahasa-id-en`
- **Error messages dari API** — tetap hardcoded, bukan teks UI
- **Konten dokumentasi API** (curl, endpoint URL) — dipindah ke locale agar bisa diterjemahkan judulnya; konten teknis (curl command) dipertahankan identik antara ID dan EN
