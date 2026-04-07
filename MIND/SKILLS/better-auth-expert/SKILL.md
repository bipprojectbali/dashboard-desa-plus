# Better Auth & Security Expert Skill

Specialized expertise for integrating Better Auth with ElysiaJS and React.

## Context
- **Provider**: Better Auth
- **Database**: Prisma
- **Integration**: Elysia Middleware
- **Frontend**: Better Auth Client

## Core Principles
1. **Middleware First**: Use `apiMiddleware.tsx` to protect backend routes.
2. **Session Persistence**: Ensure sessions are correctly handled via cookies in both Dev and Prod.
3. **Schema Sync**: Keep Prisma models (`User`, `Account`, `Session`) in sync with Better Auth requirements.
4. **Environment Isolation**: Always use `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` from `.env`.

## Code Patterns
### Protected Route (Elysia)
```typescript
.get("/protected", async ({ user }) => {
    if (!user) throw new Error("Unauthorized");
    return { data: "secret" };
})
```

### Client Usage (React)
```typescript
import { authClient } from "@/utils/auth-client";
const { data: session } = await authClient.useSession();
```
