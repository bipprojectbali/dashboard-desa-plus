# Prisma & Database Optimization Skill

Specialized expertise for type-safe database access using Prisma ORM.

## Context
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Client**: Generated in `generated/prisma`
- **Migration Strategy**: Bun-based migration

## Core Principles
1. **Schema Design**: Use descriptive field names, proper relations, and indexing (`@@index`) for performance.
2. **Type Safety**: Use types from the generated client for all database operations.
3. **Transaction Safety**: Use `$transaction` for multiple related write operations.
4. **Clean Upsert**: Always use `upsert` when syncing external data (like NOC) to avoid duplicates.

## Code Patterns
### Efficient Query
```typescript
const data = await prisma.division.findMany({
    include: { _count: { select: { activities: true } } }
});
```

### Indexing for Sync
Ensure `externalId` and `villageId` are indexed to speed up synchronization lookups.
