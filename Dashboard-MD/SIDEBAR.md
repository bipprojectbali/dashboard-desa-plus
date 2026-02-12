# SIDEBAR.md
## Spesifikasi Sidebar Navigasi – DESA+

### Tujuan
Membuat sidebar navigasi dengan **indikator menu aktif (isActive)** seperti pada desain:
- Menu aktif memiliki **background biru muda**
- Ada **indikator garis vertikal di sisi kiri**
- Status aktif mengikuti **route/path yang sedang dibuka**

---
## Perilaku isActive

### Definisi isActive
Sebuah menu dianggap **aktif** jika:
- `currentPath === menu.path`
- atau (opsional) `currentPath.startsWith(menu.path)` untuk nested route

---

## Tampilan Menu Aktif

Jika menu **AKTIF**, maka:
- Background: `#E6F0FF` (biru muda)
- Text: bold / semibold
- Border kiri:
  - Lebar: `4px`
  - Warna: `#1E40AF` (biru tua)
- Border radius: `8px`
- Transition halus (`150–200ms`)

Jika menu **TIDAK AKTIF**:
- Background transparan
- Text normal
- Hover state:
  - Background `#F1F5F9`

---