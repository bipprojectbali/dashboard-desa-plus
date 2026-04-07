# 📁 Struktur Project - Darmasaba Dashboard NOC

Dokumentasi lengkap struktur project Dashboard Darmasaba NOC.

**Versi:** 0.1.0-pre.2  
**Terakhir diupdate:** April 2026

---

## 🏗️ Arsitektur Overview

Project ini menggunakan **Single Port Architecture** dimana backend (ElysiaJS) dan frontend (React) berjalan di port yang sama (3000), menghilangkan masalah CORS dan proxy.

```
┌─────────────────────────────────────────────┐
│           Bun Server (Port 3000)            │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐    ┌─────────────────┐   │
│  │  ElysiaJS    │    │  Vite Middleware│   │
│  │  (Backend)   │    │   (Frontend)    │   │
│  │              │    │                 │   │
│  │  • API Routes│    │  • React 19     │   │
│  │  • Prisma    │    │  • TanStack     │   │
│  │  • Auth      │    │  • Mantine UI   │   │
│  └──────┬───────┘    └────────┬────────┘   │
│         │                     │             │
│         └──────────┬──────────┘             │
│                    │                        │
│              ┌─────▼─────┐                  │
│              │ PostgreSQL │                  │
│              └───────────┘                  │
└─────────────────────────────────────────────┘
```

---

## 📂 Struktur Direktori Lengkap

