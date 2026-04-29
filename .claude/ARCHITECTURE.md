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

---

## Server Side — `src/api/`

Semua Elysia plugins di-mount di `src/api/index.tsx`.

| File | Prefix | Isi |
|---|---|---|
| `dashboard.ts` | `/dashboard` | Agregasi data dashboard utama |
| `division.ts` | `/divisions` | CRUD divisi |
| `activity.ts` | `/activities` | Kegiatan per divisi |
| `document.ts` | `/documents` | Manajemen dokumen |
| `complaint.ts` | `/complaints` | Pengaduan layanan publik |
| `demografi.ts` | `/demografi` | Data kependudukan & cache |
| `resident.ts` | `/residents` | Data penduduk |
| `profile.ts` | `/profile` | Profil user |
| `event.ts` | `/events` | Event/kegiatan |
| `noc.ts` | `/noc` | Integrasi & sync NOC system |
| `apikey.ts` | `/apikeys` | Manajemen API keys |

Auth di-handle Better Auth di `/api/auth/*` (otomatis dari `src/utils/auth.ts`).

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
| `sosial.tsx` | `/sosial` | Layanan sosial |
| `profile/` | `/profile` | Profil user (view + edit) |
| `users/` | `/users`, `/users/$id` | Manajemen user |
| `admin/` | `/admin/*` | Panel admin |
| `pengaturan/` | `/pengaturan/*` | Pengaturan (umum, keamanan, tim, sinkronisasi, notifikasi) |

---

## Components — `src/components/`

Dikelompokkan per fitur:

```
components/
├── dashboard/          # Widget dashboard utama
├── kinerja-divisi/     # Komponen halaman kinerja divisi
├── umkm/               # Komponen halaman BUMDes (summary-cards, sales-table, top-products, dll)
├── pengaturan/         # Komponen halaman pengaturan
├── figma/              # ImageWithFallback dan asset dari Figma
├── ui/                 # Wrapper Radix UI + Mantine reusable
└── layout/             # Layout components (main-layout)
```

---

## State Management

**Valtio** (`src/store/`) untuk state global antar komponen:
- `src/store/umkm.ts` — Filter & time range untuk halaman BUMDes

Untuk data fetching, komponen menggunakan `useState` + `useEffect` langsung (tidak ada library fetch seperti React Query/SWR).

---

## HTTP Clients

| Client | File | Digunakan di |
|---|---|---|
| `apiClient` | `src/utils/api-client.ts` | Frontend → endpoint internal (`/api/*`), typed dari `generated/api` |
| `desaExternalClient` | `src/utils/desa-external-client.ts` | Server → Desa Website API |
| `nocExternalClient` | `src/utils/noc-external-client.ts` | Server → NOC System API |

Frontend juga bisa call Desa API langsung via `fetch(${VITE_DESA_API_URL}/api/ekonomi/...)` — pattern ini dipakai di `bumdes-page.tsx` dan `satisfaction-chart.tsx`.

---

## Auth Flow

Better Auth (`src/utils/auth.ts`) dengan Prisma adapter:
- Session cookie-based (7 hari)
- Role field di `User`: `"admin"` atau `"user"`
- Email `ADMIN_EMAIL` otomatis jadi admin saat register
- Middleware: `src/middleware/authMiddleware.tsx` (server), `src/middleware/authMiddleware.tsx` (client guard)

---

## Generated Files

| Path | Generator | Isi |
|---|---|---|
| `generated/api.ts` | `bun run gen:api` | TypeScript types untuk internal API |
| `generated/noc-external/` | openapi-codegen | Types untuk NOC External API |
| `src/routeTree.gen.ts` | TanStack Router | Route tree (auto-generated, jangan edit manual) |
