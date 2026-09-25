# Architecture

## Overview

Single Bun process menjalankan Elysia (HTTP server) + Vite middleware (React SPA). Request ke `/api/*` dihandle Elysia; semua request lain serve React SPA.

```
Browser
  │
  ├── /api/*  → Elysia (src/api/)
  └── /*      → Vite → React SPA (src/routes/)
                          │
                          └── fetch() → /api/*  (internal)
                          └── fetch() → VITE_DESA_API_URL  (external, langsung)
```

Entry point: `src/index.ts` — merakit `Elysia().use(api)`, mount 2 route proxy langsung (lihat di bawah), lalu serve Vite middleware (dev) atau static files + SPA fallback (production). Production juga auto-seed database jika `ADMIN_EMAIL` di-set, dan menjalankan `startSyncScheduler()` (`src/jobs/sync.ts`) untuk background sync job dari NOC.

---

## Server Side — `src/api/`

Semua Elysia plugin di-mount berantai di `src/api/index.tsx` pada instance `Elysia({ prefix: "/api" })`. Urutan mount (sesuai file):

| File | Prefix | Isi |
|---|---|---|
| `admin.ts` | `/admin` | Admin: manajemen user, invalidasi cache |
| `noc.ts` | `/noc` | Integrasi & sync NOC system |
| `apikey.ts` | `/apikey` | Manajemen API keys |
| `profile.ts` | `/profile` | Profil user |
| `division.ts` | `/division` | CRUD divisi |
| `complaint.ts` | `/complaint` | Pengaduan layanan publik |
| `resident.ts` | `/resident` | Data penduduk |
| `dashboard.ts` | `/dashboard` | Agregasi data dashboard utama |
| `demografi.ts` | `/demografi` | Data kependudukan & cache |
| `notification-preferences.ts` | `/notification-preferences` | Preferensi notifikasi |
| `umkm.ts` | `/umkm` | Data UMKM lokal |
| `bumdes.ts` | `/bumdes` | Halaman BUM Desa |
| `umum-preferences.ts` | `/umum-preferences` | Preferensi umum |
| `keamanan.ts` | `/keamanan` | Halaman keamanan desa |
| `keamanan-preferences.ts` | `/keamanan-preferences` | Preferensi keamanan akun |
| `akses-preferences.ts` | `/akses-preferences` | Preferensi akses & tim |
| `wall-layout.ts` | `/wall-layout` | Konfigurasi layout Video Wall |
| `keuangan.ts` | `/keuangan` | Keuangan & anggaran (APBDes) |
| `jenna.ts` | `/jenna` | Jenna AI chat helper |
| `system-stats.ts` | (lihat file) | Statistik sistem (admin) |
| `activity-log.ts` | `/activity-log` | Audit log aktivitas user |
| `invitation.ts` | `/invitation` | Sistem undangan user |
| `ip-whitelist.ts` | `/ip-whitelist` | IP whitelist enforcement |
| `search.ts` | `/search` | Global search |
| `sosial.ts` | `/sosial` | Layanan sosial |
| `sosial-kesejahteraan.ts` | `/sosial/kesejahteraan` | Data kesejahteraan masyarakat |
| `sync-log.ts` | `/admin/sync` | Riwayat sinkronisasi NOC |
| `bantuan.ts` | `/bantuan` | Halaman bantuan / help |
| `admin-faq.ts` | `/admin/faq` | CRUD FAQ (drag-and-drop reorder) |
| `my-permissions.ts` | `/my-permissions` | Permission user yang sedang login |

Plus route langsung di `api` object (bukan plugin terpisah): `GET /api/health`, `GET /api/version`, `ALL /api/auth/*` (Better Auth handler), `GET /api/session`. Swagger docs di-mount di `/api/docs` hanya saat `NODE_ENV !== "production"`.

**Route yang bypass plugin composition** — dua endpoint di-mount langsung di `src/index.ts` (bukan lewat `src/api/index.tsx`), sesuai komentar kode "bypass plugin composition issues":
- `GET /api/jenna/analytics` — proxy ke Jenna Analytics API (`VITE_JENNA_API_URL`)
- `GET /api/noc/pengaduan` — proxy ke NOC Pengaduan API (`VITE_JENNA_API_URL`)

