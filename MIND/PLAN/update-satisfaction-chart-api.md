# Plan: Update Satisfaction Chart to Use NOC API

## Overview
Update the `SatisfactionChart` component to fetch data from `/api/landingpage/pilihanratingresponden/findMany` instead of `/api/dashboard/satisfaction`, and map the rating names to match the existing chart labels.

## Current State Analysis

### Current Component (`satisfaction-chart.tsx`)
- Fetches from: `/api/dashboard/satisfaction`
- Expected data structure: `{ category, value, color }[]`
- Current labels: "Sangat Puas", "Puas", "Cukup", "Kurang"

### New API Endpoint
- Endpoint: `/api/landingpage/pilihanratingresponden/findMany`
- Response structure:
  ```json
  {
    "success": true,
    "data": [
      { "id": "...", "name": "Sangat Baik", "isActive": true },
      { "id": "...", "name": "Baik", "isActive": true },
      { "id": "...", "name": "Kurang Baik", "isActive": true },
      { "id": "...", "name": "Sangat Kurang Baik", "isActive": true }
    ]
  }
  ```

### Name Mapping Required
| New API Name | Chart Label | Color (from current) |
|--------------|-------------|---------------------|
| Sangat Baik | Sangat Puas | Green (#10B981) |
| Baik | Puas | Blue (#3B82F6) |
| Kurang Baik | Cukup | Yellow (#F59E0B) |
| Sangat Kurang Baik | Kurang | Red (#EF4444) |

## Implementation Strategy

### Option 1: Direct External API Call from Frontend ⭐ (Recommended)
- Frontend langsung fetch dari `https://desa-darmasaba-stg.wibudev.com/api/landingpage/pilihanratingresponden/findMany`
- Map the `name` field to appropriate chart labels
- Assign colors based on mapped names
- Keep existing UI and chart structure

**Pros:**
- Simple and straightforward
- No backend changes needed
- Direct access to NOC data

**Cons:**
- Requires CORS to be enabled on external server
- Name mapping is hardcoded in frontend
- Depends on external server availability

### Option 2: Proxy Through Backend (Safer)
- Create a new local endpoint `/api/noc/satisfaction-categories`
- Backend fetches from external API
- Frontend calls local endpoint

**Pros:**
- Better CORS handling
- Can add caching layer
- More control over error handling

**Cons:**
- Requires backend code changes
- Extra hop (frontend → backend → external)

## Selected Approach: Option 1 (Direct API Call with Name Mapping)

### Tasks Required

1. **Update API Client Types** 
   - Add type definition for `/api/landingpage/pilihanratingresponden/findMany` response
   - Run `bun run gen:api` if schema is already defined

2. **Update SatisfactionChart Component**
   - Change API endpoint from `/api/dashboard/satisfaction` to `/api/landingpage/pilihanratingresponden/findMany`
   - Add name mapping function: API name → Chart label
   - Add color mapping based on mapped labels
   - Add count/value calculation (currently API only has names, need to fetch count or add default values)
   - Handle loading and error states

3. **Handle Missing Data**
   - **Issue**: The API response only contains rating categories (names), not the actual count/values
   - **Question**: Where do we get the `value` (count) for each rating?
   - **Possible solutions**:
     - Another API endpoint provides the actual rating counts
     - The component should aggregate from another source
     - Use placeholder/demo data for values

4. **Test the Implementation**
   - Verify data fetches correctly
   - Check name mapping displays correctly in chart
   - Ensure colors match the intended ratings
   - Test loading and error states

## Key Considerations

### ⚠️ Missing Data Issue
The new API provides **rating categories only**, not the actual satisfaction counts. The current chart expects:
```typescript
{ name: string; value: number; color: string }
```

But the new API provides:
```typescript
{ id: string; name: string; isActive: boolean }
```

**We need to determine:**
1. Is there another endpoint that provides the actual rating counts?
2. Should we fetch related data (e.g., responses/answers) to calculate counts?
3. Should we show categories with zero values initially?

### Potential Solutions for Values
- **Option A**: Query related endpoint that has actual rating responses/counts
- **Option B**: Add a second API call to get rating statistics
- **Option C**: Display categories with placeholder/demo values temporarily
- **Option D**: Show "0" or "No data" if no ratings exist

## Files to Modify

1. `src/components/dashboard/satisfaction-chart.tsx` - Main component update
2. `generated/api.ts` - Auto-generated API types (run `bun run gen:api`)
3. Possibly create utility function if mapping becomes complex

## Success Criteria

- ✅ Chart fetches data from `/api/landingpage/pilihanratingresponden/findMany`
- ✅ Rating names are correctly mapped to chart labels
- ✅ Colors are appropriately assigned
- ✅ Loading and error states work correctly
- ✅ Chart displays correctly in both light and dark modes
- ✅ No TypeScript errors or warnings

## Next Steps

1. **Clarify the data source for `value` field** (rating counts)
2. Create task file
3. Implement the component changes
4. Test and verify
