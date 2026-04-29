# ============================================================
# Stage 1: Build
# Hanya VITE_* yang perlu di build-time (di-bundle ke frontend)
# Semua secrets/credentials diinject saat runtime
# ============================================================
FROM oven/bun:1.3 AS build

# Hanya VITE_* yang butuh ARG/ENV di build stage
# karena Vite mem-bundle nilai ini ke dalam static JS
ARG VITE_DESA_API_URL="http://localhost:3000"
ARG VITE_PUBLIC_URL="http://localhost:3000"

ENV VITE_DESA_API_URL=$VITE_DESA_API_URL
ENV VITE_PUBLIC_URL=$VITE_PUBLIC_URL
ENV NODE_ENV=production

# Dummy DATABASE_URL khusus untuk prisma generate
# prisma.config.ts memvalidasi env var ini saat load,
# tapi tidak ada koneksi aktif yang dibuat saat generate
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"

# Install build dependencies untuk native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files lebih dulu untuk memanfaatkan Docker layer cache
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client (hanya butuh schema.prisma, tidak butuh DATABASE_URL aktif)
RUN bun x prisma generate

# Generate API types (opsional)
RUN bun run gen:api || echo "tidak ada gen api"

# Build frontend
RUN bun run build


# ============================================================
# Stage 2: Runtime
# Semua credentials (DATABASE_URL, BETTER_AUTH_SECRET, dll)
# diinject dari luar: Portainer / docker-compose env_file
# JANGAN hardcode secrets di sini
# ============================================================
FROM oven/bun:1.3-slim AS runtime

ENV NODE_ENV=production
# DATABASE_URL, BETTER_AUTH_SECRET, NOC_API_URL, DESA_API_URL
# → tidak di-set di sini, diinject via Portainer atau .env file

RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/package.json ./
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/generated ./generated
COPY --from=build /app/src ./src
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/scripts ./scripts

EXPOSE 3000

CMD ["bun", "start"]