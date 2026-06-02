# feat: in-memory cache dengan TTL

**Branch:** `feat/in-memory-cache`  
**Tanggal:** 2026-06-02  
**Status:** Selesai

---

## Ringkasan

Implementasi sistem cache in-memory sederhana menggunakan `Map` dengan TTL (time-to-live) per key. Cache diterapkan pada endpoint yang melakukan fetch ke external API maupun query DB yang bersifat read-heavy.

---

## File yang Dibuat / Diubah

| File | Perubahan |
|---|---|
| `src/utils/cache.ts` | **BARU** — `InMemoryCache` class, `cache` singleton, konstanta `TTL`, wrapper `withCache()` |
| `src/api/demografi.ts` | Migrasi dari `demografiCache` ad-hoc ke `withCache` — TTL 6 jam per key |
| `src/api/noc.ts` | Ganti `demografiCache.data.apbdes` → `cache.get("apbdes:cmk-apbdes-001")` |
| `src/api/umkm.ts` | Cache `GET /umkm/lokal/stats` — TTL 1 jam; invalidasi cache pada POST/PUT/DELETE |
| `src/api/keamanan.ts` | Cache `GET /keamanan/laporan-lokal/stats` — TTL 30 menit; invalidasi pada POST/PATCH |
| `src/api/admin.ts` | Tambah `GET /api/admin/cache/stats` dan `DELETE /api/admin/cache/flush` |
| `.env.example` | Tambah `CACHE_ENABLED=true` |

---

## Desain Cache (`src/utils/cache.ts`)

```typescript
class InMemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  set<T>(key, value, ttlMs)  // Simpan dengan expiry
  get<T>(key): T | undefined  // Ambil; undefined = miss atau expired
  delete(key)                 // Hapus satu key (dipakai saat mutasi)
  flush(): number             // Hapus semua, return jumlah yang dihapus
  stats()                     // { size, entries[] } untuk admin endpoint
}

export const cache = new InMemoryCache();
```

`withCache(key, ttlMs, fn)`:
- Cek `CACHE_ENABLED` env (default: enabled, set `"false"` untuk disable)
- Cache hit → return langsung tanpa memanggil `fn`
- Cache miss → jalankan `fn`, simpan hasilnya jika non-null, return result

---

## TTL per Kategori

| Kategori | TTL | Key prefix |
|---|---|---|
| Demografi (external API) | 6 jam | `demografi:*` |
| APBDes (external API) | 1 jam | `apbdes:*` |
| UMKM stats (DB lokal) | 1 jam | `umkm:stats` |
| Keamanan stats (DB lokal) | 30 menit | `keamanan:stats` |

---

## Admin Endpoints Baru

| Method | Path | Deskripsi |
|---|---|---|
| `GET` | `/api/admin/cache/stats` | Lihat semua key + TTL sisa |
| `DELETE` | `/api/admin/cache/flush` | Hapus semua cache, return jumlah yang dihapus |

Keduanya memerlukan `user.role === "admin"`.

---

## Perubahan Arsitektur: Demografi

Sebelumnya, `demografi.ts` mengekspor `demografiCache` (object biasa tanpa TTL) yang diimport oleh `noc.ts`. Kini:
- `demografiCache` dihapus
- Setiap GET endpoint menggunakan `withCache("demografi:xxx", TTL.DEMOGRAFI, fn)`
- Endpoint `/sync` mengisi cache secara manual via `cache.set(...)` setelah fetch
- `noc.ts` mengimport `cache` langsung dari `utils/cache` dan memeriksa `cache.get("apbdes:cmk-apbdes-001")`
- `lastSyncedAt` tetap dilacak sebagai variabel module di `demografi.ts`
