# Task: Update ProgressChart to Fetch from NOC API

## Description
Modify the `ProgressChart` component in the division performance page to fetch activity progress data from the NOC API endpoint (`/api/noc/diagram-progres-kegiatan`) instead of the local statistics endpoint.

## Sub-tasks
- [x] Read and analyze `/api/noc/diagram-progres-kegiatan` response structure in `src/api/noc.ts`.
- [x] Update `src/components/kinerja-divisi/progress-chart.tsx` to use the new endpoint.
- [x] Implement percentage calculation based on raw activity counts for each status.
- [x] Update labels and colors mapping (SELESAI, BERJALAN, TERTUNDA, DIBATALKAN).
- [x] Verify the chart displays the correct data percentages.

## Status
- **Current Status**: Completed
- **Last Updated**: 2026-03-31
