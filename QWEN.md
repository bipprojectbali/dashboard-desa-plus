# Darmasaba Dashboard Noc - Project Context

## Project Overview

**Darmasaba Dashboard Noc** is a high-performance, full-stack React development template leveraging the **Bun** runtime. It features a unique "Single Port" architecture that combines a Bun/Elysia backend with a React frontend running on the same port (3000), eliminating CORS issues and proxy complexity.

### Key Technologies
- **Runtime**: Bun (Fast all-in-one JS runtime)
- **Backend**: ElysiaJS (Fast, type-safe web framework)
- **Frontend**: React 19 (UI Library)
- **Routing**: TanStack React Router (Type-safe routing)
- **UI Framework**: Mantine UI (Component library)
- **Authentication**: Better Auth (Complete auth solution)
- **Database**: Prisma ORM (Database toolkit)
- **Testing**: Bun Test & Playwright

### Architecture Highlights
- **Single Port Architecture**: Backend (Elysia) and Frontend (Vite Middleware) run on the same port (3000)
- **Contract-First API**: Strictly typed API using OpenAPI with automatic frontend type synchronization
- **PWA & TWA Support**: Ready for mobile with Service Workers, Web Manifest, and Android Trusted Web Activity verification
- **React Dev Inspector**: Alt/Option + Click to jump directly to source code in VS Code

## Project Structure

```
├── __tests__/           # Consolidated test suite (API & E2E)
├── generated/           # Auto-generated API types and Prisma client
├── prisma/              # Database schema and migrations
├── scripts/             # Internal automation scripts
└── src/
    ├── api/             # Elysia backend route modules
    ├── middleware/      # Backend & Frontend middlewares
    ├── routes/          # TanStack file-based frontend routes
    ├── store/           # Global state (Valtio)
    ├── utils/           # Shared utilities (DB, Env, API Client)
    ├── frontend.tsx     # React client entry point
    └── index.ts         # Unified server entry point
```

## Building and Running

### Prerequisites
Install [Bun](https://bun.sh/) if you haven't already.

### Installation
```bash
bun install
```

### Setup Environment
```bash
cp .env.example .env
# Fill in your DATABASE_URL and BETTER_AUTH_SECRET
# Optional: Set ADMIN_EMAIL and ADMIN_PASSWORD for admin user
```

### Database Initialization
```bash
bun x prisma migrate dev
bun run seed
```

### Start Development
```bash
bun run dev
```
- **App**: `http://localhost:3000`
- **API Docs**: `http://localhost:3000/api/docs` (Swagger)

## Testing Commands

- **Unit/Integration (API)**: `bun run test`
- **End-to-End (Browser)**: `bun run test:e2e`
- **Visual Dashboard**: `bun run test:ui`

## Development Guidelines

- **API Workflow**:
  1. Define schema in `src/api/*.ts`.
  2. Run `bun run gen:api` (or just start `dev` mode).
  3. Use `apiClient` in the frontend with full type safety.
- **Styling**: Prefer Mantine components and Style Props.
- **Code Quality**: Code is automatically formatted on save if you have the Biome extension. Manual: `bun run check`.

## Key Configuration Files

- **biome.json**: Code formatting and linting rules (uses tabs, double quotes)
- **tailwind.config.js**: Tailwind CSS configuration with custom Darmasaba color palette
- **tsconfig.json**: TypeScript configuration with path aliases (`@/*` maps to `./src/*`)
- **package.json**: Contains all scripts and dependencies
- **playwright.config.ts**: End-to-end testing configuration

## Notable Features

1. **Hot Module Replacement**: The application supports HMR for rapid development
2. **Type Safety**: Full type safety between frontend and backend through contract-first API design
3. **Authentication**: Built-in authentication using Better Auth
4. **Dark/Light Theme**: Automatic theme switching with Mantine UI
5. **Responsive Design**: Mobile-first responsive design using Tailwind CSS and Mantine
6. **Performance Optimized**: Optimized for production with proper bundling and minification

## Development Scripts

- `dev`: Starts the development server with HMR
- `lint`: Runs Biome linter
- `check`: Runs Biome checker with auto-fix
- `format`: Formats code using Biome
- `gen:api`: Generates API types from schema
- `test`: Runs unit/integration tests
- `test:ui`: Runs tests with UI
- `test:e2e`: Runs end-to-end tests
- `build`: Builds the application for production
- `start`: Starts the production server
- `seed`: Seeds the database with admin and demo users

## Default Users (after running `bun run seed`)

- **Admin**: `ADMIN_EMAIL` (from env) / `ADMIN_PASSWORD` (default: `admin123`)
- **Demo Users**:
  - `demo1@example.com` / `demo123` (role: user)
  - `demo2@example.com` / `demo123` (role: user)
  - `moderator@example.com` / `demo123` (role: moderator)

## Git & Deployment Workflow

### Workflow for Code Changes
1. **Commit** existing changes before starting new work
2. **Create plan** at `MIND/PLAN/[plan-name].md`
3. **Create task** at `MIND/PLAN/[task-name].md`
4. **Execute the task** and update task progress
5. **Create summary** at `MIND/SUMMARY/[summary-name].md` when done
6. **Run build** (`bun run build`) to ensure no compile errors
7. **Fix any build errors** if they occur
8. **Commit** all changes AFTER successful build
9. **Update version** in `package.json` for every change
10. **Push** to new branch with format: `tasks/[task-name]/[what-is-being-done]/[date-time]`
11. **Merge** to `stg` branch after completion

### GitHub Workflows
- **publish.yml**: Uses branch `main`, stack env and image tag matching version from `package.json`
- **re-pull.yml**: Uses branch `main`, stack env and stack name `dashboard-desa-plus`

### After Progress
- Always give option to continue to GitHub workflows or not