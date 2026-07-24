# Plan — Retune Palette Warna (TV-Robust, Light+Dark Selaras)

**Status:** PLAN ONLY — belum eksekusi kode.

**Tujuan:** Warna tidak "ngejreng" di TV/NOC (asumsi TV selalu Vivid mode, tak bisa dikontrol),

tetap nyaman di laptop, dan light↔dark terasa **satu sistem** (tidak jomplang).

**Scope eksekusi pertama:** Dashboard saja (bukan wall dulu, bukan semua modul).

---

## 1. Keputusan yang sudah disepakati


| Aspek         | Keputusan                                                                  |
| ------------- | -------------------------------------------------------------------------- |
| Light palette | **Ikut retune — ringan** (turun chroma tipis, hue tetap) agar selaras dark |
| Dark palette  | **Retune sedang** (muted, jewel-tone) — target utama masalah TV            |
| Asumsi TV     | Selalu Vivid/boost → desain untuk worst case, chroma diturunkan cukup      |
| Mulai dari    | **Dashboard** dulu; wall &amp; modul lain menyusul (fase berikutnya)       |
| Prinsip       | Hue konsisten light↔dark, yang beda hanya lightness/chroma                 |


---

## 2. Prinsip Desain (acuan nilai warna)

1. **Turunkan chroma, jaga hue.** Status tetap dibedakan: merah≠hijau≠kuning (aman colorblind).
2. **Background dark jangan pitch-black.** `#11192D` → diangkat → delta kontras vs aksen turun → glare turun.
3. **Cyan &amp; hijau murni paling diredam** (paling "bergetar" di layar besar gelap).
4. **Teks jaga kontras ≥ 4.5:1** (WCAG AA) supaya tetap kebaca dari jarak jauh.
5. **Satu token, dua varian** (`.light` / `.dark`) — bukan dua palette lepas.

---

## 3. Nilai Palette Usulan (draft — bisa direvisi saat eksekusi)

### 3a. Surface / Border / Text


| Peran        | Light (baru) | Dark (baru) | Dark (lama)           |
| ------------ | ------------ | ----------- | --------------------- |
| Page BG      | `#F8F9FB`    | `#161D2E`   | `#11192D`             |
| Card         | `#FFFFFF`    | `#1F2839`   | `#1E293B` / `#1E3A5F` |
| Card alt     | `#F3F5F8`    | `#243044`   | `#213654`             |
| Border       | `#E3E7ED`    | `#364356`   | `#334155`             |
| Track (rail) | `#E8EBF0`    | `#2A3446`   | `#273449`             |
| Text utama   | `#1E2733`    | `#DCE3EC`   | `#E2E8F0`             |
| Text dim     | `#5F6B7A`    | `#93A0B4`   | `#94A3B8`             |


> Catatan: card dark disatukan jadi **1 nada** (`#1F2839`) — hilangkan dualitas `#1E293B` vs `#1E3A5F`.

### 3b. Aksen Semantik


| Peran        | Light (baru) | Dark (baru) | Light (lama)        | Dark (lama)         |
| ------------ | ------------ | ----------- | ------------------- | ------------------- |
| Primary/Blue | `#2F6BC4`    | `#5A8DD6`   | `#2563EB`/`#3B82F6` | `#3B82F6`           |
| Success      | `#3E9B6B`    | `#57A773`   | `#10B981`/`#22C55E` | `#22C55E`/`#34D399` |
| Warning      | `#D89A3C`    | `#DFA94E`   | `#F59E0B`           | `#FBBF3B`           |
| Danger       | `#D14D4D`    | `#D46A6A`   | `#EF4444`           | `#FA4B4B`           |
| Info/Cyan    | `#3E8199`    | `#5C9DB8`   | `#38BDF8`           | `#38BDF8`           |
| Violet       | `#7060B8`    | `#9385D1`   | `#7C3AED`           | `#A78BFA`           |


### 3c. Selaras dengan Mantine `darmasaba-*`

