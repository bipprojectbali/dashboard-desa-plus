# deploy-stg

Deploy ke staging environment secara penuh menggunakan MCP server `deploy-stg`.

**Repo GitHub:** `bipprojectbali/dashboard-desa-plus`  
**Branch stg:** `stg`  
**STG URL:** `https://dashboard-desa-plus-stg.wibudev.com`

---

## Alur Eksekusi

### Langkah 0 — Cek /api/version endpoint
Pastikan endpoint `/api/version` sudah ada di API:
```bash
grep -n '"/version"' src/app/api/\[\[...slugs\]\]/route.ts
```
Jika belum ada, tambahkan ke main API group yang membaca `version` dari `package.json`.

---

### Langkah 1 — Version Bump

Gunakan MCP tool `bump_version` (server: `deploy-stg`).

Tool otomatis baca `package.json`, increment patch (+1), tulis kembali.  
Catat `new_version` dari response — akan dipakai di Langkah 5 dan 6.

---

### Langkah 2 — Cek & Buat Migration

Gunakan MCP tool `check_migrations` (server: `deploy-stg`).

- Jika `needs_migration: true` → jalankan `create_migration` dengan `name: bump-stg-<new_version>`
- Jika `is_up_to_date: true` → lanjut ke Langkah 3

---

### Langkah 3 — Build Check

```bash
bun run build
```

Jika build gagal → **stop**, perbaiki error sebelum melanjutkan.

---

### Langkah 4 — Commit & Push ke stg

Gunakan MCP tool `commit_and_push_stg` (server: `deploy-stg`).

Tool otomatis stage `package.json` + `prisma/migrations/`, commit dengan message yang menyertakan versi baru, lalu push ke branch `stg` menggunakan `GH_TOKEN`.

---

### Langkah 5 — Trigger publish.yml

Gunakan MCP tool `trigger_publish` (server: `deploy-stg`):
- `stack_env`: `stg` (default)
- `tag`: nilai `new_version` dari Langkah 1 (sama persis dengan versi di `package.json`)

Tool mengembalikan `run_id`. Poll dengan `watch_workflow_run` setiap 30 detik hingga `status == "completed"`:
- `conclusion == "success"` → lanjut ke Langkah 6
- `conclusion != "success"` → **stop**, tampilkan error, jangan lanjut ke re-pull

---

### Langkah 6 — Trigger re-pull.yml

Setelah publish berhasil, gunakan MCP tool `trigger_repull` (server: `deploy-stg`):
- `stack_name`: otomatis dari env `STACK_NAME` (tidak perlu diisi manual)
- `stack_env`: `stg`

Stack yang di-deploy: `<STACK_NAME>-stg`. Poll dengan `watch_workflow_run` setiap 30 detik hingga `status == "completed"`.

---

### Langkah 7 — Verifikasi Versi

Gunakan MCP tool `check_stg_version` (server: `deploy-stg`):
- `wait_seconds`: `30` (tunggu container siap)

Tool otomatis fetch `BASE_URL/api/version` dan bandingkan dengan versi lokal.
- `match: true` → **Deploy berhasil!**
- `match: false` → cek container logs di Portainer atau jalankan `gh run view <run_id> --repo bipprojectbali/dashboard-desa-plus --log`

---

## Ringkasan MCP Tools

| Tool | Server | Tujuan |
|------|--------|--------|
| `bump_version` | `deploy-stg` | Increment patch version di package.json |
| `check_migrations` | `deploy-stg` | Cek status Prisma migrations |
| `create_migration` | `deploy-stg` | Buat migration baru jika diperlukan |
| `commit_and_push_stg` | `deploy-stg` | Commit + push ke branch stg |
| `trigger_publish` | `deploy-stg` | Trigger publish.yml (build Docker image) |
| `watch_workflow_run` | `deploy-stg` | Poll status workflow run |
| `trigger_repull` | `deploy-stg` | Trigger re-pull.yml (redeploy di Portainer) |
| `check_stg_version` | `deploy-stg` | Bandingkan versi lokal vs STG |

## Ringkasan Workflow Inputs

| Workflow | Input | Value |
|----------|-------|-------|
| `publish.yml` | `stack_env` | `stg` |
| `publish.yml` | `tag` | versi dari `package.json` (e.g. `0.1.26`) |
| `publish.yml` | `stack_name` | dari env `STACK_NAME` (opsional) |
| `re-pull.yml` | `stack_name` | dari env `STACK_NAME` (otomatis) |
| `re-pull.yml` | `stack_env` | `stg` |

## Catatan

- Jangan jalankan `re-pull.yml` jika `publish.yml` belum selesai/berhasil.
- Isi `GH_TOKEN` di `.env` sebelum menjalankan deploy (bisa sama dengan `GH_TOKEN`).
- `BASE_URL` di `.env` sudah diset ke `https://dashboard-desa-plus-stg.wibudev.com`.
- `STACK_NAME` di `.env` diset ke nama stack (e.g. `dashboard-desa-plus`) — dipakai otomatis oleh `trigger_publish` dan `trigger_repull`.
- Verifikasi versi via `/api/version` (bukan `/api/utils/version`).
