# Plan: Discussion NOC Integration

Integrate the `DiscussionPanel` component with the NOC API to display real-time or synced discussions from the central system.

## Objective
Update the "Diskusi" panel in the performance page to fetch data from the NOC API instead of the generic local discussions endpoint, limited to 6 latest items.

## Strategy
- Use the `/api/noc/latest-discussion` endpoint.
- Provide `idDesa: "desa1"` and `limit: "6"` in the request.
- Map the NOC response fields (`senderName`, `createdAt`, `divisionName`) to the component's internal state.
- Maintain the existing visual style and formatting.

## Steps
1. Create a task for updating the `DiscussionPanel` component.
2. Modify `src/components/kinerja-divisi/discussion-panel.tsx` to call `/api/noc/latest-discussion`.
3. Update the data mapping in the component's `useEffect`.
4. Verify only 6 items are displayed and data is correct.
5. Document the changes in a summary.
