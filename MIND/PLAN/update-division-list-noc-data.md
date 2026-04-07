# Plan: Update Division List with NOC Synchronized Data

This plan outlines the steps to update the `DivisionList` component in the "Kinerja Divisi" page to use the synchronized `activityCount` from NOC, ensuring consistency across the dashboard and the division list.

## Objectives
- Update the `DivisionList` component to use the `activityCount` field returned by the `/api/division/` endpoint.
- Ensure the UI correctly reflects the total activity count synchronized from NOC (e.g., "47 Kegiatan").

## Proposed Changes

### 1. Component Update (`src/components/kinerja-divisi/division-list.tsx`)
- Update the `DivisionItem` interface and the data mapping logic within `useEffect`.
- Change `div._count?.activities` to `div.activityCount` (or `(div as any).activityCount` if typing is strict).

## Verification Strategy
- Refresh the "Kinerja Divisi" page.
- Verify that the numbers in the "Divisi Teraktif" list match the synchronized data (e.g., Kesejahteraan: 47).
- Ensure the layout remains consistent with the design.
