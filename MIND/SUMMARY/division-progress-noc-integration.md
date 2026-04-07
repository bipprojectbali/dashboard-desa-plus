# Summary: Division Progress NOC Integration

I have successfully updated the `DivisionProgress` component to fetch data from the specialized NOC API endpoint.

## Changes
- **Component**: `src/components/dashboard/division-progress.tsx`
- **Data Source**: Switched from `/api/division/` to `/api/noc/active-divisions`.
- **Query Parameters**: Added `idDesa: "desa1"` and `limit: "5"`.
- **UI Enhancements**:
    - Now uses the `color` field returned by the API for each division's progress bar, making the visualization more dynamic and consistent with the backend's division categorization.
    - Updated interfaces to reflect the exact data structure returned by the NOC API.

## Verification
- **Type Checking**: Ran `bun x tsc --noEmit`. No type errors were found in the modified component, confirming compatibility with `generated/api.ts`.
- **Data Integrity**: The component now correctly maps `activityCount` to the progress value and uses the specific division color.

The component is now fully integrated with the Network Operation Center (NOC) data layer for active divisions.
