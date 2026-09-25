# GEMINI.md

This project is **darmasaba-dashboard-noc**, a high-performance, full-stack React development template leveraging the Bun runtime. It is designed for a seamless developer experience with a unified "single-port" architecture and a Contract-First API design.

## Project Overview

*   **Runtime**: [Bun](https://bun.sh/)
*   **Architecture**: "Single Port" (default: 3000). [ElysiaJS](https://elysiajs.com/) serves as the main HTTP server. During development, it integrates [Vite](https://vitejs.dev/) in **middleware mode** for HMR and React Dev Inspector support. In production, `@elysiajs/static` is used to efficiently serve pre-built frontend assets.
*   **API Design**: **Contract-First (OpenAPI)**. The frontend uses `openapi-fetch` with types generated from the backend's OpenAPI schema, ensuring a decoupled but type-safe connection.
*   **Mobile Readiness**: **PWA (Progressive Web App)** & **TWA (Trusted Web Activity)**. Built-in support for offline caching and Android app packaging.
*   **Frontend**: React 19 with [TanStack React Router](https://tanstack.com/router/latest) for type-safe, file-based routing.
*   **UI Framework**: [Mantine UI](https://mantine.dev/) for a comprehensive component library and hooks.
*   **UI Primitives**: [Radix UI](https://www.radix-ui.com/) for unstyled, accessible UI components (primitives).
*   **Authentication**: [Better Auth](https://www.better-auth.com/) integrated with Elysia.
*   **Database**: [Prisma ORM](https://www.prisma.io/) for type-safe database access.
*   **Tooling**: [Biome](https://biomejs.dev/) for ultra-fast linting and formatting.

## Building and Running

### Development
*   **Install dependencies**: `bun install`
*   **Start development server**: `bun run dev` (Runs Elysia + Vite Middleware)
*   **Update Route Tree**: `bun x tsr generate` (usually automatic via Vite plugin)
*   **Generate API Types**: `bun run gen:api` (Syncs frontend types with backend schema)
*   **Database Migration**: `bun x prisma migrate dev`

### Production
*   **Build Frontend**: `bun run build` (Outputs to `dist/`)
*   **Start Production Server**: `bun run start` (Serves pre-built assets from `dist/` via Elysia)

### Quality Control (Testing & Linting)
*   **All Tests**: `bun run test` (Runs Bun's native test runner for `tests/` — api/config/hooks/theme)
*   **API Tests Only**: `bun run test:api` (`tests/api/`)
*   **Watch Mode**: `bun run test:watch`
*   **Lint**: `bun run lint` (Biome check)
*   **Format**: `bun run format` (Biome write)
*   **Type Check**: `bun x tsc --noEmit`
*   **Full Gate**: `bun run verify` (lint + all tests — run this after finishing a feature)

## Testing Architecture

The project consolidates testing in the `tests/` directory (Bun's native test runner, `bunfig.toml` preloads `tests/setup/dom.ts` for a happy-dom shim so libs touching `window` at import time don't crash):

1.  **API Testing (`tests/api/`)**: Covers unit tests for utilities, database integration, and Elysia API endpoint verification using `api.handle()`. Routes behind `apiMiddleware` are deterministically testable without a live DB — an unauthenticated request is rejected in `onBeforeHandle` before the handler touches Prisma.
2.  **Other (`tests/config/`, `tests/hooks/`, `tests/theme/`)**: Unit tests for config, hooks, and theme utilities.

## Development Conventions

### Code Style & Structure
*   **Formatting**: Strictly use **Biome**. The project uses **tab indentation** and **double quotes** for JavaScript/TypeScript.
*   **Imports**: 
    *   Use the `node:` protocol for Node.js built-ins (e.g., `import fs from "node:fs"`).
    *   Use the `@/` alias for absolute paths from the `src/` directory.
*   **Routing**: Use TanStack Router's file-based system in `src/routes/`.

### API Workflow (Contract-First)
*   **Backend First**: Define schemas in Elysia routes (using `t.Object`, etc.).
*   **Sync**: Run `bun run gen:api` to export the OpenAPI `schema.json` and generate TypeScript types in `generated/api.ts`.
*   **Frontend Usage**: Use the `apiClient` from `@/utils/api-client`, which uses `openapi-fetch` for type-safe requests.

### Mobile & PWA
*   **Manifest**: Metadata is located in `src/manifest.json`.
*   **Service Worker**: Offline logic is in `src/sw.js`. It uses a "Cache First" strategy.
*   **TWA Verification**: The Android ownership file is at `src/.well-known/assetlinks.json`.
*   **Server Logic**: In production, `@elysiajs/static` handles serving static assets, including PWA/TWA files, ensuring proper caching headers.

### Backend/API
*   **Prefix**: All backend API routes are prefixed with `/api`.
*   **Documentation**: Swagger/OpenAPI documentation is available at `/api/docs` in development.
*   **Authentication**: Handled at `/api/auth/*`. Protected routes use the `apiMiddleware`.

### Frontend
*   **Theme**: Mantine is configured via `MantineProvider` in `src/frontend.tsx`.
*   **Modals**: Use the imperative `modals` manager from `@mantine/modals`.
*   **State Management**: [Valtio](https://valtio.pmnd.rs/) is used for simple proxy-based state (see `src/store/`).

## Project Layout

*   `src/index.ts`: Unified server entry point (Dev/Prod conditional logic).
*   `src/vite.ts`: Vite server configuration (Dev-only).
*   `src/api/`: Elysia route modules and schema definitions.
*   `src/routes/`: Frontend route definitions and layouts.
*   `src/utils/`: Shared utilities (Auth, DB, Env, API Client).
*   `src/sw.js`: PWA Service Worker.
*   `src/manifest.json`: PWA Manifest.
*   `src/.well-known/`: TWA verification assets.
*   `scripts/`: Automation scripts (e.g., `generate-schema.ts`).
*   `generated/`: Auto-generated artifacts (OpenAPI schema and types).
*   `tests/`: Centralized testing directory (`api/`, `config/`, `hooks/`, `theme/`, `setup/`).
*   `prisma/`: Database schema and migrations.
*   `dist/`: Production build output.

## Git & Deployment Workflow

### Workflow for Code Changes
1.  **Commit** existing changes before starting new work
2.  **Create plan** at `MIND/PLAN/[plan-name].md`
3.  **Create task** at `MIND/PLAN/[task-name].md`
4.  **Execute the task** and update task progress
5.  **Create summary** at `MIND/SUMMARY/[summary-name].md` when done
6.  **Run build** (`bun run build`) to ensure no compile errors
7.  **Fix any build errors** if they occur
8.  **Commit** all changes AFTER successful build
9.  **Update version** in `package.json` for every change
10. **Push** to new branch with format: `tasks/[task-name]/[what-is-being-done]/[date-time]`
11. **Merge** to `stg` branch after completion

### GitHub Workflows
1.  **publish.yml**: Uses branch `main`, stack env and image tag matching version from `package.json`.
2.  **re-pull.yml**: **Wait for `publish.yml` to complete successfully before running.** Uses branch `main`, stack env and stack name `dashboard-desa-plus`.

### After Progress
-   Always give option to continue to GitHub workflows or not