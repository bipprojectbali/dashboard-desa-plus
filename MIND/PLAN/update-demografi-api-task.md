# Task: Update Demografi Pekerjaan API Integration

## Status: Not Started
## Created: 2026-04-14

## Objective
Replace internal API calls in Demografi Pekerjaan component with external Desa API endpoints to display real demographic data.

## Steps

### 1. Define TypeScript Interfaces
- [ ] Create interfaces for all external API responses
- [ ] Map to existing component data formats

### 2. Update Data Fetching
- [ ] Replace `/api/resident/stats` with `/api/kependudukan/dashboard/summary`
- [ ] Replace `/api/resident/banjar-stats` with `/api/kependudukan/data-banjar`
- [ ] Replace `/api/resident/demographics` with multiple endpoints:
  - `/api/kependudukan/distribusi-umur`
  - `/api/ekonomi/demografi-pekerjaan`
  - `/api/kependudukan/distribusi-agama`
- [ ] Add new fetches for:
  - `/api/kesehatan/kelahiran/findMany` (births)
  - `/api/kesehatan/kematian/findMany` (deaths)
  - `/api/kependudukan/migrasi-penduduk` (migration)
  - `/api/ekonomi/sektor-unggulan-desa` (sectors)

### 3. Map Data to Component State
- [ ] Map dashboard summary to stats (total, heads, poor)
- [ ] Map birth API to kelahiran count
- [ ] Map death API to kematian count
- [ ] Map migration to pindah masuk/keluar
- [ ] Map age distribution to ageData
- [ ] Map occupation data to jobData
- [ ] Map religion distribution to religionData (with colors)
- [ ] Map banjar data to banjarData
- [ ] Map sector data to sektorUnggulanData

### 4. Update Component Display
- [ ] Update KPI cards with real data
- [ ] Update dynamic stats with real counts
- [ ] Ensure all charts display correctly
- [ ] Verify banjar table formatting

### 5. Error Handling & Fallback
- [ ] Keep mock data as fallback
- [ ] Add console logging for debugging
- [ ] Handle API errors gracefully

## Notes
- Use same pattern as satisfaction-chart.tsx (direct fetch with VITE_DESA_API_URL)
- Response format: `{ success: true, data: [...] }`
- Maintain existing UI/UX - only data source changes
