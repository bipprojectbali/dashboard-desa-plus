# Route map, auth, and selectors

Sourced from `src/middleware/authMiddleware.tsx`, `src/components/sidebar.tsx`, `src/components/header.tsx`, `src/routes/signin.tsx`, `src/locales/id.ts`. Re-verify against those files if the app has changed significantly since this was written — selectors drift.

## Environments

| Env | Base URL | Notes |
|---|---|---|
| Staging (default) | `https://dashboard-desa-plus-stg.wibudev.com` | Use unless user explicitly names another env |
| Local dev | `http://localhost:3000` | Only if user is running `bun run dev` locally and asks for it |
| Production | (ask user — not hardcoded here on purpose) | Never target without explicit user request |

## Login flow

Route: `/signin` (public, no auth required to view).

| Field | Selector | Notes |
|---|---|---|
| Email input | `#signin-email` (or `loc=css:#signin-email`) | placeholder `nama@desa.go.id`, label "Alamat Email" |
| Password input | Mantine `PasswordInput` — use `loc=role:textbox[name*="Password"]` or snapshot ref; no fixed `id` | placeholder `••••••••` |
| Submit button | `text="Masuk ke Dashboard"` | `type="submit"` |
| Remember me (optional) | checkbox "Ingat saya selama 30 hari" | leave default |

```js
const task = await taskSpace("qc-run");
const page = task.page("p1");
await page.goto(`${BASE_URL}/signin`);
await page.fill("#signin-email", ADMIN_EMAIL);
// Use a snapshot ref or role locator for the password field — confirm with a snapshot first.
const snap = await page.snapshot();
// ... locate password field ref, then:
await page.fill(PASSWORD_REF_OR_SELECTOR, ADMIN_PASSWORD);
await page.click('text="Masuk ke Dashboard"');
await page.waitForURL(/\/(?!signin)/, { timeout: 10_000 }); // left /signin
```

Credentials: read `ADMIN_EMAIL` / `ADMIN_PASSWORD` from the repo's local `.env` (never commit or print the actual value in the report). Fallback seed defaults (dev/staging only, confirm before relying on them): `admin@example.com` / `admin123`.

**One attempt only.** If login fails, stop and report — do not try other credentials (see SKILL.md Guardrails).

## Auth rules (from `authMiddleware.tsx`)

| Route pattern | Rule |
|---|---|
| `/signin`, `/signup`, `/auth-callback` | Public, no auth |
| `/wall*` | Public, no router-level auth (optional server-side `WALL_ACCESS_TOKEN` gate via `?key=` param — check `.env`/Portainer config if testing the token gate) |
| `/admin*`, `/pengaturan/akses-dan-tim` | Requires auth **and** role=admin — redirects otherwise |
| Everything else | Requires auth — redirects to `/signin?redirect=<path>` |
| Any route except `/profile` | If `user.emailVerified === false`, redirected to `/signin` |

For role-gating tests (checklist §6.2): log in as a non-admin seed user (`demo1@example.com` / `demo123`, role `user` — see `prisma/seeders/seed-auth.ts`) and confirm `/admin*` redirects instead of rendering.

## Full route sweep list

Visit in this order (matches sidebar nav order, so screenshots read naturally). Nav labels are what the QC agent should also verify are visible/clickable in the sidebar itself.

| # | Nav label (ID) | Route | Primary QC focus (from PEKERJAAN_QC.md) |
|---|---|---|---|
| 1 | Beranda | `/` | Chart APBDes (dark-mode color bug regression), statistik surat, kepuasan layanan donut, SDGs images |
| 2 | Kinerja Divisi | `/kinerja-divisi` | Divisi teraktif list, document bar chart, activity progress %, grid whitespace |
| 3 | Pengaduan & Layanan Publik | `/pengaduan-layanan-publik` | Tren pengaduan line chart, surat terbanyak bar chart, pengajuan terbaru list padding |
| 4 | Jenna Analytic | `/jenna-analytic` | Interaksi chatbot bar chart, jam tersibuk progress |
| 5 | Demografi & Kependudukan | `/demografi-pekerjaan` | Pengelompokan umur, demografi pekerjaan (Y-axis truncation regression), sektor unggulan |
| 6 | Keuangan & Anggaran | `/keuangan-anggaran` | Alokasi anggaran per bidang (label truncation regression), realisasi APBDes |
| 7 | Bumdes & UMKM Desa | `/bumdes` | Sales table, detail modal (ring progress, comparison bar) |
| 8 | Sosial | `/sosial` | General visual/data pass |
| 9 | Keamanan | `/keamanan` | General visual/data pass |

Additional routes not in the main sidebar (visit separately):

| Route | Auth | Notes |
|---|---|---|
| `/bantuan` | Auth required | FAQ page |
| `/admin` | Admin only | Landing/overview |
| `/admin/users` | Admin only | Table pagination/filter/sort |
| `/admin/roles` | Admin only | Role permission matrix |
| `/admin/apikey` | Admin only | API key CRUD — **do not create/revoke real keys** without asking |
| `/admin/audit-log` | Admin only | Large table — good for performance/resiliency checklist |
| `/admin/system-health` | Admin only | Live status indicators |
| `/admin/settings` | Admin only | System settings — **do not change values** without asking |
| `/admin/help` | Admin only | — |
| `/pengaturan/umum` | Auth required | General settings form |
| `/pengaturan/keamanan` | Auth required | Security prefs |
| `/pengaturan/notifikasi` | Auth required | Notification prefs |
| `/pengaturan/akses-dan-tim` | Admin only | Team/access management |
| `/pengaturan/sinkronisasi` | Auth required | **Trigger sync at most once** (Guardrails) |
| `/profile` | Auth required | View own profile |
| `/profile/edit` | Auth required | Edit form — test validation, don't leave garbage saved data |
| `/users` | Auth required | User directory |
| `/users/$id` | Auth required | Pick one real id from `/users` list |
| `/wall` | Public | Kiosk display — check both the layout builder (if reachable) and the display mode; also test `?key=` param behavior if `WALL_ACCESS_TOKEN` is set |
| `/signin`, `/signup` | Public | Auth flow itself — test validation errors, don't complete a real signup unless asked |

## Theme toggle

| Element | Selector |
|---|---|
| Toggle button | `[aria-label="Ganti tema"]` (icon-only `ActionIcon` in header, top-right area) |
| Verify state | `await page.evaluate(() => localStorage.getItem("mantine-color-scheme-value"))` → `"light"` / `"dark"` |

```js
await page.click('[aria-label="Ganti tema"]', { label: "toggle dark mode" });
await page.waitForTimeout(300); // theme transition
const scheme = await page.evaluate(() => localStorage.getItem("mantine-color-scheme-value"));
```

## Viewport switching

`ego-browser` has no dedicated viewport-resize wrapper in the documented Page API — use CDP directly:

```js
async function setViewport(page, width, height) {
  await page.cdp("Emulation.setDeviceMetricsOverride", {
    width, height, deviceScaleFactor: 1, mobile: width < 768,
  });
}
await setViewport(page, 1440, 900); // Desktop
await setViewport(page, 375, 812);  // Mobile (iPhone-ish)
await setViewport(page, 768, 1024); // Tablet (optional)
```

Reset with `await page.cdp("Emulation.clearDeviceMetricsOverride")` if reusing the same Page for a non-emulated check afterward (usually not necessary if you always call `setViewport` before each route visit).