Skala `darmasaba-blue` (primary), `-success`, `-warning`, `-danger` di `createTheme` di-retune

agar shade 5–6 (yang dipakai `autoContrast`) match nilai di atas. **Fase terpisah** — lihat §5.

---

## 4. Arsitektur Token (target akhir)

```
src/theme/
  palette.ts        # SEMANTIC tokens: { surface, card, border, text, textDim,
                    #   primary, success, warning, danger, info, violet }
                    # tiap token punya .light & .dark
  index.ts          # re-export (≤50 baris)
```

**Cara konsumsi (rekomendasi, biar minim churn):**

- Ekspos token sebagai **CSS variables** di `:root` + `[data-mantine-color-scheme="dark"]`

  (di `index.css`), supaya komponen cukup pakai `var(--app-card)` tanpa hook `isDark`.
- Alternatif: helper `usePalette()` yang balikin objek sesuai `useIsDark()` — tapi ini

  mempertahankan pola runtime ternary. CSS var lebih disukai (nol re-render, no hardcode).

> Keputusan mekanisme (CSS var vs hook) diambil saat eksekusi fase 1 — belum dikunci.

---

## 5. Staging Eksekusi (Dashboard-first)

### Fase 0 — Token (pondasi)

- [ ] Buat `src/theme/palette.ts` (semantic token light+dark, nilai §3).
- [ ] Tambah CSS variables di `src/index.css` (`:root` + selector dark).
- [ ] Tidak mengubah tampilan apa pun dulu (token belum dipakai).

### Fase 1 — Dashboard (scope pertama yang disepakati)

Target file (hex → token), grup dashboard:

- [ ] `src/components/dashboard/stat-card.tsx`
- [ ] `src/components/dashboard/activity-list.tsx`
- [ ] `src/components/dashboard/satisfaction-chart.tsx`
- [ ] `src/components/dashboard-card.tsx`
- [ ] `src/components/jenna-analytic.tsx`
- [ ] (file dashboard lain yang muncul saat audit ulang)
- [ ] Ganti `dark ? "#1E293B" : "white"` → `var(--app-card)` dsb.
- [ ] Verifikasi visual light &amp; dark (screenshot manual oleh user).

### Fase 2 — Mantine theme sync (opsional, setelah dashboard oke)

- [ ] Retune skala `darmasaba-*` di `createTheme` agar match token.
- [ ] Cek komponen yang pakai `color="darmasaba-*"` (23×) tidak berubah drastis.

### Fase 3 — Wall/NOC (menyusul)

- [ ] Alias `WALL_THEME` → token dark (nilai muted §3).
- [ ] Ini yang paling ngejreng — dampak paling terasa, tapi user minta dashboard dulu.

### Fase 4 — Modul sisa (bertahap, per-modul)

- [ ] keuangan, sosial, umkm, demografi, kinerja-divisi, layanan, pengaduan, keamanan.

---

## 6. Verifikasi &amp; Guardrail

- [ ] **Kontras teks** semua pasangan text/bg ≥ 4.5:1 (cek dengan tool sebelum commit).
- [ ] **Status distinguishable** untuk colorblind (deuteranopia): merah vs hijau tetap beda lightness.
- [ ] **Tidak menambah hex hardcoded baru** — semua lewat token (patuh aturan global #15).
- [ ] Branch baru `feature/color-retune` (aturan global #2), commit per-fase.
- [ ] Test: tidak ada logic berubah; visual regression dicek manual oleh user (bukan playwright otomatis).
- [ ] Tidak deploy/push sampai user eksplisit minta.

---

## 7. Terbuka untuk Diskusi (belum dikunci)

1. Mekanisme konsumsi token: **CSS variables** (rekomendasi) vs `usePalette()` hook.
2. Nilai exact tiap warna di §3 — masih draft, boleh digeser saat lihat hasil nyata.
3. Apakah `darmasaba-navy` (brand heading) ikut diredam atau dipertahankan sebagai identitas.
4. Urutan modul di Fase 4.