```
dashboard-desa-plus-fix/
│
├── 📄 .env.example                    # Template environment variables
├── 📄 .env.staging                    # Template untuk staging (tidak di-commit)
├── 📄 .gitignore                      # Git ignore rules
├── 📄 biome.json                      # Code formatter & linter config
├── 📄 bun.lock                        # Bun dependency lock file
├── 📄 bunfig.toml                     # Bun configuration
├── 📄 Dockerfile                      # Docker multi-stage build config
├── 📄 package.json                    # Project dependencies & scripts
├── 📄 playwright.config.ts            # E2E testing configuration
├── 📄 postcss.config.cjs              # PostCSS configuration
├── 📄 prisma.config.ts                # Prisma configuration
├── 📄 tailwind.config.js              # Tailwind CSS configuration
├── 📄 tsconfig.json                   # TypeScript configuration
│
├── 📁 __tests__/                      # Test suite
│   ├── 📁 api/                        # API & integration tests
│   │   ├── api.test.ts                # API endpoint tests
│   │   ├── database.test.ts           # Database tests
│   │   ├── features.test.ts           # Feature tests
│   │   └── noc.test.ts                # NOC sync tests
│   └── 📁 e2e/                        # End-to-end tests (Playwright)
│       ├── apikey.spec.ts             # API key E2E tests
│       ├── login.spec.ts              # Login flow tests
│       ├── noc-sync.spec.ts           # NOC sync E2E tests
│       └── signup.spec.ts             # Signup flow tests
│
├── 📁 generated/                      # Auto-generated files (jangan edit manual)
│   ├── 📁 prisma/                     # Prisma Client (auto-generated)
│   │   ├── index.d.ts                 # TypeScript declarations
│   │   ├── client.js                  # Prisma client runtime
│   │   └── ...                        # Prisma runtime files
│   │
│   ├── api.ts                         # Auto-generated API types from OpenAPI
│   ├── schema.json                    # OpenAPI schema
│   └── noc-external.ts                # NOC external API types
│
├── 📁 prisma/                         # Database management
│   ├── schema.prisma                  # Database schema definition
│   ├── seed.ts                        # Main seed script
│   └── 📁 seeders/                    # Modular seed scripts
│       ├── README.md                  # Seeder documentation
│       ├── seed-auth.ts               # Seed admin users & sessions
│       ├── seed-dashboard.ts          # Seed dashboard metrics (SDGS, Satisfaction)
│       ├── seed-demographics.ts       # Seed resident demographics
│       ├── seed-division-performance.ts # Seed division metrics
│       ├── seed-discussions.ts        # Seed discussion data
│       ├── seed-public-services.ts    # Seed service letter data
│       └── seed-phase2.ts             # Seed phase 2 features
│
├── 📁 scripts/                        # Automation & deployment scripts
│   ├── build.ts                       # Custom build script
│   ├── check-db.sh                    # Database diagnostic script
│   ├── check-sync-data.ts             # Check NOC sync data
│   ├── deploy-staging.sh              # Staging deployment script
│   ├── generate-schema.ts             # Generate OpenAPI schema
│   ├── inspect-noc-data.ts            # Inspect NOC data structure
│   ├── reset-noc-data.ts              # Reset NOC data
│   └── sync-noc.ts                    # NOC data synchronization script
│
├── 📁 src/                            # Source code utama
│   │
│   ├── 📁 api/                        # Backend API routes (ElysiaJS)
│   │   ├── apikey.ts                  # API key management endpoints
│   │   │   ├── POST /api/apikey/create
│   │   │   ├── GET /api/apikey/list
│   │   │   └── DELETE /api/apikey/:id
│   │   │
│   │   ├── complaint.ts               # Complaint & public service endpoints
│   │   │   ├── GET /api/complaint/stats
│   │   │   ├── GET /api/complaint/recent
│   │   │   ├── GET /api/complaint/trends
│   │   │   ├── GET /api/complaint/service-stats
│   │   │   ├── GET /api/complaint/service-trends
│   │   │   ├── GET /api/complaint/service-weekly
│   │   │   └── GET /api/complaint/innovation-ideas
│   │   │
│   │   ├── dashboard.ts               # Dashboard metrics endpoints
│   │   │   ├── GET /api/dashboard/budget
│   │   │   ├── GET /api/dashboard/sdgs
│   │   │   └── GET /api/dashboard/satisfaction
│   │   │
│   │   ├── division.ts                # Division & activity endpoints
│   │   │   ├── GET /api/division/
│   │   │   ├── GET /api/division/activities
│   │   │   ├── GET /api/division/activities/stats
│   │   │   ├── GET /api/division/documents/stats
│   │   │   └── GET /api/division/discussions
│   │   │
│   │   ├── event.ts                   # Event management endpoints
│   │   │   └── ...
│   │   │
│   │   ├── noc.ts                     # NOC synchronization endpoints
│   │   │   ├── POST /api/noc/sync
│   │   │   ├── GET /api/noc/last-sync
│   │   │   ├── GET /api/noc/active-divisions
│   │   │   ├── GET /api/noc/latest-projects
│   │   │   ├── GET /api/noc/upcoming-events
│   │   │   ├── GET /api/noc/diagram-jumlah-document
│   │   │   ├── GET /api/noc/diagram-progres-kegiatan
│   │   │   ├── GET /api/noc/apbdes-data
│   │   │   ├── GET /api/noc/latest-discussion
│   │   │   └── GET /api/noc/satisfaction-categories
│   │   │
│   │   ├── profile.ts                 # User profile endpoints
│   │   │   └── ...
│   │   │
│   │   └── resident.ts                # Resident demographics endpoints
│   │       └── ...
│   │
│   ├── 📁 components/                 # React UI components
│   │   │
│   │   ├── 📁 dashboard/              # Dashboard page components
│   │   │   ├── activity-list.tsx      # Recent activities list
│   │   │   ├── chart-apbdes.tsx       # APBDes budget chart
│   │   │   ├── chart-surat.tsx        # Service letter trends chart
│   │   │   ├── division-progress.tsx  # Division progress chart
│   │   │   ├── satisfaction-chart.tsx # Satisfaction rating pie chart
│   │   │   ├── sdgs-card.tsx          # SDGs score cards
│   │   │   └── stat-card.tsx          # Statistics display card
│   │   │
│   │   ├── 📁 kinerja-divisi/         # Division performance page
│   │   │   ├── activity-card.tsx      # Activity display card
│   │   │   ├── archive-card.tsx       # Archive display card
│   │   │   ├── discussion-panel.tsx   # Discussion thread panel
│   │   │   ├── division-list.tsx      # Division list view
│   │   │   ├── document-chart.tsx     # Document statistics chart
│   │   │   ├── event-card.tsx         # Event display card
│   │   │   └── progress-chart.tsx     # Progress visualization
│   │   │
│   │   ├── 📁 pengaturan/             # Settings page components
│   │   │   ├── akses-dan-tim.tsx      # Access & team management
│   │   │   ├── keamanan.tsx           # Security settings
│   │   │   ├── notifikasi.tsx         # Notification settings
│   │   │   ├── sinkronisasi.tsx       # NOC sync settings
│   │   │   └── umum.tsx               # General settings
│   │   │
│   │   ├── 📁 sosial/                 # Social page components
│   │   │   ├── beasiswa.tsx           # Scholarship management
│   │   │   ├── event-calendar.tsx     # Event calendar view
│   │   │   ├── health-stats.tsx       # Health statistics
│   │   │   ├── pendidikan.tsx         # Education statistics
│   │   │   ├── posyandu-schedule.tsx  # Posyandu schedule
│   │   │   └── summary-cards.tsx      # Summary stat cards
│   │   │
│   │   ├── 📁 umkm/                   # UMKM (village business) components
│   │   │   ├── header-toggle.tsx      # Header toggle component
│   │   │   ├── produk-unggulan.tsx    # Featured products
│   │   │   ├── sales-table.tsx        # Sales data table
│   │   │   ├── summary-cards.tsx      # Summary cards
│   │   │   └── top-products.tsx       # Top products list
│   │   │
│   │   ├── 📁 ui/                     # Reusable UI components (shadcn)
│   │   │   ├── accordion.tsx          # Accordion component
│   │   │   ├── alert-dialog.tsx       # Alert dialog component
│   │   │   ├── alert.tsx              # Alert component
│   │   │   ├── avatar.tsx             # Avatar component
│   │   │   ├── badge.tsx              # Badge component
│   │   │   ├── button.tsx             # Button component
│   │   │   ├── calendar.tsx           # Calendar component
│   │   │   ├── card.tsx               # Card component
│   │   │   ├── carousel.tsx           # Carousel component
│   │   │   ├── chart.tsx              # Chart component
│   │   │   ├── checkbox.tsx           # Checkbox component
│   │   │   ├── command.tsx            # Command palette
│   │   │   ├── dialog.tsx             # Dialog/modal component
│   │   │   ├── drawer.tsx             # Drawer component
│   │   │   ├── dropdown-menu.tsx      # Dropdown menu
│   │   │   ├── form.tsx               # Form component
│   │   │   ├── input.tsx              # Input component
│   │   │   ├── label.tsx              # Label component
│   │   │   ├── popover.tsx            # Popover component
│   │   │   ├── progress.tsx           # Progress bar
│   │   │   ├── select.tsx             # Select dropdown
│   │   │   ├── separator.tsx          # Separator component
│   │   │   ├── sheet.tsx              # Sheet/sidebar component
│   │   │   ├── sidebar.tsx            # Sidebar component
│   │   │   ├── skeleton.tsx           # Skeleton loader
│   │   │   ├── slider.tsx             # Slider component
│   │   │   ├── sonner.tsx             # Toast notifications
│   │   │   ├── switch.tsx             # Switch/toggle
│   │   │   ├── table.tsx              # Table component
│   │   │   ├── tabs.tsx               # Tabs component
│   │   │   ├── textarea.tsx           # Textarea component
│   │   │   ├── tooltip.tsx            # Tooltip component
│   │   │   └── ...                    # More UI components
│   │   │
│   │   ├── 📁 figma/                  # Figma design utilities
│   │   │   └── ImageWithFallback.tsx  # Image with fallback
│   │   │
│   │   ├── 📁 layout/                 # Layout components
│   │   │   └── main-layout.tsx        # Main page layout wrapper
│   │   │
│   │   ├── bumdes-page.tsx            # BUMDes page component
│   │   ├── dashboard-card.tsx         # Dashboard card wrapper
│   │   ├── dashboard-content.tsx      # Main dashboard content
│   │   ├── demografi-pekerjaan.tsx    # Demographics page
│   │   ├── dev-inspector.tsx          # Dev inspector (dev-only)
│   │   ├── header.tsx                 # Page header component
│   │   ├── help-page.tsx              # Help page component
│   │   ├── jenna-analytic.tsx         # Jenna Analytic page
│   │   ├── keamanan-page.tsx          # Security page
│   │   ├── keuangan-anggaran.tsx      # Finance page
│   │   ├── kinerja-divisi.tsx         # Division performance page
│   │   ├── pengaduan-layanan-publik.tsx # Complaints page
│   │   ├── sidebar.tsx                # Main sidebar
│   │   └── sosial-page.tsx            # Social page
│   │
│   ├── 📁 hooks/                      # Custom React hooks
│   │   └── ...                        # (Jika ada custom hooks)
│   │
│   ├── 📁 middleware/                  # Elysia middleware
│   │   ├── apiMiddleware.ts           # API authentication & validation
│   │   └── ...                        # Other middleware
│   │
│   ├── 📁 routes/                     # TanStack Router file-based routes
│   │   │
│   │   ├── __root.tsx                 # Root layout route
│   │   ├── index.tsx                  # Home route (dashboard)
│   │   │
│   │   ├── 📁 admin/                  # Admin routes
│   │   │   ├── index.tsx              # Admin dashboard
│   │   │   ├── route.tsx              # Admin layout
│   │   │   ├── apikey.tsx             # API key management
│   │   │   ├── settings.tsx           # Admin settings
│   │   │   └── users.tsx              # User management
│   │   │
│   │   ├── 📁 pengaturan/             # Settings routes
│   │   │   ├── route.tsx              # Settings layout
│   │   │   ├── akses-dan-tim.tsx      # Access & team
│   │   │   ├── keamanan.tsx           # Security settings
│   │   │   ├── notifikasi.tsx         # Notification settings
│   │   │   ├── sinkronisasi.tsx       # NOC sync settings
│   │   │   └── umum.tsx               # General settings
│   │   │
│   │   ├── 📁 profile/                # Profile routes
│   │   │   ├── index.tsx              # View profile
│   │   │   ├── route.tsx              # Profile layout
│   │   │   └── edit.tsx               # Edit profile
│   │   │
│   │   ├── 📁 users/                  # User management routes
│   │   │   ├── index.tsx              # User list
│   │   │   └── $id.tsx                # User detail
│   │   │
│   │   ├── bantuan.tsx                # Bantuan page
│   │   ├── bumdes.tsx                 # BUMDes page
│   │   ├── demografi-pekerjaan.tsx    # Work demographics
│   │   ├── jenna-analytic.tsx         # Jenna Analytic page
│   │   ├── keamanan.tsx               # Security page
│   │   ├── keuangan-anggaran.tsx      # Finance & budget
│   │   ├── kinerja-divisi.tsx         # Division performance
│   │   ├── pengaduan-layanan-publik.tsx # Public complaints
│   │   ├── signin.tsx                 # Login page
│   │   ├── signup.tsx                 # Register page
│   │   └── sosial.tsx                 # Social page
│   │
│   ├── 📁 store/                      # Global state management (Valtio)
│   │   └── ...                        # (Global state stores)
│   │
│   ├── 📁 utils/                      # Shared utilities
│   │   ├── api-client.ts              # Type-safe API client (openapi-fetch)
│   │   ├── auth-client.ts             # Client-side auth utilities
│   │   ├── auth.ts                    # Better Auth server configuration
│   │   ├── db.ts                      # Prisma client initialization
│   │   ├── desa-external-client.ts    # External Desa API client
│   │   ├── dev-inspector-plugin.ts    # Dev inspector Vite plugin
│   │   ├── env.ts                     # Environment variable validation
│   │   ├── logger.ts                  # Pino logger
│   │   ├── noc-external-client.ts     # NOC external API client
│   │   └── open-in-editor.ts          # Open-in-editor utility
│   │
│   ├── frontend.tsx                   # React app entry point
│   ├── index.css                      # Global CSS styles
│   ├── index.html                     # HTML template
│   ├── index.ts                       # Server entry point (Bun + Elysia)
│   ├── logo.svg                       # Logo asset
│   ├── react.svg                      # React asset
│   ├── router.tsx                     # Router configuration
│   ├── routeTree.gen.ts               # Auto-generated route tree
│   └── vite.ts                        # Vite configuration
│
├── 📁 Dashboard-MD/                   # Design documentation & specs
│   ├── BANTUAN.md                     # Bantuan page design
│   ├── BUMDES.md                      # BUMDes page design
│   ├── DASHBOARD_DESIGN.md            # Dashboard design specs
│   ├── DEMOGRAFI_KEPENDUDUKAN.md      # Demographics design
│   ├── JENNA_ANALYTHIC.md             # Jenna Analytic design
│   ├── KEAMANAN.md                    # Security design
│   ├── KEUANGAN_ANGGARAN.md           # Finance design
│   ├── KINERJA-DIVISI-2.md            # Division performance design
│   ├── PENGAUDAN.md                   # Audit design
│   ├── SIDEBAR.md                     # Sidebar design
│   └── SOSIAL.md                      # Social page design
│
├── 📁 MIND/                           # Project planning & documentation
│   ├── 📁 PLAN/                       # Implementation plans
│   │   ├── activity-noc-integration.md
│   │   ├── activity-progress-noc-integration.md
│   │   ├── database-schema-complete.md
│   │   ├── discussion-noc-integration.md
│   │   ├── integrate-apbdes-external-api.md
│   │   ├── integrate-noc-active-divisions.md
│   │   ├── integrate-noc-document-chart.md
│   │   ├── noc-discussion-integration.md
│   │   ├── noc-latest-projects-integration.md
│   │   ├── routing-and-layout-optimization.md
│   │   ├── sync-division-activity-count.md
│   │   ├── sync-document-chart-noc-api.md
│   │   ├── update-division-list-noc-data.md
│   │   └── update-satisfaction-chart-api.md
│   │
│   ├── 📁 TASK/                       # Task breakdowns
│   │   ├── integrate-apbdes-external-api.md
│   │   ├── sync-document-chart-noc-api.md
│   │   └── 📁 noc-integration/
│   │       └── ...
│   │
│   └── 📁 MEMO/                       # Analysis & memos
│       ├── darmasaba-features-analysis.md
│       ├── darmasaba-routes-complete.md
│       └── 📁 noc-api/
│           └── integration-contract.md
│
├── 📁 public/                         # Static assets (served as-is)
│   └── ...                            # (Images, fonts, manifest, etc.)
│
├── 📁 .gemini/                        # Gemini Code assistant config
│   ├── settings.json
│   └── 📁 hooks/
│       └── telegram-notify.ts         # Telegram notification hook
│
├── 📁 .qwen/                          # Qwen Code assistant config
│   └── settings.json
│
├── 📄 CHANGELOG.md                    # Version history & changes
├── 📄 DEPLOYMENT.md                   # Full deployment guide
├── 📄 STAGING-README.md               # Quick staging guide
├── 📄 TROUBLESHOOTING.md              # Troubleshooting guide
├── 📄 QWEN.md                         # Qwen Code context
├── 📄 README.md                       # Project overview
├── 📄 grafikRealisasi.md              # Realization charts docs
└── 📄 Dashboard-MD/                   # Additional design docs
```

