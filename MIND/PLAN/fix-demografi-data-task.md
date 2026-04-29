# Task: Fix Demografi Data Display & Add Sync

## Status: Not Started
## Created: 2026-04-14

## Objective
Fix demografi-pekerjaan data display by creating internal API proxy endpoints and adding sync functionality to sinkronisasi component.

## Steps

### 1. Create Internal API Endpoints (src/api/demografi.ts)
- [ ] Create Elysia routes for all demografi endpoints
- [ ] Add GET endpoints for each data type (summary, banjar, age, occupation, religion, births, deaths, migration, sectors)
- [ ] Add POST /api/demografi/sync endpoint
- [ ] Use desaExternalClient to fetch from external API
- [ ] Cache responses to avoid rate limiting
- [ ] Return standardized response format

### 2. Register API Routes
- [ ] Import demografi routes in src/index.ts
- [ ] Add routes to Elysia app instance
- [ ] Test endpoints with curl/Postman

### 3. Update Demografi Component
- [ ] Replace direct `fetch()` with `apiClient.GET()`
- [ ] Update data parsing logic
- [ ] Add error handling for API failures
- [ ] Keep mock data as fallback
- [ ] Add refresh after sync

### 4. Update Sinkronisasi Component
- [ ] Add "Sinkronisasi Data Demografi" section
- [ ] Call `/api/demografi/sync` on button click
- [ ] Show sync progress and status
- [ ] Display last sync time
- [ ] Trigger data refresh in demografi component

### 5. Testing
- [ ] Test each API endpoint individually
- [ ] Verify data displays in UI
- [ ] Test sync button
- [ ] Test error scenarios
- [ ] Verify mock fallback works

## Notes
- Use same pattern as noc.ts API endpoints
- Response format: `{ success, data, lastSyncedAt }`
- External API base: `VITE_DESA_API_URL` or `https://desa-darmasaba-stg.wibudev.com`
- Consider adding request timeout (10s)

## External API Endpoints
```
GET /api/kependudukan/dashboard/summary
GET /api/kependudukan/data-banjar
GET /api/kependudukan/distribusi-umur
GET /api/ekonomi/demografi-pekerjaan
GET /api/kependudukan/distribusi-agama
GET /api/kesehatan/kelahiran/findMany
GET /api/kesehatan/kematian/findMany
GET /api/kependudukan/migrasi-penduduk
GET /api/ekonomi/sektor-unggulan-desa
```
