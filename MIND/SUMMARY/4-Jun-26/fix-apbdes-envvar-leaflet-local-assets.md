# Summary Perubahan — 4 Jun 2026

## 1. ID APBDes dipindah ke environment variable

**Masalah:** String `"cmk-apbdes-001"` di-hardcode di 3 file server-side, membuat ID desa tidak bisa dikonfigurasi tanpa mengubah kode.

**Perubahan:**

| File | Perubahan |
|------|-----------|
| `src/api/demografi.ts` | Tambah `import { getEnv }` + `const APBDES_ID = getEnv("DESA_APBDES_ID", "cmk-apbdes-001")`. Ganti 2 hardcode string dengan `APBDES_ID`. |
| `src/api/noc.ts` | Sama — ganti cache key `"apbdes:cmk-apbdes-001"` dan kondisi `idDesa === "cmk-apbdes-001"` dengan `APBDES_ID`. |
| `src/jobs/sync.ts` | Sama — ganti path param dan cache key. |
| `.env.example` | Tambah entry `DESA_APBDES_ID="cmk-apbdes-001"` sebagai dokumentasi. |

---

## 2. Leaflet marker icon dipindah ke aset lokal

**Masalah:** `src/components/keamanan-page.tsx` menggunakan 3 URL CDN `unpkg.com` untuk icon marker peta Leaflet. Jika CDN tidak tersedia, marker hilang dari peta.

**Perubahan:**

| File | Perubahan |
|------|-----------|
| `public/marker-icon.png` | File baru — copy dari `node_modules/leaflet/dist/images/` |
| `public/marker-icon-2x.png` | File baru — copy dari `node_modules/leaflet/dist/images/` |
| `public/marker-shadow.png` | File baru — copy dari `node_modules/leaflet/dist/images/` |
| `src/components/keamanan-page.tsx` | Ganti 3 URL CDN (`unpkg.com/leaflet@1.9.4/dist/images/...`) dengan path lokal (`/marker-icon.png`, `/marker-icon-2x.png`, `/marker-shadow.png`). |

---

## 3. Route sinkronisasi di-redirect ke halaman preferences admin

**Masalah:** Halaman `/pengaturan/sinkronisasi` sudah tidak relevan karena fitur sync dipindah ke `AdminSyncSection` di `/admin/preferences`.

**Perubahan:**

| File | Perubahan |
|------|-----------|
| `src/routes/pengaturan/sinkronisasi.tsx` | Ganti component dengan `beforeLoad` redirect ke `/admin/preferences`. |
| `src/components/pengaturan/sinkronisasi.tsx` | File dihapus (649 baris komponen lama). |
