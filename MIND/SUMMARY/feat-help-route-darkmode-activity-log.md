# Summary: Help Page, Dark Mode Toggle & Activity Log on Login

**Tanggal:** 2026-05-20
**Branch asal:** feat/help-route-darkmode-activity-log
**Target:** stg

---

## Perubahan Utama

### 1. Halaman Help Center (`/admin/help`)

- **File baru:** `src/routes/admin/help.tsx`
- Route `AdminHelpPage` ditambahkan ke TanStack Router via `src/routeTree.gen.ts`
- Konten halaman: artikel panduan, video tutorial, FAQ accordion, dan chat Jenna (virtual assistant)
- Nav link "Pusat Bantuan" di sidebar (`src/routes/admin/route.tsx`) sekarang aktif navigasi ke `/admin/help` menggunakan `Link` + `active` state
- Ikon berubah dari `IconSettings` → `IconHelpCircle`

### 2. Dark/Light Mode Toggle di Header

- **File:** `src/routes/admin/route.tsx`
- Ditambahkan `ActionIcon` di header kanan dengan ikon `IconSun` / `IconMoon`
- Menggunakan `useMantineColorScheme().toggleColorScheme()`
- Ikon berganti sesuai tema aktif (gelap → tampilkan matahari, terang → tampilkan bulan)

### 3. Activity Log saat Login

- **File:** `src/utils/auth.ts`
- Ditambahkan hook `session.create.after` pada Better Auth
- Setiap login sukses → tulis record ke `activityLog` (action: `"login"`, IP, user agent)
- Cek `keamananPreference.logAktivitas` terlebih dahulu; jika `false`, skip pencatatan
- Error ditangkap secara silent (non-critical)

### 4. Fix Navigate setelah Sign Out

- **File:** `src/routes/admin/route.tsx`, `src/routes/admin/index.tsx`
- `navigate({ to: "/signin" })` → `navigate({ to: "/signin", search: { redirect: undefined } })`
- Mencegah query param `redirect` tersisa di URL setelah logout

### 5. Biome Formatting (kode formatting saja, no logic change)

File-file yang hanya terkena auto-format Biome:
- `src/api/demografi.ts` — multi-line return objects
- `src/components/sidebar.tsx` — inline style object
- `src/locales/en.ts`, `src/locales/id.ts` — panjang string dipecah ke multi-line
- `src/components/bumdes-page.tsx`
- `src/components/dashboard/chart-apbdes.tsx`
- `src/components/dashboard/satisfaction-chart.tsx`
- `src/components/demografi-pekerjaan.tsx`
- `src/components/help-page.tsx`
- `src/components/keuangan-anggaran.tsx`
- `src/components/kinerja-divisi/document-chart.tsx`
- `src/components/pengaduan-layanan-publik.tsx`
- `src/components/umkm/sales-table.tsx`
- `src/frontend.tsx`
- `src/routes/signin.tsx`

### 6. Generated Files

- `generated/api.ts` — endpoint baru hasil `bun run gen:api`
- `generated/schema.json` — schema update

---

## File Terdampak

| File | Jenis Perubahan |
|---|---|
| `src/routes/admin/help.tsx` | **BARU** — halaman help center |
| `src/routes/admin/route.tsx` | Tambah dark mode toggle + fix nav link + fix logout |
| `src/routes/admin/index.tsx` | Fix navigate setelah sign out |
| `src/utils/auth.ts` | Tambah activity log hook pada login |
| `src/routeTree.gen.ts` | Auto-generated: tambah route `/admin/help` |
| `generated/api.ts`, `generated/schema.json` | Auto-generated |
| `src/locales/en.ts`, `src/locales/id.ts` | Formatting |
| Komponen lainnya (11 file) | Biome formatting saja |

---

## Catatan

- Tidak ada perubahan schema Prisma — tidak perlu migration baru
- Activity log memanfaatkan model `activityLog` yang sudah ada
- Dark mode toggle bersifat in-memory (via Mantine); persistent jika user sudah punya settings preferences
