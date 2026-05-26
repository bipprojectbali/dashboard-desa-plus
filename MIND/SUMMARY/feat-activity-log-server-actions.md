# Feat: ActivityLog untuk 6 Server-Side Actions

## Perubahan

### `src/api/admin.ts`
- `POST /admin/users/update-role`: tambah `prisma.activityLog.create()` setelah update berhasil. Fetch `oldRole` terlebih dahulu dengan `findUnique` sebelum update agar bisa dicatat di detail.
- `POST /admin/users/delete`: tambah `prisma.activityLog.create()` setelah delete berhasil.

### `src/api/apikey.ts`
- `POST /apikey/` (create): tambah `prisma.activityLog.create()` setelah API key dibuat.
- `POST /apikey/delete`: tambah `prisma.activityLog.create()` setelah API key dihapus. `apiKey.name` dicatat dari record yang di-fetch sebelum delete.

### `src/api/noc.ts`
- `POST /noc/sync`: tambah `prisma.activityLog.create()` setelah sync script berhasil.

### `src/api/demografi.ts`
- Tambah `import { prisma } from "@/utils/db"`
- `POST /demografi/sync`: tambah parameter `{ request }` ke handler, tambah `prisma.activityLog.create()` setelah data di-cache. `userId` menggunakan `"system"` karena endpoint ini tidak memiliki auth middleware.

## Format Log

Semua log menggunakan pola yang sama:
```ts
await prisma.activityLog.create({
  data: {
    userId: user.id,           // atau "system" untuk demografi sync
    action: "<action-string>", // lihat tabel di bawah
    detail: JSON.stringify({ ...metadata }),
    ipAddress: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? null,
    userAgent: request.headers.get("user-agent") ?? null,
  },
});
```

| Aksi | `action` string | Isi `detail` (JSON string) |
|---|---|---|
| Update role | `update-role` | `{ targetId, oldRole, newRole }` |
| Delete user | `delete-user` | `{ targetId }` |
| Create API key | `create-api-key` | `{ apiKeyId, name }` |
| Delete API key | `delete-api-key` | `{ apiKeyId, name }` |
| NOC sync | `noc-sync` | `{ success: true }` |
| Demografi sync | `demografi-sync` | `{ errors: string[] \| null }` |

## Catatan

- `ActivityLog.userId` tidak memiliki `@relation` di Prisma schema (plain `String`), sehingga nilai `"system"` aman digunakan untuk demografi sync.
- `detail` adalah `String?` di schema (bukan `Json?`), sehingga metadata di-serialize dengan `JSON.stringify()`.
- Log hanya ditambahkan di success path. Error path tidak di-log untuk menghindari noise dan menjaga error handling tetap bersih.

## File Terdampak

- `src/api/admin.ts`
- `src/api/apikey.ts`
- `src/api/noc.ts`
- `src/api/demografi.ts`
