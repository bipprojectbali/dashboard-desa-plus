# Summary of Changes - May 22, 2026

## Overview
Mengganti seluruh hardcoded data di komponen `JennaAnalytic` dengan data live dari external API platform desa. Data diambil menggunakan bearer token authentication ke endpoint `/api/noc/jenna/analytics`.

## Key Changes

- **`src/components/jenna-analytic.tsx`**: Hapus semua hardcoded data (kpiData, chartData, topTopics, busyHours). Tambah `useState` + `useEffect` untuk fetch ke `/api/noc/jenna/analytics` dengan header `Authorization: Bearer`. Tambah tipe `JennaAnalyticsData` sesuai shape response API. Tampilkan `Loader` saat data loading. Semua nilai KPI, chart mingguan, topik, dan jam tersibuk kini dinamis dari API.
- **`.env.example`**: Tambah dua env var baru — `VITE_JENNA_API_URL` dan `VITE_JENNA_API_TOKEN` — sebagai placeholder untuk developer.
- **`.env.staging`**: Tambah nilai aktual `VITE_JENNA_API_URL=https://desa-platform-stg.wibudev.com` dan `VITE_JENNA_API_TOKEN` untuk environment staging.

## API Mapping

| Field API (`/api/noc/jenna/analytics`) | Komponen |
|---|---|
| `stats.interaksiHariIni` | KPI card 1 — nilai interaksi hari ini |
| `stats.changeFromYesterday` | KPI card 1 — subtitle perubahan dari kemarin |
| `stats.jawabanOtomatis` | KPI card 2 — persentase jawaban otomatis |
| `stats.belumDitindak` | KPI card 3 — jumlah belum ditindak |
| `stats.waktuRespon` | KPI card 4 — waktu respon rata-rata |
| `chartMingguan[].{day, count}` | Bar chart interaksi per hari |
| `topTopics[].{topic, count}` | Daftar topik pertanyaan terbanyak |
| `jamTersibuk[].{slot, pct}` | Progress bar jam tersibuk |

## Git Workflow
1. **Branch Created**: `feat/jenna-api-integration`
2. **Merge**: Merged into `stg` branch.

## Next Steps
- [ ] Deploy ke staging via `/deploy-stg` untuk verifikasi live di `https://dashboard-desa-plus-stg.wibudev.com`
