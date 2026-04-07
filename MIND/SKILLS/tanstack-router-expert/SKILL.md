# TanStack Router & React 19 Expert Skill

Specialized expertise for building type-safe, file-based React applications.

## Context
- **Frontend**: React 19
- **Routing**: TanStack Router (File-based)
- **UI**: Mantine UI + Radix UI
- **State**: Valtio

## Core Principles
1. **Strict Typing**: Leverage TanStack Router's full type safety for params, search, and routes.
2. **File Structure**: Follow the convention in `src/routes/` (e.g., `__root.tsx`, `index.tsx`).
3. **OpenAPI Fetch**: Use `apiClient` with generated types for all network requests.
4. **Component Architecture**: Keep components surgical and modular in `src/components/`.

## Code Patterns
### Route Definition
```typescript
export const Route = createFileRoute('/my-path')({
  component: () => <div>Hello</div>,
})
```

### Type-Safe API Fetch
```typescript
const { data } = await apiClient.GET("/api/my-endpoint", {
    params: { query: { id: "123" } }
});
```
