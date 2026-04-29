# Deployment

## Staging

**URL:** `https://dashboard-desa-plus-stg.wibudev.com`  
**Repo:** `bipprojectbali/dashboard-desa-plus`  
**Branch:** `stg`

### Deploy via slash command

Gunakan `/deploy-stg` di Claude Code. Command ini menjalankan seluruh alur deploy otomatis via MCP server `deploy-stg`.

### Alur deploy manual (via MCP tools)

| Langkah | MCP Tool | Keterangan |
|---|---|---|
| 0 | — | Cek `/api/version` endpoint tersedia di kode |
| 1 | `bump_version` | Increment patch version di `package.json` |
| 2 | `check_migrations` | Cek apakah perlu migration baru |
| 2b | `create_migration` | Buat migration jika `needs_migration: true` |
| 3 | — | `bun run build` — stop jika gagal |
| 4 | `commit_and_push_stg` | Commit + push ke branch `stg` |
| 5 | `trigger_publish` | Trigger `publish.yml` (build Docker image) |
| 5b | `watch_workflow_run` | Poll setiap 30 detik hingga selesai |
| 6 | `trigger_repull` | Trigger `re-pull.yml` (redeploy di Portainer) |
| 6b | `watch_workflow_run` | Poll setiap 30 detik hingga selesai |
| 7 | `check_stg_version` | Verifikasi versi live = versi lokal |

---

## Environment Variables

Semua vars diset di `.env`. Wajib untuk deploy:

```env
# Database
DATABASE_URL="postgresql://USER:PASS@HOST:PORT/DB?schema=public"

# Auth
BETTER_AUTH_SECRET="<32+ char random string>"
ADMIN_EMAIL="admin@example.com"

# External APIs
DESA_API_URL="https://desa-darmasaba-stg.wibudev.com"
VITE_DESA_API_URL="https://desa-darmasaba-stg.wibudev.com"
NOC_API_URL="https://darmasaba.muku.id/api/noc/docs/json"

# App
PORT=3000
VITE_PUBLIC_URL="https://dashboard-desa-plus-stg.wibudev.com"

# Deploy MCP (untuk /deploy-stg)
GH_TOKEN="<GitHub personal access token>"
BASE_URL="https://dashboard-desa-plus-stg.wibudev.com"
STACK_NAME="dashboard-desa-plus"

# Notifikasi Telegram (opsional)
BOT_TOKEN="..."
CHAT_ID="..."
```

---

## MCP Server: `deploy-stg`

Konfigurasi di `.mcp.json`:
```json
{
  "mcpServers": {
    "deploy-stg": {
      "command": "node",
      "args": ["--env-file=.env", ".claude/mcp/github-actions.mjs"],
      "env": {
        "GH_TOKEN": "${GH_TOKEN}",
        "BASE_URL": "${BASE_URL}",
        "STACK_NAME": "${STACK_NAME}"
      }
    }
  }
}
```

Script MCP ada di `.claude/mcp/github-actions.mjs`.

---

## Catatan Penting

- Jangan jalankan `re-pull.yml` sebelum `publish.yml` selesai/berhasil
- Verifikasi versi via `/api/version` (bukan `/api/utils/version`)
- Jika versi tidak match setelah deploy: cek container logs di Portainer atau `gh run view <run_id> --repo bipprojectbali/dashboard-desa-plus --log`
- `GH_TOKEN` harus punya permission: `contents:write`, `actions:write`
