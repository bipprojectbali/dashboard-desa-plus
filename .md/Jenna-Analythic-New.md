Create a modern chatbot analytics dashboard UI.

Tech stack:
- React 19 + Vite (Bun runtime)
- Mantine UI (core components)
- TailwindCSS (ONLY for layout & spacing)
- Recharts (charts)
- TanStack Router
- Icons: lucide-react
- State: Valtio
- Date: dayjs

---

## 🎨 DESIGN SYSTEM

- Background: #f3f4f6 (soft gray)
- Card: white, rounded-2xl
- Shadow: subtle (soft elevation)
- Primary color: navy (#1E3A5F)
- Text:
  - Title: semi-bold
  - Subtitle: gray-500
- Spacing: gap-6, padding p-6

- Icon style:
  - Inside circular background
  - Circle: navy
  - Icon: white

---

## 🧱 LAYOUT STRUCTURE

### 🔹 TOP STATS (4 CARDS - GRID)
Responsive grid (4 → 2 → 1)

Each card contains:
- Title (small)
- Main value (large, bold)
- Subtitle
- Optional trend indicator (green +%)

Cards:

1. Interaksi Hari ini
   - Value: 61
   - Subtitle: "+15% dari kemarin"
   - Show green trend

2. Jawaban otomatis
   - Value: 87%
   - Subtitle: "53 dari 61 interaksi"

3. Belum Ditindak
   - Value: 8
   - Subtitle: "Perlu respon manual"

4. Waktu respon
   - Value: 2.3 sec
   - Subtitle: "Rata-rata"

Use:
- Mantine Card
- Group justify="space-between"
- Icon inside circle

---

## 📊 MAIN CHART (FULL WIDTH)
Title: "Interaksi Chatbot"

- Use Recharts BarChart
- Data:
  Sen, Sel, Rab, Kam, Jum, Sab, Min
- Values range: 20–80

Style:
- Bar color: navy (#1E3A5F)
- Rounded bars
- Minimal grid (light dashed)
- Clean axis
- Spacious container
- No heavy borders

---

## 📦 BOTTOM SECTION (2 COLUMN GRID)

---

### 🔹 LEFT: "Topik Pertanyaan Terbanyak"

List style (NOT chart)

Each item:
- Topic name (left)
- Count (right)

Example:
- Cara mengurus KTP → 89x
- Syarat Kartu Keluarga → 76x
- Jadwal Posyandu → 64x
- Pengaduan jalan rusak → 52x
- Info program bansos → 48x

Style:
- Light gray container per item
- Rounded (lg)
- Padding medium
- Flex justify-between

---

### 🔹 RIGHT: "Jam Tersibuk"

List with progress bar

Each item:
- Label (left)
- Percentage (right)
- Progress bar below

Data:
- Pagi (08:00–12:00) → 30%
- Siang (12:00–16:00) → 40%
- Sore (16:00–20:00) → 20%
- Malam (20:00–08:00) → 10%

Style:
- Mantine Progress (rounded)
- Color: navy or blue
- Clean spacing

---

## ⚙️ COMPONENT STRUCTURE

components/
- StatCard.tsx
- ChatbotBarChart.tsx
- TopicList.tsx
- BusyTimeList.tsx

routes/
- chatbot-dashboard.tsx

---

## ✨ INTERACTIONS (VIBE CODER TOUCH)

- Card hover → scale(1.02)
- Transition: 150ms ease
- Progress bar smooth animation
- List hover → subtle bg change
- Cursor pointer on interactive items

---

## 🎯 UX DETAILS

- Numbers MUST stand out visually
- Keep alignment super clean
- Avoid visual noise
- Maintain consistent spacing
- Make dashboard feel calm & readable

---

## 🚀 OUTPUT

- Modular React components
- Clean, production-ready code
- Use Mantine properly (no hacky inline styling)
- Tailwind only for grid/layout