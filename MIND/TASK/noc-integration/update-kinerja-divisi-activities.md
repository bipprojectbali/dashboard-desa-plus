# Task: Update KinerjaDivisi Activities to Fetch from NOC API

## Description
Modify the `KinerjaDivisi` component to fetch the latest project/activity data from the NOC API endpoint (`/api/noc/latest-projects`) instead of the local activities endpoint.

## Sub-tasks
- [x] Read and analyze `/api/noc/latest-projects` response structure in `src/api/noc.ts`.
- [x] Update `src/components/kinerja-divisi.tsx` to use the NOC API.
- [x] Implement data mapping from NOC response fields (`title`, `status`, `progress`, `createdAt`) to the `Activity` interface.
- [x] Update the `useEffect` call and error handling.
- [x] Verify the activities section displays the synced data from NOC correctly.

## Status
- **Current Status**: Completed
- **Last Updated**: 2026-03-31
