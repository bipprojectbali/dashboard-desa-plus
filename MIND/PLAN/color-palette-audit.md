# Palette Warna — Dashboard Desa Plus

Audit warna aktual yang dipakai project. Sumber: `src/frontend.tsx` (theme Mantine),
`src/components/wall/wall-theme.ts`, + hex hardcoded tersebar di `src/components/**`.

> ⚠️ Temuan: mayoritas warna **hardcoded hex** per komponen (pola `dark ? "#1E293B" : "white"`),
> bukan dari theme token. Palette di bawah = normalisasi hex tsb jadi peran semantik + saran token.

---

## 1. Theme Resmi (Mantine `createTheme`)

Terdaftar di `src/frontend.tsx`. Shade 0 (paling terang) → 9 (paling gelap).

| Nama Token | Peran | 0 | 4 (base) | 6 | 9 |
|---|---|---|---|---|---|
| `darmasaba-navy` | Brand navy / heading | `#E1E4F2` | `#4C6CAE` | `#2C497F` | `#071833` |
| `darmasaba-blue` ⭐ **primary** | Aksi utama, link | `#E3F0FF` | `#3B8FFF` | `#1C6BBF` | `#073260` |
| `darmasaba-success` | Sukses/positif | `#E3F9E7` | `#5DB572` | `#3C7F4A` | `#17301B` |
| `darmasaba-warning` | Peringatan | `#FFF8E1` | `#FBBF3B` | `#C2981D` | `#675A0D` |
| `darmasaba-danger` | Error/bahaya | `#FFE3E3` | `#FA4B4B` | `#C22A2A` | `#670C0C` |

- `primaryColor: "darmasaba-blue"`, `autoContrast: true`, `defaultColorScheme: "auto"`.
- Dipakai via prop: `color="darmasaba-navy"` (15×), `color="darmasaba-blue"` (7×), `color="darmasaba-success"` (1×).

---

## 2. Palette Semantik — Terang & Gelap

Peran → hex yang benar-benar muncul di kode. Kolom **Light** untuk `colorScheme=light`, **Dark** untuk dark/wall.

### 2a. Permukaan (Surface / Background)

| Peran | Light | Dark | Catatan |
|---|---|---|---|
| Page background | `#FFFFFF` / `#F8F9FA` | `#11192D` · `#0F172A` · `#040D1A` | wall pakai `#11192D` |
| Card / Paper | `#FFFFFF` | `#1E293B` (107×) · `#1E3A5F` (74×) | dua nada card dark |
| Card alt / nested | `#F8FAFC` · `#F1F5F9` · `#F3F4F6` | `#213654` · `#1F293A` | |
| Track (progress rail) | `#E5E7EB` (23×) · `#EEE` | `#273449` · `#334155` | |
| Highlight biru muda | `#EBF2FD` · `#EAF1FB` · `#EFF6FF` · `#E6F0FF` · `#F0F4F8` | `#1E3A5F` | banner/aksen info |

### 2b. Border / Divider

| Peran | Light | Dark |
|---|---|---|
| Border utama | `#E5E7EB` · `#CCC` | `#334155` (99×) |
| Border sekunder | `#F1F5F9` · `#EEE` | `#374151` (38×) · `#475569` |

### 2c. Teks

| Peran | Light | Dark |
|---|---|---|
| Teks utama | `#1E293B` · `#374151` | `#E2E8F0` (71×) · `#F1F5F9` (45×) · `#F8FAFC` |
| Teks dim/sekunder (`c="dimmed"` 203×) | `#64748B` · `#6B7280` | `#94A3B8` (13×) · `#CBD5E1` |

### 2d. Warna Aksen Semantik

| Peran | Light (on-white) | Dark (on-dark) | Mantine prop |
|---|---|---|---|
| **Primary / Info** | `#2563EB` · `#3B82F6` (16×) | `#3B8FFF` · `#60A5FA` · `#38BDF8` | `blue` / `darmasaba-blue` |
| **Success** | `#10B981` (12×) · `#22C55E` (8×) | `#34D399` (9×) · `#92CC76` | `green` / `teal` |
| **Warning** | `#F59E0B` (6×) · `#EAB308` | `#FBBF3B` · `#FACC15` · `#FAC858` | `orange` / `yellow` |
| **Danger** | `#EF4444` (17×) · `#A32020` | `#FA4B4B` · `#ED6665` · `#FF6868` | `red` |
| **Violet / kategori** | `#7C3AED` · `#6366F1` (indigo) | `#A78BFA` | `violet` / `indigo` |
| **Pink / aksen** | `#EC4899` | — | `grape` |

---

## 3. Wall Theme (NOC TV — dark-only)

`src/components/wall/wall-theme.ts` — token bernama, khusus layar TV gelap.

| Token | Hex | Peran |
|---|---|---|
| `PAGE_BG` | `#11192D` | Background halaman |
| `CARD` | `#1E293B` | Kartu |
| `BORDER` | `#334155` | Garis |
| `TEXT` | `#E2E8F0` | Teks utama |
| `TEXT_DIM` | `#94A3B8` | Teks redup |
| `ACCENT` | `#3B82F6` | Aksen biru (darmasaba-blue) |
| `OK` | `#22C55E` | Status sehat |
| `WARN` | `#F59E0B` | Peringatan |
| `DANGER` | `#EF4444` | Bahaya |
| `INFO` | `#38BDF8` | Aksen sekunder (cyan) |
| `VIOLET` | `#A78BFA` | Kategori/KPI |
| `TRACK` | `#273449` | Rel progress bar |

**Palet kategorikal chart** (`WALL_CATEGORICAL`): ACCENT → OK → WARN → VIOLET → INFO → DANGER.

---

## 4. Mantine Color Prop — Frekuensi Pakai

Nama warna standar Mantine yang dipakai via `color=` / `c=` / `bg=`:

| Warna | Jumlah | Warna | Jumlah |
|---|---|---|---|
| `dimmed` | 203 | `teal` | 8 |
| `red` | 64 | `green` | 16 |
| `orange` | 51 | `blue` | 29 |
| `white` | 59 | `violet` | 14 |
| `gray` | 18 | `darmasaba-*` | 23 |
| `indigo` | 2 | `yellow` / `grape` | 1 / 1 |

---

## 5. Ringkasan Temuan (untuk cleanup)

1. **Inkonsistensi source-of-truth:** theme punya 5 skala `darmasaba-*`, tapi komponen mayoritas
   pakai hex Tailwind-slate (`#1E293B`, `#334155`, `#E2E8F0`) langsung — bukan token theme.
2. **Card dark punya 2 nada** (`#1E293B` biru-abu vs `#1E3A5F` navy) — perlu diseragamkan.
3. **Success/warning/danger** di komponen pakai hex Tailwind (`#10B981`, `#F59E0B`, `#EF4444`),
   berbeda dari skala `darmasaba-success/warning/danger` di theme.
4. **Rekomendasi:** ekstrak palette dark ke token (mirip `WALL_THEME`) atau tambahkan skala
   `dark`/`slate` ke `createTheme`, lalu ganti hex hardcoded → CSS var / `theme.colors`.
   Melanggar aturan global #15 (no hardcoded values).