---

## 🗂️ Penjelasan Setiap Direktori

### **Root Directory**
File-file konfigurasi utama project.

| File/Folder | Deskripsi |
|------------|-----------|
| `.env.example` | Template environment variables yang harus di-copy ke `.env` |
| `.env.staging` | Template khusus untuk deployment staging |
| `biome.json` | Konfigurasi linter & formatter (pengganti ESLint + Prettier) |
| `bun.lock` | Lock file dependencies Bun (seperti package-lock.json) |
| `bunfig.toml` | Konfigurasi Bun runtime |
| `Dockerfile` | Konfigurasi Docker multi-stage build |
| `package.json` | Dependencies, scripts, dan metadata project |
| `playwright.config.ts` | Konfigurasi E2E testing dengan Playwright |
| `prisma.config.ts` | Konfigurasi Prisma ORM |
| `tailwind.config.js` | Konfigurasi Tailwind CSS (warna custom, dll) |
| `tsconfig.json` | Konfigurasi TypeScript (path aliases, strict mode, dll) |

---

### **`__tests__/` - Test Suite**
Semua test files untuk API dan E2E.

```
__tests__/
├── api/              # Unit & integration tests untuk API
│   ├── api.test.ts           # Test semua endpoint API
│   ├── database.test.ts      # Test database operations
│   ├── features.test.ts      # Test fitur-fitur utama
│   └── noc.test.ts           # Test NOC sync functionality
└── e2e/              # End-to-end tests dengan Playwright
    ├── apikey.spec.ts        # Test flow API key management
    ├── login.spec.ts         # Test login flow
    ├── noc-sync.spec.ts      # Test NOC sync E2E
    └── signup.spec.ts        # Test signup flow
```

