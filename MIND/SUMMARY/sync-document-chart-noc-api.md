# Summary: Sync Document Chart with NOC API

I have updated the `DocumentChart` component to fetch data from the specialized NOC API endpoint, following the successful pattern from `DivisionProgress`.

## Changes
- **Backend**: Updated `/api/noc/diagram-jumlah-document` in `src/api/noc.ts` to group by `type` and return a structured response with `label`, `value`, and `color`.
- **Component**: `src/components/kinerja-divisi/document-chart.tsx` updated to use `label` for X-axis and `value` for bars.
- **UI Enhancements**:
    - Groups data by file type (e.g., "Gambar", "Dokumen", "PDF").
    - Uses specific colors: Gambar (#fac858), Dokumen (#92cc76).

The `DocumentChart` is now fully synchronized with the NOC data layer and follows project-wide data-fetching patterns.
