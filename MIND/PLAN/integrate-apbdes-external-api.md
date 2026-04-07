# Plan: Integrate APBDes Data from External Desa Website API

## 📋 Overview
Replace the current hardcoded APBDes chart data source (from local `/api/dashboard/budget` endpoint) with real-time data from the Desa Darmasaba website external API endpoint `/api/landingpage/apbdes/{id}`.

## 🎯 Objectives
1. Create a new external API client for the Desa Darmasaba website (similar to `nocExternalClient`)
2. Add a new endpoint in the NOC API that fetches APBDes data from the external website
3. Update the `ChartAPBDes` component to use the new data source
4. Implement fallback mechanism if external API fails

## 🏗️ Architecture

### Current Flow
```
ChartAPBDes → /api/dashboard/budget → Local Prisma DB
```

### New Flow
```
ChartAPBDes → /api/noc/apbdes-data → External API (/api/landingpage/apbdes/{id})
                                      ↓ (fallback)
                              Local Prisma DB (Budget table)
```

## 📝 Implementation Steps

### Step 1: Create External API Client for Desa Website
**File**: `src/utils/desa-external-client.ts`
- Create an OpenAPI fetch client similar to `noc-external-client.ts`
- Base URL: `https://darmasaba.desa.id`
- Need to generate types from the external API schema (or use `any` if schema unavailable)

### Step 2: Add APBDes Endpoint to NOC API
**File**: `src/api/noc.ts`
- Add new GET endpoint: `/noc/apbdes-data`
- Accept query parameter: `idDesa` (village ID)
- Try to fetch from external Desa website API first
- Fallback to local Budget table if external fails
- Return format matching the chart component's needs:
  ```typescript
  {
    success: boolean,
    message: string,
    data: Array<{
      category: string,
      amount: number,
      percentage: number,
      color: string
    }>
  }
  ```

### Step 3: Update ChartAPBDes Component
**File**: `src/components/dashboard/chart-apbdes.tsx`
- Change API call from `/api/dashboard/budget` to `/api/noc/apbdes-data`
- Add `idDesa` query parameter (can be hardcoded as "desa1" or from config)
- Update error handling and loading states
- Keep the same UI rendering logic

### Step 4: Test the Integration
- Verify external API endpoint structure
- Test fallback mechanism
- Ensure chart displays correctly with real data

## 🔧 Technical Details

### External API Client Pattern
```typescript
// Similar to noc-external-client.ts
import createClient from "openapi-fetch";
import { getEnv } from "./env";

const externalBaseUrl = getEnv("DESA_API_URL", "https://darmasaba.desa.id");

export const desaExternalClient = createClient({
  baseUrl: externalBaseUrl,
});
```

### NOC Endpoint Pattern
```typescript
// Similar to /noc/diagram-jumlah-document
.get("/apbdes-data", async ({ query }) => {
  const { idDesa } = query;
  
  try {
    // Try external API first
    const { data, error } = await desaExternalClient.GET(
      `/api/landingpage/apbdes/${idDesa}`
    );
    
    if (!error && data) {
      return { success: true, message: "...", data: transformData(data) };
    }
  } catch (err) {
    console.error("Failed to fetch APBDes from external", err);
  }
  
  // Fallback to local DB
  const data = await prisma.budget.findMany({ ... });
  return { success: true, message: "...", data };
})
```

## ⚠️ Considerations

1. **API Schema Unknown**: The exact structure of `/api/landingpage/apbdes/{id}` is unknown. We'll need to:
   - Make the client flexible with `any` types
   - Add data transformation logic to map external data to our format
   - Log the response for debugging

2. **CORS**: External API calls from server-side (Elysia) won't have CORS issues

3. **Performance**: Add caching or timeout if needed in the future

4. **Error Handling**: Graceful degradation to local data if external API fails

## 📊 Expected Data Structure

The external API likely returns:
```typescript
{
  success: boolean,
  data: {
    pendapatan: number,
    belanja: number,
    pembiayaan: number,
    // or similar structure
  }
}
```

We'll transform this to match the chart's expected format:
```typescript
{
  category: string,
  amount: number,
  percentage: number,
  color: string
}
```

## ✅ Success Criteria
- [ ] External API client created and configured
- [ ] New `/noc/apbdes-data` endpoint working
- [ ] Chart component fetching from new endpoint
- [ ] Fallback to local DB working when external API fails
- [ ] No TypeScript errors
- [ ] Chart displays correctly with real data
