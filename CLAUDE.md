# CLAUDE.md — Dashboard Desa Plus

## Project Overview

Dashboard administrasi desa berbasis web untuk **Desa Darmasaba**. Full-stack app: Elysia (server) + React (frontend) dalam satu Bun process. Data diambil dari dua external API: Desa Website API dan NOC System API.

---

## Stack

| Layer | Tech |
|---|---|
| Runtime | Bun |
| Backend | Elysia v1.4.22 |
| Frontend | React 19 + Vite (via Bun) |
| Router | TanStack Router |
| UI | Mantine v8 + Radix UI + Tailwind CSS v4 |
| State | Valtio |
| ORM | Prisma v6 + PostgreSQL |
| Auth | Better Auth v1.4 |
| HTTP client | openapi-fetch |
| Linter/formatter | Biome |

---

## Commands

```bash
bun run dev          # Dev server (port 3000, hot reload)
bun run build        # Production build
bun start            # Run production server
bun run check        # Biome lint + format fix
bun run gen:api      # Regenerate API types dari OpenAPI schema
bun run sync:noc     # Manual sync dari NOC system
bun run seed         # Seed semua data
bun run seed:auth    # Seed admin user saja
bun test             # Unit tests
bun run test:e2e     # Playwright E2E tests
```

---

## Architecture

- **Entry server:** `src/index.ts` — Elysia + Vite middleware
- **Frontend entry:** `src/index.html`
- **API routes:** `src/api/` — server-side Elysia handlers
- **React routes/pages:** `src/routes/` — TanStack Router file-based routing
- **Components:** `src/components/` — React components, dikelompokkan per fitur
- **Store:** `src/store/` — Valtio proxy stores
- **Utils:** `src/utils/` — clients, auth, db, env, logger

> Detail lebih lanjut: `.claude/ARCHITECTURE.md`

---

## External APIs

| Client | URL | Tujuan |
|---|---|---|
| `desaExternalClient` | `DESA_API_URL` (stg: `https://desa-darmasaba-stg.wibudev.com`) | Data desa: UMKM, APBDes, demografi, dll |
| `nocExternalClient` | `NOC_API_URL` (`https://darmasaba.muku.id/api/noc`) | Sync kegiatan divisi, dokumen |

Frontend bisa akses Desa API langsung via `VITE_DESA_API_URL` (CORS allowed).

---

## Key Conventions

- **Server route**: tambah di `src/api/` sebagai Elysia plugin, mount di `src/api/index.tsx`
- **Frontend route**: buat file di `src/routes/`, TanStack Router auto-detect
- **Data fetching frontend**: gunakan `fetch(${VITE_DESA_API_URL}/api/...)` untuk Desa API langsung, atau `apiClient.GET(...)` untuk endpoint internal
- **Styling**: Mantine untuk komponen utama, Tailwind untuk fine-tuning layout
- **Path alias**: `@/` → `src/`
- **TypeScript**: strict mode, no `any` kecuali benar-benar diperlukan
- **No hardcoded mock data** di komponen — gunakan empty state / 0 sebagai fallback

---

## Database

> Detail: `.claude/DATABASE.md`

PostgreSQL via Prisma. Key models:
- `Division`, `Activity`, `Document`, `Discussion`, `Event` — Kinerja divisi
- `Complaint`, `ServiceLetter` — Layanan publik
- `Resident`, `Banjar`, `HealthRecord`, `EmploymentRecord` — Demografi
- `Budget`, `BudgetTransaction`, `Umkm` — Keuangan & ekonomi
- `User`, `Session`, `Account`, `ApiKey` — Auth

---

## Deployment

> Detail: `.claude/DEPLOYMENT.md`

Deploy ke staging via slash command `/deploy-stg`. MCP server `deploy-stg` otomatis bump version, build, push, trigger GitHub Actions, dan verifikasi.

- **Staging:** `https://dashboard-desa-plus-stg.wibudev.com`
- **Repo:** `bipprojectbali/dashboard-desa-plus`, branch `stg`
