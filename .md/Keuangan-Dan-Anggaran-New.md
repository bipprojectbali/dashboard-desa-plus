Build a modern financial dashboard web app for village budgeting (APBDes) using the following stack:

- Runtime: Bun
- Frontend: React 19 + Vite
- Routing: TanStack Router
- UI: Mantine + TailwindCSS
- Charts: @mantine/charts or recharts
- State: Valtio
- Backend: ElysiaJS
- ORM: Prisma (PostgreSQL)
- API: OpenAPI (auto-generated client)

---

### 🎯 GOAL
Create a clean, professional, and data-rich dashboard for monitoring village finances including:
- Total budget (APBDes)
- Realization percentage
- Monthly income & expenses
- Budget allocation per sector
- Detailed financial report
- Aid & grants tracking

---

### 🧱 LAYOUT STRUCTURE

#### 1. Top Summary Cards (Grid 4 columns)
Each card:
- Rounded (xl), soft shadow
- Background: white / neutral
- Icon in circular container (right side)
- Big bold number
- Small label & subtitle

Cards:
1. Total APBDes → "5.2M" (year label)
2. Realisasi → "68%" + subtext "3.5M dari 5.2M"
3. Pemasukan → "580jt" + trend "+8%"
4. Pengeluaran → "520jt"

---

#### 2. Main Chart Section (2 columns)

LEFT (70%):
- Line chart: "Pemasukan dan Pengeluaran"
- Dual line:
  - Green = pemasukan
  - Red = pengeluaran
- X-axis: bulan (Apr - Okt)
- Smooth curve, dots enabled
- Legend bottom

RIGHT (30%):
- Horizontal bar chart: "Alokasi Anggaran Per Sektor"
- Categories:
  - Pembangunan
  - Kesehatan
  - Pendidikan
  - Sosial
  - Kebudayaan
  - Teknologi
- Clean minimal bars, rounded edges

---

#### 3. Bottom Section (2 columns)

LEFT: "Laporan APBDes"
- Split into 2 columns:
  - Pendapatan (green theme)
  - Belanja (red theme)
- Each item:
  - Label (left)
  - Amount (right)
- Add totals at bottom:
  - Total Pendapatan (green)
  - Total Belanja (red)

RIGHT: "Dana Bantuan dan Hibah"
- List of funding sources:
  - Dana Desa
  - ADD
  - Bagi Hasil Pajak
  - Hibah Provinsi
- Each item:
  - Name
  - Amount
  - Status badge:
    - "cair" (green)
    - "proses" (yellow)

---

### 🎨 DESIGN SYSTEM

- Use Mantine components (Card, Grid, Text, Badge)
- Combine with Tailwind for layout spacing
- Radius: xl / 2xl
- Shadow: soft (not harsh)
- Font: Inter or system UI
- Colors:
  - Primary: slate/blue
  - Success: green
  - Danger: red
  - Background: light gray (#f5f6f8)
- Dark mode support (Mantine color scheme)

---

### ⚙️ FUNCTIONALITY

- Fetch data from Elysia API
- Use OpenAPI generated client
- Use Valtio for global state
- Add loading skeletons
- Add number formatting (e.g., 580jt, 5.2M)
- Responsive:
  - Desktop: 2–4 column grid
  - Mobile: stacked layout

---

### 📦 FILE STRUCTURE

- /src/routes/dashboard.tsx
- /src/components/dashboard/
  - summary-cards.tsx
  - income-expense-chart.tsx
  - sector-allocation.tsx
  - laporan-apbdes.tsx
  - dana-bantuan.tsx

---

### 🚀 BONUS (if possible)

- Add filter by year
- Add hover tooltip on charts
- Add subtle animation (fade/scale)
- Add currency toggle (Rp format)

---

### 🧠 OUTPUT EXPECTATION

Generate:
- Clean modular React components
- Use hooks properly
- Use Mantine + Tailwind hybrid styling
- Production-ready code (not demo-level)