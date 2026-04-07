# Mobile Responsive Plan - Dashboard Darmasaba NOC

## 📱 Analisis Saat Ini

### Masalah Mobile yang Ditemukan:

1. **Header Component (`header.tsx`)**
   - User info (nama + avatar) tidak responsif, overlap di mobile
   - Breadcrumbs terlalu panjang di mobile
   - Icon groups (theme toggle, notification, admin) tidak wrap dengan baik
   - User info text "Kepala Desa" terpotong di layar kecil

2. **Sidebar Component (`sidebar.tsx`)**
   - Logo terlalu besar di mobile
   - Search input tidak optimal di mobile
   - Menu items perlu scrollable yang lebih baik di mobile
   - Settings submenu collapse tidak smooth di mobile

3. **Main Layout (`main-layout.tsx`)**
   - AppShell navbar width 300px terlalu lebar untuk mobile
   - Padding `md` terlalu besar untuk layar kecil
   - Main content area perlu padding adjustment di mobile

4. **Dashboard Content (`dashboard-content.tsx`)**
   - Grid sudah ada responsive spans (base: 12, md: 6, lg: 3) ✅
   - SDGS cards span `{ base: 9, md: 3 }` aneh, harusnya `{ base: 12, md: 6, lg: 3 }`
   - Charts perlu minHeight di mobile untuk prevent height warning
   - Stat cards perlu padding adjustment di mobile

5. **Kinerja Divisi Page (`kinerja-divisi.tsx`)**
   - Activity cards 4 kolom di desktop, perlu adjustment di mobile
   - 3-column grid (DivisionList, DocumentChart, ProgressChart) perlu stack di mobile
   - Archive cards perlu stack di mobile

6. **Other Pages** (belum dicek detail)
   - Pages lain perlu responsive check

## 🎯 Rencana Implementasi

### Phase 1: Core Layout & Navigation (Priority: HIGH)
- Fix Header component untuk mobile
- Fix Sidebar component untuk mobile  
- Fix Main Layout padding & sizing
- Improve burger menu & mobile sidebar

### Phase 2: Dashboard Page (Priority: HIGH)
- Fix SDGS card grid layout
- Fix chart minHeight issues
- Optimize stat cards for mobile
- Improve spacing & gaps di mobile

### Phase 3: Kinerja Divisi Page (Priority: MEDIUM)
- Fix activity cards grid
- Fix 3-column dashboard grid
- Fix archive cards layout
- Improve DiscussionPanel di mobile

### Phase 4: Other Pages (Priority: MEDIUM)
- Check & fix responsive di semua pages
- Optimize tables & forms untuk mobile
- Improve modals & dialogs di mobile

### Phase 5: Polish & Testing (Priority: LOW)
- Test di berbagai ukuran layar
- Fine-tune spacing & typography
- Add responsive utilities jika diperlukan
- Cross-browser testing

## 📐 Breakpoints yang Akan Digunakan

Menggunakan Mantine breakpoints default:
- `xs`: 576px (Extra small devices)
- `sm`: 768px (Small devices - tablets portrait)
- `md`: 992px (Medium devices - tablets landscape)
- `lg`: 1200px (Large devices - desktops)
- `xl`: 1400px (Extra large devices)

## 🔧 Teknik yang Akan Digunakan

1. **Mantine Responsive Props**
   - `span={{ base: 12, sm: 6, md: 4, lg: 3 }}` untuk Grid
   - `visibleFrom="sm"` / `hiddenFrom="sm"` untuk show/hide
   - `size={{ base: "sm", md: "md" }}` untuk dynamic sizing

2. **CSS Media Queries** (jika perlu)
   - `@media (max-width: 768px)` untuk custom styles
   - Tailwind responsive classes jika applicable

3. **Component Restructuring**
   - Simplify header di mobile (hide breadcrumbs, shorten user info)
   - Stack elements vertically di mobile
   - Use drawers/sheets instead of modals di mobile

4. **Touch Optimization**
   - Larger tap targets (min 44x44px)
   - Better spacing between interactive elements
   - Smooth transitions & animations

## ⚠️ Constraints

- Harus tetap bagus di desktop (no regression)
- Harus support dark/light theme
- Harus maintain accessibility
- Performance harus tetap baik (no heavy re-renders)

## 📊 Success Criteria

- ✅ No horizontal scroll di mobile (max-width: 375px)
- ✅ All interactive elements accessible di mobile
- ✅ Text readable tanpa zoom (min 14px)
- ✅ Touch targets minimal 44x44px
- ✅ Sidebar usable di mobile (drawer style)
- ✅ Charts render properly di mobile
- ✅ Forms usable di mobile
- ✅ Tables scrollable atau card layout di mobile

## 🕒 Estimasi

- Phase 1: ~2-3 jam
- Phase 2: ~1-2 jam
- Phase 3: ~1-2 jam
- Phase 4: ~2-3 jam
- Phase 5: ~1 jam

**Total: ~7-11 jam**
