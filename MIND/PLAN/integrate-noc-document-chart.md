# Plan: Integrate NOC Document Chart

Integrate the Network Operation Center (NOC) document statistics into the `DocumentChart` component to replace the current local endpoint.

## Objectives
- Replace the data source for `DocumentChart` with the NOC API.
- Map the NOC API response format to the component's expected data structure.
- Maintain visual consistency and performance.

## Strategy
1. **Analyze API Response**: Confirm the format of `/api/noc/diagram-jumlah-document`.
2. **Update Component**:
   - Change `apiClient.GET("/api/division/documents/stats")` to `apiClient.GET("/api/noc/diagram-jumlah-document", { query: { idDesa: "desa1" } })`.
   - Implement a mapping function to convert `{ category: string, count: number }` to `{ name: string, jumlah: number, color: string }`.
3. **Enhance UI**: Ensure the chart remains visually appealing with appropriate colors for different document categories.
4. **Validation**: Verify that the data is fetched and displayed correctly.

## Proposed Changes
- `src/components/kinerja-divisi/document-chart.tsx`: Update the `useEffect` hook and data mapping logic.
