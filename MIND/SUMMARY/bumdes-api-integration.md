# Summary: BUMDes Dashboard API Integration

## Work Completed
- Integrated real API data for BUMDes/UMKM dashboard components.
- Added dynamic filtering for categories and UMKM in `SalesTable`.
- Connected `SummaryCards`, `ProdukUnggulan`, and `TopProducts` to API endpoints.
- Subscribed to `umkmStore.selectedRange` for reactive data fetching across components.
- Removed hardcoded mock data from UMKM components.
- Created `tasks-sample.csv` to track project progress.
- Bumped version to `0.1.0-pre.8` in `package.json`.

## Files Modified
- `package.json`: Version bump.
- `src/components/bumdes-page.tsx`: Main integration logic and state management.
- `src/components/umkm/produk-unggulan.tsx`: Props and display logic update.
- `src/components/umkm/sales-table.tsx`: Filtering and dynamic options.
- `src/components/umkm/summary-cards.tsx`: Props and display logic update.
- `src/components/umkm/top-products.tsx`: Props and display logic update.

## Verification
- Ran `bun run build` successfully.
- All components correctly receive and render data via props.