**Run tests:**
```bash
bun run test          # API tests
bun run test:e2e      # E2E tests
bun run test:ui       # Tests dengan UI dashboard
```

---

### **`generated/` - Auto-Generated Files**
Files yang di-generate otomatis, **JANGAN edit manual**.

```
generated/
├── prisma/           # Prisma Client (dari `prisma generate`)
│   ├── index.d.ts          # TypeScript definitions
│   ├── client.js           # Prisma client runtime code
│   └── ...                 # Files internal Prisma
├── api.ts            # API types (dari `openapi-typescript`)
├── schema.json       # OpenAPI schema (dari `generate-schema.ts`)
└── noc-external.ts   # NOC external API types
```

**Generate:**
```bash
bun x prisma generate     # Generate Prisma client
bun run gen:api           # Generate API types
```

---

### **`prisma/` - Database Management**
Schema, migrations, dan seed scripts.

```
prisma/
├── schema.prisma       # Database schema (models, relations, enums)
├── seed.ts             # Main seed orchestrator
└── seeders/            # Modular seed scripts
    ├── README.md               # Dokumentasi seeders
    ├── seed-auth.ts            # Seed admin user, demo users
    ├── seed-dashboard.ts       # Seed SDGS, satisfaction, budget
    ├── seed-demographics.ts    # Seed residents, banjar, population
    ├── seed-division-performance.ts  # Seed division metrics
    ├── seed-discussions.ts     # Seed discussion threads
    ├── seed-public-services.ts # Seed service letters, innovations
    └── seed-phase2.ts          # Seed phase 2 features
```

