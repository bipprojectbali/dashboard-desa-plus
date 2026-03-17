Create a modern admin dashboard UI for a village management system using React 19 + Vite + TailwindCSS + Mantine components + Recharts.

Design style:
- Clean, soft UI with rounded corners (2xl)
- Light gray background (#f5f6f8)
- Card-based layout with subtle shadow
- Smooth spacing and consistent padding
- Professional government-style but still modern
- Use Inter or system font
- Primary color: dark blue
- Accent color: orange for progress
- Success color: green
- Use Mantine components where possible

Layout:
- Responsive grid layout (desktop-first)
- 4 summary cards on top (horizontal)
- 2 columns main content below
- Left sidebar for division list
- Right content for charts and activity

---

## 🔹 TOP CARDS (4 ITEMS)
Each card contains:
- Title (e.g: "Rakor 2025")
- Progress bar (orange)
- Date (small text)
- Status badge "Selesai" (green)

Use:
- Mantine Card
- Mantine Progress
- Mantine Badge

---

## 🔹 LEFT PANEL - "Divisi teraktif"
Vertical list of divisions:
- Each item is clickable
- Show division name + number of activities
- Rounded container with hover effect
- Chevron icon on right

Example items:
- Kesejahteraan (37 kegiatan)
- Pemerintahan (26 kegiatan)
- Keuangan (17 kegiatan)
- etc

Use:
- Scrollable container
- Soft border + hover highlight

---

## 🔹 CENTER - BAR CHART (Jumlah Dokumen)
- Use Recharts
- Two bars:
  - Gambar
  - Dokumen
- Color:
  - Yellow/orange
  - Green
- Show Y axis scale (0–400)

---

## 🔹 RIGHT - PIE CHART (Progres Kegiatan)
- Use Recharts PieChart
- Segments:
  - Selesai (green ~83%)
  - Dikerjakan (orange ~16%)
  - Segera dikerjakan (blue)
  - Dibatalkan (red)
- Include legend below

---

## 🔹 BOTTOM LEFT - Diskusi Panel
- List of discussion messages
- Each item:
  - Title
  - Sender name
  - Date
- Styled like notification cards
- Compact and clean

---

## 🔹 BOTTOM RIGHT - "Acara Hari Ini"
- Empty state
- Show text: "Tidak ada acara hari ini"
- Centered, muted text

---

## ⚙️ TECH REQUIREMENTS

- Use React functional components
- Use TanStack Router (file-based or route config)
- Use Mantine for UI components
- Use Tailwind for layout and spacing
- Use Recharts for charts
- State management: Valtio (simple global state)
- Date formatting: dayjs
- Icons: lucide-react

---

## 📁 COMPONENT STRUCTURE

- components/
  - DashboardCard.tsx
  - DivisionList.tsx
  - BarChartCard.tsx
  - PieChartCard.tsx
  - DiscussionList.tsx
  - EmptyState.tsx

- routes/
  - dashboard.tsx

---

## ✨ EXTRA (IMPORTANT FOR VIBE CODING)

- Add subtle hover animations (scale 1.02)
- Smooth transitions (150–200ms)
- Keep spacing consistent (gap-4 / gap-6)
- Avoid clutter, prioritize readability
- Make it feel "calm and productive"

---

Output:
- Full React component code (modular, not monolithic)
- Clean, readable, production-ready
- No unnecessary comments