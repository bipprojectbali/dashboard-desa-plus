# Summary: Settings UI Overhaul, Jenna Chatbot & I18n

**Branch:** `feat/settings-ui-overhaul-jenna-i18n`
**Commit:** `34bed6e`
**Tanggal:** 2026-05-11

---

## Perubahan Utama

### 1. Redesign UI/UX Halaman Pengaturan (5 Tab)

Semua tab pengaturan diupgrade dari layout flat/polos ke card-based design yang konsisten:

| Tab | File | Sebelum | Sesudah |
|-----|------|---------|---------|
| Umum | `pengaturan/umum.tsx` | `Box pr="50%"`, Switch tanpa deskripsi | `Box maw={680}`, 2 Paper card, Skeleton loading, interval refresh fix (30d → 30s/1m/5m/15m) |
| Notifikasi | `pengaturan/notifikasi.tsx` | Grid 2 kolom polos, `Stack pr="20%"` | 3 Paper card (Metode, Alert Sistem, Push), SwitchRow dengan icon + deskripsi + badge |
| Keamanan | `pengaturan/keamanan.tsx` | `Stack pr="50%"`, tombol fullwidth `bg="#1E3A5F"` | 3 Paper card (Autentikasi, Password, Audit), ActionRow untuk aksi, badge "Disarankan"/"Lanjutan" |
| Akses & Tim | `pengaturan/akses-dan-tim.tsx` | `Stack pr="50%"`, hardcoded "12 Anggota" | 3 Paper card, `RingProgress` donut chart distribusi role, ActionRow untuk undangan/kelola |
| Sinkronisasi | `pengaturan/sinkronisasi.tsx` | Grid 2 kolom Card biasa | `SyncCard` reusable component, page header banner gradient, last sync info box, URL sumber per card |

**Pola desain konsisten di semua tab:**
- `Box maw={680-720}` menggantikan `pr="X%"` — responsive, tidak sempit
- `Paper withBorder radius="lg"` per section dengan gradient ThemeIcon header
- Skeleton loading saat fetch preferensi
- `Alert` (bukan `Notification`) untuk toast success/error
- Tombol Simpan gradient sesuai tema warna tiap tab
- Divider antar item dalam card

---

### 2. Jenna Virtual Assistant — UI Overhaul

**File:** `src/components/help-page.tsx`

Widget chatbot Jenna di halaman `/bantuan` didesain ulang total:

- Full-width card (`md: 12`)
- Header gradient biru-indigo dengan avatar dan status "Online"
- Chat bubbles: user (biru kanan) dan Jenna (putih/dark kiri) dengan avatar masing-masing
- Animated 3-dot loading indicator (CSS `@keyframes bounce` di `src/index.css`)
- Quick reply badges — hanya tampil saat percakapan baru dimulai
- Mantine `TextInput` + `ActionIcon` gradient send button
- Auto-scroll ke pesan terbaru via `chatBottomRef`
- Disclaimer teks di bawah input

**Backend:** `src/api/jenna.ts` + mount di `src/api/index.tsx`
- Handler Elysia `POST /api/jenna/chat` dengan `apiMiddleware` (auth guard)
- Saat ini: stub response (AI integration ditunda karena proxy API belum terkonfigurasi)
- Frontend sudah async fetch — siap diganti AI response kapanpun

---

### 3. Halaman Bantuan — Modal & Support Config

**File:** `src/components/help-page.tsx`, `src/config/support.ts` (baru)

- Ekstrak hardcoded kontak support (email, WhatsApp, jam kerja) ke `src/config/support.ts`
- 3 modal (Panduan, Video Tutorial, Dokumentasi) didesain ulang:
  - Gradient header dengan icon dan badge
  - `ScrollArea` untuk konten panjang
  - Custom close button teks

---

### 4. I18n Bahasa Indonesia / English

**Files:** `src/locales/id.ts`, `src/locales/en.ts`, `src/store/i18n.ts`, `src/hooks/useTranslate.ts`

- Valtio store `i18nStore` dengan `lang` dan `zonaWaktu`
- `useTranslate()` hook mengembalikan locale aktif secara reaktif
- Seluruh teks UI di 5 tab settings, sidebar, breadcrumb, dan header menggunakan `t.*`
- Perubahan bahasa langsung apply ke UI tanpa reload

---

### 5. Dev Inspector — Clipboard Copy

**File:** `src/components/dev-inspector.tsx`

- Saat klik elemen di mode inspect (Ctrl+Shift+Cmd+C), path lengkap `file:line:col` disalin ke clipboard otomatis
- Tambahan satu baris: `navigator.clipboard.writeText(loc).catch(() => {})`

---

### 6. Fix Biome Lint Errors

- **`noNonNullAssertion`**: `user!.id` → `user?.id` di 4 file API preferences
- **`as any`**: `(error as any)` → `error as Record<string, string>` di `sinkronisasi.tsx`
- **`noArrayIndexKey`**: `biome-ignore` comment di modal Panduan help-page
- **`useExhaustiveDependencies`**: `biome-ignore` comment di `sinkronisasi.tsx` useEffect fetch-on-mount

---

## Files yang Diubah

```
src/api/jenna.ts                          (baru) — Elysia handler chatbot stub
src/api/index.tsx                         — mount jennaChat
src/api/akses-preferences.ts             — fix noNonNullAssertion
src/api/keamanan-preferences.ts          — fix noNonNullAssertion
src/api/notification-preferences.ts      — fix noNonNullAssertion
src/api/umum-preferences.ts              — fix noNonNullAssertion
src/components/dev-inspector.tsx         — clipboard copy
src/components/header.tsx                — i18n + jam live zona waktu
src/components/help-page.tsx             — Jenna UI + modals + support config
src/components/pengaturan/umum.tsx       — redesign card UI
src/components/pengaturan/notifikasi.tsx — redesign card UI
src/components/pengaturan/keamanan.tsx   — redesign card UI
src/components/pengaturan/akses-dan-tim.tsx — redesign card UI + RingProgress
src/components/pengaturan/sinkronisasi.tsx  — redesign SyncCard UI
src/config/support.ts                    (baru) — editable support contact config
src/index.css                            — bounce keyframe animation
src/locales/id.ts                        — tambah key i18n
src/locales/en.ts                        — tambah key i18n
src/store/i18n.ts                        — zonaWaktu state
generated/api.ts                         — regenerated OpenAPI types
generated/schema.json                    — regenerated schema
```

---

## Catatan

- **Jenna AI integration ditunda**: Proxy Anthropic (`claude-proxy.wibudev.com` / `claude-local.wibudev.com`) belum mendukung endpoint `/v1/messages` dengan key format `sk-cp-*`. Frontend sudah siap — tinggal ganti stub di `src/api/jenna.ts` saat API key valid tersedia.
- **Data hardcoded di akses-dan-tim.tsx**: `totalAnggota = 12`, `administrator = 2`, `editor = 5`, `viewer = 5` masih hardcoded — belum terhubung ke API user. Dapat di-fetch dari `/api/admin/users` bila diperlukan.
