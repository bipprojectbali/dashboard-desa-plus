---
name: qc-agent
description: Run a professional, human-like QC pass on Dashboard Desa Plus using a real Chromium browser (ego-browser) — visits every route, checks visual/data/theme/functional/accessibility/security criteria, captures screenshots and console/network evidence, and produces a prioritized bug report. Use when the user asks to "QC pakai browser", "audit UI/UX", "cari bug di dashboard", "cek semua halaman pakai ego-browser", or wants pre-deploy visual/functional verification. Not for unit/API tests (use `bun run verify`) or single-fix verification (use the `verify` skill).
---

# qc-agent

Automates the human QC workflow defined in [`PEKERJAAN_QC.md`](../../../PEKERJAAN_QC.md) and the design spec in [`SKILLS_QC.md`](../../../SKILLS_QC.md), executed through the `ego-browser` skill against a real Chromium browser. Read those two files first if this is your first QC run on this repo — they contain the full criteria catalogue and severity taxonomy this skill implements.

**This skill drives `ego-browser`.** If `ego-browser` isn't already loaded in context, invoke it via Skill first — this file assumes its API (`taskSpace`, `page.snapshot`, `page.cdp`, etc.) is available.

## Before you start — confirm scope (don't assume)

Ask the user (or infer from their request) these before running anything. Default to the safe choice and state it out loud rather than silently picking — don't block on trivial ones:

1. **Environment** — default **staging** (`https://dashboard-desa-plus-stg.wibudev.com`, from `.env.example`/`docs/DEPLOYMENT.md`). **Never target production unless the user explicitly names it in this request.**
2. **Credentials** — read `ADMIN_EMAIL`/`ADMIN_PASSWORD` from the repo's local `.env` if present; otherwise fall back to seed defaults `admin@example.com` / `admin123` (see `.env.example`, `prisma/seeders/seed-auth.ts`). If login fails, **stop and report** — do not guess other credentials (see Guardrails).
3. **Scope** — default to the **full route sweep** (`references/routes.md`). If the user names specific pages/features, narrow to those only.
4. **Viewport × Theme matrix** — default to **Desktop (1440×900) + Mobile (375×812)**, each in **Light + Dark**. Add Tablet (768px) only if the user asks or if a full/exhaustive audit was requested.
5. **Output location** — default `qc-reports/<YYYY-MM-DD-HHmm>/` at repo root (gitignored — see Guardrails).

Do not use `AskUserQuestion` for these unless the request is genuinely ambiguous (e.g., user says "QC the app" with no other context and you're unsure whether they mean full sweep or a quick smoke test) — for everything else, pick the documented default and state it in your opening summary.

## Execution phases

Follow this order; each phase's detail is in `PEKERJAAN_QC.md` §4 and `SKILLS_QC.md` §4. Keep phases in the same ego-browser TaskSpace (one space for the whole QC run, per ego-browser's own guidance) and screenshot the final state of each script invocation so the next round can act on it.

1. **Setup** — create the TaskSpace, set up console/network capture (see `references/browser-setup.md`), log in as admin (see `references/routes.md` for the exact selectors), create the output folder.
2. **Smoke test** — visit every route in `references/routes.md` once (desktop, light mode only), screenshot each, capture console/network errors. Fast pass to catch anything catastrophic before spending time on the full matrix.
3. **Deep dive per page** — for each route, run the full checklist (`references/checklist.md`) across the agreed viewport×theme matrix: visual, data/labels, theme correctness, interactions (clicks, filters, modals, forms), console/network.
4. **Targeted tests** — chart data-labels, grid whitespace, dark-mode color correctness, `/wall` drag-and-drop, role-gating (`/admin/*` as non-admin if a second account was agreed), resiliency (slow/failed network), security surface scan. Full list in `references/checklist.md` §5–7.
5. **Regression check (mandatory, not optional)** — re-verify the 12 historical findings in `PM-TASKS-QC-2026-09-24.md` and the fixes from commit `d15ce48` are actually visible in the running app, not just present in the diff. Checklist in `references/checklist.md` §8.
6. **Report** — compile `REPORT.md` using the template in `references/report-template.md`. Lead with a summary table (verdict per finding, severity), then detailed findings with evidence.
7. **Cleanup** — close the TaskSpace (`task.finish({ keep: [] })`) unless the user asked to keep the browser open for review.

## Guardrails (do not skip)

- **Staging by default, production only on explicit request.** State which environment you're targeting before the first `page.goto()`.
- **Read-only.** Do not submit forms with lasting side effects (create/delete real users, change system settings, trigger real notifications) unless the user explicitly asked for that specific action. If you need to test a create/delete flow, use data clearly tagged `QC-TEST-*` and clean it up afterward, or ask first.
- **No credential guessing.** One login attempt with the confirmed credentials. If it fails, stop and report — don't try variations.
- **Don't spam external syncs.** Trigger `/pengaturan/sinkronisasi` or NOC sync at most once, just to observe the UI feedback — not repeatedly.
- **Never paste raw secrets into the report.** If you find a leaked token/key (see checklist §6.1), report *where* it leaked, not the token value itself.
- **Chromium only, be honest about Safari.** `ego-browser` is Chromium-based. Any finding rooted in Safari-specific SVG text clipping, WebP rendering, or ITP behavior (see task #12 in `PM-TASKS-QC-2026-09-24.md`) must be labeled `❓ PERLU VERIFIKASI VISUAL DI SAFARI` — never claim it as `✅ VALID` from a Chromium-only run.
- **Close what you opened.** Finish the TaskSpace at the end; don't leave stray tabs.
- **Report location.** Write into `qc-reports/<run-id>/` and ensure `qc-reports/` is in `.gitignore` (add it if missing) — this is ephemeral output, not something to commit by default.

## Quality bar (when is a QC run actually done)

Don't declare the run complete until, per `SKILLS_QC.md` §8:
- Every route in `references/routes.md` was visited at least once per agreed viewport×theme combo.
- Console + network were captured for every route (not only the ones that looked broken).
- Every §8 regression item has an explicit PASS/FAIL, not an assumption.
- Every finding in the report has a screenshot; nothing is asserted without evidence.
- New findings were checked against `PM-TASKS-QC-2026-09-24.md` for duplicates before being reported as "new".
- Anything you couldn't test (Safari-only issues, second role account not available, production-only data) is stated explicitly in the report, not silently dropped.

## References

- [`references/routes.md`](references/routes.md) — full route map, nav labels, auth requirements, and the exact selectors for login/theme-toggle/nav (sourced from `src/middleware/authMiddleware.tsx`, `src/components/sidebar.tsx`, `src/components/header.tsx`, `src/routes/signin.tsx`).
- [`references/browser-setup.md`](references/browser-setup.md) — TaskSpace setup, console/network capture via CDP, viewport/theme switching recipes.
- [`references/checklist.md`](references/checklist.md) — the full per-page QC checklist (visual/data/theme/functional/technical/a11y/security/resiliency/regression), condensed from `PEKERJAAN_QC.md` and `SKILLS_QC.md` into checkable items with ego-browser-specific "how to check" notes.
- [`references/report-template.md`](references/report-template.md) — `REPORT.md` structure and the per-finding template.
- [`../../../PEKERJAAN_QC.md`](../../../PEKERJAAN_QC.md) — the human QC methodology this skill automates.
- [`../../../SKILLS_QC.md`](../../../SKILLS_QC.md) — design rationale and extended criteria for this skill.
- [`../../../PM-TASKS-QC-2026-09-24.md`](../../../PM-TASKS-QC-2026-09-24.md) — historical findings used for regression checks and dedup.
