# Deployment Guide - Staging/Production

## 🔧 Prasyarat di Portainer

### 1. Environment Variables yang Harus Di-set

Di Portainer, pada Stack/Container settings, tambahkan environment variables berikut:

```bash
# Database (WAJIB)
DATABASE_URL=postgresql://user:password@host:5432/dashboard_desa?schema=public

# Authentication (WAJIB - min 32 karakter)
BETTER_AUTH_SECRET=gantidengankaracakrandomminimal32karakter

# Admin User (WAJIB untuk pertama kali)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# External APIs (WAJIB untuk staging)
VITE_DESA_API_URL=https://desa-darmasaba-stg.wibudev.com
DESA_API_URL=https://desa-darmasaba-stg.wibudev.com
NOC_API_URL=https://darmasaba.muku.id/api/noc/docs/json

# Optional
VITE_PUBLIC_URL=https://dashboard-desa-plus-stg.wibudev.com
PORT=3000
LOG_LEVEL=info
```

### 2. Build dengan Docker Build Args

Saat build image di Portainer, gunakan **Build Args**:

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

**PENTING:** `VITE_*` variables HARUS di-set saat **build time** karena Vite meng-embed nilai ini ke bundle JavaScript.

### 3. Database Migration & Seed

Setelah container running, jalankan commands ini di dalam container:

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

Setelah setup selesai:

1. Cek logs: `docker logs -f <container_name>`
2. Akses app: `https://dashboard-desa-plus-stg.wibudev.com`
3. Login dengan `ADMIN_EMAIL` dan `ADMIN_PASSWORD`
4. Buka browser console, pastikan tidak ada error 500

---

## 🐛 Troubleshooting

### Error: `Cannot read properties of undefined (reading 'VITE_DESA_API_URL')`

**Penyebab:** Environment variable `VITE_DESA_API_URL` tidak tersedia saat build time.

**Solusi:**
- Rebuild image dengan `--build-arg VITE_DESA_API_URL=<url>`
- Atau set di Dockerfile ARG (sudah diperbaiki)

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

**Solusi:** Generate secret baru:
```bash
openssl rand -base64 32
```

---

## 📝 Checklist Deployment

- [ ] Environment variables sudah benar di Portainer
- [ ] Build args untuk `VITE_*` variables sudah diset
- [ ] Database sudah di-migrate (`prisma migrate deploy`)
- [ ] Database sudah di-seed (`bun run seed`)
- [ ] Container running dan healthy
- [ ] Tidak ada error 500 di browser console
- [ ] Bisa login dengan admin credentials
- [ ] External API (Desa & NOC) bisa diakses

---

## 🔄 Update Deployment

Saat ada code update:

```bash
# 1. Build ulang
docker build --build-arg ... -t dashboard-desa-plus:latest .

# 2. Push ke registry (jika ada)
docker push dashboard-desa-plus:latest

# 3. Redeploy di Portainer
# Atau via CLI:
docker-compose up -d --force-recreate

# 4. Jalankan migration jika ada perubahan schema
bun x prisma migrate deploy

# 5. Restart container
docker restart <container_name>
```
