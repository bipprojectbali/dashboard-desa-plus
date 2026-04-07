# Plan: Synchronize Division Activity Counts from NOC

This plan outlines the steps to capture and display the total activity count per division directly from the NOC API, ensuring the dashboard reflects the real numbers (e.g., "47 Kegiatan") even if not all activity details are synchronized locally.

## Objectives
- Store the total activity count from NOC in the local database.
- Update the synchronization logic to capture this data.
- Update the frontend to display these "external" counts instead of just the locally synchronized activities.

## Proposed Changes

### 1. Database Schema (`prisma/schema.prisma`)
- Add `externalActivityCount` (Int, default: 0) to the `Division` model.

### 2. Synchronization Logic (`scripts/sync-noc.ts`)
- During the `syncActiveDivisions` phase, map `totalKegiatan` from the NOC response to the new `externalActivityCount` field.

### 3. Backend API (`src/api/noc.ts` & `src/api/division.ts`)
- Update the endpoints to return the `externalActivityCount` so the frontend can access it.

### 4. Frontend Component (`src/components/dashboard/division-progress.tsx`)
- Change the data mapping to use `externalActivityCount` as the primary value for the progress bars.

## Verification Strategy
- Run `bun run sync:noc` and verify the database contains the correct counts.
- Check the dashboard UI to ensure the numbers match the NOC JSON data (e.g., Kesejahteraan: 47).
- Run existing API tests to ensure no regressions.
