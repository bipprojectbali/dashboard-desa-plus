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

Semua vars diset di `.env` (lihat `.env.example` untuk template lengkap).

```env
# Database
DATABASE_URL="postgresql://USER:PASS@HOST:PORT/DB?schema=public"

# Auth
BETTER_AUTH_SECRET="<32+ char random string>"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"

# OAuth (opsional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Desa Website API (server proxy + frontend direct access)
DESA_API_URL="https://desa-darmasaba-stg.wibudev.com"
VITE_DESA_API_URL="https://desa-darmasaba-stg.wibudev.com"
DESA_APBDES_ID="cmk-apbdes-001"

# NOC System API
NOC_API_URL="https://darmasaba.muku.id/api/noc/docs/json"
NOC_API_KEY="<noc-api-key>"
NOC_VILLAGE_ID="desa1"

# Jenna AI Analytics API
VITE_JENNA_API_URL="https://desa-platform-stg.wibudev.com"
VITE_JENNA_API_TOKEN="<jenna-bearer-token>"
JENNA_DAILY_COST_LIMIT=10000

# Platform API — Pengaduan & Surat live (Fase 2), server-only Bearer
PLATFORM_API_URL="https://desa-platform-stg.wibudev.com"
PLATFORM_API_TOKEN="<platform-bearer-token>"

# Cache (set "false" untuk disable in-memory cache)
CACHE_ENABLED=true

# NOC Video Wall (/wall) — optional kiosk token.
# Kosong ⇒ /wall terbuka tanpa login. Diisi ⇒ wajib akses via /wall?key=<token>.
# Server-only (JANGAN pakai prefix VITE_).
WALL_ACCESS_TOKEN=""

# App
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
VITE_PUBLIC_URL="https://dashboard-desa-plus-stg.wibudev.com"

# Deploy MCP (untuk /deploy-stg)
GH_TOKEN="<GitHub personal access token>"
BASE_URL="https://dashboard-desa-plus-stg.wibudev.com"
STACK_NAME="dashboard-desa-plus"

# Notifikasi Telegram (opsional)
BOT_TOKEN="..."
CHAT_ID="..."
```

**PENTING:** Semua `VITE_*` variables HARUS di-set saat **build time** (bukan hanya runtime) karena Vite meng-embed nilai ini ke bundle JavaScript. Di Portainer, gunakan **Build Args** saat build image:

```bash
docker build \
  --build-arg DATABASE_URL="postgresql://user:password@host:5432/dashboard_desa?schema=public" \
  --build-arg BETTER_AUTH_SECRET="random-secret-min-32-characters" \
  --build-arg VITE_DESA_API_URL="https://desa-darmasaba-stg.wibudev.com" \
  --build-arg VITE_PUBLIC_URL="https://dashboard-desa-plus-stg.wibudev.com" \
  --build-arg NOC_API_URL="https://darmasaba.muku.id/api/noc/docs/json" \
  --build-arg DESA_API_URL="https://desa-darmasaba-stg.wibudev.com" \
  -t dashboard-desa-plus:latest .
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

## Setup Manual di Portainer (tanpa MCP)

Untuk deploy pertama kali atau troubleshooting manual, tanpa `/deploy-stg`:

### 1. Set Environment Variables

Di Portainer, pada Stack/Container settings, tambahkan semua env vars di atas (minimal `DATABASE_URL`, `BETTER_AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DESA_API_URL`/`VITE_DESA_API_URL`, `NOC_API_URL`).

### 2. Build dengan Docker Build Args

Lihat contoh `docker build` di atas — `VITE_*` wajib jadi build arg.

### 3. Migration & Seed

Setelah container running:

```bash
# Masuk ke container shell
docker exec -it <container_name> sh

# Jalankan database migrations
bun x prisma migrate deploy

# Seed database dengan data awal
bun run seed

# Atau seed partial jika perlu:
bun run seed:auth        # Seed admin user saja
bun run seed:divisions   # Seed divisi default
bun run seed:dashboard   # Seed data dashboard (SDGS, Satisfaction, dll)
```

### 4. Verifikasi

1. Cek logs: `docker logs -f <container_name>`
2. Akses app: `https://dashboard-desa-plus-stg.wibudev.com`
3. Login dengan `ADMIN_EMAIL` dan `ADMIN_PASSWORD`
4. Buka browser console, pastikan tidak ada error 500
5. Verifikasi versi via `/api/version` (bukan `/api/utils/version`)

### Update Deployment (manual)

```bash
# 1. Build ulang (dengan build args)
docker build --build-arg ... -t dashboard-desa-plus:latest .

# 2. Push ke registry (jika ada)
docker push dashboard-desa-plus:latest

# 3. Redeploy di Portainer, atau via CLI:
docker-compose up -d --force-recreate

# 4. Jalankan migration jika ada perubahan schema
docker exec -it <container_name> bun x prisma migrate deploy

# 5. Restart container
docker restart <container_name>
```

---

## Troubleshooting

### Error: `Cannot read properties of undefined (reading 'VITE_DESA_API_URL')`

**Penyebab:** Environment variable `VITE_DESA_API_URL` tidak tersedia saat build time.

**Solusi:** Rebuild image dengan `--build-arg VITE_DESA_API_URL=<url>`.

### Error: `500 Internal Server Error` di semua API endpoint

**Penyebab:** Database belum di-migrate atau `DATABASE_URL` salah.

**Solusi:**
1. Pastikan `DATABASE_URL` benar di Portainer env vars
2. Jalankan `bun x prisma migrate deploy` di container
3. Restart container

### Error: `PrismaClientInitializationError`

**Penyebab:** Database tidak bisa dikoneksi.

**Solusi:**
- Cek koneksi database dari container: `bun x prisma db pull`
- Pastikan database accessible dari network container
- Cek format `DATABASE_URL`

### Error: `BETTER_AUTH_SECRET must be at least 32 characters`

**Penyebab:** Secret terlalu pendek.

**Solusi:** Generate secret baru: `openssl rand -base64 32`

### Versi tidak match setelah deploy via `/deploy-stg`

- Jangan jalankan `re-pull.yml` sebelum `publish.yml` selesai/berhasil
- Verifikasi versi via `/api/version`
- Cek container logs di Portainer atau `gh run view <run_id> --repo bipprojectbali/dashboard-desa-plus --log`
- `GH_TOKEN` harus punya permission: `contents:write`, `actions:write`

---

## Checklist Deployment

- [ ] Environment variables sudah benar di Portainer / `.env`
- [ ] Build args untuk `VITE_*` variables sudah diset
- [ ] Database sudah di-migrate (`prisma migrate deploy`)
- [ ] Database sudah di-seed (`bun run seed`)
- [ ] Container running dan healthy
- [ ] Tidak ada error 500 di browser console
- [ ] Bisa login dengan admin credentials
- [ ] External API (Desa, NOC, Platform) bisa diakses
- [ ] Versi live (`/api/version`) = versi lokal (`package.json`)
