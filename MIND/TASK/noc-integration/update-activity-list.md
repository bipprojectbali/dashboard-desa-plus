# Task: Update ActivityList to Fetch from NOC API

## Description
Modify the `ActivityList` component in the dashboard to fetch upcoming events from the NOC API endpoint (`/api/noc/upcoming-events`) instead of the local event endpoint.

## Sub-tasks
- [x] Read and analyze `/api/noc/upcoming-events` response structure in `src/api/noc.ts`.
- [x] Update `src/components/dashboard/activity-list.tsx` to use the new endpoint.
- [x] Update the data mapping in the component's `useEffect`.
- [x] Test the integration with the dashboard.

## Status
- **Current Status**: Completed
- **Last Updated**: 2026-03-31
