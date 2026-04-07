# Task: Integrate APBDes Data from External Desa Website API

## 📋 Task Name
integrate-apbdes-external-api

## 🎯 Goal
Integrate real APBDes data from Desa Darmasaba website API (`/api/landingpage/apbdes/{id}`) into the dashboard chart component, replacing the current local budget data source.

## ✅ Tasks

### Task 1: Create Desa External API Client
- [x] Create `src/utils/desa-external-client.ts`
- [x] Configure base URL to `https://darmasaba.desa.id`
- [x] Follow the same pattern as `noc-external-client.ts`
- [x] Use flexible typing since external API schema is unknown

### Task 2: Add APBDes Data Endpoint to NOC API
- [x] Add new GET endpoint `/noc/apbdes-data` in `src/api/noc.ts`
- [x] Accept `idDesa` query parameter
- [x] Implement external API call to `/api/landingpage/apbdes/{idDesa}`
- [x] Add data transformation logic to map external data to chart format
- [x] Implement fallback to local Budget table if external API fails
- [x] Add proper response typing with `t.Object`
- [x] Follow the pattern from `/noc/diagram-jumlah-document` endpoint

### Task 3: Update ChartAPBDes Component
- [x] Change API endpoint from `/api/dashboard/budget` to `/api/noc/apbdes-data`
- [x] Add `idDesa` parameter to the API call (use "desa1" as default)
- [x] Update data mapping to handle both external and local data formats
- [x] Improve error messages for better debugging
- [x] Test loading states and empty states

### Task 4: Test & Verify
- [x] Run TypeScript type checking (`bun run check`)
- [x] Run linter (`bun run lint`)
- [x] Start dev server and verify chart displays correctly
- [x] Test fallback mechanism by simulating external API failure
- [x] Verify no console errors

## 📝 Notes
- External API structure is unknown, so we'll use flexible typing and add logging
- The chart expects: `{ category: string, amount: number, percentage: number, color: string }[]`
- Fallback ensures the chart always shows data even if external API is down
- Follow existing patterns from `noc.ts` for consistency

## 🔗 Related Files
- `src/utils/desa-external-client.ts` (new)
- `src/api/noc.ts` (modify)
- `src/components/dashboard/chart-apbdes.tsx` (modify)
- `src/utils/noc-external-client.ts` (reference)
- `src/api/dashboard.ts` (reference for Budget model)
