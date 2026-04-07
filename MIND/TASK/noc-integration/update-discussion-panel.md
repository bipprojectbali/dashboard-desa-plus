# Task: Update DiscussionPanel to Fetch 6 Latest from NOC API

## Description
Modify the `DiscussionPanel` component in the performance page to fetch 6 latest discussion items from the NOC API endpoint (`/api/noc/latest-discussion`) instead of the local discussions endpoint.

## Sub-tasks
- [x] Read and analyze `/api/noc/latest-discussion` response structure in `src/api/noc.ts`.
- [x] Update `src/components/kinerja-divisi/discussion-panel.tsx` to use the NOC API.
- [x] Set `limit: "6"` and `idDesa: "desa1"` in the API request.
- [x] Update data mapping:
    - `senderName` -> `sender`
    - `createdAt` -> `date`
    - `divisionName` -> `division`
- [x] Verify the UI displays only 6 latest discussions.

## Status
- **Current Status**: Completed
- **Last Updated**: 2026-03-31
