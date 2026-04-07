# Plan: NOC Latest Projects Integration

Integrate the `KinerjaDivisi` component with the NOC API to display the latest synced projects/activities.

## Objective
Update the "Program Kegiatan" section in the Division Performance page to fetch real-time or synced project data from the NOC API instead of the generic local activities endpoint.

## Strategy
- Use the `/api/noc/latest-projects` endpoint which provides project data from the NOC system.
- Map the response fields (e.g., `title`, `status`, `progress`, `createdAt`) to the existing `Activity` interface used in the component.
- Maintain the limit of displaying only the first 4 activities for the top section.

## Steps
1. Create a task for updating the `KinerjaDivisi` component.
2. Modify `src/components/kinerja-divisi.tsx` to call `/api/noc/latest-projects` with the appropriate `idDesa`.
3. Update the data mapping logic to handle potential differences in field names or status enums.
4. Verify the UI correctly displays the data.
5. Document the changes in a summary.
