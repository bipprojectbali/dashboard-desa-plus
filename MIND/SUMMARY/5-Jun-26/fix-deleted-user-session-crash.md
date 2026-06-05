# Fix: Deleted User Session — Graceful Fallback

**Tanggal:** 5 Juni 2026  
**Branch:** `fix/deleted-user-session-handling`  
**Merged ke:** `stg`

---

## Masalah

Jika akun pengguna dihapus dari database namun sesi login masih aktif (cookie cache valid hingga 30 hari), aplikasi sebelumnya tidak menangani kondisi ini — permintaan ke API dan navigasi frontend bisa crash atau mengembalikan error tak terduga karena data user sudah tidak ada di DB.

---

## Akar Masalah

`betterAuth` dikonfigurasi dengan `cookieCache.maxAge: 30 hari` di `src/utils/auth.ts`. Ini berarti session dikembalikan dari cache cookie tanpa query ke DB, sehingga user yang sudah dihapus tetap dianggap aktif oleh `auth.api.getSession()`.

---

## Perubahan

### 1. `src/api/index.tsx`
- Tambah import `prisma` dari `../utils/db`
- Endpoint `GET /api/session`: setelah `auth.api.getSession()`, validasi apakah `user.id` masih ada di DB
- Jika user tidak ditemukan → return `{ data: null }` sehingga frontend memperlakukan sesi sebagai tidak valid

**Before:**
```ts
const data = await auth.api.getSession({ headers: request.headers });
return { data };
```

**After:**
```ts
const data = await auth.api.getSession({ headers: request.headers });
if (data?.user?.id) {
    const userExists = await prisma.user.findUnique({
        where: { id: data.user.id },
        select: { id: true },
    });
    if (!userExists) return { data: null };
}
return { data };
```

### 2. `src/middleware/apiMiddleware.tsx`
- Setelah `auth.api.getSession()` mengembalikan session user, tambah DB check
- Jika user tidak ditemukan di DB → return `{ user: null }` → middleware mengembalikan `401 Unauthorized`

**Before:**
```ts
if (userSession?.user) {
    // Return user data from session if authenticated via session
    return { user: { ...userSession.user, ... } };
}
```

**After:**
```ts
if (userSession?.user) {
    const userExists = await prisma.user.findUnique({
        where: { id: userSession.user.id },
        select: { id: true },
    });
    if (!userExists) return { user: null };

    return { user: { ...userSession.user, ... } };
}
```

---

## Alur Setelah Fix

```
User dihapus admin
    ↓
User akses halaman → frontend fetch /api/session
    ↓
Backend: getSession() → dapat session dari cookie cache
    ↓
Backend: prisma.user.findUnique() → tidak ditemukan
    ↓
Return { data: null }
    ↓
Frontend: session null → authMiddleware redirect ke /signin
    ↓
Tampilan login (default), bukan crash/error
```

---

## Layer Perlindungan

| Layer | File | Behavior |
|---|---|---|
| `/api/session` endpoint | `src/api/index.tsx` | Return `null` → frontend redirect ke login |
| API middleware | `src/middleware/apiMiddleware.tsx` | Return `user: null` → 401 Unauthorized |

Dua layer ini memastikan user yang sudah dihapus tidak bisa mengakses UI maupun API, meskipun cookie sesi mereka belum expired.
