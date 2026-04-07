#!/bin/bash

# 🚀 Script untuk build dan deploy ke staging
# Usage: ./scripts/deploy-staging.sh

set -e

echo "🚀 Starting staging deployment..."

# Load .env file jika ada
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Default values jika tidak ada di .env
DATABASE_URL=${DATABASE_URL:-"postgresql://user:password@localhost:5432/dashboard_desa?schema=public"}
BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET:-"$(openssl rand -base64 32)"}
VITE_DESA_API_URL=${VITE_DESA_API_URL:-"https://desa-darmasaba-stg.wibudev.com"}
VITE_PUBLIC_URL=${VITE_PUBLIC_URL:-"https://dashboard-desa-plus-stg.wibudev.com"}
NOC_API_URL=${NOC_API_URL:-"https://darmasaba.muku.id/api/noc/docs/json"}
DESA_API_URL=${DESA_API_URL:-"https://desa-darmasaba-stg.wibudev.com"}

echo "📦 Building Docker image with build args..."

docker build \
  --build-arg DATABASE_URL="$DATABASE_URL" \
  --build-arg BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET" \
  --build-arg VITE_DESA_API_URL="$VITE_DESA_API_URL" \
  --build-arg VITE_PUBLIC_URL="$VITE_PUBLIC_URL" \
  --build-arg NOC_API_URL="$NOC_API_URL" \
  --build-arg DESA_API_URL="$DESA_API_URL" \
  -t dashboard-desa-plus-staging:latest .

echo "✅ Docker image built successfully!"

echo ""
echo "📋 Next steps:"
echo "1. Deploy image ke Portainer"
echo "2. Set environment variables di Portainer:"
echo "   - DATABASE_URL=$DATABASE_URL"
echo "   - BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET"
echo "   - VITE_DESA_API_URL=$VITE_DESA_API_URL"
echo "   - DESA_API_URL=$DESA_API_URL"
echo "   - ADMIN_EMAIL=<your-admin-email>"
echo "   - ADMIN_PASSWORD=<your-admin-password>"
echo ""
echo "3. Jalankan di container shell:"
echo "   bun x prisma migrate deploy"
echo "   bun run seed"
echo ""
echo "4. Akses: https://dashboard-desa-plus-stg.wibudev.com"
