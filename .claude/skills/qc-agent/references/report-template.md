# REPORT.md structure

Write the final report to `qc-reports/<run-id>/REPORT.md`. Structure:

```markdown
# QC Report — Dashboard Desa Plus

**Tanggal:** <date>
**Environment:** <base URL>
**Scope:** <full sweep / specific pages>
**Viewport × Theme matrix:** <e.g. Desktop 1440×900, Mobile 375×812; Light + Dark>
**Akun QC:** <admin email, and non-admin if role-gating was tested — never the password>
**Skill:** qc-agent (ego-browser, Chromium — cross-browser Safari claims not verifiable in this run)

---

## Ringkasan

| # | Halaman | Severity tertinggi | Jumlah temuan | Catatan |
|---|---|---|---|---|
| 1 | Beranda | Major | 2 | ... |
| 2 | Kinerja Divisi | Minor | 1 | ... |
| ... | | | | |

**Total temuan:** N (Blocker: n, Critical: n, Major: n, Minor: n, Trivial: n)

## Regresi (checklist.md §8)

| # | Item | Verdict |
|---|---|---|
| 1 | Bumdes Aksi/Detail | ✅ PASS |
| 2 | Alokasi Anggaran label + data label | ✅ PASS |
| ... | | |

## Temuan Detail

### [Blocker/Critical/Major/Minor/Trivial] Judul singkat

- **Halaman/Route:** /path
- **Komponen (jika diketahui):** src/components/.../file.tsx
- **Viewport/Tema:** Desktop 1440px / Dark
- **Langkah reproduksi:**
  1. ...
  2. ...
- **Hasil aktual:** ...
- **Hasil diharapkan:** ...
- **Screenshot:** `screenshots/<file>.png`
- **Console/Network:** <inline snippet or path to console-network-log/*.json>
- **Jenis bug:** Visual / Data / Cross-browser / Dark Mode / Functional / Performance / Console / Network / Auth / A11y / Responsive / Copy / Product
- **Verdict:** ✅ VALID / ⚠️ PARSIAL / ❓ PERLU VERIFIKASI VISUAL (mis. Safari-only)
- **Duplikat dari:** <link ke PM-TASKS-QC-2026-09-24.md item, jika ada> / tidak ada

(repeat per finding, grouped by page, ordered by severity within each page)

## Tidak Dapat Diuji

- <e.g. "Safari-specific SVG clipping — ego-browser is Chromium-only, needs manual Safari check">
- <e.g. "Role-gating for non-admin — second account not provided in this run">
- <e.g. "Production environment — this run targeted staging only">

## Lampiran

- Screenshot lengkap: `screenshots/`
- Console/network log mentah (hanya untuk halaman bermasalah): `console-network-log/`
```

## Severity definitions (use consistently — see PEKERJAAN_QC.md §3.2)

| Level | Criteria |
|---|---|
| Blocker | App unusable / crash / totally wrong data |
| Critical | Core feature broken, significant data error |
| Major | Disrupts UX but has a workaround (e.g. severe label clipping, dark-mode color bug) |
| Minor | Cosmetic, doesn't block function |
| Trivial/Enhancement | Suggestion, not a bug |

## Notes on writing findings

- Every finding needs a screenshot path that actually exists in `screenshots/` — don't reference a file you didn't save.
- State the exact selector/component file if you found it via inspection (`getComputedStyle`, snapshot ref) — this is what makes the report actionable for a dev, matching the style of `PM-TASKS-QC-2026-09-24.md`.
- Cross-check every new finding against `PM-TASKS-QC-2026-09-24.md` before writing "new" — if it's the same root cause, link it instead of duplicating.
- Don't editorialize product opinions as bugs (e.g. "this button seems unnecessary") — file those under a `Product/UX` type with a note that it's a suggestion, not a defect, same as task #1 in the historical doc.
