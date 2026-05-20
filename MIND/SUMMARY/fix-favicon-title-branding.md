# Summary: Fix Favicon & Title Branding Dashboard Desa Plus NOC

**Tanggal:** 2026-05-20
**Branch asal:** stg
**Target:** stg

---

## Perubahan Utama

### 1. Ganti Title Halaman

- **File:** `src/index.html`
- Title sebelumnya: `Bun + React` (default template)
- Title baru: `Dashboard Desa Plus NOC`

### 2. Buat Favicon SVG Custom

- **File baru:** `src/logo.svg` (replace isi Bun logo), `public/favicon.svg`
- Favicon sebelumnya: logo Bun (SVG bola mata kucing)
- Favicon baru: ikon balai desa custom — lingkaran hijau `#2d6a4f` dengan silhouette rumah putih, 2 jendela, pintu, dan tiang bendera kecil warna `#f3d5a3`
- Dipilih SVG (bukan PNG) agar scalable dan ringan (0.57 KB setelah bundle)

### 3. Fix Path Favicon untuk Dev Server

- **File:** `src/index.html`
- Path awal `./logo.svg` tidak bekerja di dev karena `<base href="/">` me-resolve ke `/logo.svg` (root), sementara file ada di `src/logo.svg`
- Fix: SVG dipindah ke `public/favicon.svg` dan href diubah ke `/favicon.svg` (absolute path)
- Cara ini bekerja di dev (Bun/Vite serve `public/` di root) maupun production (`cp -r public/* dist/`)

---

## File Terdampak

| File | Jenis Perubahan |
|---|---|
| `src/index.html` | Ganti title + fix favicon href ke `/favicon.svg` |
| `src/logo.svg` | Replace isi: Bun logo → ikon balai desa SVG |
| `public/favicon.svg` | **BARU** — copy dari `src/logo.svg`, di-serve di root `/` |

---

## Catatan

- Tidak ada perubahan schema Prisma — tidak perlu migration baru
- File `src/logo-desa-plus.png` sempat dibuat di `src/` lalu dihapus karena Bun bundler tidak bisa resolve path PNG dari `public/` saat build HTML
- Favicon PNG dari `public/logo-desa-plus.png` tidak dipakai karena kurang scalable; diganti SVG custom
- Hard refresh browser (Cmd+Shift+R) diperlukan agar cache favicon lama tidak dipakai