**Commands:**
```bash
bun x prisma migrate dev    # Create & apply migration
bun x prisma migrate deploy # Apply migrations (production)
bun run seed                # Run all seeders
bun run seed:auth           # Seed auth only
bun run seed:dashboard      # Seed dashboard data
```

**Schema Models:**
- `User` - User accounts
- `Division` - Divisi desa
- `Activity` - Kegiatan divisi
- `Document` - Dokumen
- `Discussion` - Forum diskusi
- `Event` - Event desa
- `Complaint` - Pengaduan masyarakat
- `ServiceLetter` - Surat layanan
- `InnovationIdea` - Ide inovasi
- `Resident` - Data penduduk
- `Banjar` - Wilayah banjar
- `Budget` - Anggaran
- `SdgsScore` - Skor SDGS
- `SatisfactionRating` - Rating kepuasan
- Dan lain-lain...

---

### **`scripts/` - Automation Scripts**
Scripts untuk deployment, sync, dan maintenance.

```
scripts/
├── build.ts                  # Custom build script
├── check-db.sh               # Diagnostic koneksi database
├── check-sync-data.ts        # Cek data NOC sebelum sync
├── deploy-staging.sh         # Script deploy ke staging
├── generate-schema.ts        # Generate OpenAPI schema dari code
├── inspect-noc-data.ts       # Inspect struktur data NOC
├── reset-noc-data.ts         # Reset data NOC di database
└── sync-noc.ts               # Script sinkronisasi dengan NOC server
```

**Usage:**
```bash
./scripts/deploy-staging.sh   # Deploy ke staging
./scripts/check-db.sh         # Cek database connection
bun scripts/sync-noc.ts       # Sync data NOC
```

---

### **`src/` - Source Code Utama**

#### **`src/api/` - Backend Routes (ElysiaJS)**

Semua endpoint API backend. Setiap file adalah modul routes dengan prefix.

```
src/api/
├── apikey.ts         # POST /api/apikey/* - API key management
├── complaint.ts      # GET /api/complaint/* - Complaint stats & trends
├── dashboard.ts      # GET /api/dashboard/* - Dashboard metrics
├── division.ts       # GET /api/division/* - Divisions & activities
├── event.ts          # Event management endpoints
├── noc.ts            # POST/GET /api/noc/* - NOC sync & data
├── profile.ts        # User profile endpoints
└── resident.ts       # Resident demographics endpoints
```

**Route Registration:**
Semua routes di-import dan digabung di `src/api/index.ts` (jika ada) atau di `src/index.ts`.

**API Workflow:**
1. Define route & schema di `src/api/*.ts`
2. Run `bun run gen:api` untuk generate types
3. Use `apiClient` di frontend dengan full type safety

---

#### **`src/components/` - React UI Components**

##### **Page Components**
Komponen utama untuk setiap halaman.

```
components/
├── dashboard-content.tsx        # Main dashboard view
├── kinerja-divisi.tsx           # Division performance page
├── pengaduan-layanan-publik.tsx # Public complaints page
├── keuangan-anggaran.tsx        # Finance & budget page
├── demografi-pekerjaan.tsx      # Work demographics page
├── sosial-page.tsx              # Social programs page
├── bumdes-page.tsx              # Village business page
├── jenna-analytic.tsx           # Analytics page
├── keamanan-page.tsx            # Security page
└── sidebar.tsx                  # Main navigation sidebar
```

