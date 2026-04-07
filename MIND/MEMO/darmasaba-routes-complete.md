# Darmasaba Dashboard - Complete Routes Documentation

**Tanggal:** 26 Maret 2026  
**Framework:** TanStack Router (File-based routing)  
**Total Routes:** 27 routes

---

## 📋 DAFTAR ISI

1. [Route Tree Overview](#route-tree-overview)
2. [Public Routes](#public-routes)
3. [Protected Routes](#protected-routes)
4. [Admin Routes](#admin-routes)
5. [Settings Routes](#settings-routes)
6. [Profile Routes](#profile-routes)
7. [API Routes](#api-routes)
8. [Route Guards & Middleware](#route-guards--middleware)
9. [Route Configuration Details](#route-configuration-details)

---

## 🌳 ROUTE TREE OVERVIEW

```
/
├── (public)
│   ├── /signin
│   └── /signup
│
├── (protected - all authenticated users)
│   ├── /                              # Beranda (Dashboard)
│   ├── /kinerja-divisi
│   ├── /pengaduan-layanan-publik
│   ├── /jenna-analytic
│   ├── /demografi-pekerjaan
│   ├── /keuangan-anggaran
│   ├── /bumdes
│   ├── /sosial
│   ├── /keamanan
│   ├── /bantuan
│   ├── /profile
│   │   ├── /                          # Profile view
│   │   └── /edit                      # Edit profile
│   ├── /pengaturan
│   │   ├── /umum
│   │   ├── /notifikasi
│   │   ├── /keamanan
│   │   └── /akses-dan-tim
│   └── /users
│       ├── /                          # Users list
│       └── /$id                       # User detail (dynamic)
│
└── (admin only)
    └── /admin
        ├── /                          # Admin dashboard
        ├── /users
        ├── /apikey
        └── /settings
```

---

## 🔓 PUBLIC ROUTES

Routes yang dapat diakses tanpa autentikasi.

### 1. `/signin` 
**File:** `src/routes/signin.tsx`  
**Komponen:** `SigninComponent`  
**Layout:** Standalone (no sidebar/header)

**Fitur:**
- Email & Password login form
- GitHub OAuth login button
- "Remember me" checkbox
- Link ke signup page
- Error handling dengan message display

**State:**
- `email`, `password`, `loading`, `error`

**Navigation:**
- Success → `/profile`
- Link → `/signup`

---

### 2. `/signup`
**File:** `src/routes/signup.tsx`  
**Komponen:** `SignupComponent`  
**Layout:** Standalone (no sidebar/header)

**Fitur:**
- Registration form (name, email, password)
- Link ke signin page
- Error handling

**State:**
- `name`, `email`, `password`, `loading`, `error`

**Navigation:**
- Success → `/admin` (should be `/profile`)
- Link → `/signin`

---

## 🔒 PROTECTED ROUTES

Routes yang memerlukan autentikasi (semua role: user, moderator, admin).

### 3. `/` - Beranda (Dashboard Utama)
**File:** `src/routes/index.tsx`  
**Komponen:** `DashboardPage`  
**Layout:** AppShell (Header + Sidebar + Main)

**Fitur:**
- Dashboard dengan 4 stat cards
- Charts (Surat, Kepuasan, APBDes)
- SDGs Cards
- Division Progress
- Activity List
- Collapsible sidebar
- Dark/Light theme toggle

**Child Components:**
- `DashboardContent`
- `Header`
- `Sidebar`

---

### 4. `/kinerja-divisi`
**File:** `src/routes/kinerja-divisi.tsx`  
**Komponen:** `KinerjaDivisiPage`  
**Layout:** AppShell

**Fitur:**
- Program kegiatan cards (4 items)
- Division list
- Document chart
- Progress chart
- Discussion panel
- Event card
- Arsip digital (4 categories)

---

### 5. `/pengaduan-layanan-publik`
**File:** `src/routes/pengaduan-layanan-publik.tsx`  
**Komponen:** `PengaduanLayananPublikPage`  
**Layout:** AppShell

**Fitur:**
- 4 KPI cards (Total, Baru, Diproses, Selesai)
- Tren pengaduan line chart
- Surat terbanyak bar chart
- Pengajuan terbaru list
- Ajuan ide inovatif

---

### 6. `/jenna-analytic`
**File:** `src/routes/jenna-analytic.tsx`  
**Komponen:** `JennaAnalyticPage`  
**Layout:** AppShell

**Fitur:**
- Chatbot analytics KPI (4 cards)
- Interaksi chatbot bar chart
- Topik pertanyaan terbanyak
- Jam tersibuk progress bars

---

### 7. `/demografi-pekerjaan`
**File:** `src/routes/demografi-pekerjaan.tsx`  
**Komponen:** `DemografiPekerjaanPage`  
**Layout:** AppShell

**Fitur:**
- Demografi KPI (4 cards)
- Pengelompokan umur bar chart
- Demografi pekerjaan bar chart
- Dinamika penduduk (4 stats)
- Distribusi agama pie chart
- Data per banjar table
- Sektor unggulan bar chart

---

### 8. `/keuangan-anggaran`
**File:** `src/routes/keuangan-anggaran.tsx`  
**Komponen:** `KeuanganAnggaranPage`  
**Layout:** AppShell

**Fitur:**
- Keuangan KPI (4 cards)
- Pemasukan & pengeluaran line chart
- Alokasi anggaran per sektor
- Laporan APBDes (Pendapatan & Belanja)
- Dana bantuan dan hibah

---

### 9. `/bumdes`
**File:** `src/routes/bumdes.tsx`  
**Komponen:** `BumdesRoute`  
**Layout:** AppShell

**Fitur:**
- UMKM summary cards
- Time range toggle
- Produk unggulan
- Top products
- Sales table dengan detail

---

### 10. `/sosial`
**File:** `src/routes/sosial.tsx`  
**Komponen:** `SosialRoute`  
**Layout:** AppShell

**Fitur:**
- Summary cards
- Statistik kesehatan
- Jadwal posyandu
- Pendidikan
- Beasiswa desa
- Event calendar

---

### 11. `/keamanan`
**File:** `src/routes/keamanan.tsx`  
**Komponen:** `KeamananRoute`  
**Layout:** AppShell

**Fitur:**
- Security dashboard
- Activity logs
- Security settings overview

---

### 12. `/bantuan`
**File:** `src/routes/bantuan.tsx`  
**Komponen:** `BantuanRoute`  
**Layout:** AppShell

**Fitur:**
- Help documentation
- FAQ
- User guide
- Support contact

---

### 13. `/users/` - Users List
**File:** `src/routes/users/index.tsx`  
**Komponen:** `UsersPage`  
**Layout:** Standalone page container

**Status:** ⚠️ Placeholder/Demo

**Fitur:**
- Users grid layout
- Link ke user detail
- Route pattern demonstration

**Dynamic Link:**
- `/users/$id` → User detail page

---

### 14. `/users/$id` - User Detail
**File:** `src/routes/users/$id.tsx`  
**Komponen:** `UserDetailPage`  
**Layout:** Standalone page container

**Status:** ⚠️ Placeholder/Demo

**Fitur:**
- Dynamic route dengan parameter `id`
- User detail card
- Back navigation
- Route info box

**Params:**
- `id` (string) - User ID dari URL

---

## 👤 PROFILE ROUTES

Routes untuk manajemen profil user (protected).

### 15. `/profile/`
**File:** `src/routes/profile/index.tsx`  
**Komponen:** `Profile`  
**Layout:** Container (centered)  
**Middleware:** `protectedRouteMiddleware`

**Fitur:**
- Profile overview card dengan avatar
- User info (name, email, role badge)
- Identity information section:
  - Nama Lengkap
  - Peran
  - Email (copyable)
  - Unique User ID (copyable)
- Security & Session section:
  - Current session status
  - Session token (masked, copyable)
  - Session history button
- Action buttons:
  - Edit Profil
  - Admin Panel (jika admin)
  - Keluar (dengan konfirmasi modal)

**State:**
- `copied` - Track copied field

---

### 16. `/profile/edit`
**File:** `src/routes/profile/edit.tsx`  
**Komponen:** `EditProfile`  
**Layout:** Container (centered)  
**Middleware:** `protectedRouteMiddleware`

**Fitur:**
- Edit profile form
- Fields:
  - Nama Lengkap
  - URL Foto Profil
- Form validation (min 2 letters)
- Save changes button
- Back button ke `/profile`

**Form:**
- `name` (required, min 2 chars)
- `image` (optional, URL)

**API:**
- `POST /api/profile/update`

**State:**
- `isUpdating` - Loading state

---

## ⚙️ PENGATURAN ROUTES

Routes untuk pengaturan aplikasi (nested dalam layout `/pengaturan`).

### Parent Layout: `/pengaturan`
**File:** `src/routes/pengaturan/route.tsx`  
**Komponen:** `PengaturanLayout`  
**Layout:** AppShell (shared dengan main routes)

**Fitur Layout:**
- Shared sidebar
- Shared header
- Outlet untuk child routes
- Mobile responsive navbar
- Auto-close navbar on route change (mobile)

---

### 17. `/pengaturan/umum`
**File:** `src/routes/pengaturan/umum.tsx`  
**Komponen:** `UmumSettings`

**Fitur:**

**Preferensi Tampilan:**
- Bahasa Aplikasi (Indonesia/English)
- Zona Waktu (GMT+7/8/9)
- Format Tanggal

**Dashboard Settings:**
- Refresh Otomatis (toggle)
- Interval Refresh (30d/60d/90d)
- Tampilkan Grid (toggle)
- Animasi Transisi (toggle)

**Actions:**
- Batal
- Simpan Perubahan

---

### 18. `/pengaturan/notifikasi`
**File:** `src/routes/pengaturan/notifikasi.tsx`  
**Komponen:** `NotifikasiSettings`

**Fitur:**

**Metode Notifikasi (Grid 2 kolom):**
- Laporan Harian
- Alert Sistem
- Update Keamanan
- Newsletter Bulanan

**Preferensi Alert:**
- Treshold Memori
- Treshold CPU
- Treshold Disk

**Notifikasi Push:**
- Alert Kritis
- Aktivitas Tim
- Komentar & Mention
- Bunyi Notifikasi

**Actions:**
- Batal
- Simpan Preferensi

---

### 19. `/pengaturan/keamanan`
**File:** `src/routes/pengaturan/keamanan.tsx`  
**Komponen:** `KeamananSettings`

**Fitur:**

**Autentikasi:**
- Two-Factor Authentication
- Biometrik Login
- IP Whitelist

**Password:**
- Ubah Password button
- Riwayat Login button
- Perangkat Terdaftar button

**Audit & Log:**
- Log Aktivitas toggle
- Download Log button

**Actions:**
- Batal
- Simpan Perubahan

---

### 20. `/pengaturan/akses-dan-tim`
**File:** `src/routes/pengaturan/akses-dan-tim.tsx`  
**Komponen:** `AksesDanTimSettings`

**Fitur:**

**Manajemen Tim:**
- Undangan Anggota Baru button
- Kelola Role & Permission button
- Daftar Anggota Teraktif (12 Anggota)

**Hak Akses:**
- Administrator (2 Orang)
- Editor (5 Orang)
- Viewer (5 Orang)

**Kolaborasi:**
- Izin Export Data toggle
- Require Approval Untuk Perubahan toggle

**Actions:**
- Batal
- Simpan Perubahan

---

## 👨‍💼 ADMIN ROUTES

Routes khusus admin (role: admin required).

### Parent Layout: `/admin`
**File:** `src/routes/admin/route.tsx`  
**Komponen:** `DashboardLayout`  
**Layout:** Custom AppShell (admin theme)  
**Middleware:** `protectedRouteMiddleware`

**Fitur Layout:**
- Admin header dengan branding
- User menu dropdown (Profil, Pengaturan, Keluar)
- Admin sidebar navigation:
  - Beranda (`/admin`)
  - Pengguna (`/admin/users`)
  - API Key (`/admin/apikey`)
  - Pengaturan (`/admin/settings`)
- Mobile & desktop burger menu
- Tooltip descriptions untuk nav items
- Logout confirmation modal

**Navigation Items:**
```typescript
[
  { icon: IconHome, label: "Beranda", to: "/admin" },
  { icon: IconUsers, label: "Pengguna", to: "/admin/users" },
  { icon: IconKey, label: "API Key", to: "/admin/apikey" },
  { icon: IconSettings, label: "Pengaturan", to: "/admin/settings" },
]
```

---

### 21. `/admin/` - Admin Dashboard
**File:** `src/routes/admin/index.tsx`  
**Komponen:** `DashboardComponent`

**Fitur:**
- User profile card (avatar, name, email, verified badge)
- 4 Stat cards:
  - Total Users: 1,234
  - Server Uptime: 99.9%
  - Database Load: 42%
  - Active Sessions: 128
- System Performance section:
  - CPU Usage: 32% (progress bar)
  - Memory Usage: 64%
  - Disk Usage: 45%
- Server Status section:
  - Main Server: Online
  - Database: Connected
  - Cache: Running
  - Backup: Pending
- Logout button dengan konfirmasi

---

### 22. `/admin/users` - User Management
**File:** `src/routes/admin/users.tsx`  
**Komponen:** `DashboardUsersComponent`  
**Middleware:** `protectedRouteMiddleware`

**Status:** ⚠️ Placeholder

**Fitur yang Direncanakan:**
- Users list table
- User role management
- Activate/deactivate users
- User statistics

---

### 23. `/admin/apikey` - API Keys Management
**File:** `src/routes/admin/apikey.tsx`  
**Komponen:** `DashboardApikeyComponent`  
**Middleware:** `protectedRouteMiddleware`

**Fitur Lengkap:**

**CRUD Operations:**
- ✅ **Create:** Generate API key baru
  - Input: Name, Expiration date
  - Format: `sk-{nanoid(32)}`
  
- ✅ **Read:** List semua API keys
  - Table dengan 6 kolom
  - Show/Hide key visibility
  - Copy to clipboard
  
- ✅ **Update:** Toggle active/inactive
  - Switch toggle
  - Update expiry date
  
- ✅ **Delete:** Hapus API key
  - Confirmation modal
  - Permanent deletion

**Table Columns:**
1. Name
2. Key (masked/unmasked dengan toggle)
3. Status (active/inactive switch)
4. Expiration date
5. Created date
6. Actions (delete button)

**API Endpoints Used:**
- `GET /api/apikey/` - Fetch all keys
- `POST /api/apikey/` - Create new key
- `POST /api/apikey/update` - Update key
- `POST /api/apikey/delete` - Delete key

**State:**
- `apiKeys` - Array of API keys
- `loading`, `error`
- `createModalOpen`, `deleteModalOpen`
- `newKeyName`, `newKeyExpiresAt`
- `showKey` - Visibility state per key
- `keyToDelete` - Key ID for deletion
- `creating` - Create loading state

---

### 24. `/admin/settings` - Admin Settings
**File:** `src/routes/admin/settings.tsx`  
**Komponen:** `DashboardSettingsComponent`  
**Middleware:** `protectedRouteMiddleware`

**Status:** ⚠️ Placeholder

**Output:** "Hello from /admin/settings!"

**Fitur yang Direncanakan:**
- System configuration
- Global settings
- Admin preferences

---

## 📡 API ROUTES

Backend routes (ElysiaJS) - Base path: `/api`

### Health & Auth

#### `GET /api/health`
**Description:** Health check endpoint  
**Response:** `{ ok: true }`

#### `ALL /api/auth/*`
**Description:** Better Auth handler (all auth endpoints)  
**Methods:** GET, POST (depends on auth operation)

**Sub-routes:**
- `POST /api/auth/sign-in` - Email/password login
- `POST /api/auth/sign-up` - Registration
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/callback/github` - GitHub OAuth callback
- `POST /api/auth/forget-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

#### `GET /api/session`
**Description:** Get current session  
**Response:** `{ data: { user, session } }`  
**Auth:** Required (via cookie)

---

### Profile API

#### `POST /api/profile/update`
**Description:** Update user profile  
**Auth:** Required

**Request Body:**
```typescript
{
  name?: string,
  image?: string
}
```

**Response (200):**
```typescript
{
  user: {
    id: string,
    name: string,
    email: string,
    image: string,
    role: string
  }
}
```

**Response (401/500):**
```typescript
{ error: string }
```

---

### API Keys API (Protected)

#### `GET /api/apikey/`
**Description:** Get all API keys for authenticated user  
**Auth:** Required

**Response (200):**
```typescript
{
  apiKeys: Array<{
    id: string,
    name: string,
    key: string,
    isActive: boolean,
    expiresAt: string | null,
    createdAt: datetime,
    updatedAt: datetime
  }>
}
```

---

#### `POST /api/apikey/`
**Description:** Create new API key  
**Auth:** Required

**Request Body:**
```typescript
{
  name: string,
  expiresAt?: string // ISO date string
}
```

**Response (200):**
```typescript
{
  apiKey: {
    id: string,
    name: string,
    key: string, // Full key (sk-...)
    isActive: boolean,
    expiresAt: string | null,
    createdAt: datetime,
    updatedAt: datetime
  }
}
```

---

#### `POST /api/apikey/update`
**Description:** Update API key (status, expiry)  
**Auth:** Required

**Request Body:**
```typescript
{
  id: string,
  isActive: boolean,
  expiresAt?: string | null
}
```

**Response (200):**
```typescript
{
  apiKey: {
    id: string,
    name: string,
    key: string,
    isActive: boolean,
    expiresAt: string | null,
    createdAt: datetime,
    updatedAt: datetime
  }
}
```

**Response (403):**
```typescript
{ error: "Forbidden" } // If API key doesn't belong to user
```

---

#### `POST /api/apikey/delete`
**Description:** Delete API key  
**Auth:** Required

**Request Body:**
```typescript
{
  id: string
}
```

**Response (200):**
```typescript
{ success: boolean }
```

---

### Documentation

#### `GET /api/docs`
**Description:** Swagger UI documentation  
**Availability:** Development only (`NODE_ENV !== production`)

---

## 🛡️ ROUTE GUARDS & MIDDLEWARE

### Frontend Middleware

#### `protectedRouteMiddleware`
**File:** `src/middleware/authMiddleware.tsx`  
**Export:** `createProtectedRoute()`

**Route Rules:**

```typescript
const routeRules: RouteRule[] = [
  // 1. Public routes - no auth required
  {
    match: (p) =>
      p === "/" ||
      p === "/signin" ||
      p === "/signup" ||
      p.startsWith("/kinerja-divisi") ||
      p.startsWith("/pengaduan") ||
      p.startsWith("/jenna") ||
      p.startsWith("/demografi") ||
      p.startsWith("/keuangan") ||
      p.startsWith("/bumdes") ||
      p.startsWith("/sosial") ||
      p.startsWith("/keamanan") ||
      p.startsWith("/bantuan") ||
      p.startsWith("/pengaturan") ||
      p.startsWith("/users"),
    requireAuth: false,
  },
  
  // 2. Profile routes - auth required
  {
    match: (p) => p === "/profile" || p.startsWith("/profile/"),
    requireAuth: true,
    redirectTo: "/signin",
  },
  
  // 3. Admin routes - admin role required
  {
    match: (p) => p.startsWith("/admin"),
    requireAuth: true,
    requiredRole: "admin",
    redirectTo: "/signin",
  },
];
```

**Session Fetcher:**
- Fetches from `/api/session`
- Includes credentials (cookies)
- Returns user data with role

**Redirect Logic:**
- If auth required but not logged in → redirect to `/signin`
- If admin role required but user is not admin → redirect to `/signin`
- Preserves original URL in search params for redirect back

---

### Backend Middleware

#### `apiMiddleware`
**File:** `src/middleware/apiMiddleware.tsx`

**Authentication Flow:**

1. **Session Auth (Priority 1):**
   - Check Better Auth session via cookies
   - Extract user from session
   - Return user with role

2. **API Key Auth (Priority 2):**
   - Check `X-API-Key` header
   - Or check `Authorization: Bearer <key>` header
   - Lookup API key in database
   - Verify API key is active and not expired
   - Return associated user

3. **No Auth:**
   - Return `{ user: null }`
   - `onBeforeHandle` will reject with 401

**onBeforeHandle Hook:**
- Skips `/api/docs` (public in dev)
- Returns 401 if no user found
- Logs unauthorized attempts

---

## 📊 ROUTE CONFIGURATION DETAILS

### Route File Structure

```
src/routes/
├── __root.tsx                    # Root route with Outlet
├── index.tsx                     # Dashboard home
├── signin.tsx                    # Login page
├── signup.tsx                    # Registration page
│
├── admin/
│   ├── route.tsx                 # Admin layout
│   ├── index.tsx                 # Admin dashboard
│   ├── users.tsx                 # User management
│   ├── apikey.tsx                # API keys
│   └── settings.tsx              # Admin settings
│
├── profile/
│   ├── index.tsx                 # Profile view
│   └── edit.tsx                  # Edit profile
│
├── pengaturan/
│   ├── route.tsx                 # Settings layout
│   ├── umum.tsx                  # General settings
│   ├── notifikasi.tsx            # Notification settings
│   ├── keamanan.tsx              # Security settings
│   └── akses-dan-tim.tsx         # Access & team
│
├── users/
│   ├── index.tsx                 # Users list (demo)
│   └── $id.tsx                   # User detail (dynamic)
│
└── [feature pages].tsx           # Main dashboard pages
```

### Route Naming Convention

- **File-based:** TanStack Router automatically generates routes from file structure
- **Dynamic routes:** Use `$` prefix (e.g., `$id.tsx` → `/:id`)
- **Layout routes:** Use `route.tsx` for parent layouts
- **Index routes:** Use `index.tsx` for route default component

### Generated Route Tree

TanStack Router generates `routeTree.gen.ts` automatically during dev/build:

```bash
# Development
bun run dev

# Manual generation
bun x tsr generate
```

---

## 🔗 NAVIGATION PATTERNS

### Programmatic Navigation

```typescript
import { useNavigate } from "@tanstack/react-router";

function Component() {
  const navigate = useNavigate();
  
  // Navigate to route
  navigate({ to: "/profile" });
  
  // Navigate with replace
  navigate({ to: "/signin", replace: true });
  
  // Navigate with search params
  navigate({ to: "/users/$id", params: { id: "123" } });
}
```

### Link Component

```typescript
import { Link } from "@tanstack/react-router";

<Link to="/profile">Profile</Link>
<Link to="/users/$id" params={{ id: user.id }}>User Detail</Link>
```

### Active Route Detection

```typescript
import { useLocation } from "@tanstack/react-router";

const location = useLocation();
const isActive = location.pathname === "/profile";
const isAdmin = location.pathname.startsWith("/admin");
```

---

## 📝 NOTES & CONSIDERATIONS

### Route Status Legend

- ✅ **Complete** - Fully implemented with features
- ⚠️ **Placeholder** - Basic component, needs implementation
- 🔄 **In Progress** - Partial implementation

### Current Status Summary

| Route Category | Total | Complete | Placeholder |
|----------------|-------|----------|-------------|
| Public | 2 | 2 | 0 |
| Protected (Main) | 10 | 10 | 0 |
| Profile | 2 | 2 | 0 |
| Settings | 4 | 4 | 0 |
| Admin | 4 | 1 | 3 |
| Demo/Test | 2 | 0 | 2 |
| **TOTAL** | **24** | **19** | **5** |

### Known Issues

1. **`/signup` redirect:** Redirects to `/admin` instead of `/profile`
2. **`/admin/users`:** Placeholder needs full implementation
3. **`/admin/settings`:** Placeholder needs full implementation
4. **`/users/*`:** Demo routes, may need removal or integration
5. **Route access:** Some public routes might need auth (review route rules)

### Recommendations

1. **Fix signup redirect** to `/profile` instead of `/admin`
2. **Implement admin user management** features
3. **Add admin settings** functionality
4. **Review public route rules** - consider moving dashboard routes to protected
5. **Add 404 route** for unknown paths
6. **Add route transitions** for better UX
7. **Implement breadcrumbs** for nested routes
8. **Add route metadata** (title, description) for SEO

---

**Dokumentasi ini dibuat untuk:** Tim Pengembang Darmasaba  
**Tujuan:** Referensi lengkap semua routes dalam aplikasi  
**Update:** Saat ada penambahan atau perubahan route
