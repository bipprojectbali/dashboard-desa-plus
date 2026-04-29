# Plan: Fix Demografi Data Display & Add Sync Functionality

## Overview
Fix the demografi-pekerjaan component data display issue and add sync functionality to synchronize data from external Desa API.

## Problem Analysis

### Why Data Not Showing
The current implementation uses direct `fetch()` calls from browser to external Desa API:
```typescript
fetch(`${externalApiUrl}/api/kependudukan/dashboard/summary`)
```

**Potential Issues:**
1. **CORS blocking**: Browser blocks cross-origin requests to `desa-darmasaba-stg.wibudev.com` from localhost
2. **API endpoints might not exist**: The assumed endpoints may not match actual API structure
3. **Response format mismatch**: Expected `{ success: true, data: [...] }` but actual response differs
4. **Environment variable not set**: `VITE_DESA_API_URL` might not be configured

### Architecture Pattern
Looking at existing working code:
- **satisfaction-chart.tsx**: Uses direct `fetch()` to external API - works because it's simple GET
- **sinkronisasi.tsx**: Uses `apiClient` to internal `/api/noc/sync` endpoint
- **NOC sync flow**: Backend fetches from external API, frontend calls internal API

**Best Solution**: Create internal API endpoints that proxy requests to external Desa API, avoiding CORS issues.

## Target Architecture

### Frontend Flow
```
demografi-pekerjaan.tsx
  ↓ calls internal API
src/api/demografi.ts (NEW)
  ↓ fetches from external API
https://desa-darmasaba-stg.wibudev.com/api/*
```

### Sync Flow
```
sinkronisasi.tsx "Sync Now" button
  ↓ calls internal API
/api/demografi/sync
  ↓ fetches & caches from external API
https://desa-darmasaba-stg.wibudev.com/api/*
  ↓ returns data
Frontend displays data
```

## Implementation Strategy

### Phase 1: Create Internal API Endpoints
1. Create `src/api/demografi.ts` with proxy endpoints
2. Add routes for each demografi data type:
   - `GET /api/demografi/summary` - dashboard summary
   - `GET /api/demografi/banjar` - banjar data
   - `GET /api/demografi/age` - age distribution
   - `GET /api/demografi/occupation` - occupation data
   - `GET /api/demografi/religion` - religion distribution
   - `GET /api/demografi/births` - birth data
   - `GET /api/demografi/deaths` - death data
   - `GET /api/demografi/migration` - migration data
   - `GET /api/demografi/sectors` - sector data
   - `POST /api/demografi/sync` - sync all data

### Phase 2: Update Frontend Component
1. Replace direct `fetch()` with `apiClient.GET()` calls
2. Update data parsing to match internal API response format
3. Add loading and error states
4. Trigger refetch after sync

### Phase 3: Update Sync Component
1. Add "Sync Demografi Data" section to sinkronisasi.tsx
2. Call `/api/demografi/sync` when user clicks sync
3. Show sync progress and results
4. Trigger data refresh in demografi component after sync

### Phase 4: Test & Verify
1. Test API endpoints with external API
2. Verify data displays correctly
3. Test sync functionality
4. Handle errors gracefully

## Data Mapping (External → Internal API)

### External API Endpoints (desa-darmasaba-stg.wibudev.com)
- `/api/kependudukan/dashboard/summary`
- `/api/kependudukan/data-banjar`
- `/api/kependudukan/distribusi-umur`
- `/api/ekonomi/demografi-pekerjaan`
- `/api/kependudukan/distribusi-agama`
- `/api/kesehatan/kelahiran/findMany`
- `/api/kesehatan/kematian/findMany`
- `/api/kependudukan/migrasi-penduduk`
- `/api/ekonomi/sektor-unggulan-desa`

### Internal API Response Format
```typescript
{
  success: true,
  data: [...],
  lastSyncedAt: "2026-04-14T...",
  source: "external-api"
}
```

## Files to Modify
- **NEW**: `src/api/demografi.ts` - internal API endpoints
- **MODIFY**: `src/components/demografi-pekerjaan.tsx` - use internal API
- **MODIFY**: `src/components/pengaturan/sinkronisasi.tsx` - add demografi sync
- **MODIFY**: `src/index.ts` - register new API routes

## Success Criteria
- ✅ Demografi data displays correctly
- ✅ No CORS errors in console
- ✅ Sync button works and updates data
- ✅ Loading states show during fetch
- ✅ Error handling with user-friendly messages
- ✅ Mock data fallback still works
