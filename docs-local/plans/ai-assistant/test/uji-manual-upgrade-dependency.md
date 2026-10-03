# Uji manual — Upgrade dependency (better-auth 1.7.7, TanStack Router 1.170, Elysia/Vite patch)

> Branch bertumpuk dari `ai_pointer`: `chore/upgrade-better-auth` → `chore/upgrade-tanstack-router` → `chore/upgrade-elysia-vite`
> (uji di yang teratas). Audit: 122 (4 critical/70 high) → 102 (2/57). Celah *account takeover via OAuth auto-link*
> (GHSA-g38m-r43w-p2q7) tertutup + dikunci test `tests/db/oauth-account-linking.test.ts`. Setelah merge: `bun install`,
> restart `bun run dev`. Isi **Hasil** dengan ✅ / ❌.

| # | Langkah | Yang seharusnya terlihat | Hasil |
|---|---|---|---|
| 1 | Login email + password admin | Dashboard terbuka | |
| 2 | Daftar user baru (email) | 403 "Akun menunggu verifikasi admin"; setelah admin verifikasi → bisa akses | |
| 3 | Login GitHub & Google dengan akun baru | Menunggu verifikasi admin | |
| 4 | Daftar email X (belum diverifikasi), lalu login GitHub/Google dengan email X | **Ditolak** (`error=account_not_linked`), tidak ada akun tertaut | |
| 5 | Logout | Kembali ke `/signin`; halaman terlindungi menolak | |
| 6 | Sesi kedaluwarsa (ubah `expiresAt` di DB) | Request berikutnya diarahkan ke signin | |
| 7 | Navigasi semua menu sidebar, `/wall`, back/forward browser | Normal; devtools router tampil di dev | |
| 8 | `/api/docs` (dev) | Swagger terbuka | |
| 9 | Fitur AI: chat, penunjuk, panduan, halaman uji suara | Tidak ada regresi | |

## Catatan hasil uji

| Tanggal | Penguji | Langkah ❌ | Catatan / screenshot |
|---|---|---|---|
| | | | |
