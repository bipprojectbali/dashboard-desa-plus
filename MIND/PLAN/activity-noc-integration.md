# Plan: Activity NOC Integration

Integrate the `ActivityList` component with the NOC API to display real-time upcoming events and activities.

## Objective
Update the dashboard's activity calendar to fetch data from the NOC external API instead of purely local database events.

## Strategy
- Use the `/api/noc/upcoming-events` endpoint which is already configured to fetch from the NOC server with a local database fallback.
- Ensure the frontend component correctly maps the response from the NOC API.
- Maintain the visual style and loading states.

## Steps
1. Create a task for updating the `ActivityList` component.
2. Modify `src/components/dashboard/activity-list.tsx` to call `/api/noc/upcoming-events`.
3. Verify the data mapping (e.g., `startDate` vs `date`).
4. Document the changes in a summary.
