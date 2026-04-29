# 🚀 Quick Start - Staging Deployment

## Masalah yang Sering Terjadi

Jika di staging muncul error seperti:
- `500 Internal Server Error` di semua API endpoints
- `Cannot read properties of undefined (reading 'VITE_DESA_API_URL')`
- Database connection errors

## ✅ Solusi Cepat (3 Langkah)

### Langkah 1: Set Environment Variables di Portainer

Di Portainer, buka Stack/Container → **Env** tab, tambahkan:

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname?schema=public
BETTER_AUTH_SECRET=random-secret-minimal-32-characters-here
VITE_DESA_API_URL=https://desa-darmasaba-stg.wibudev.com
DESA_API_URL=https://desa-darmasaba-stg.wibudev.com
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### Langkah 2: Rebuild Image

```bash
# Dari root project
./scripts/deploy-staging.sh
```

Atau manual:
```bash
docker build \
  --build-arg VITE_DESA_API_URL="https://desa-darmasaba-stg.wibudev.com" \
  --build-arg VITE_PUBLIC_URL="https://dashboard-desa-plus-stg.wibudev.com" \
  --build-arg DESA_API_URL="https://desa-darmasaba-stg.wibudev.com" \
  -t dashboard-desa-plus-staging:latest .
```

### Langkah 3: Setup Database

Di Portainer → Container → **Console** tab (atau `docker exec`):

```bash
# 1. Jalankan migrasi
bun x prisma migrate deploy

# 2. Seed database
bun run seed

# 3. Restart container
```

## 🎯 Setelah Berhasil

- Akses: `https://dashboard-desa-plus-stg.wibudev.com`
- Login dengan `ADMIN_EMAIL` dan `ADMIN_PASSWORD`
- Cek browser console, pastikan tidak ada error 500

## 📞 Masih Error?

Jalankan script diagnostic:
```bash
./scripts/check-db.sh
```

Atau lihat dokumentasi lengkap di `DEPLOYMENT.md`
