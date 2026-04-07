#!/bin/bash

# 🔍 Script untuk cek koneksi dan status database
# Usage: ./scripts/check-db.sh

set -e

echo "🔍 Checking database connection..."

# Load .env file jika ada
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set!"
    exit 1
fi

echo "📍 Database URL: $(echo $DATABASE_URL | sed 's/\/\/.*@/\/\/***@/')"

# Check if we're in a container or local
if command -v bun &> /dev/null; then
    echo "✅ Bun is available"
    
    # Check Prisma status
    echo ""
    echo "📊 Prisma Status:"
    bun x prisma status 2>&1 || echo "⚠️  Prisma status check failed"
    
    # Try to connect
    echo ""
    echo "🔌 Testing database connection..."
    bun x prisma db pull --force 2>&1 | head -20 || {
        echo "❌ Cannot connect to database!"
        echo ""
        echo "Possible issues:"
        echo "1. DATABASE_URL is incorrect"
        echo "2. Database server is not running"
        echo "3. Network/firewall issues"
        echo "4. Database doesn't exist"
        exit 1
    }
    
    # Check migrations
    echo ""
    echo "📋 Migration Status:"
    bun x prisma migrate status 2>&1 || echo "⚠️  Migration status check failed"
    
else
    echo "❌ Bun not available. Run this script inside the container or locally."
    exit 1
fi

echo ""
echo "✅ Database connection looks good!"
