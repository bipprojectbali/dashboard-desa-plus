Build a smart village dashboard focusing on health (kesehatan), education (pendidikan), and social programs.

Use the following stack:
- Runtime: Bun
- Frontend: React 19 + Vite
- Routing: TanStack Router
- UI: Mantine + TailwindCSS
- Charts/Stats: Mantine Progress + optional recharts
- State: Valtio
- Backend: ElysiaJS
- ORM: Prisma (PostgreSQL)
- API Client: OpenAPI generated (openapi-fetch)

---

## 🎯 GOAL

Create a clean, modern, and data-driven dashboard to monitor:
- Maternal & child health
- Posyandu activity
- Education statistics
- Scholarship distribution
- Cultural events calendar

---

## 🧱 LAYOUT STRUCTURE

### 1. TOP SUMMARY CARDS (4 GRID)

Each card:
- Rounded-xl
- Soft shadow
- Icon inside circular navy background (right side)
- Title (muted)
- Big number
- Small label

Cards:
1. Ibu hamil aktif → 87 (Aktif)
2. Balita terdaftar → 342 (Terdaftar)
3. Alert Stunting → 12 (Perhatian)
4. Posyandu Aktif → 8 (Aktif)

---

### 2. SECOND ROW (2 COLUMN GRID)

#### LEFT → "Statistik Kesehatan"

Use progress bars (Mantine Progress):

- Imunisasi Lengkap → 92%
- Pemeriksaan Rutin → 88%
- Gizi Baik → 86%
- Target Stunting → 14% (low progress, highlight)

Rules:
- Show percentage on right
- Color:
  - High (green)
  - Medium (blue)
  - Low (red)

---

#### RIGHT → "Jadwal Posyandu"

List style card:
- Each item:
  - Posyandu name
  - Date (dayjs formatted)
  - Time range
- Use subtle card rows with hover effect

---

### 3. THIRD ROW (2 COLUMN GRID)

#### LEFT → "Pendidikan"

Section 1: Student Statistics
- TK / PAUD → 500
- SD → 458
- SMP → 234
- SMA → 189

Section 2: Info Sekolah
- Lembaga Pendidikan → 10
- Tenaga Pengajar → 3

UI:
- Each row = rounded card
- Label left, value right
- Slight background contrast

---

#### RIGHT → "Beasiswa Desa"

Centered layout:

- Penerima Beasiswa → 250+
- Dana Tersalurkan → 1.5M
- Subtitle:
  - Tahun Ajaran 2025/2026

Make it visually balanced (almost like KPI hero card)

---

### 4. BOTTOM SECTION (FULL WIDTH or 2 COL)

#### "Kalender Event Budaya"

List of events:
- Event name
- Date
- Location (right aligned)

Example:
- Lomba Baris Berbaris — 1 Des 2025 — Lapangan Desa
- Lomba Tari Tradisional — 10 Des 2025 — Banjar Desa
- Davoz — 20 Des 2025 — Kantor Desa

UI:
- Rounded list items
- Border + hover effect
- Clean spacing

---

## 🎨 DESIGN SYSTEM

- Mantine components:
  - Card
  - Progress
  - Grid
  - Text
- Tailwind for spacing/layout

Style:
- Radius: xl / 2xl
- Shadow: soft
- Background: #f5f6f8
- Primary: navy blue
- Success: green
- Danger: red
- Neutral: gray

Typography:
- Clean, readable
- Emphasis on numbers

---

## ⚙️ FUNCTIONALITY

- Fetch data from Elysia API
- Use OpenAPI client
- Global state (Valtio):
  - selectedYear
  - filters

- Add:
  - loading skeletons
  - error toast (sonner)
  - empty states

- Format numbers:
  - 1.5M
  - 250+

---

## 📦 FILE STRUCTURE

/src/routes/health-dashboard.tsx

/src/components/health/
  - summary-cards.tsx
  - health-stats.tsx
  - posyandu-schedule.tsx
  - pendidikan.tsx
  - beasiswa.tsx
  - event-calendar.tsx

---

## 🧠 DATA MODEL (IMPORTANT)

type HealthStats = {
  imunisasi: number
  pemeriksaan: number
  gizi: number
  stunting: number
}

type PosyanduSchedule = {
  id: string
  name: string
  date: string
  startTime: string
  endTime: string
}

type EducationStats = {
  tk: number
  sd: number
  smp: number
  sma: number
  lembaga: number
  pengajar: number
}

type Scholarship = {
  totalRecipients: number
  totalFunds: number
  year: string
}

type Event = {
  id: string
  name: string
  date: string
  location: string
}

---

## 🚀 BONUS (ADVANCED)

- Add calendar view toggle (list ↔ calendar)
- Add filter by dusun / banjar
- Add alert highlight for stunting > threshold
- Add realtime update (websocket / polling Elysia)
- Add export PDF report

---

## 🧠 OUTPUT EXPECTATION

- Clean modular React components
- Maintainable architecture
- No hardcoded values
- Proper hooks usage
- Production-ready code