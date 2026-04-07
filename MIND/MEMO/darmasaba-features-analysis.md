# Darmasaba Dashboard - Analisis Fitur Lengkap

**Tanggal Analisis:** 26 Maret 2026  
**Versi Aplikasi:** 0.1.0-pre.2  
**Runtime:** Bun + React 19 + ElysiaJS

---

## 📋 DAFTAR ISI

1. [Ringkasan Eksekutif](#ringkasan-eksekutif)
2. [Arsitektur Teknis](#arsitektur-teknis)
3. [Fitur Utama](#fitur-utama)
4. [Fitur Dashboard](#fitur-dashboard)
5. [Fitur Authentication & Authorization](#fitur-authentication--authorization)
6. [Fitur Admin](#fitur-admin)
7. [Fitur Pengaturan](#fitur-pengaturan)
8. [Struktur Database](#struktur-database)
9. [API Endpoints](#api-endpoints)
10. [Rekomendasi Pengembangan](#rekomendasi-pengembangan)

---

## 🎯 RINGKASAN EKSEKUTIF

Darmasaba Dashboard adalah sistem manajemen desa berbasis web dengan arsitektur **Single Port** yang menggabungkan backend (ElysiaJS) dan frontend (React 19) dalam satu port (3000), menghilangkan masalah CORS dan kompleksitas proxy.

### Statistik Fitur

- **Total Halaman/Rute:** 18+ halaman
- **Modul Utama:** 10 modul fungsional
- **API Endpoints:** 8+ endpoints
- **Role System:** 4 role (admin, moderator, user, guest)

---

## 🏗️ ARSITEKTUR TEKNIS

### Technology Stack

| Layer            | Teknologi               | Fungsi                        |
| ---------------- | ----------------------- | ----------------------------- |
| **Runtime**      | Bun                     | JavaScript runtime all-in-one |
| **Backend**      | ElysiaJS                | Web framework type-safe       |
| **Frontend**     | React 19                | UI library                    |
| **Routing**      | TanStack Router         | File-based type-safe routing  |
| **UI Framework** | Mantine UI v8           | Component library             |
| **Charts**       | Recharts                | Data visualization            |
| **Auth**         | Better Auth             | Authentication system         |
| **Database**     | PostgreSQL + Prisma ORM | Data persistence              |
| **State**        | Valtio                  | Global state management       |
| **Testing**      | Bun Test + Playwright   | Unit & E2E testing            |

### Struktur Folder

```
├── __tests__/              # Test suite (API & E2E)
├── generated/              # Auto-generated types (Prisma & API)
├── prisma/                 # Database schema & migrations
├── scripts/                # Automation scripts
└── src/
    ├── api/                # Elysia backend routes
    ├── components/         # React components
    ├── hooks/              # Custom React hooks
    ├── middleware/         # Backend & Frontend middlewares
    ├── routes/             # TanStack file-based routes
    ├── store/              # Global state (Valtio)
    ├── utils/              # Shared utilities
    ├── frontend.tsx        # React client entry
    └── index.ts            # Unified server entry
```

### Arsitektur Single Port

```
┌─────────────────────────────────────┐
│         Port 3000                   │
│  ┌─────────────┐  ┌──────────────┐  │
│  │  ElysiaJS   │  │   Vite       │  │
│  │   Backend   │  │  Middleware  │  │
│  │             │  │   (Frontend) │  │
│  └─────────────┘  └──────────────┘  │
└─────────────────────────────────────┘
```

---

## 🚀 FITUR UTAMA

### 1. **Beranda (Dashboard Utama)** `/`

**Komponen:** `DashboardContent`

**Fitur:**

- **4 Stat Cards Utama:**
  - Surat Minggu Ini (dengan trend analysis)
  - Pengaduan Aktif
  - Layanan Selesai
  - Kepuasan Warga (dengan persentase)

- **Chart & Grafik:**
  - Chart Surat (line chart tren surat)
  - Chart Kepuasan Masyarakat (pie chart)
  - Chart APBDes (bar chart anggaran)

- **Division Progress:** Progress bar kinerja divisi
- **Activity List:** Daftar aktivitas terbaru
- **SDGs Cards:** 4 kartu SDGs dengan skor:
  - Desa Berenergi Bersih (99.64)
  - Desa Damai Berkeadilan (78.65)
  - Desa Sehat dan Sejahtera (77.37)
  - Desa Tanpa Kemiskinan (52.62)

---

### 2. **Kinerja Divisi** `/kinerja-divisi`

**Komponen:** `KinerjaDivisi`

**Fitur:**

#### Section 1 - Program Kegiatan

- 4 Activity Cards dengan progress tracking
- Status: "Selesai" dengan persentase completion
- Contoh program: Rakor 2025, Pemutakhiran Indeks Desa, dll

#### Section 2 - Dashboard Grid (3 Kolom)

- **Division List:** Daftar divisi dengan status
- **Document Chart:** Grafik dokumen per divisi
- **Progress Chart:** Chart progress keseluruhan

#### Section 3 - Discussion Panel

- Forum diskusi internal divisi

#### Section 4 - Acara Hari Ini

- Event card untuk agenda harian

#### Section 5 - Arsip Digital

- 4 kategori arsip:
  - Surat Keputusan
  - Dokumentasi
  - Laporan Keuangan
  - Notulensi Rapat

---

### 3. **Pengaduan & Layanan Publik** `/pengaduan-layanan-publik`

**Komponen:** `PengaduanLayananPublik`

**Fitur:**

#### KPI Cards (4 Stats)

- Total Pengaduan: 42/bulan
- Pengaduan Baru: 14
- Diproses: 14
- Selesai: 14

#### Chart Utama

- **Tren Pengaduan:** Line chart 6 bulan (Apr-Okt)
- **Surat Terbanyak:** Bar chart horizontal per jenis surat
  - KTP, KK, Domisili, Usaha, Lainnya

#### Panel Data

- **Pengajuan Terbaru:** List 5 pengajuan dengan status (baru/proses/selesai)
- **Ajuan Ide Inovatif:** 4 ide dengan kategori (Teknologi, Ekonomi, Kesehatan, Pendidikan)

---

### 4. **Jenna Analytic** `/jenna-analytic`

**Komponen:** `JennaAnalytic`

**Fitur:** Chatbot Analytics Dashboard

#### KPI Chatbot

- Interaksi Hari Ini: 61 (+15%)
- Jawaban Otomatis: 87%
- Belum Ditindak: 8
- Waktu Respon: 2.3 detik

#### Visualisasi Data

- **Interaksi Chatbot:** Bar chart mingguan (Sen-Min)
- **Topik Pertanyaan Terbanyak:** Top 5 topik
  - Cara mengurus KTP (89x)
  - Syarat Kartu Keluarga (76x)
  - Jadwal Posyandu (64x)
  - Pengaduan jalan rusak (52x)
  - Info program bansos (48x)

- **Jam Tersibuk:** Progress bars per periode
  - Pagi (08-12): 30%
  - Siang (12-16): 40%
  - Sore (16-20): 20%
  - Malam (20-08): 10%

---

### 5. **Demografi & Kependudukan** `/demografi-pekerjaan`

**Komponen:** `DemografiPekerjaan`

**Fitur:**

#### KPI Utama

- Total Penduduk: 5,634
- Kepala Keluarga: 1,354
- Kelahiran Tahun Ini: 23
- Kemiskinan: 324 (-10% YoY)

#### Visualisasi Data

**Row 2 - 3 Kolom:**

1. **Pengelompokan Umur:** Bar chart vertikal (6 kategori umur)
2. **Demografi Pekerjaan:** Bar chart horizontal
   - Sipil, Guru, Petani, Pedagang, Wiraswasta
3. **Dinamika Penduduk:** 4 stat cards
   - Kelahiran, Kematian, Pindah Masuk, Pindah Keluar

**Row 3 - 3 Kolom:**

1. **Distribusi Agama:** Pie chart + legend
   - Hindu (4,234), Islam (856), Kristen (412), Buddha (202)
2. **Data per Banjar:** Table dengan 6 banjar
   - Darmasaba, Manesa, Cabe, Penenjoan, Baler Pasar, Bucu
   - Kolom: Penduduk, KK, Miskin
3. **Sektor Unggulan:** Bar chart horizontal
   - Pertanian, Perdagangan, Industri, Jasa

---

### 6. **Keuangan & Anggaran** `/keuangan-anggaran`

**Komponen:** `KeuanganAnggaran`

**Fitur:**

#### KPI Keuangan

- Total APBDes: Rp 5.2M
- Realisasi: 68% (Rp 3.5M)
- Pemasukan: Rp 580jt (+8%)
- Pengeluaran: Rp 520jt

#### Chart & Grafik

**Main Chart Section:**

- **Pemasukan & Pengeluaran:** Line chart 7 bulan
  - Garis hijau: Pemasukan
  - Garis merah: Pengeluaran

- **Alokasi Anggaran Per Sektor:** Bar chart horizontal
  - Pembangunan (1,200), Kesehatan (800), Pendidikan (650), Sosial (550), Kebudayaan (400), Teknologi (300)

**Bottom Section:**

1. **Laporan APBDes (2 Kolom):**
   - **Pendapatan (Hijau):** 5 kategori
     - Dana Desa, Alokasi DD, Bagi Hasil Pajak, Pendapatan Asli Desa, Hibah
     - Total: Rp 3,080jt
   - **Belanja (Merah):** 5 kategori
     - Penyelenggaraan Pemerintah, Pembangunan Desa, Pembinaan Kemasyarakatan, Pemberdayaan Masyarakat, Penanggulangan Bencana
     - Total: Rp 2,155jt
   - **Saldo:** Rp 925jt (surplus)

2. **Dana Bantuan dan Hibah:**
   - 4 sumber dana dengan status (Cair/Proses)
   - Dana Desa (DD), Alokasi DD, Bagi Hasil Pajak, Hibah Provinsi

---

### 7. **Bumdes & UMKM Desa** `/bumdes`

**Komponen:** `BumdesPage`

**Fitur:**

#### Summary Cards (KPI)

- Summary cards untuk metrics UMKM

#### Header Toggle

- Toggle untuk range waktu (harian/mingguan/bulanan)

#### Main Content (2 Kolom)

**Left Panel (40%):**

- **Produk Unggulan:** Showcase produk terbaik
- **Top Products:** Ranking produk terlaris

**Right Panel (60%):**

- **Sales Table:** Tabel detail penjualan produk
  - Data penjualan per produk
  - Trend analysis
  - Action buttons (detail view)

---

### 8. **Sosial** `/sosial`

**Komponen:** `SosialPage`

**Fitur:**

#### Summary Cards

- Top level metrics untuk data sosial

#### Section 1 - Kesehatan (2 Kolom)

- **Statistik Kesehatan:** Health stats dashboard
- **Jadwal Posyandu:** Schedule management

#### Section 2 - Pendidikan (2 Kolom)

- **Pendidikan:** Data pendidikan warga
- **Beasiswa Desa:** Program beasiswa

#### Section 3 - Event

- **Event Calendar:** Kalender event budaya

---

### 9. **Keamanan** `/keamanan`

**Komponen:** `KeamananPage`

**Fitur:**

- Security dashboard
- Session management
- Activity logs
- Security settings

---

### 10. **Bantuan** `/bantuan`

**Komponen:** `HelpPage`

**Fitur:**

- Documentation
- FAQ
- User guide
- Support contact

---

## 🔐 FITUR AUTHENTICATION & AUTHORIZATION

### Authentication System

**Provider:** Better Auth

**Metode Login:**

1. **Email & Password:** Traditional login
2. **GitHub OAuth:** Social login

**Session Management:**

- Session expiry: 7 days
- Cookie cache enabled
- Secure session tokens

### Role-Based Access Control (RBAC)

**Roles:**

1. **Admin:** Full access
2. **Moderator:** Limited admin access
3. **User:** Standard access
4. **Guest:** Public routes only

**Protected Routes:**

- Semua route kecuali `/signin` dan `/signup` dilindungi
- Middleware: `protectedRouteMiddleware`

### User Management

**Database Models:**

- User
- Session
- Account
- Verification
- ApiKey

**User Fields:**

- id, email, name, image, role
- emailVerified, createdAt, updatedAt

---

## 👨‍💼 FITUR ADMIN

### 1. **Admin Dashboard** `/admin`

**Komponen:** `DashboardComponent`

**Fitur:**

- User profile card dengan avatar
- 4 Stat cards:
  - Total Users: 1,234
  - Server Uptime: 99.9%
  - Database Load: 42%
  - Active Sessions: 128

- **System Performance:**
  - CPU Usage: 32% (progress bar)
  - Memory Usage: 64%
  - Disk Usage: 45%

- **Server Status:**
  - Main Server: Online
  - Database: Connected
  - Cache: Running
  - Backup: Pending

---

### 2. **API Keys Management** `/admin/apikey`

**Komponen:** `DashboardApikeyComponent`

**Fitur:**

#### CRUD Operations

- **Create:** Generate API key baru dengan nama dan expiry date
- **Read:** List semua API keys dengan detail
- **Update:** Toggle active/inactive status
- **Delete:** Hapus API key dengan konfirmasi

#### API Key Features

- Format: `sk-{nanoid(32)}`
- Show/Hide key visibility toggle
- Copy to clipboard functionality
- Expiration date management
- Status indicator (active/inactive)

#### Table Columns

- Name
- Key (masked/unmasked)
- Status (toggle switch)
- Expiration date
- Created date
- Actions (delete)

---

### 3. **User Management** `/admin/users`

**Status:** Placeholder component

**Fitur yang Direncanakan:**

- List semua users
- Edit user role
- Activate/deactivate users
- User statistics

---

### 4. **Admin Settings** `/admin/settings`

**Status:** Route tersedia

---

## ⚙️ FITUR PENGATURAN

### Structure

```
/pengaturan
├── /umum              # General settings
├── /notifikasi        # Notification settings
├── /keamanan          # Security settings
└── /akses-dan-tim     # Access & team management
```

### 1. **Pengaturan Umum** `/pengaturan/umum`

**Komponen:** `UmumSettings`

**Fitur yang Direncanakan:**

- Site configuration
- Language settings
- Theme preferences
- General app settings

---

## 👤 FITUR PROFILE

### **Profile Page** `/profile`

**Komponen:** `Profile`

**Fitur:**

#### Profile Overview Card

- Avatar dengan initial/nama
- User name dan email
- Role badge (admin/user/moderator)
- Edit profile button
- Logout button

#### Identity Information

- Nama Lengkap
- Peran (Role)
- Email (copyable)
- Unique User ID (copyable)

#### Security & Session

- Current session status
- Session token (masked, copyable)
- Session history link

#### Actions

- Edit Profile
- Admin Panel (jika admin)
- Logout dengan konfirmasi modal

---

## 🗄️ STRUKTUR DATABASE

### Prisma Schema

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified Boolean?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  role          String?   @default("user")
  accounts      Account[]
  sessions      Session[]
  apiKeys       ApiKey[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id                    String    @id @default(cuid())
  userId                String
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  expiresAt             DateTime?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model ApiKey {
  id        String   @id @default(cuid())
  name      String
  key       String   @unique
  userId    String
  isActive  Boolean  @default(true)
  expiresAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 🔌 API ENDPOINTS

### Base Path: `/api`

#### Health Check

- `GET /health` - Health check endpoint

#### Authentication (Better Auth)

- `ALL /auth/*` - All auth endpoints
- `GET /session` - Get current session

#### Profile

- `POST /profile/update` - Update user profile
  - Body: `{ name?, image? }`
  - Response: `{ user }`

#### API Keys (Protected)

- `GET /apikey/` - Get all API keys for user
- `POST /apikey/` - Create new API key
  - Body: `{ name, expiresAt? }`
- `POST /apikey/update` - Update API key
  - Body: `{ id, isActive, expiresAt? }`
- `POST /apikey/delete` - Delete API key
  - Body: `{ id }`

#### Documentation

- `GET /docs` - Swagger UI (development only)

---

## 🎨 UI/UX FEATURES

### Design System

**Color Palette:**

- Primary: Darmasaba Blue (#1E3A5F, #396aaaff)
- Accent: Orange (#fbf0df)
- Success: Green (#22C55E)
- Danger: Red (#EF4444)
- Neutral: Gray scale

**Theme:**

- Dark/Light mode toggle
- Mantine UI theming
- Custom color schemes per component

### Responsive Design

- Mobile-first approach
- Breakpoints: base, sm, md, lg, xl
- Collapsible sidebar
- Burger menu for mobile

### Interactive Components

- Modals (confirmation, forms)
- Tooltips
- Badges with variants
- Progress bars (animated)
- Copy to clipboard actions
- Show/Hide toggles

### Charts & Visualizations

- Recharts library
- Bar charts (vertical/horizontal)
- Line charts
- Pie charts
- Custom tooltips
- Responsive containers

---

## 📱 PWA & MOBILE FEATURES

### Progressive Web App

- Service Workers ready
- Web Manifest support
- Offline capability structure

### TWA (Trusted Web Activity)

- Android TWA verification
- `.well-known/assetlinks.json` support
- Mobile app readiness

---

## 🧪 TESTING

### Test Structure

```
__tests__/
├── api/         # API unit/integration tests
└── e2e/         # Playwright E2E tests
```

### Test Commands

- `bun run test` - Unit/Integration tests
- `bun run test:ui` - Tests with UI dashboard
- `bun run test:e2e` - End-to-End tests

---

## 🔧 DEVELOPMENT TOOLS

### Code Quality

- **Biome:** Linting & formatting
- **TypeScript:** Type safety
- **OpenAPI:** API contract-first development

### Developer Experience

- **Hot Module Replacement:** Fast dev server
- **React Dev Inspector:** Alt/Option + Click to source
- **Auto-generated Types:** Prisma & API types
- **Swagger Docs:** Interactive API documentation

### Scripts

```json
{
  "dev": "Development server with HMR",
  "lint": "Run Biome linter",
  "check": "Lint & fix",
  "format": "Format code",
  "gen:api": "Generate API types",
  "test": "Run tests",
  "test:ui": "Tests with UI",
  "test:e2e": "E2E tests",
  "build": "Production build",
  "start": "Start production server",
  "seed": "Seed database"
}
```

---

## 📊 DEFAULT USERS (After Seed)

| Role      | Email                 | Password   |
| --------- | --------------------- | ---------- |
| Admin     | `ADMIN_EMAIL` (env)   | `admin123` |
| User      | demo1@example.com     | demo123    |
| User      | demo2@example.com     | demo123    |
| Moderator | moderator@example.com | demo123    |

---

## 🚀 REKOMENDASI PENGEMBANGAN

### Fitur yang Perlu Dilengkapi

1. **User Management (`/admin/users`)**
   - [ ] Implement user list table
   - [ ] Add role editing
   - [ ] User activation/deactivation
   - [ ] Bulk actions

2. **Pengaturan Pages**
   - [ ] Umum settings form
   - [ ] Notification preferences
   - [ ] Security settings (2FA, password change)
   - [ ] Team management (invite, remove)

3. **Data Integration**
   - [ ] Connect dashboard charts to real data
   - [ ] Implement CRUD for Pengaduan
   - [ ] Add data export (PDF, Excel)
   - [ ] Real-time updates (WebSocket)

4. **Enhanced Features**
   - [ ] Advanced search & filters
   - [ ] Pagination for large lists
   - [ ] Image upload for profiles
   - [ ] Email notifications
   - [ ] Activity audit logs

5. **Mobile Optimization**
   - [ ] Touch-friendly interactions
   - [ ] Mobile-specific layouts
   - [ ] PWA installation prompt
   - [ ] Push notifications

6. **Security Enhancements**
   - [ ] Rate limiting for API
   - [ ] Input validation
   - [ ] CSRF protection
   - [ ] Session management UI

7. **Performance**
   - [ ] Lazy loading for routes
   - [ ] Image optimization
   - [ ] Caching strategies
   - [ ] Database query optimization

---

## 📝 CATATAN TEKNIS

### Environment Variables Required

```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=min-32-chars
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
GITHUB_CLIENT_ID=optional
GITHUB_CLIENT_SECRET=optional
VITE_PUBLIC_URL=http://localhost:3000
```

### Deployment Considerations

- Production build: `bun run build`
- Start production: `bun run start`
- Auto-seed on production start
- Trust proxy enabled for auth

### Known Limitations

- Some pages are placeholders (users, settings sub-pages)
- Mock data used in most dashboard components
- No real database integration for domain-specific data
- Email verification not fully implemented

---

## 📞 SUPPORT & DOCUMENTATION

- **API Docs:** `http://localhost:3000/api/docs`
- **App:** `http://localhost:3000`
- **GitHub:** Repository linked
- **Issues:** Track via GitHub Issues

---

**Dibuat untuk:** Tim Pengembang Darmasaba  
**Tujuan:** Dokumentasi lengkap fitur untuk analisis dan perencanaan pengembangan  
**Update Selanjutnya:** Setelah implementasi fitur prioritas