##### **Dashboard Components**
```
components/dashboard/
├── activity-list.tsx        # List aktivitas terbaru
├── chart-apbdes.tsx         # Chart APBDes (anggaran vs realisasi)
├── chart-surat.tsx          # Chart trensurat layanan
├── division-progress.tsx    # Progress divisi per periode
├── satisfaction-chart.tsx   # Pie chart kepuasan masyarakat
├── sdgs-card.tsx            # Cards skor SDGS
└── stat-card.tsx            # Generic stat card component
```

##### **Division Performance Components**
```
components/kinerja-divisi/
├── activity-card.tsx        # Card untuk setiap activity
├── archive-card.tsx         # Card arsip kegiatan
├── discussion-panel.tsx     # Panel forum diskusi
├── division-list.tsx        # List divisi
├── document-chart.tsx       # Chart dokumen by category
├── event-card.tsx           # Card event
└── progress-chart.tsx       # Chart progress divisi
```

##### **Settings Components**
```
components/pengaturan/
├── akses-dan-tim.tsx        # Manajemen akses & tim
├── keamanan.tsx             # Pengaturan keamanan
├── notifikasi.tsx           # Pengaturan notifikasi
├── sinkronisasi.tsx         # Sinkronisasi NOC
└── umum.tsx                 # Pengaturan umum
```

##### **Social Components**
```
components/sosial/
├── beasiswa.tsx             # Program beasiswa
├── event-calendar.tsx       # Kalender event desa
├── health-stats.tsx         # Statistik kesehatan
├── pendidikan.tsx           # Statistik pendidikan
├── posyandu-schedule.tsx    # Jadwal posyandu
└── summary-cards.tsx        # Summary cards
```

##### **UMKM Components**
```
components/umkm/
├── header-toggle.tsx        # Toggle header UMKM
├── produk-unggulan.tsx      # Produk unggulan desa
├── sales-table.tsx          # Tabel penjualan
├── summary-cards.tsx        # Summary UMKM
└── top-products.tsx         # Produk terlaris
```

##### **UI Components (shadcn)**
Reusable UI primitives dari shadcn/ui.

```
components/ui/
├── accordion.tsx       # Accordion/collapsible
├── alert-dialog.tsx    # Confirmation dialogs
├── alert.tsx           # Alert messages
├── avatar.tsx          # User avatar
├── badge.tsx           # Badge/tag
├── button.tsx          # Button variants
├── calendar.tsx        # Date picker calendar
├── card.tsx            # Card container
├── checkbox.tsx        # Checkbox input
├── dialog.tsx          # Modal dialogs
├── dropdown-menu.tsx   # Dropdown menus
├── form.tsx            # Form wrapper
├── input.tsx           # Text input
├── label.tsx           # Input labels
├── popover.tsx         # Popover tooltips
├── progress.tsx        # Progress bars
├── select.tsx          # Select dropdown
├── separator.tsx       # Divider/separator
├── sheet.tsx           # Side sheets
├── sidebar.tsx         # Sidebar navigation
├── skeleton.tsx        # Loading placeholders
├── switch.tsx          # Toggle switches
├── table.tsx           # Data tables
├── tabs.tsx            # Tab navigation
├── textarea.tsx        # Multi-line input
├── tooltip.tsx         # Tooltips
└── ...                 # More components
```

---

#### **`src/routes/` - Frontend Routes (TanStack Router)**

File-based routing. Setiap file = satu route.

```
routes/
├── __root.tsx                    # Root layout (wrap semua pages)
├── index.tsx                     # GET / (Dashboard home)
│
├── signin.tsx                    # GET /signin (Login page)
├── signup.tsx                    # GET /signup (Register page)
│
├── bantuan.tsx                   # GET /bantuan
├── bumdes.tsx                    # GET /bumdes
├── demografi-pekerjaan.tsx       # GET /demografi-pekerjaan
├── jenna-analytic.tsx            # GET /jenna-analytic
├── keamanan.tsx                  # GET /keamanan
├── keuangan-anggaran.tsx         # GET /keuangan-anggaran
├── kinerja-divisi.tsx            # GET /kinerja-divisi
├── pengaduan-layanan-publik.tsx  # GET /pengaduan-layanan-publik
├── sosial.tsx                    # GET /sosial
│
├── 📁 admin/                     # /admin/* (Admin area)
│   ├── index.tsx                 # GET /admin
│   ├── route.tsx                 # Admin layout
│   ├── apikey.tsx                # GET /admin/apikey
│   ├── settings.tsx              # GET /admin/settings
│   └── users.tsx                 # GET /admin/users
│
├── 📁 pengaturan/                # /pengaturan/* (Settings area)
│   ├── route.tsx                 # Settings layout
│   ├── akses-dan-tim.tsx         # GET /pengaturan/akses-dan-tim
│   ├── keamanan.tsx              # GET /pengaturan/keamanan
│   ├── notifikasi.tsx            # GET /pengaturan/notifikasi
│   ├── sinkronisasi.tsx          # GET /pengaturan/sinkronisasi
│   └── umum.tsx                  # GET /pengaturan/umum
│
├── 📁 profile/                   # /profile/*
│   ├── index.tsx                 # GET /profile
│   ├── route.tsx                 # Profile layout
│   └── edit.tsx                  # GET /profile/edit
│
└── 📁 users/                     # /users/*
    ├── index.tsx                 # GET /users (User list)
    └── $id.tsx                   # GET /users/:id (User detail)
```

