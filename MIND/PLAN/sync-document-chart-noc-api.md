# Plan: Sync Document Chart with NOC API

Follow the pattern established in `DivisionProgress` to update `DocumentChart` to use the NOC API.

## Steps
1. **Backend**: Update `/api/noc/diagram-jumlah-document` to return structured data (success, message, and mapped names/colors).
2. **Types**: Run `bun run gen:api` to synchronize frontend types.
3. **Frontend**: Update `src/components/kinerja-divisi/document-chart.tsx` to fetch from the updated NOC endpoint with `idDesa: "desa1"`.
4. **Verification**: Confirm data displays correctly in the Kinerja Divisi page.
