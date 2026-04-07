# Plan: Activity Progress NOC Integration

Integrate the `ProgressChart` component with the NOC API to display real-time activity progress statistics.

## Objective
Update the "Progres Kegiatan" chart in the division performance page to fetch data from the NOC API instead of the local division activity stats endpoint.

## Strategy
- Use the `/api/noc/diagram-progres-kegiatan` endpoint.
- Since the NOC API returns raw counts and average progress per status, calculate the percentage of total activities per status in the frontend to match the chart's requirements.
- Map the status strings (e.g., `SELESAI`, `BERJALAN`) to human-readable labels and colors.

## Steps
1. Create a task for updating the `ProgressChart` component.
2. Modify `src/components/kinerja-divisi/progress-chart.tsx` to call `/api/noc/diagram-progres-kegiatan`.
3. Implement percentage calculation logic in the component.
4. Verify the mapping and visual output.
5. Document the changes in a summary.
