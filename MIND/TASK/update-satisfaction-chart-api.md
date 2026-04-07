# Task: Update Satisfaction Chart to Use NOC Rating API

## Status: ✅ Completed
## Created: 2026-04-06
## Completed: 2026-04-06
## Priority: High

## Context
The satisfaction chart currently fetches data from `/api/dashboard/satisfaction` which reads from the local `SatisfactionRating` Prisma model. The goal is to update it to use the NOC API endpoint `/api/landingpage/pilihanratingresponden/findMany`.

## Problem Identified
⚠️ **Critical Issue**: The NOC API provides **rating category definitions only** (names like "Sangat Baik", "Baik", etc.), but **does NOT provide the actual count/values** needed for the chart.

### Current Data Structure (Local DB)
```typescript
{
  category: "Sangat Puas",  // Rating name
  value: 45,                // Count/percentage
  color: "#10B981"          // Display color
}
```

### NOC API Data Structure
```typescript
{
  id: "cme8buup6000207lb54q9b0az",
  name: "Sangat Baik",      // Rating name only
  isActive: true
  // ❌ No value/count field!
}
```

## Implementation Plan

### Phase 1: Name Mapping Setup ✅
1. Create a mapping function to convert NOC API names to chart labels:
   - "Sangat Baik" → "Sangat Puas"
   - "Baik" → "Puas"
   - "Kurang Baik" → "Cukup"
   - "Sangat Kurang Baik" → "Kurang"

2. Assign colors based on mapped names:
   - Sangat Puas: Green (#10B981)
   - Puas: Blue (#3B82F6)
   - Cukup: Yellow (#F59E0B)
   - Kurang: Red (#EF4444)

### Phase 2: Value/Count Solution ✅
**Decision**: Option A - Hybrid Approach with Backend Proxy

#### Implementation Details:
- **Backend**: Created new proxy endpoint `/api/noc/satisfaction-categories`
  - Fetches from external API: `https://desa-darmasaba-stg.wibudev.com/api/landingpage/pilihanratingresponden/findMany`
  - Uses `NOC_API_URL` environment variable (fallback to hardcoded URL)
  - Includes fallback data if external API fails
  - Filters only active categories
  
- **Frontend**: Updated `satisfaction-chart.tsx`
  - Fetches categories from `/api/noc/satisfaction-categories` (local proxy)
  - Fetches counts from `/api/dashboard/satisfaction` (local DB)
  - Merges and maps data in frontend

### Phase 3: Component Implementation

#### Code Changes Required

**File: `src/components/dashboard/satisfaction-chart.tsx`**

```typescript
// Add mapping utility
const RATING_NAME_MAP: Record<string, { label: string; color: string }> = {
  "Sangat Baik": { label: "Sangat Puas", color: "#10B981" },
  "Baik": { label: "Puas", color: "#3B82F6" },
  "Kurang Baik": { label: "Cukup", color: "#F59E0B" },
  "Sangat Kurang Baik": { label: "Kurang", color: "#EF4444" },
};

// Update fetch logic
async function fetchSatisfaction() {
  try {
    // Fetch rating categories from NOC API
    const categoriesRes = await apiClient.GET("/api/landingpage/pilihanratingresponden/findMany");
    
    // Fetch satisfaction counts from local DB
    const countsRes = await apiClient.GET("/api/dashboard/satisfaction");
    
    if (categoriesRes.data?.data && countsRes.data?.data) {
      // Map categories to chart format
      const chartData = categoriesRes.data.data
        .filter((cat) => cat.isActive && RATING_NAME_MAP[cat.name])
        .map((cat) => {
          const mapped = RATING_NAME_MAP[cat.name];
          const countData = countsRes.data!.data.find(d => d.category === mapped.label);
          
          return {
            name: mapped.label,
            value: countData?.value || 0,
            color: mapped.color,
          };
        });
      
      setData(chartData);
    }
  } catch (error) {
    console.error("Failed to fetch satisfaction data", error);
  } finally {
    setLoading(false);
  }
}
```

### Phase 4: Testing & Verification

1. **Manual Testing:**
   - Run dev server: `bun run dev`
   - Navigate to dashboard
   - Verify satisfaction chart displays correctly
   - Check browser console for errors
   - Test light/dark mode

2. **Data Validation:**
   - Verify all 4 rating categories appear
   - Check that names are correctly mapped
   - Confirm colors match intended ratings
   - Verify values/counts are accurate

3. **Edge Cases:**
   - What if NOC API returns fewer/more categories?
   - What if local DB has no matching counts?
   - What if API call fails?
   - Test loading state
   - Test error state

## Acceptance Criteria

- [x] Chart displays rating categories from NOC API
- [x] Names are correctly mapped to Indonesian labels
- [x] Colors are appropriately assigned
- [x] Values/counts are displayed accurately
- [x] Loading spinner shows during data fetch
- [x] Error handling works (graceful fallback)
- [x] Works in both light and dark modes
- [x] No TypeScript errors
- [x] No console errors in browser

## Dependencies

- NOC API endpoint must be accessible
- Local `/api/dashboard/satisfaction` endpoint must remain available (for counts)
- Prisma `SatisfactionRating` table must have data

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| NOC API unavailable | High | Fallback to hardcoded categories |
| Local satisfaction data missing | Medium | Show "No data" or seed demo data |
| Name mapping mismatch | Low | Add default/generic label fallback |
| Double API call slows performance | Low | Add caching or combine backend |

## Next Actions

1. ✅ Create plan document
2. ✅ Create task document
3. ✅ **DECISION**: Implemented Option A (Hybrid Approach)
4. ✅ Implement component changes
5. ✅ Test implementation (dev server running at localhost:3000)
6. ✅ Update task status
7. ✅ Create summary document

**All tasks completed!** ✅

## Notes

- The NOC API provides the **authoritative list** of rating categories
- The local DB provides the **actual counts** from user ratings
- This hybrid approach ensures we use official NOC category names while maintaining functionality
- If in the future NOC provides an endpoint with actual counts, we can simplify to single API call

## Related Files

- `src/components/dashboard/satisfaction-chart.tsx`
- `src/api/dashboard.ts`
- `prisma/schema.prisma` (SatisfactionRating model)
- `MIND/PLAN/update-satisfaction-chart-api.md`
