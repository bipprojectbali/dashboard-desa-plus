# Plan: Integrate NOC Active Divisions API

This plan outlines the steps to update the `DivisionProgress` component to fetch data from the NOC Active Divisions API instead of the general division API.

## Objectives
- Update `src/components/dashboard/division-progress.tsx` to use the `/api/noc/active-divisions` endpoint.
- Use the `idDesa` from environment variables or a constant (likely "darmasaba" based on project context).
- Ensure the UI remains consistent or improves with the new data.

## Steps
1. **Research & Preparation**
    - Identify the correct `idDesa` to use for the API call.
    - Verify the data structure of `/api/noc/active-divisions` from `generated/api.ts`.
2. **Implementation**
    - Create a task file `MIND/TASK/update-division-progress-noc-api.md`.
    - Modify `src/components/dashboard/division-progress.tsx`:
        - Update the API endpoint in `apiClient.GET`.
        - Add the required `idDesa` query parameter.
        - Update types if necessary (though they seem compatible).
3. **Verification**
    - Verify the component renders correctly with the new data.
    - Check for any console errors.
4. **Finalization**
    - Update the task status.
    - Create a summary in `MIND/SUMMARY/division-progress-noc-integration.md`.