**Subfolder pendukung** (logic non-plugin, dipakai internal oleh route handler di atas):
- `src/api/sources/` — fetcher raw dari API eksternal (`apbdes.ts`, `umkm-dashboard.ts`)
- `src/api/transforms/` — transformer data eksternal → shape internal (APBDes, demografi, Jenna, NOC discussions/divisions/documents/events/pengaduan/progres/projects, religion)
- `src/api/wall-snapshot/` — builder snapshot data untuk tiap kategori widget Video Wall (beranda, bumdes, demografi, divisi, jenna, keamanan, keuangan, kpi, pengaduan, sosial)

Auth di-handle Better Auth di `/api/auth/*` (konfigurasi di `src/utils/auth.ts`, lihat [Auth Flow](#auth-flow)).

---

## Frontend Side — `src/routes/`

TanStack Router file-based routing. File route → URL:

| File | URL | Halaman |
|---|---|---|
| `index.tsx` | `/` | Dashboard utama |
| `signin.tsx` | `/signin` | Login |
| `signup.tsx` | `/signup` | Registrasi |
| `kinerja-divisi.tsx` | `/kinerja-divisi` | Performa divisi |
| `keuangan-anggaran.tsx` | `/keuangan-anggaran` | Keuangan & anggaran (APBDes) |
| `demografi-pekerjaan.tsx` | `/demografi-pekerjaan` | Demografi & ketenagakerjaan |
| `bumdes.tsx` | `/bumdes` | BUM Desa — UMKM & penjualan |
| `pengaduan-layanan-publik.tsx` | `/pengaduan-layanan-publik` | Pengaduan publik |
| `keamanan.tsx` | `/keamanan` | Keamanan desa |
| `jenna-analytic.tsx` | `/jenna-analytic` | Analitik (Jenna AI) |
| `bantuan.tsx` | `/bantuan` | Bantuan / help |
| `sosial.tsx` | `/sosial` | Layanan sosial & kesejahteraan masyarakat |
| `wall.tsx` | `/wall` | **NOC Video Wall** — kiosk mode, lihat [Video Wall](#video-wall-wall) |
| `profile/` | `/profile` | Profil user (view + edit) |
| `users/` | `/users`, `/users/$id` | Manajemen user |
| `admin/` | `/admin/*` | Panel admin (apikey, audit-log, help, preferences, roles, settings, system-health, users) |
| `pengaturan/` | `/pengaturan/*` | Pengaturan (umum, keamanan, akses-dan-tim, notifikasi, sinkronisasi) |

---

## Components — `src/components/`

Dikelompokkan per fitur:

```
components/
├── dashboard/          # Widget dashboard utama
├── kinerja-divisi/     # Komponen halaman kinerja divisi
├── umkm/               # Komponen halaman BUMDes (summary-cards, sales-table, top-products, dll)
├── keuangan/            # KPI cards, income-expense-chart, allocation-chart, dana-bantuan-card, laporan-card
├── sosial/              # Kesejahteraan, beasiswa, posyandu-schedule, health-records/stats, event-calendar
├── wall/                # Widget registry & layout builder untuk NOC Video Wall
├── pengaturan/          # Komponen halaman pengaturan
├── figma/               # ImageWithFallback dan asset dari Figma
├── ui/                  # Wrapper Radix UI + Mantine reusable
└── layout/              # Layout components (main-layout)
```

Plus komponen top-level per halaman: `bumdes-page.tsx`, `dashboard-card.tsx`, `dashboard-content.tsx`, `demografi-pekerjaan.tsx`, `dev-inspector.tsx`, `global-search.tsx`, `header.tsx`, `help-page.tsx`, `jenna-analytic.tsx`, `keamanan-page.tsx`, `keuangan-anggaran.tsx`, `kinerja-divisi.tsx`, `pengaduan-layanan-publik.tsx`, `sidebar.tsx`, `sosial-page.tsx`.

---

## State Management

**Valtio** (`src/store/`) untuk state global antar komponen:

| Store | Isi |
|---|---|
| `akses.ts` | State akses & tim (pengaturan) |
| `auth.ts` | Session/user state di client |
| `i18n.ts` | Bahasa aktif |
| `notif.ts` | Notifikasi in-app |
| `permission.ts` | Permission user yang sedang login (cache dari `/api/my-permissions`) |
| `sosial.ts` | Filter & state halaman `/sosial` |
| `umkm.ts` | Filter & time range untuk halaman BUMDes |
| `wall-layout.ts` | Layout widget Video Wall (order, sizes) — sinkron dengan `WallLayout` model |

Untuk data fetching, komponen menggunakan `@tanstack/react-query` (`src/utils/query-client.ts`) atau `useState`/`useEffect` langsung tergantung kompleksitas.

---

## HTTP Clients

| Client | File | Digunakan di |
|---|---|---|
| `apiClient` | `src/utils/api-client.ts` | Frontend → endpoint internal (`/api/*`), typed dari `generated/api` |
| `desaExternalClient` | `src/utils/desa-external-client.ts` | Server → Desa Website API |
| `nocExternalClient` | `src/utils/noc-external-client.ts` | Server → NOC System API |
| `platformExternalClient` | `src/utils/platform-external-client.ts` | Server → Platform API (`PLATFORM_API_URL`, Bearer token) — Pengaduan & Surat live "Fase 2" |

Frontend juga bisa call Desa API langsung via `fetch(${VITE_DESA_API_URL}/api/ekonomi/...)` — pattern ini dipakai di `bumdes-page.tsx` dan komponen chart kepuasan warga.

---

## Auth Flow

Better Auth (`src/utils/auth.ts`) dengan Prisma adapter (`postgresql`):

- **Providers**: email+password (bcrypt cost 12) dan OAuth `github` + `google`
- **Session**: cookie cache 30 hari (`maxAge`), `expiresIn` 30 hari, `cookiePrefix: "bun-react"`, `trustProxy: true`
- **Role**: field custom `role` di `User` (default `"user"`)
- **Auto-admin**: `databaseHooks.user.create.before` — email yang cocok `ADMIN_EMAIL` otomatis jadi `role: "admin"` + `emailVerified: true`. User lain default `emailVerified: false` (butuh verifikasi admin sebelum bisa akses).
- **Activity log**: `databaseHooks.session.create.after` — setiap login dicatat ke `ActivityLog` (IP, user-agent) kecuali user menonaktifkan `logAktivitas` di `KeamananPreference`.
- **Middleware**: `src/middleware/authMiddleware.tsx` (guard server & client), `src/middleware/apiMiddleware.tsx` (dipasang di `src/api/index.tsx` sebelum semua plugin fitur).

---

## Video Wall (`/wall`)

Kiosk mode untuk TV/monitor NOC — menampilkan snapshot data lintas fitur (beranda, kinerja divisi, keamanan, keuangan, sosial, BUMDes, pengaduan) dalam grid widget yang bisa di-drag-resize.

- **Model**: `WallLayout` (Prisma) — singleton (`id: "singleton"`), simpan `order` (urutan widget) dan `sizes` (override ukuran per widget, JSON partial)
- **Editor**: admin drag-resize widget via `@dnd-kit` (lihat skill `react-dnd`), state client di store `src/store/wall-layout.ts`
- **Snapshot builder**: `src/api/wall-snapshot/` — satu builder per kategori widget (`build-beranda.ts`, `build-bumdes.ts`, `build-demografi.ts`, `build-divisi.ts`, `build-jenna.ts`, `build-keamanan.ts`, `build-keuangan.ts`, `build-kpi.ts`, `build-pengaduan.ts`, `build-sosial.ts`)
- **Akses**: opsional digerbangi `WALL_ACCESS_TOKEN` — jika di-set, wajib akses via `/wall?key=<token>`; jika kosong, `/wall` terbuka tanpa login (server-only env var, jangan pakai prefix `VITE_`)

---

## Generated Files

| Path | Generator | Isi |
|---|---|---|
| `generated/api.ts` | `bun run gen:api` | TypeScript types untuk internal API |
| `generated/noc-external/` | openapi-codegen | Types untuk NOC External API |
| `src/routeTree.gen.ts` | TanStack Router | Route tree (auto-generated, jangan edit manual) |
