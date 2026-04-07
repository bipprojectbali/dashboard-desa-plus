# Task: Update Division Progress to use NOC API

This task involves modifying `src/components/dashboard/division-progress.tsx` to fetch its data from the NOC Active Divisions endpoint.

## Sub-tasks
- [x] Research: Identify `idDesa` and verify NOC API structure. (Status: Done)
- [x] Code: Modify `src/components/dashboard/division-progress.tsx` to call `/api/noc/active-divisions`. (Status: Done)
- [x] Verification: Ensure data displays correctly in the dashboard. (Status: Done)

## Details
- **Endpoint**: `/api/noc/active-divisions`
- **Query Params**: `idDesa` (e.g., "desa1")
- **Expected Data Structure**:
  ```typescript
  data: {
    id: string;
    name: string;
    activityCount: number;
    color: string;
  }[]
  ```
