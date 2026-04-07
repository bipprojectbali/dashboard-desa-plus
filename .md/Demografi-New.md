Create a modern demographic analytics dashboard for a village system (Dashboard Kependudukan).

Tech stack:
- React 19 + Vite (Bun runtime)
- Mantine UI (core components)
- TailwindCSS (ONLY for layout/grid/spacing)
- Recharts (charts)
- TanStack Router
- Icons: lucide-react
- State: Valtio
- Date: dayjs

---

## 🎨 DESIGN SYSTEM (CONSISTENT WITH OTHER DASHBOARDS)

- Background: #f3f4f6
- Card: white, rounded-2xl
- Shadow: soft (low elevation)
- Primary: navy (#1E3A5F)
- Text hierarchy:
  - Title: semi-bold
  - Subtitle: gray-500
  - Numbers: bold, high contrast

- Spacing:
  - gap-6
  - padding p-6
  - consistent vertical rhythm

- Icons:
  - inside circle
  - navy background
  - white icon

---

## 🧱 LAYOUT STRUCTURE

### 🔹 TOP STATS (4 CARDS)
Grid: 4 columns (responsive)

Cards:

1. Total Penduduk
   - Value: 5.634
   - Subtitle: "Aktif terdaftar"

2. Kepala Keluarga
   - Value: 1.354
   - Subtitle: "Total KK"

3. Kelahiran
   - Value: 23
   - Subtitle: "Tahun ini"

4. Kemiskinan
   - Value: 324
   - Subtitle: "-10% dari tahun lalu"
   - Show green trend indicator

---

## 📊 ROW 2 (3 COLUMNS)

---

### 🔹 LEFT: "Pengelompokan Umur"
- BarChart (Recharts)
- Categories:
  17–25, 26–35, 36–45, 46–55, 56–65, 65+

Style:
- Navy bars
- Rounded edges
- Clean axis
- Balanced spacing

---

### 🔹 CENTER: "Demografi Pekerjaan"
- BarChart (Recharts)

Categories:
- Sipil
- Guru
- Petani
- Pedagang
- Wiraswasta

Style:
- Same style as previous chart (CONSISTENT)

---

### 🔹 RIGHT: "Statistik Dinamika Penduduk"

Grid inside card (2x2 mini cards):

- Kelahiran (green)
- Kematian (red)
- Pindah Masuk (blue)
- Pindah Keluar (blue)

Each mini card:
- Icon
- Value
- Label

Style:
- Soft background
- Centered content
- Rounded-lg

---

## 📦 ROW 3 (3 COLUMNS)

---

### 🔹 LEFT: "Distribusi Agama"
- PieChart (Recharts)

Data:
- Hindu
- Islam
- Kristen
- Buddha

Style:
- Clean labels
- Soft colors
- Legend optional

---

### 🔹 CENTER: "Data per Banjar"
- Table (Mantine Table)

Columns:
- Banjar
- Penduduk
- KK
- Miskin

Style:
- Clean rows
- Minimal border
- Zebra optional
- Right align numbers

---

### 🔹 RIGHT: "Statistik Sektor Unggulan"
- BarChart (single or few bars)

Example:
- Pertanian

Style:
- Large bar
- Center focus
- Minimal axis

---

## ⚙️ COMPONENT STRUCTURE

components/
- StatCard.tsx
- BarChartCard.tsx
- PieChartCard.tsx
- MiniStatGrid.tsx
- DataTable.tsx

routes/
- demografi-dashboard.tsx

---

## ✨ INTERACTIONS (VIBE CODER TOUCH)

- Card hover → scale(1.02)
- Transition: 150–200ms ease
- Chart hover tooltip (Recharts default)
- Table row hover highlight
- Mini cards slightly lift on hover

---

## 🎯 UX PRINCIPLES

- Group related data clearly
- Maintain visual hierarchy
- Charts must be consistent (VERY IMPORTANT)
- Avoid clutter
- Numbers should be easy to scan

---

## 🚀 OUTPUT

- Modular React components (NOT monolithic)
- Clean, production-ready
- Use Mantine correctly
- Tailwind ONLY for layout/grid