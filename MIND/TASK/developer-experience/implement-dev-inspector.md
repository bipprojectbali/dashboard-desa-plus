# TASK: Implementasi Click-to-Source (Dev Inspector)

**ID:** `TASK-DX-001`  
**Konteks:** Developer Experience (DX)  
**Status:** 🏗️ PROPOSED  
**Prioritas:** 🟡 TINGGI (Peningkatan Produktivitas)  
**Estimasi:** 1 Hari Kerja  

---

## 🎯 OBJEKTIF
Mengaktifkan fitur **Click-to-Source** di lingkungan pengembangan: klik elemen UI di browser sambil menekan hotkey (`Ctrl+Shift+Cmd+C` atau `Ctrl+Shift+Alt+C`) untuk langsung membuka file source code di editor (VS Code, Cursor, dll) pada baris dan kolom yang tepat.

---

## 📋 DAFTAR TUGAS (TODO)

### 1. Vite Plugin Configuration
- [ ] Buat file `src/utils/dev-inspector-plugin.ts` yang berisi `inspectorPlugin()` (regex-based JSX attribute injection).
- [ ] Modifikasi `src/vite.ts`:
  - Impor `inspectorPlugin`.
  - Tambahkan `inspectorPlugin()` ke array `plugins` **sebelum** `react()`.
  - Gunakan `enforce: 'pre'` pada plugin tersebut.

### 2. Frontend Component Development
- [ ] Buat komponen `src/components/dev-inspector.tsx`:
  - Implementasikan hotkey listener.
  - Tambahkan overlay UI (border biru & tooltip nama file) saat hover.
  - Implementasikan `getCodeInfoFromElement` dengan fallback (fiber props -> DOM attributes).
  - Tambahkan fungsi `openInEditor` (POST ke `/__open-in-editor`).

### 3. Backend Integration (Elysia)
- [ ] Modifikasi `src/index.ts`:
  - Tambahkan handler `onRequest` sebelum middleware lainnya.
  - Intercept request ke path `/__open-in-editor` (POST).
  - Gunakan `Bun.spawn()` untuk memanggil editor (berdasarkan `.env` `REACT_EDITOR`).
  - Gunakan `Bun.which()` untuk verifikasi keberadaan editor di system PATH.

### 4. Application Root Integration
- [ ] Modifikasi `src/frontend.tsx`:
  - Implementasikan **Conditional Dynamic Import** untuk `DevInspector`.
  - Gunakan `import.meta.env?.DEV` agar tidak ada overhead di production.
  - Bungkus `<App />` (atau router) dengan `<DevInspectorWrapper>`.

### 5. Environment Setup
- [ ] Tambahkan `REACT_EDITOR=code` (atau `cursor`, `windsurf`) di file `.env`.
- [ ] Pastikan alias `@/` berfungsi dengan benar di plugin Vite untuk resolusi path.

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
