# ElysiaJS Expert Skill (Bun Runtime)

Specialized expertise for developing high-performance backends using ElysiaJS and Bun.

## Context
- **Runtime**: Bun
- **Server**: ElysiaJS
- **Validation**: TypeBox (`t`)
- **API Design**: Contract-First (OpenAPI/Swagger)

## Core Principles
1. **Type Safety**: Always use `t.Object`, `t.Array`, etc., for request/response validation.
2. **Contract Consistency**: Ensure schema definitions match the generated `schema.json`.
3. **Async Performance**: Leverage Bun's native async capabilities (e.g., `Bun.file`, `Bun.password`).
4. **Hook Usage**: Utilize lifecycle hooks (`beforeHandle`, `onAfterHandle`) for cross-cutting concerns like auth or logging.

## Code Patterns
### Route Definition
```typescript
export const myRoute = new Elysia({ prefix: '/my-route' })
    .get('/', () => ({ success: true }), {
        response: t.Object({ success: t.Boolean() })
    });
```

### OpenAPI Documentation
Always provide `detail: { summary: "...", description: "..." }` for every route to ensure clear Swagger docs.
