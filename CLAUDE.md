# CLAUDE.md — Dashboard Desa Plus

## Project Overview

Dashboard administrasi desa berbasis web untuk **Desa Darmasaba**. Full-stack app: Elysia (server) + React (frontend) dalam satu Bun process. Data diambil dari tiga external API: Desa Website API, NOC System API, dan Platform API (pengaduan & surat live). Fitur utama termasuk kinerja divisi, layanan publik, demografi, keuangan/APBDes, BUMDes, sosial-kesejahteraan, keamanan, dan **NOC Video Wall** (`/wall`) — kiosk display untuk TV/monitor NOC.

---

## Stack

| Layer | Tech |
|---|---|
| Runtime | Bun |
| Backend | Elysia `^1.4.22` |
| Frontend | React `^19` + Vite `^7.3.1` (via Bun) |
| Router | TanStack Router (`@tanstack/react-router` `^1.158.1`) |
| UI | Mantine `^8.3.14` + Radix UI (27 primitives) + Tailwind v4 (`@tailwindcss/vite` `^4.1.18`) |
| State | Valtio `^2.3.0`, TanStack Query `^5.101.2` |
| ORM | Prisma `^6.19.2` (+ `@prisma/adapter-pg` `^7.3.0`) + PostgreSQL |
| Auth | Better Auth `^1.4.18` (email/password + GitHub/Google OAuth) |
| HTTP client | openapi-fetch `^0.15.0` |
| Linter/formatter | Biome `2.3.14` (exact pin) |

---

## Commands

```bash
bun run dev          # Dev server (port 3000, hot reload; auto-kill port + auto gen:api dulu)
bun run build        # Production build
bun start            # Migrate + run production server
bun run check        # Biome check --write (lint + format fix)
bun run lint         # Biome check (read-only)
bun run format       # Biome format --write saja
bun run gen:api      # Regenerate API types dari OpenAPI schema
bun run sync:noc     # Manual sync dari NOC system
bun run seed         # Seed semua data (ada juga seed:auth/:demographics/:divisions/:services/:documents/:dashboard/:phase2)
bun run test         # Semua unit test (tests/api, tests/config, tests/hooks, tests/theme)
bun run test:api     # Unit test API saja (tests/api/)
bun run test:watch   # Unit test mode watch
bun run test:ui      # Unit test dengan UI dashboard
bun run verify       # Gate lengkap: lint (error-only) + semua test — jalankan setelah selesai fitur baru
```

---

## Architecture

- **Entry server:** `src/index.ts` — Elysia + Vite middleware
- **Frontend entry:** `src/index.html`
- **API routes:** `src/api/` — Elysia plugin per fitur, di-mount di `src/api/index.tsx`
- **React routes/pages:** `src/routes/` — TanStack Router file-based routing
- **Components:** `src/components/` — React components, dikelompokkan per fitur
- **Store:** `src/store/` — Valtio proxy stores (8 file)
- **Middleware:** `src/middleware/` — auth & API middleware
- **Utils:** `src/utils/` — HTTP clients, auth, db, env, logger

> Detail lengkap: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## External APIs

| Client | Env var | Tujuan |
|---|---|---|
| `desaExternalClient` | `DESA_API_URL` / `VITE_DESA_API_URL` (stg: `https://desa-darmasaba-stg.wibudev.com`) | Data desa: UMKM, APBDes, demografi, dll |
| `nocExternalClient` | `NOC_API_URL` (`https://darmasaba.muku.id/api/noc`), `NOC_API_KEY` | Sync kegiatan divisi, dokumen |
| `platformExternalClient` | `PLATFORM_API_URL`, `PLATFORM_API_TOKEN` (Bearer, server-only) | Pengaduan & Surat live (Fase 2) |

Frontend bisa akses Desa API langsung via `VITE_DESA_API_URL` (CORS allowed).

---

## Key Conventions

- **Server route**: tambah di `src/api/` sebagai Elysia plugin, mount di `src/api/index.tsx`
- **Frontend route**: buat file di `src/routes/`, TanStack Router auto-detect
- **Data fetching frontend**: gunakan `fetch(${VITE_DESA_API_URL}/api/...)` untuk Desa API langsung, atau `apiClient.GET(...)` untuk endpoint internal
- **Styling**: Mantine untuk komponen utama, Tailwind untuk fine-tuning layout
- **Drag-and-drop**: pakai `@dnd-kit` — lihat skill `react-dnd` (dipakai di Video Wall layout builder)
- **Path alias**: `@/` → `src/`
- **TypeScript**: strict mode, no `any` kecuali benar-benar diperlukan
- **No hardcoded mock data** di komponen — gunakan empty state / 0 sebagai fallback

---

## Testing

Semua test ada di `tests/` (root), pakai Bun native test runner (`bun:test`). Struktur:
- `tests/api/` — Elysia API test via `api.handle(new Request(...))`, tanpa server HTTP asli
- `tests/config/`, `tests/hooks/`, `tests/theme/` — unit test util/hook/tema
- `tests/setup/dom.ts` — preload happy-dom (auto-load lewat `bunfig.toml`) supaya lib yang sentuh `window` di top-level import (mis. `leaflet`) tidak crash di lingkungan test

**Konvensi test API**: route yang dilindungi `apiMiddleware` selalu 401 tanpa auth — manfaatkan ini untuk test auth-guard yang deterministik TANPA perlu koneksi DB nyata (request direject di `onBeforeHandle`, sebelum handler sempat query Prisma). Lihat `tests/api/sosial.test.ts` sebagai contoh pola.

**Wajib dijalankan agent setelah selesai fitur baru:**
```bash
bun run verify   # lint (error-only, non-blocking di warning) + semua test
```
Atau granular: `bun run lint` (biome, harus exit 0 di level error) dan `bun run test` (harus 0 fail).

---

## Database

> Detail lengkap: [`docs/DATABASE.md`](docs/DATABASE.md)

PostgreSQL via Prisma (39 model). Ringkasan per domain:
- **Auth & User**: `User`, `Session`, `Account`, `Verification`, `ApiKey`, `Invitation`
- **Preferences**: `NotificationPreference`, `UmumPreference`, `KeamananPreference`, `AksesPreference`
- **Keamanan & Audit**: `IpWhitelistEntry`, `ActivityLog`, `RolePermission`
- **Kinerja divisi**: `Division`, `Activity`, `Document`, `DocumentStat`, `Discussion`, `Event`, `DivisionMetric`
- **Layanan publik**: `Complaint`, `ComplaintUpdate`, `ServiceLetter`, `InnovationIdea`
- **Demografi**: `Resident`, `Banjar`, `HealthRecord`, `EmploymentRecord`, `PopulationDynamic`, `Posyandu`
- **Keuangan & ekonomi**: `Budget`, `BudgetTransaction`, `Umkm`
- **Video Wall**: `WallLayout` (singleton config kiosk `/wall`)
- **Lain-lain**: `SdgsScore`, `SatisfactionRating`, `SecurityReport`, `SyncLog`, `Faq`

---

## Deployment

> Detail lengkap: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

Deploy ke staging via slash command `/deploy-stg`. MCP server `deploy-stg` otomatis bump version, build, push, trigger GitHub Actions, dan verifikasi.

- **Staging:** `https://dashboard-desa-plus-stg.wibudev.com`
- **Repo:** `bipprojectbali/dashboard-desa-plus`, branch `stg`
