Create a modern analytics dashboard UI for a village complaint system (Pengaduan Dashboard).

Tech stack:
- React 19 + Vite (Bun runtime)
- Mantine UI (core components)
- TailwindCSS (layout & spacing only)
- Recharts (charts)
- TanStack Router
- Icons: lucide-react
- State: Valtio
- Date: dayjs

---

## 🎨 DESIGN STYLE

- Clean, minimal, and soft dashboard
- Background: light gray (#f3f4f6)
- Card: white with subtle shadow
- Border radius: 16px–24px (rounded-2xl)
- Typography: medium contrast (not too bold)
- Primary color: navy blue (#1E3A5F)
- Accent: soft blue + neutral gray
- Icons inside circular solid background

Spacing:
- Use gap-6 consistently
- Internal padding: p-5 or p-6
- Layout must feel breathable (no clutter)

---

## 🧱 LAYOUT STRUCTURE

### 🔹 TOP SECTION (4 STAT CARDS - GRID)
Grid: 4 columns (responsive → 2 / 1)

Each card contains:
- Title (small, muted)
- Big number (bold, large)
- Subtitle (small gray text)
- Right side: circular icon container

Example:
- Total Pengaduan → 42 → "Bulan ini"
- Baru → 14 → "Belum diproses"
- Diproses → 14 → "Sedang ditangani"
- Selesai → 14 → "Terselesaikan"

Use:
- Mantine Card
- Group justify="space-between"
- Icon inside circle (bg navy, icon white)

---

## 📈 MAIN CHART (FULL WIDTH)
Title: "Tren Pengaduan"

- Use Recharts LineChart
- Smooth line (monotone)
- Show dots on each point
- Data: Apr → Okt
- Value range: 30–60

Style:
- Minimal grid (light dashed)
- No heavy colors (use gray/blue line)
- Rounded container card
- Add small top-right icon (expand)

---

## 📊 BOTTOM SECTION (3 COLUMN GRID)

### 🔹 LEFT: "Surat Terbanyak"
- Horizontal bar chart (Recharts)
- Categories:
  - KTP
  - KK
  - Domisili
  - Usaha
  - Lainnya

Style:
- Dark blue bars
- Rounded edges
- Clean axis

---

### 🔹 CENTER: "Pengajuan Terbaru"
List of activity cards:

Each item:
- Name (bold)
- Subtitle (jenis surat)
- Time (small text)
- Status badge (kanan)

Status:
- baru → red
- proses → blue
- selesai → green

Style:
- Card per item
- Soft border
- Rounded
- Compact spacing

---

### 🔹 RIGHT: "Ajuan Ide Inovatif"
List mirip dengan pengajuan terbaru:

Each item:
- Nama
- Judul ide
- Waktu
- Button kecil "Detail"

Style:
- Right-aligned action button
- Light border
- Clean spacing

---

## ⚙️ COMPONENT STRUCTURE

components/
- StatCard.tsx
- LineChartCard.tsx
- BarChartCard.tsx
- ActivityList.tsx
- IdeaList.tsx

routes/
- dashboard.tsx

---

## ✨ INTERACTIONS (IMPORTANT)

- Hover card → scale(1.02)
- Transition: 150ms ease
- Icon circle slightly pop on hover
- List item hover → subtle bg change

---

## 🎯 UX DETAILS

- Numbers must be visually dominant
- Icons must balance layout (not too big)
- Avoid heavy borders
- Keep everything aligned perfectly
- No clutter

---

## 🚀 OUTPUT

- Modular React components (NOT one file)
- Clean code (production-ready)
- Use Mantine properly (no hacky inline styles unless needed)
- Use Tailwind only for layout/grid/spacing