**Route Generation:**
Routes di-generate otomatis oleh TanStack Router saat `dev` atau build.
```bash
bun run dev              # Auto-generate routes
npx @tanstack/router-cli # Manual route generation
```

---

#### **`src/utils/` - Utilities**

Shared utilities untuk backend & frontend.

```
utils/
├── api-client.ts              # Type-safe API client (openapi-fetch)
├── auth-client.ts             # Client-side auth hooks
├── auth.ts                    # Better Auth server config
├── db.ts                      # Prisma client singleton
├── desa-external-client.ts    # Client untuk external Desa API
├── dev-inspector-plugin.ts    # Vite plugin dev inspector
├── env.ts                     # Env var validation
├── logger.ts                  # Pino logger config
├── noc-external-client.ts     # Client untuk external NOC API
└── open-in-editor.ts          # Open file in editor utility
```

**Key Utilities:**

**`api-client.ts`** - Type-safe API client:
```typescript
import { apiClient } from "@/utils/api-client";

// Full type safety!
const { data, error } = await apiClient.GET("/api/noc/last-sync", {
  params: { query: { idDesa: "desa1" } },
});
```

**`db.ts`** - Prisma client singleton:
```typescript
import { prisma } from "@/utils/db";

const users = await prisma.user.findMany();
```

**`auth.ts`** - Better Auth configuration:
- Email/password authentication
- GitHub OAuth (optional)
- Session management
- Role-based access

---

#### **`src/middleware/` - Backend Middleware**

```
middleware/
└── apiMiddleware.ts    # Authentication, validation, logging
```

Middleware yang apply ke API routes:
- Authentication check
- Request validation
- Error handling
- Logging

---

#### **`src/store/` - Global State (Valtio)**

```
store/
└── ...                 # Valtio proxy stores (jika ada)
```

Global state management menggunakan Valtio (proxy-based).

---

#### **Entry Points**

```
src/
├── index.ts            # Server entry (Bun + Elysia + Vite)
├── frontend.tsx        # React app entry (render ke DOM)
├── index.html          # HTML template
├── index.css           # Global styles
├── router.tsx          # Router instance
└── routeTree.gen.ts    # Auto-generated route tree
```

**`index.ts`** - Server entry point:
- Setup Elysia app
- Register API routes
- Setup Vite middleware (dev)
- Serve static files (prod)
- Start server on port 3000

**`frontend.tsx`** - React entry point:
- Create router
- Setup Mantine theme
- Render to DOM
- Hot module replacement (dev)

---

### **`Dashboard-MD/` - Design Documentation**

Dokumentasi design untuk setiap halaman.

```
Dashboard-MD/
├── DASHBOARD_DESIGN.md            # Main dashboard design specs
├── SIDEBAR.md                     # Sidebar design
├── KINERJA-DIVISI-2.md            # Division performance design
├── KEUANGAN_ANGGARAN.md           # Finance design
├── DEMOGRAFI_KEPENDUDUKAN.md      # Demographics design
├── SOSIAL.md                      # Social page design
├── BUMDES.md                      # BUMDes design
├── JENNA_ANALYTHIC.md             # Analytics design
├── KEAMANAN.md                    # Security design
├── BANTUAN.md                     # Bantuan design
└── PENGAUDAN.md                   # Audit design
```

---

### **`MIND/` - Project Planning**

Dokumentasi perencanaan dan analisis.

```
MIND/
├── 📁 PLAN/              # Implementation plans
│   ├── database-schema-complete.md
│   ├── activity-noc-integration.md
│   ├── integrate-apbdes-external-api.md
│   └── ...
├── 📁 TASK/              # Task breakdowns
│   ├── noc-integration/
│   ├── database-implementation/
│   └── ...
└── 📁 MEMO/              # Analysis & memos
    ├── darmasaba-features-analysis.md
    ├── darmasaba-routes-complete.md
    └── noc-api/
        └── integration-contract.md
```

---

### **Configuration Folders**

```
.gemini/                  # Gemini assistant config
├── settings.json
└── hooks/
    └── telegram-notify.ts

.qwen/                    # Qwen assistant config
└── settings.json
```

---

## 🔑 File-File Penting

### **Configuration Files**

| File | Purpose | Edit When |
|------|---------|-----------|
| `package.json` | Dependencies & scripts | Add/remove packages |
| `tsconfig.json` | TypeScript config | Change compiler options |
| `tailwind.config.js` | Tailwind CSS config | Add custom colors/utilities |
| `biome.json` | Linting & formatting | Change code style rules |
| `prisma.config.ts` | Prisma config | Change DB connection |
| `playwright.config.ts` | E2E test config | Change test settings |

### **Environment Variables**

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `BETTER_AUTH_SECRET` | Auth encryption secret (min 32 chars) | ✅ Yes |
| `ADMIN_EMAIL` | Admin user email | ✅ For seeding |
| `ADMIN_PASSWORD` | Admin user password | ✅ For seeding |
| `VITE_DESA_API_URL` | External Desa API URL (frontend) | ✅ For build |
| `DESA_API_URL` | External Desa API URL (backend) | ✅ Yes |
| `NOC_API_URL` | NOC server API URL | ✅ Yes |
| `VITE_PUBLIC_URL` | App public URL (frontend) | ✅ For build |
| `PORT` | Server port (default: 3000) | ❌ Optional |
| `NODE_ENV` | Environment (dev/prod) | ❌ Optional |
| `LOG_LEVEL` | Logger verbosity | ❌ Optional |

