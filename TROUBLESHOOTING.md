# 🔧 Troubleshooting Checklist - Staging

## ✅ Pre-Deployment Checklist

- [ ] `DATABASE_URL` sudah benar di Portainer
- [ ] `BETTER_AUTH_SECRET` minimal 32 karakter
- [ ] `VITE_DESA_API_URL` sudah diset (untuk frontend)
- [ ] `DESA_API_URL` sudah diset (untuk backend)
- [ ] Build args saat docker build sudah include `VITE_*` variables
- [ ] Database sudah accessible dari network container
- [ ] Image sudah di-rebuild dengan env vars yang benar

## ✅ Post-Deployment Checklist

- [ ] Container running dan healthy
- [ ] `bun x prisma migrate deploy` sudah dijalankan
- [ ] `bun run seed` sudah dijalankan
- [ ] Container sudah di-restart setelah seed
- [ ] Tidak ada error 500 di browser console
- [ ] Bisa akses `/api/docs` (Swagger)
- [ ] Bisa login dengan admin credentials

---

## 🚨 Error: 500 Internal Server Error (Semua Endpoint)

### Gejala:
```
GET /api/noc/last-sync 500
GET /api/complaint/stats 500
GET /api/dashboard/satisfaction 500
```

### Kemungkinan Penyebab:

#### 1. Database Belum Migrasi
**Solusi:**
```bash
docker exec -it <container> sh
bun x prisma migrate deploy
```

#### 2. DATABASE_URL Salah
**Cek:**
```bash
# Di Portainer env vars, pastikan format benar:
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
```

**Test koneksi:**
```bash
docker exec -it <container> sh
bun x prisma db pull
```

#### 3. Database Tidak Reachable
**Cek dari host:**
```bash
psql -h <db-host> -U <db-user> -d <db-name>
```

**Cek dari container:**
```bash
docker exec -it <container> sh
ping <db-host>
```

---

## 🚨 Error: Cannot read properties of undefined (reading 'VITE_DESA_API_URL')

### Gejala:
```
TypeError: Cannot read properties of undefined (reading 'VITE_DESA_API_URL')
at satisfaction-chart.tsx:43
```

### Penyebab:
`VITE_DESA_API_URL` tidak tersedia saat **build time**.

### Solusi:

#### Opsi A: Rebuild dengan Build Args (Recommended)
```bash
docker build \
  --build-arg VITE_DESA_API_URL="https://desa-darmasaba-stg.wibudev.com" \
  --build-arg VITE_PUBLIC_URL="https://dashboard-desa-plus-stg.wibudev.com" \
  -t dashboard-desa-plus-staging:latest .
```

#### Opsi B: Update Dockerfile (Sudah diperbaiki)
Dockerfile sekarang sudah include:
```dockerfile
ARG VITE_DESA_API_URL="http://localhost:3000"
ENV VITE_DESA_API_URL=$VITE_DESA_API_URL
```

Jadi tinggal rebuild dengan build args.

---

## 🚨 Error: PrismaClientInitializationError

### Gejala:
```
Can't reach database server at `host:5432`
```

### Solusi:

1. **Cek DATABASE_URL format:**
   ```
   postgresql://username:password@hostname:5432/database?schema=public
   ```

2. **Cek network:**
   ```bash
   # Dari container
   telnet <db-host> 5432
   ```

3. **Cek database running:**
   ```bash
   # PostgreSQL
   pg_isready -h <host> -p 5432
   ```

4. **Allow connections di PostgreSQL:**
   - Cek `postgresql.conf`: `listen_addresses = '*'`
   - Cek `pg_hba.conf`: allow dari container IP

---

## 🚨 Error: BETTER_AUTH_SECRET Invalid

### Gejala:
```
BETTER_AUTH_SECRET must be at least 32 characters
```

### Solusi:
Generate secret baru:
```bash
openssl rand -base64 32
```

Set di Portainer env vars dengan value yang baru di-generate.

---

## 🚨 Error: External API Timeout

### Gejala:
```
Failed to fetch from external API: https://desa-darmasaba-stg.wibudev.com
```

### Solusi:

1. **Cek external API accessible:**
   ```bash
   curl -I https://desa-darmasaba-stg.wibudev.com/api/landingpage/responden/findMany
   ```

2. **Cek CORS di external API**
   - Pastikan external API allow requests dari domain staging

3. **Fallback:**
   - Code sudah ada fallback ke local DB jika external API gagal

---

## 🔍 Diagnostic Commands

### Cek Logs Container
```bash
docker logs -f <container_name> --tail 100
```

### Cek Environment di Container
```bash
docker exec -it <container> env | grep -E "DATABASE|VITE|DESA"
```

### Cek Database Tables
```bash
docker exec -it <container> sh
bun x prisma db pull
bun x prisma migrate status
```

### Cek API Endpoints
```bash
# Health check
curl http://localhost:3000/api/docs

# Test endpoint
curl http://localhost:3000/api/noc/last-sync?idDesa=desa1
```

### Cek Build Output
```bash
# Saat build, pastikan VITE vars ter-set
docker build --progress=plain ... 2>&1 | grep -i vite
```

---

## 💡 Tips

1. **Selalu rebuild setelah perubahan:**
   ```bash
   ./scripts/deploy-staging.sh
   ```

2. **Gunakan script diagnostic:**
   ```bash
   ./scripts/check-db.sh
   ```

3. **Cek dokumentasi lengkap:**
   - `DEPLOYMENT.md` - Full deployment guide
   - `STAGING-README.md` - Quick start

4. **Generate secure secret:**
   ```bash
   openssl rand -base64 32
   ```

5. **Backup database sebelum deploy:**
   ```bash
   pg_dump -h <host> -U <user> <dbname> > backup_$(date +%Y%m%d).sql
   ```

---

## 📞 Butuh Bantuan?

Jika masih error setelah ikut checklist ini:

1. Collect logs:
   ```bash
   docker logs <container> > container-logs.txt
   ```

2. Screenshot browser console errors

3. Share env vars (hide sensitive data)

4. Cek `DEPLOYMENT.md` untuk detailed guide
