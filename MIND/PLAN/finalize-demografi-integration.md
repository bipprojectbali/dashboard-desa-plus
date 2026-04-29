# Plan: Finalize Demografi API Integration

## Objective
Finalize the integration of external demographic data into the dashboard, ensuring correct mapping, type safety, and removal of mock data.

## Steps
1.  **Refactor Backend API**: Update `src/api/demografi.ts` to use correct external endpoints (`/find-many` suffixes).
2.  **Fix Frontend Mapping**: Update `src/components/demografi-pekerjaan.tsx` to map API response fields correctly (Indonesian names, sum of male/female counts).
3.  **Cleanup**: Remove hardcoded mock data fallbacks.
4.  **Verification**: Run build to ensure no compile errors.
5.  **Deployment**: Update version and push to staging.
