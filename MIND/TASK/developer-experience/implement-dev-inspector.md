# TASK: Implementasi Click-to-Source (Dev Inspector)

**ID:** `TASK-DX-001`  
**Konteks:** Developer Experience (DX)  
**Status:** ✅ COMPLETED  
**Prioritas:** 🟡 TINGGI (Peningkatan Produktivitas)  
**Estimasi:** 1 Hari Kerja  

---

## 🎯 OBJEKTIF
Mengaktifkan fitur **Click-to-Source** di lingkungan pengembangan: klik elemen UI di browser sambil menekan hotkey (`Ctrl+Shift+Cmd+C` atau `Ctrl+Shift+Alt+C`) untuk langsung membuka file source code di editor (VS Code, Cursor, dll) pada baris dan kolom yang tepat.

---

## 📋 DAFTAR TUGAS (TODO)

### 1. Vite Plugin Configuration
- [x] Buat file `src/utils/dev-inspector-plugin.ts` yang berisi `inspectorPlugin()` (regex-based JSX attribute injection).
- [x] Modifikasi `src/vite.ts`:
  - [x] Impor `inspectorPlugin`.
  - [x] Tambahkan `inspectorPlugin()` ke array `plugins` **sebelum** `react()`.
  - [x] Gunakan `enforce: 'pre'` pada plugin tersebut.

### 2. Frontend Component Development
- [x] Buat komponen `src/components/dev-inspector.tsx`:
  - [x] Implementasikan hotkey listener.
  - [x] Tambahkan overlay UI (border biru & tooltip nama file) saat hover.
  - [x] Implementasikan `getCodeInfoFromElement` dengan fallback (fiber props -> DOM attributes).
  - [x] Tambahkan fungsi `openInEditor` (POST ke `/__open-in-editor`).

### 3. Backend Integration (Elysia)
- [x] Modifikasi `src/index.ts`:
  - [x] Tambahkan handler `onRequest` sebelum middleware lainnya.
  - [x] Intercept request ke path `/__open-in-editor` (POST).
  - [x] Gunakan `Bun.spawn()` untuk memanggil editor (berdasarkan `.env` `REACT_EDITOR`).
  - [x] Gunakan `Bun.which()` untuk verifikasi keberadaan editor di system PATH.

### 4. Application Root Integration
- [x] Modifikasi `src/frontend.tsx`:
  - [x] Implementasikan **Conditional Dynamic Import** untuk `DevInspector`.
  - [x] Gunakan `import.meta.env?.DEV` agar tidak ada overhead di production.
  - [x] Bungkus `<App />` (atau router) dengan `<DevInspectorWrapper>`.

### 5. Environment Setup
- [x] Tambahkan `REACT_EDITOR=code` (atau `cursor`, `windsurf`) di file `.env`.
- [x] Pastikan alias `@/` berfungsi dengan benar di plugin Vite untuk resolusi path.

---

## 🛠️ INSTRUKSI TEKNIS

### Urutan Plugin di Vite
Sangat krusial agar `inspectorPlugin` berjalan di fase **pre-transform** sebelum JSX diubah menjadi `React.createElement` oleh compiler Rust (OXC) milik Vite React Plugin.

### Penanganan React 19
Gunakan strategi *multi-fallback* karena React 19 menghapus `_debugSource`. Prioritas pencarian info:
1. `__reactProps$*` (React internal props)
2. `__reactFiber$*` (Fiber tree walk-up)
3. DOM attribute `data-inspector-*` (Fallback universal)

---

## ✅ DEFINITION OF DONE (DoD)
1. [ ] Hotkey `Ctrl+Shift+Cmd+C` (macOS) / `Ctrl+Shift+Alt+C` mengaktifkan mode inspeksi.
2. [ ] Klik pada elemen UI membuka file yang benar di VS Code/Cursor pada baris yang tepat.
3. [ ] Fitur hanya aktif di mode pengembangan (`bun run dev`).
4. [ ] Di mode produksi (`bun run build`), tidak ada kode `DevInspector` yang masuk ke bundle (verifikasi via `dist/` jika perlu).
5. [ ] Kode mengikuti standar linting Biome (jalankan `bun run lint`).

---

## 📝 CATATAN
- Gunakan `Bun.spawn()` dengan mode `detached: true` jika memungkinkan (atau default fire-and-forget).
- Jika menggunakan Windows (WSL), pastikan path file dikonversi dengan benar (jika ada kendala).
- Gunakan log di console saat mode inspeksi aktif untuk mempermudah debugging.
