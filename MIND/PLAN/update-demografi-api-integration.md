# Plan: Update Demografi Pekerjaan API Integration

## Overview
Update the Demografi Pekerjaan component to fetch data from external Desa API endpoints instead of the current internal API. This will provide real demographic data from the village system.

## Current State
- Component uses internal API endpoints:
  - `/api/resident/stats`
  - `/api/resident/banjar-stats`
  - `/api/resident/demographics`
- Currently has mock data fallbacks when API returns no data

## Target State
- Component will fetch from external Desa API endpoints:
  - `/api/kesehatan/kematian/findMany` - Death/mortality data
  - `/api/kesehatan/kelahiran/findMany` - Birth data
  - `/api/kependudukan/distribusi-umur` - Age distribution data
  - `/api/ekonomi/demografi-pekerjaan` - Occupation/demographics data
  - `/api/kependudukan/migrasi-penduduk` - Migration data (in/out)
  - `/api/kependudukan/distribusi-agama` - Religion distribution data
  - `/api/kependudukan/data-banjar` - Banjar/village data
  - `/api/ekonomi/sektor-unggulan-desa` - Village sector data
  - `/api/kependudukan/dashboard/summary` - Dashboard summary/stats

## API Pattern
Based on existing implementation in `satisfaction-chart.tsx`, the external API follows this pattern:
- Base URL: `https://desa-darmasaba-stg.wibudev.com` (staging) or `https://darmasaba.desa.id` (production)
- Response format: `{ success: boolean, data: [...] }`
- Uses `VITE_DESA_API_URL` environment variable
- Direct fetch() calls (not using apiClient)

## Implementation Strategy
1. Create TypeScript interfaces for each API response
2. Replace current API calls with external API fetch calls
3. Map external API data to component state format
4. Keep mock data as fallback for error cases
5. Update KPI cards and dynamic stats with real data
6. Add sektor unggulan section with real data

## Data Mapping

### Dashboard Summary → KPI Cards
- `total` → Total Penduduk
- `heads` → Kepala Keluarga  
- `poor` → Kemiskinan

### Birth API → Kelahiran KPI
- Count records from `/api/kesehatan/kelahiran/findMany`

### Death API → Kematian Dynamic Stat
- Count records from `/api/kesehatan/kematian/findMany`

### Age Distribution → Age Chart
- Map to `{ ageRange, total }` format

### Occupation Data → Job Chart
- Map to `{ job, total }` format

### Religion Distribution → Religion Pie Chart
- Map to `{ name, value, color }` format

### Migration Data → Dynamic Stats (Pindah Masuk/Keluar)
- Separate迁入 and 迁出 counts

### Banjar Data → Banjar Table
- Map to `{ id, name, totalPopulation, totalKK, totalPoor }`

### Sector Unggulan → Sector Chart
- Map to `{ sektor, value }` format

## Files to Modify
- `src/components/demografi-pekerjaan.tsx`

## Testing
- Verify component loads with real data
- Test fallback to mock data when API fails
- Ensure all charts render correctly
- Verify data formatting and display
