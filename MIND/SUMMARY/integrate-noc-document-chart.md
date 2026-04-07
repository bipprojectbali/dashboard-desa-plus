# Summary: Integrated NOC Document Chart (v2)

The `DocumentChart` component and its backend endpoint have been updated to use a more descriptive and direct format inspired by the actual NOC API response.

## Changes Made
- **Backend API (`src/api/noc.ts`)**: Updated `/api/noc/diagram-jumlah-document` to:
  - Group documents by **type** (e.g., "Gambar", "Dokumen") instead of category.
  - Return a structured JSON with `success`, `message`, and `data` containing `label`, `value`, and `color`.
- **Frontend Component (`src/components/kinerja-divisi/document-chart.tsx`)**: 
  - Simplified the mapping logic to directly use the labels and colors provided by the API.
  - Corrected the `apiClient.GET` parameter structure to use the required `params: { query: { ... } }` wrapper.
- **Type Safety**: Regenerated API types using `bun run gen:api` to ensure full TypeScript support for the new response format.

## Verification
- API now proxies the real external NOC data via `nocExternalClient`.
- Returns real-time data from the external source (e.g., 385 for "Gambar" and 147 for "Dokumen").
- **Final Update**: Removed mocked JSON and local DB grouping. The local `/api/noc/diagram-jumlah-document` now acts as a secure proxy to the external NOC server.
