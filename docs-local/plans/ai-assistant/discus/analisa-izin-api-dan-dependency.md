# Analisa — Izin `view-*` di API (temuan 4) & kerentanan dependency

> Disusun sesi induk 2026-10-02 atas persetujuan user ("analisa dulu sebelum kode"). Hanya membaca kode & `bun audit`;
> **belum ada perubahan kode.** Temuan 8 (role dari cookie cache) sedang diperbaiki `ai_pointer` di `fix/role-from-db`
> dan menjadi dasar bagian A.

## A. Temuan 4 — izin `view-*` tidak ditegakkan di API

**Fakta (join `277c5c5`).** `checkPermission()` (`src/utils/permission.ts`) tidak dipanggil di route mana pun. Izin di
`/admin/roles` hanya menyembunyikan menu sidebar. Semua route data di bawah ini hanya mensyaratkan **login**
(`apiMiddleware`), tidak mengecek fitur:

| Prefix API | Fitur yang seharusnya | Catatan |
|---|---|---|
| `/keuangan` | `view-keuangan` | |
| `/demografi`, `/resident` | `view-demografi` | `resident` berisi data warga — paling sensitif |
| `/bumdes`, `/umkm` | `view-bumdes` | |
| `/sosial`, `/sosial/kesejahteraan` | `view-sosial` | data kesehatan (ibu hamil, balita) |
| `/keamanan` | `view-keamanan` | |
| `/complaint`, complaint-platform | `view-pengaduan` | teks pengaduan warga |
| `/division` | `view-kinerja-divisi` | |
| `/dashboard`, dashboard-cache | `view-dashboard` | |
| `/search` | per hasil | hasil lintas modul harus disaring per fitur |
| wall-snapshot, `/wall-layout` (GET) | per widget / `view-dashboard` | kiosk `/wall` |
| `/admin/*`, `/admin/sync`, `/noc` (sync) | admin / `sync-noc` | sudah ada guard admin (sebagian) |
| `/profile`, `/*-preferences`, `/my-permissions`, `/apikey`, `/bantuan` | milik user sendiri | tetap cukup login |

Asisten AI **tidak** terdampak: izin ditegakkan di dalam tool (`resolveAllowedFeatures`).

**Usulan perbaikan (satu branch `fix/api-permission-guard`, setelah `fix/role-from-db` masuk):**
1. Guard Elysia bernama `requireFeature(feature)` (macro/`onBeforeHandle`) yang memakai **sumber yang sama dengan asisten**
   (`resolveAllowedFeatures`, role dari DB) → 403 bila tidak diizinkan. Satu query per request (tanpa N+1); boleh di-cache
   per request.
2. Pasang per plugin sesuai tabel; `/search` dan wall-snapshot menyaring hasil per fitur, bukan menolak seluruhnya.
3. Halaman frontend: route guard yang menampilkan "Tidak punya akses" (sekarang halaman bisa dibuka dengan mengetik URL).
4. Test: per prefix → 401 tanpa login, 403 tanpa fitur, 200 dengan fitur (pola `tests/api/sosial.test.ts` + `tests/db` untuk sesi nyata).

**Risiko:** akun kiosk `/wall` harus punya izin modul widget yang tampil (sudah aturan F2-w); role `user` default
memiliki semua `view-*`, jadi tidak ada yang tiba-tiba terkunci kecuali admin memang mencabut izin.

**Pertanyaan:** (1) Setuju pendekatan guard bersama + saring `/search`/wall? (2) Dikerjakan di mana? (saran: `ai_pointer`
setelah batch saat ini, atau sesi baru karena di luar AI).

## B. Kerentanan dependency (`bun audit`, 2026-10-02)

Total **121** (4 critical, 69 high, 39 moderate, 9 low) — sama dengan sebelum fitur AI (tidak ada yang berasal dari
paket baru `react-markdown`/`remark-gfm`).

### Critical

| Paket | Lewat | Relevan untuk kita? |
|---|---|---|
| `better-auth` — refresh-token replay di plugin `oidc-provider`/`mcp` | langsung (`^1.4.18`) | **Tidak langsung**: kita tidak memakai plugin apa pun (`src/utils/auth.ts` tanpa `plugins`) |
| `seroval` (`fromJSON` type confusion) | `@tanstack/react-router` 1.158.1 → `router-core` | Rendah: dipakai untuk serialisasi SSR; kita SPA tanpa SSR. Tetap ikut upgrade router |
| `shell-quote` | `@react-dev-inspector/vite-plugin` (dev) | Hanya dev; tidak masuk build produksi |
| `@vitest/ui` (baca/eksekusi file saat UI server jalan) | `better-auth` → `vitest` → `@vitest/ui` | Hanya bila `vitest --ui` dijalankan; kita memakai `bun:test`. Hilang bila better-auth di-upgrade (perlu dicek) |

### High yang paling relevan

| Paket | Isu | Relevan? |
|---|---|---|
| `better-auth` | **Account takeover via OAuth auto-link ke email pre-registered yang belum terverifikasi** | **YA** — kita memakai login GitHub/Google + email/password. Penyerang mendaftar dengan email korban (belum terverifikasi), korban login Google → akun tertaut. Perlu upgrade atau matikan auto-link untuk email belum terverifikasi |
| `better-auth` | magic-link/email-OTP, organization invitation, oidc alg=none, XSS redirect_uri oidc/mcp | Tidak — plugin tersebut tidak dipakai |
| `elysia` (2), `vite` (3), `undici` (6), `fast-uri` (8), `brace-expansion`/`minimatch`/`picomatch`, `nanoid`, `kysely`, `js-yaml`, `postcss`, `rollup`, `lodash`, dll. | beragam | Sebagian besar transitif/dev; perlu dicek per isu saat upgrade |

### Usulan

1. **Prioritas tinggi:** upgrade `better-auth` `1.4.18` → terbaru (`1.7.7` per `npm view` 2026-10-02) di branch
   `chore/upgrade-better-auth`, baca changelog (lompatan minor bisa membawa perubahan konfigurasi), jalankan semua test
   auth (`tests/db` sesi nyata), uji manual login email + GitHub + Google + verifikasi admin. Bila upgrade terhambat:
   set `account.accountLinking` agar tidak menautkan ke email yang belum terverifikasi (perlu dicek opsi tepatnya di versi kita).
2. Upgrade `@tanstack/react-router` (+ plugin/generator) `1.158.1` → terbaru (`1.170.41`) — menutup `seroval`.
3. `elysia`, `vite` ke patch terbaru yang menutup advisory; cek ulang `bun audit`.
4. Dev-only (`@react-dev-inspector`, `vitest` UI): catat, upgrade bila mudah; tidak memblok deploy.
5. Satu branch per kelompok, `bun audit` sebelum/sesudah dilampirkan di laporan.

**Pertanyaan:** (3) Setuju urutan 1 → 2 → 3? (4) Dikerjakan di mana?
