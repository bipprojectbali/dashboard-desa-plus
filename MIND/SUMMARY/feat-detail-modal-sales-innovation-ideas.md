# feat: detail modal untuk sales produk dan ajuan ide inovatif

## Tanggal
2026-05-25

## Branch
`feat/detail-modal-sales-innovation-ideas`

## Ringkasan
Menambahkan dua modal detail baru — satu untuk data penjualan produk UMKM/BUMDes, satu lagi untuk ajuan ide inovatif di halaman Pengaduan & Layanan Publik.

---

## File Baru

### `src/components/umkm/sales-detail-modal.tsx`
Modal detail produk penjualan UMKM/BUMDes yang dipanggil dari tombol "Detail" di `SalesTable`.

Fitur:
- Banner gradient biru dengan nama produk dan badge tren (hijau/merah/abu-abu)
- 3 `StatCard`: Penjualan Bulan Ini (highlight), Bulan Lalu, Perubahan %
- Progress bar perbandingan penjualan bulan ini vs bulan lalu
- Volume card + Stock card dengan `RingProgress` (Aman=100%, Sedang=60%, Rendah=20%)
- Scroll: `overflowY: "auto"`, `maxHeight: "75vh"` pada body modal
- Sub-komponen lokal: `StatCard`, `ComparisonBar`
- Dark mode support penuh

### `src/components/layanan/innovation-idea-modal.tsx`
Modal detail ajuan ide inovatif yang dipanggil dari tombol "Detail" di seksi "Ajuan Ide Inovatif" halaman Pengaduan Layanan Publik.

Fitur:
- Banner gradient dinamis berdasarkan kategori (Teknologi=#7C3AED, Ekonomi=#059669, Kesehatan=#DC2626, Pendidikan=#D97706)
- Badge status (BARU/DIKAJI/DISETUJUI/DITOLAK/DIIMPLEMENTASI) + badge kategori di banner
- Card deskripsi ide dengan `whiteSpace: "pre-wrap"` dan `lineHeight: 1.7`
- Grid 2×2 `InfoItem`: Pengusul, Kontak (dimmed jika kosong), Tanggal Diajukan, Kategori (warna aksen)
- Scroll: `overflowY: "auto"`, `maxHeight: "75vh"` pada body modal
- Export interface `InnovationIdea` agar bisa di-reuse parent
- Sub-komponen lokal: `InfoItem`
- Dark mode support penuh

---

## File Dimodifikasi

### `src/components/bumdes-page.tsx`
- Import `SalesDetailModal` dan `SalesData`
- Tambah state: `selectedProduct: SalesData | null`, `detailModalOpen: boolean`
- Update `handleDetailClick` agar set state dan buka modal
- Tambah `<SalesDetailModal ... />` di JSX return

### `src/components/pengaduan-layanan-publik.tsx`
- Hapus local `InnovationIdea` interface (7 field)
- Import `InnovationIdeaModal` dan type `InnovationIdea` dari modal file (type alias)
- Tambah state: `selectedIdea: InnovationIdea | null`, `ideaModalOpen: boolean`
- Update onClick tombol Detail di seksi ide inovatif
- Tambah `<InnovationIdeaModal ... />` di JSX return

### `src/locales/id.ts`
Tambah ke **type definition** dan **value** section:
- `bumdes`: 6 key baru — `detailProduk`, `perubahan`, `statusStok`, `perbandinganPenjualan`, `tutupDetail`, `infoVolume`
- `pengaduanLayanan`: 8 key baru — `detailIde`, `deskripsiIde`, `pengusul`, `kontakPengusul`, `diajukanPada`, `kategoriIde`, `tidakAdaKontak`, `tutupIde`

### `src/locales/en.ts`
Tambah ke **value** section (English equivalents dari key di atas):
- `bumdes`: 6 key baru
- `pengaduanLayanan`: 8 key baru

---

## Verifikasi
- `bun run tsc --noEmit`: tidak ada error baru pada file yang dimodifikasi
- `bun run check` (Biome): tidak ada error baru pada file yang dimodifikasi
