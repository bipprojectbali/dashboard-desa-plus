# Wall Bento Grid — Layout Asimetris per Bobot Widget

**Tanggal:** 17 Juli 2026
**Branch:** `feature/wall-bento-layout` (sudah push ke origin, belum merge)
**Halaman:** `/wall` (NOC video wall) — mode display & edit inline

---

## Konteks Awal

Melanjutkan dari `feature/wall-widget-grid`. Grid `/wall` sebelumnya sudah responsif tapi
**uniform**: `repeat(auto-fill, minmax(460px, 1fr))` + `gridAutoRows: minmax(300px, 1fr)` →
semua widget dapat sel berukuran sama. Rapi tapi flat — mata tak punya hierarki, KPI ringkas
dan donut besar berebut ruang yang sama.

Permintaan user: ubah `/wall` jadi **bento layout** (grid asimetris, tiap tile ukuran beda
sesuai bobot kontennya). Keputusan yang disepakati sebelum koding:
- **Span fixed per widget** (bukan user-resizable) → tak menyentuh schema DB `wall_layout`.
- **Pertahankan tema NOC** (dark `#11192D`, border tipis, radius 12) — cuma ubah proporsi grid.
- Drag-reorder mode edit **tetap jalan**.

---

## Perubahan yang Sudah Selesai (commit `cba4b7c`)

### 1. Modul bento pure — `wall-bento.ts` (baru)
Single source of truth untuk sistem span, tanpa import React (bisa diuji tanpa render).
- Tipe `WallSize = "sm" | "wide" | "tall" | "lg"` + peta `BENTO_SPAN` ke `{col, row}`.
- Unit dasar sel: `WALL_BENTO_COL` (300px, kolom auto-fill) × `WALL_BENTO_ROW` (240px, baris tetap).
- `bentoClass(size)` → nama class CSS (`sm` = string kosong, tak butuh span).
- `bentoCss` → definisi span + **media query collapse** di `WALL_BENTO_COLLAPSE_PX` (720px):
  tile `wide`/`lg` turun ke 1 kolom di layar sempit supaya tak overflow horizontal.

### 2. Metadata `size` per widget — `widget-registry.tsx`
Tambah field `size: WallSize` ke `WidgetDefinition` + isi tiap entry sesuai bobot visual konten:

| Ukuran | Span | Widget |
|--------|------|--------|
| `lg` | 2×2 | donut hero: Sebaran Gender, Sebaran Agama, Kepuasan (Keuangan & Pengaduan) |
| `wide` | 2×1 | chart lebar: APBDes, Tren 7 Bulan, Kelompok Umur, Pekerjaan, Dokumen, Surat per Tipe |
| `tall` | 1×2 | list panjang: Skor SDGs, Kinerja Divisi, Status Sistem (ops) |
| `sm` | 1×1 | KPI ringkas: Status Pengaduan, Ringkasan Demografi, Laporan Keamanan |

### 3. Grid bento — `wall-grid.tsx`
- Ganti `gridTemplateColumns` ke unit bento + `gridAutoFlow: "dense"` (isi celah span).
- Inject `<style>{bentoCss}</style>` sekali; tiap grid item dapat class span dari `slotClass(id)`.
- **Alasan span pakai class, bukan inline style:** media query hanya bisa meng-override CSS
  eksternal — inline style tak bisa dikalahkan tanpa `!important`.
- Display mode: tiap `WidgetSlot` dibungkus `<div className={slotClass}>`.
- Edit mode: class diteruskan ke item dnd (bukan wrapper) supaya pengukuran sortable tak rusak.

### 4. Item dnd terima span — `sortable-widget-card.tsx`
Tambah prop `className` → dipasang di node draggable (`setNodeRef`). Satu jalur span untuk
display & edit.

### 5. Bersih-bersih — `wall-theme.ts`
Buang `WALL_MIN_CARD_WIDTH`/`WALL_MIN_CARD_HEIGHT` (tak ada konsumen lain setelah pindah ke bento).

---

## Test

**File baru:** `__tests__/api/wall-bento.test.ts` (12 test, runner `bun test`).
- Peta span: tiap ukuran col/row ≥ 1, maks 2 (aman untuk collapse), nilai `sm/wide/tall/lg` benar.
- `bentoClass`: `sm` → kosong, sisanya → `wall-bento-<size>`.
- `bentoCss`: punya definisi tiap class non-sm + media query di ambang yang ditentukan.
- Registry: tiap `WidgetId` di katalog punya `size` valid.

**Hasil:**
- ✅ 82/82 test API lulus (12 baru)
- ✅ Lint Biome bersih
- ✅ Build produksi sukses
- ✅ Typecheck: 0 error di file wall (error prisma seeders / api preferences yang ada = pre-existing, di luar scope)

---

## Yang TIDAK Disentuh

- Schema DB / `wall_layout` — span di kode, bukan per-user.
- `wall-layout-editor`, store Valtio, API route — tetap.
- Palet & token tema NOC — identitas visual tak berubah.

---

## Status & Langkah Berikut

- Branch `feature/wall-bento-layout` sudah **push ke origin**, belum merge (nunggu review user).
- **Belum diverifikasi di browser** — proporsi tile bisa perlu tweak setelah lihat di TV asli
  (mis. apakah `lg` 2×2 kekecilan/kebesaran untuk donut, atau `tall` cukup untuk ops panel).
- Opsi lanjutan: preview Playwright, atau adjust peta `size` per feedback visual.
