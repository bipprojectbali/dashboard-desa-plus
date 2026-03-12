# Stage 1: Build
FROM oven/bun:1.3 AS build

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Use .env.example as default env for build
RUN cp .env.example .env

# Generate Prisma client
RUN bun x prisma generate

# Generate API types
RUN bun run gen:api

# Build the application frontend using our custom build script
RUN bun run build

# Stage 2: Runtime
FROM oven/bun:1.3-slim AS runtime

# Set environment variables
ENV NODE_ENV=production

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy necessary files from build stage
COPY --from=build /app/package.json ./
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/generated ./generated
COPY --from=build /app/src ./src
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma

# Expose the port
EXPOSE 3000

# Start the application
CMD ["bun", "start"]