### **Entry Points**

| File | Purpose |
|------|---------|
| `src/index.ts` | Server startup (Bun + Elysia) |
| `src/frontend.tsx` | React app render |
| `src/api/*.ts` | API route definitions |
| `src/routes/*.tsx` | Page route definitions |
| `prisma/schema.prisma` | Database schema |

---

## 📊 Database Schema Overview

### **Core Models**

```
User ──────────────────────┐
├─ accounts (1:N)          │
├─ sessions (1:N)          │
├─ apiKeys (1:N)           │
├─ discussions (1:N)       │
├─ events (1:N)            │
├─ complaints (1:N)        │
├─ serviceLetters (1:N)    │
└─ innovationIdeas (1:N)   │
                           │
Division ──────────────────┤
├─ activities (1:N)        │
├─ documents (1:N)         │
├─ discussions (1:N)       │
└─ metrics (1:N)           │
                           │
Activity ──────────────────┤
├─ belongsTo: Division     │
└─ assignedTo: User[]      │
                           │
Complaint ─────────────────┤
├─ reporter: User?         │
├─ assignee: User?         │
└─ updates (1:N)           │
                           │
Resident ──────────────────┤
├─ belongsTo: Banjar       │
├─ healthRecords (1:N)     │
└─ employmentRecords (1:N) │
                           │
ServiceLetter ─────────────┤
├─ processedBy: User?      │
└─ letterType (enum)       │
                           │
Event ─────────────────────┤
└─ createdBy: User         │
                           │
Discussion ────────────────┤
├─ sender: User            │
├─ division: Division?     │
└─ replies (self-ref 1:N)  │
                           │
Banjar ────────────────────┤
├─ residents (1:N)         │
└─ umkms (1:N)             │
                           │
Budget ────────────────────┤
└─ fiscalYear              │
                           │
SdgsScore ─────────────────┤
└─ title, score, image     │
                           │
SatisfactionRating ────────┘
└─ category, value, color
```

---

## 🚀 Development Workflow

### **1. Start Development**
```bash
bun install          # Install dependencies
cp .env.example .env # Setup environment
bun run dev          # Start dev server (port 3000)
```

### **2. Make Changes**

**Add API endpoint:**
1. Edit `src/api/<module>.ts`
2. Run `bun run gen:api`
3. Use in frontend with `apiClient`

**Add page:**
1. Create `src/routes/my-page.tsx`
2. Create component `src/components/my-page.tsx`
3. Auto-routed! Access `/my-page`

**Change database:**
1. Edit `prisma/schema.prisma`
2. Run `bun x prisma migrate dev`
3. Update seeders if needed

### **3. Test**
```bash
bun run test          # API tests
bun run test:e2e      # E2E tests
bun run check         # Lint & format
```

### **4. Deploy**
```bash
# Build
./scripts/deploy-staging.sh

# Or manual
docker build --build-arg ... -t app:latest .

# Deploy to Portainer
# Run migrations
bun x prisma migrate deploy

# Seed if needed
bun run seed
```

---

## 🎯 Key Architectural Decisions

### **1. Single Port Architecture**
- Backend (Elysia) dan Frontend (Vite) di port 3000 yang sama
- **Keuntungan:** No CORS, simpler deployment, better DX
- **Implementasi:** Vite as middleware di Elysia (dev mode)

### **2. Contract-First API**
- API schema didefinisikan di backend dengan TypeScript types
- Frontend types di-generate otomatis dari schema
- **Keuntungan:** Full type safety, auto-completion, refactor-safe

### **3. File-Based Routing**
- Routes otomatis dari struktur file `src/routes/`
- **Keuntungan:** No route config, intuitive structure, type-safe

### **4. Multi-Stage Docker Build**
- Stage 1: Build (install deps, generate, build frontend)
- Stage 2: Runtime (only production files)
- **Keuntungan:** Smaller image, faster deployment, better security

### **5. Modular Seeders**
- Seed data terpisah per fitur (auth, dashboard, demographics, dll)
- **Keuntungan:** Flexible seeding, easier testing, maintainable

---

## 📈 Project Metrics

| Metric | Value |
|--------|-------|
| **API Endpoints** | ~30+ routes |
| **Database Models** | 25+ models |
| **React Components** | 90+ components |
| **Pages/Routes** | 25+ routes |
| **UI Components** | 40+ shadcn components |
| **Test Files** | 8 test files |
| **Seeders** | 7 modular seeders |

---

## 🔗 Related Documentation

- `README.md` - Project overview & quick start
- `DEPLOYMENT.md` - Full deployment guide
- `STAGING-README.md` - Quick staging instructions
- `TROUBLESHOOTING.md` - Common errors & solutions
- `QWEN.md` - Qwen Code context

---

**Dibuat:** April 2026  
**Diperbarui:** April 2026  
**Penulis:** Dashboard NOC Team
