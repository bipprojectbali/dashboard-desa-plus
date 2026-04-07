Build a user preferences/settings page for a smart village dashboard system.

Use the following stack:
- Runtime: Bun
- Frontend: React 19 + Vite
- Routing: TanStack Router
- UI: Mantine + TailwindCSS
- State: Valtio
- Backend: ElysiaJS
- ORM: Prisma (PostgreSQL)
- API Client: OpenAPI generated (openapi-fetch)

---

## 🎯 GOAL

Create a clean and intuitive settings page where users can customize:
- Language
- Timezone
- Date format
- Dashboard behavior
- UI preferences

---

## 🧱 LAYOUT STRUCTURE

### PAGE TITLE
- "Preferensi Tampilan"
- Large bold heading
- Left aligned
- Clean spacing

---

## 1. SECTION: GENERAL SETTINGS

Form-style layout (vertical spacing, label left, input right)

Fields:

1. Bahasa
   - Select dropdown
   - Options:
     - Indonesia
     - English

2. Zona Waktu
   - Select dropdown
   - Default: WITA
   - Options:
     - WIB
     - WITA
     - WIT

3. Format Tanggal
   - Select dropdown
   - Options:
     - DD/MM/YYYY
     - MM/DD/YYYY
     - YYYY-MM-DD

---

## 2. SECTION: DASHBOARD SETTINGS

### Toggle Controls (Switch)

1. Refresh Otomatis
   - Toggle ON/OFF
   - If ON → enable interval selection

2. Interval Refresh
   - Select dropdown
   - Options:
     - 5s
     - 30s
     - 1m
     - 5m
     - 30m

3. Tampilkan Grid
   - Toggle ON/OFF
   - Controls layout grid visibility

4. Animasi Transisi
   - Toggle ON/OFF
   - Controls UI animation

---

## 3. ACTION BUTTONS

Bottom left:

- "Batal"
  - Secondary button (gray outline)

- "Simpan Perubahan"
  - Primary button (navy blue)
  - Rounded
  - On click → save settings

---

## 🎨 DESIGN SYSTEM

- Mantine:
  - Select
  - Switch
  - Button
  - Stack / Group
  - Card

- Tailwind:
  - spacing
  - layout grid
  - responsive

Design style:
- Clean minimal
- Plenty whitespace
- Left-aligned labels
- Inputs aligned consistently

Colors:
- Primary: navy blue
- Background: light gray (#f5f6f8)
- Border: subtle gray

---

## ⚙️ FUNCTIONALITY

### STATE MANAGEMENT (Valtio)

Create global state:

type UserPreferences = {
  language: "id" | "en"
  timezone: "WIB" | "WITA" | "WIT"
  dateFormat: string
  autoRefresh: boolean
  refreshInterval: number
  showGrid: boolean
  animations: boolean
}

---

### API INTEGRATION

Endpoints:

GET /user/preferences
PUT /user/preferences

---

### BEHAVIOR

- Load preferences on page mount
- Update local state on change
- Save on button click
- Show toast (sonner):
  - success: "Perubahan disimpan"
  - error: "Gagal menyimpan"

---

### UX IMPROVEMENTS

- Disable "Interval Refresh" if autoRefresh = false
- Show loading state on save
- Optimistic UI update
- Persist preferences (DB via Prisma)

---

## 📦 FILE STRUCTURE

/src/routes/settings.tsx

/src/components/settings/
  - general-settings.tsx
  - dashboard-settings.tsx
  - settings-actions.tsx

---

## 🧠 DATABASE (PRISMA)

model UserPreferences {
  id              String @id @default(cuid())
  userId          String @unique
  language        String
  timezone        String
  dateFormat      String
  autoRefresh     Boolean
  refreshInterval Int
  showGrid        Boolean
  animations      Boolean
  updatedAt       DateTime @updatedAt
}

---

## 🚀 BONUS (ADVANCED)

- Add dark mode toggle 🌙
- Add reset to default button
- Add real-time preview (change UI instantly)
- Sync preferences across devices
- Multi-user support (role-based settings)

---

## 🧠 OUTPUT EXPECTATION

- Clean modular React components
- Proper form handling (react-hook-form optional)
- No hardcoded values
- Fully functional API integration
- Production-ready UX