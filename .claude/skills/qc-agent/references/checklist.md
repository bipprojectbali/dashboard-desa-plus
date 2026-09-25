# Per-page QC checklist (condensed from PEKERJAAN_QC.md + SKILLS_QC.md)

Run every applicable section per route per viewport×theme combo. "How to check" notes are ego-browser-specific; skip a check only if it genuinely doesn't apply to that page (e.g. no charts on `/admin/apikey`) — note the skip, don't silently omit it.

## 1. Visual / Layout

- [ ] No truncated text without ellipsis or tooltip. **How:** full-page screenshot + `page.snapshot()`; compare rendered text length against container width via `getComputedStyle` if suspicious.
- [ ] Chart axis labels (X/Y) readable or properly ellipsized with full text on hover. **How:** screenshot chart region tightly (`clip`), hover the axis label, screenshot again to confirm tooltip.
- [ ] No unexplained whitespace in card grids (cards of mismatched height sitting next to short-content cards). **How:** full-page screenshot at each viewport; look at `kinerja-divisi` and `pengaduan-layanan-publik` grids specifically (known-risky per `PM-TASKS-QC-2026-09-24.md` #6/#8).
- [ ] Consistent padding/margin across sibling cards on the same page.
- [ ] No overlapping elements (tooltips, dropdowns, modals over other content).
- [ ] All images render (no broken-image icon). **How:** `page.evaluate(() => [...document.images].filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src))` — flags broken images directly; specifically check Beranda SDGs images.
- [ ] Responsive: layout doesn't break at tablet/mobile viewport (no horizontal scroll unless intended, no clipped nav).

## 2. Data & Information

- [ ] Every quantitative chart (Bar/Line/Pie/Donut) has a visible data label (number/%), not tooltip-only. **How:** snapshot the chart's text nodes; cross-reference against the regression list in §8 below.
- [ ] Progress bars show the percentage as text, not just the visual bar.
- [ ] Chart legends include values/percentages, not just color+name.
- [ ] No hardcoded/mock data visible — empty states show empty-state UI or 0, not placeholder numbers (per CLAUDE.md convention).
- [ ] Number/currency/date formatting is consistent Indonesian locale (`Rp`, thousand separators, `id-ID` dates) across the page.
- [ ] Rendered numbers match the underlying API response. **How:** `page.fetch()` the same endpoint the page calls (see Network tab / `src/api/*.ts` for the route) and diff a few key numbers against what's rendered.

## 3. Theme (Light/Dark)

- [ ] Toggling dark mode leaves no hardcoded light-mode color behind (known regression: `chart-apbdes.tsx` background — verify in §8).
- [ ] Status colors (red=danger, green=safe, yellow=warning) stay semantically correct in both themes.
- [ ] Text/background contrast is readable in dark mode, not just light. **How:** `page.evaluate()` pull `getComputedStyle(el).color` and `.backgroundColor` for status badges/legend text, eyeball or compute basic contrast ratio.
- [ ] Alert/status icons match the condition (not a generic arrow where a warning icon is expected).

## 4. Functional / Interaction

- [ ] All buttons/links/forms trigger the correct action. **How:** click, then snapshot/screenshot to confirm the expected result (modal opened with correct data, navigation happened, etc.) — e.g. Bumdes "Detail" button opens `SalesDetailModal` with the clicked row's product.
- [ ] Modals open/close correctly (ESC, backdrop click, close button); no orphaned backdrop or stuck modal.
- [ ] Form validation shows clear Indonesian-language error messages.
- [ ] Table filter/sort/pagination work and produce correct results (test on `/admin/users`, `/admin/audit-log`, `/users`).
- [ ] `/wall` drag-and-drop (layout builder) — items move/resize; state isn't lost after drop; invalid drop targets don't corrupt the layout.
- [ ] Auth flow: signin → session persists across navigation → logout invalidates session (back-button after logout shouldn't reveal protected content).
- [ ] Role-gating: non-admin account redirected away from `/admin/*` and `/pengaturan/akses-dan-tim`, not shown a blank/broken page. **How:** requires a second, non-admin login — only test if that account was agreed in scope (`SKILL.md` step 3).
- [ ] Manual sync (`/pengaturan/sinkronisasi`) gives clear loading/success/error feedback. **Trigger at most once** (Guardrails).

## 5. Technical (Console & Network)

- [ ] Zero JS errors in console during normal navigation. **How:** `Runtime.exceptionThrown` events from `browser-setup.md`'s capture helper.
- [ ] No repeated React key warnings, hydration mismatches, or `act()` warnings. **How:** `Runtime.consoleAPICalled` events with `type: "warning"`.
- [ ] No failed API requests (4xx/5xx) without a corresponding UI error state. **How:** `Network.responseReceived` events with `status >= 400`; then check the screenshot for whether the UI showed an error state or failed silently.
- [ ] No excessive duplicate requests to the same endpoint on a single page load (possible React Query key bug). **How:** group `Network.requestWillBeSent` events by URL within one `visitAndCapture` call; flag if the same endpoint fires >2-3 times without an obvious reason (pagination, filters).
- [ ] Reasonable load time; chart-heavy pages (Beranda, Kinerja Divisi) don't freeze the UI thread. **How:** rough timing via `page.cdp("Performance.getMetrics")` before/after `waitForLoadState`.
- [ ] No CORS/mixed-content errors on cross-origin requests (`VITE_DESA_API_URL`, image CDN). **How:** `Network.loadingFailed` events with CORS-related `errorText`.
- [ ] No 404s for static assets (favicon, fonts, images).

## 6. Security surface (non-invasive, no pentesting)

- [ ] No secret/token leakage in client-visible surfaces. **How:** `page.evaluate(() => document.documentElement.outerHTML)` plus captured network response bodies — scan for patterns like `PLATFORM_API_TOKEN`, `NOC_API_KEY`, `WALL_ACCESS_TOKEN`, generic `Bearer `/`sk-`/`token=` strings that shouldn't be client-exposed (only `VITE_*`-prefixed values are meant to reach the client per CLAUDE.md). **If found, report the location only — never paste the actual secret value into the report** (Guardrails).
- [ ] Admin-only routes actually block data fetching for non-admin users, not just hide UI (check Network tab for admin-only API calls firing even when the page redirects).
- [ ] Logged-out state can't reach protected content via browser back button.
- [ ] Staging cookies are `Secure` over HTTPS. **How:** `page.cdp("Network.getCookies")`.

## 7. Resiliency, performance, i18n, a11y (see SKILLS_QC.md §5 for full rationale)

- [ ] Loading/skeleton state visible under throttled network (not just a layout jump). Use the `Network.emulateNetworkConditions` recipe in `browser-setup.md`.
- [ ] 404 route shows a proper error page, not a blank/crashed React tree.
- [ ] No raw locale keys leaking into UI text (e.g. literal `kinerjaDivisi.progres` instead of translated text) — scan visible text for dot-separated camelCase patterns.
- [ ] Tab `<title>` updates per route, not a static/generic value.
- [ ] Icon-only buttons have `aria-label` (pattern already confirmed correct for the theme toggle — verify it's consistent across other icon buttons, e.g. the `/wall` header link, table row actions).
- [ ] Double-clicking a submit/action button doesn't fire the action twice.
- [ ] ESC/backdrop-click on a modal returns focus sensibly, doesn't leave a stuck overlay.

## 8. Mandatory regression check — historical findings

Re-verify these against the **running app**, not the diff, before calling the run complete. Source: `PM-TASKS-QC-2026-09-24.md` findings, fixed in commit `d15ce48`.

| # | Page / component | Expected now | Verdict (fill in) |
|---|---|---|---|
| 1 | Bumdes sales table | "Aksi/Detail" column behavior as currently decided (was a product question, not a bug — just confirm it still opens `SalesDetailModal` correctly if still present) | |
| 2 | Keuangan → Alokasi Anggaran Per Bidang | Y-axis labels not clipped even for long sector names; bar values shown as data labels | |
| 3 | Demografi → Pengelompokan Umur, Demografi Pekerjaan, Sektor Unggulan | All three charts show data labels | |
| 4 | Demografi Pekerjaan Y-axis | "Pedagang/UMKM" label shows in full, not clipped to "edagang/UMKM" | |
| 5 | Jenna Analytic → Interaksi Chatbot | Bar chart shows data labels | |
| 6/7 | Pengaduan → Tren Pengaduan (line), Surat Terbanyak (bar) | Line chart shows point labels; bar chart shows value labels; card padding/whitespace looks intentional, not leftover gap | |
| 8 | Kinerja Divisi → Divisi Teraktif, Jumlah Dokumen | No excess whitespace below list/chart cards in the 3-column grid | |
| 9 | Kinerja Divisi → ProgressChart, DocumentChart | Document bar chart has labels; donut legend still shows %, ideally also in-slice if that was implemented | |
| 10 | Beranda → Statistik Pengajuan Surat, Tingkat Kepuasan | Bar chart has labels; satisfaction donut legend shows numbers, not just color+name | |
| 11 | Beranda → APBDes "realisasi rendah" status | Background is **not green** in dark mode when status is red/alert — must match `statusMessage.color` | |
| 12 | Beranda → SDGs images | Images render in Chrome (this is the one item this Chromium-only run *can* meaningfully confirm — but original bug was Safari-specific, so a Chrome PASS here does not close the Safari-side task; still mark `❓ perlu verifikasi Safari` for the Safari claim even if Chrome shows the image fine) | |

Every row needs an explicit verdict (`✅ PASS`, `❌ REGRESSED`, `❓ N/A in Chrome — needs Safari`) with a screenshot reference — don't leave any blank.
