# System Health Monitoring — Summary

**Tanggal:** 2026-06-02  
**Branch:** feat/system-health  
**Status:** Selesai

---

## Apa yang Diimplementasikan

### 1. Ekspansi `GET /api/system/stats` (`src/api/system-stats.ts`)

Endpoint sebelumnya hanya mengembalikan metrik OS (CPU, memori, disk). Sekarang ditambahkan:

- **PostgreSQL connectivity check** — `prisma.$queryRaw\`SELECT 1\`` dengan pengukuran latency (ms).
- **Latency ke Desa API** — HEAD request ke `DESA_API_URL` dengan timeout 3 detik.
- **Latency ke NOC API** — HEAD request ke `NOC_API_URL` dengan timeout 3 detik.
- **Last sync timestamp** — query `SyncLog.findFirst()` order by `startedAt desc`.
- **Log ke ActivityLog** — jika ada komponen yang gagal (`db`, `desa-api`, `noc-api`), dibuat entri `ActivityLog` dengan `action: "health-check-failed"` dan detail JSON berisi array komponen yang gagal. Skip jika DB sendiri yang down (untuk hindari cascading error).
- `apiMiddleware` ditambahkan ke plugin agar `user` context tersedia untuk logging.

Response shape tambahan:
```json
{
  "data": {
    "db": { "ok": true, "latencyMs": 4 },
    "desaApi": { "ok": true, "latencyMs": 142 },
    "nocApi": { "ok": false, "latencyMs": null },
    "lastSync": { "type": "noc", "status": "success", "startedAt": "2026-06-02T..." }
  }
}
```

---

### 2. Halaman `/admin/system-health` (`src/routes/admin/system-health.tsx`)

Halaman admin baru dengan:

- **4 status card** — PostgreSQL, Desa API, NOC API, Last Sync — menampilkan badge Online/Offline + latency (ms) berwarna (hijau < 200ms, orange < 800ms, merah ≥ 800ms).
- **Auto-refresh 30 detik** — `setInterval` di `useEffect`, dibersihkan saat unmount.
- **Tombol refresh manual** — `ActionIcon` dengan `IconRefresh`.
- **History latency mini-chart** — `AreaChart` dari `@mantine/charts` dengan maksimum 20 titik data. Menampilkan 3 series: DB, Desa API, NOC API. Chart muncul setelah minimal 2 data point terkumpul.
- Timestamp "diperbarui" ditampilkan di header.

---

### 3. Nav item di Admin Layout (`src/routes/admin/route.tsx`)

Ditambahkan nav item **"System Health"** dengan ikon `IconActivity` dari `@tabler/icons-react`, ditempatkan di antara "Role & Permission" dan "Pengaturan".

---

## File yang Diubah

| File | Perubahan |
|---|---|
| `src/api/system-stats.ts` | Rewrite — tambah DB/API health checks, ActivityLog logging |
| `src/routes/admin/system-health.tsx` | **Baru** — halaman system health |
| `src/routes/admin/route.tsx` | Tambah nav item System Health |

---

## Keputusan Desain

- **Skip ActivityLog jika DB down** — agar tidak double-failure (DB down → gagal tulis log → exception).
- **HEAD request** untuk eksternal API — lebih ringan dari GET, tidak mendownload body.
- **Max 20 history points** — menjaga memori browser, ~10 menit history dengan refresh 30s.
- **`connectNulls: false`** pada chart — agar gap terlihat jelas saat ada timeout.
