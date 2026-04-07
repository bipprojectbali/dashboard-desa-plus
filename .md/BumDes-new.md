Build a modern UMKM (small business) analytics dashboard for monitoring product sales and performance.

Use the following stack:
- Runtime: Bun
- Frontend: React 19 + Vite
- Routing: TanStack Router
- UI: Mantine + TailwindCSS
- Charts: @mantine/charts or recharts
- State Management: Valtio
- Backend: ElysiaJS
- ORM: Prisma (PostgreSQL)
- API Client: OpenAPI generated (openapi-fetch)

---

## 🎯 CORE FEATURES

- UMKM summary metrics
- Product sales analytics
- Top-selling products
- Real-time sales updates
- Product performance table
- Filtering (weekly / monthly)

---

## 🧱 LAYOUT STRUCTURE

### 1. SUMMARY CARDS (TOP - 4 GRID)

Each card:
- Rounded-xl, soft shadow
- Icon inside circular dark-blue background (right side)
- Title (small muted)
- Value (large bold)
- Subtitle (small)

Cards:
1. UMKM Aktif → 45 (Beroperasi)
2. UMKM Terdaftar → 68 (Total registrasi)
3. Omzet → 48jt (Omzet BUMDes per bulan)
4. UMKM Terbanyak → 34 (Kategori Kuliner)

---

### 2. HEADER SECTION (IMPORTANT UX)

- Title: "Update Penjualan Produk"
- Background: dark blue (full width container)
- Right side:
  - Toggle buttons:
    - "Minggu ini"
    - "Bulan ini"
- Active state highlighted (white bg)

---

### 3. MAIN CONTENT (2 COLUMN GRID)

#### LEFT PANEL (30%) → "Produk Unggulan"

Cards inside:

1. Total Penjualan
   - Rp 30.900.000
   - Trend: +18% vs bulan lalu (green)

2. Produk Aktif
   - 7 kategori

3. Total Transaksi
   - 500 transaksi bulan ini

---

#### BELOW → "Top 3 Produk Terlaris"

Each item:
- Rank (#1, #2, #3)
- Product name
- UMKM name
- Revenue
- Quantity sold
- Trend (+15%, +10%)

---

#### RIGHT PANEL (70%) → "Detail Penjualan Produk"

Table with columns:

- Produk
- Penjualan Bulan Ini
- Bulan Lalu
- Trend (with arrow icon + percentage)
- Volume (Kg / Pcs / etc)
- Aksi (button "Detail")
- Stok (badge: red if low)

---

### TABLE UX:

- Sticky header
- Hover row highlight
- Badge colors:
  - Green = growth
  - Red = decline
- Action button:
  - Small, rounded
  - Opens modal / detail page

---

### FILTER

Top-right:
- Dropdown "Filter"
- Future:
  - kategori
  - UMKM
  - rentang tanggal

---

## 🎨 DESIGN SYSTEM

- Mantine as base components (Card, Table, Badge, Button)
- Tailwind for layout & spacing
- Radius: xl / 2xl
- Shadow: subtle
- Color palette:
  - Primary: navy / blue (#1e3a5f)
  - Success: green
  - Danger: red
  - Warning: yellow
  - Background: light gray (#f5f6f8)

- Typography:
  - Clean, semi-bold headings
  - Numeric emphasis (tabular numbers)

---

## ⚙️ FUNCTIONALITY

- Fetch data from Elysia API
- Use OpenAPI generated client
- Use Valtio for global store:
  - selectedRange (week/month)
  - filters

- Add:
  - loading skeletons
  - empty state
  - error state (toast with sonner)

- Format currency:
  - Rp 48jt
  - Rp 30.9M

---

## 📦 FILE STRUCTURE

/src/routes/umkm-dashboard.tsx

/src/components/umkm/
  - summary-cards.tsx
  - header-toggle.tsx
  - produk-unggulan.tsx
  - top-products.tsx
  - sales-table.tsx

---

## 🧠 DATA MODEL (IMPORTANT)

Design schema like:

type Product = {
  id: string
  name: string
  umkmName: string
  category: string
  price: number
  stock: number
}

type SalesData = {
  productId: string
  currentMonth: number
  lastMonth: number
  growth: number
  volume: number
  unit: "kg" | "pcs" | "ikat"
}

---

## 🚀 BONUS (HIGH VALUE)

- Add realtime updates (polling / websocket Elysia)
- Add sorting (by omzet, growth, volume)
- Add search (cmdk)
- Add export CSV
- Add modal detail:
  - sales history chart
  - product info

---

## 🧠 OUTPUT EXPECTATION

- Modular React components
- Clean separation UI vs data
- Use hooks properly
- Avoid hardcoded values
- Production-ready structure