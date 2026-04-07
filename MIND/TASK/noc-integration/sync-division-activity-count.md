# Task: Synchronize Division Activity Count from NOC

Track the implementation of capturing and displaying the external activity count for divisions.

## Tasks
- [x] **DB**: Add `externalActivityCount` to `Division` model in `prisma/schema.prisma`
- [x] **DB**: Run migration to apply schema changes
- [x] **SYNC**: Update `scripts/sync-noc.ts` to map `totalKegiatan` from NOC to `externalActivityCount`
- [x] **API**: Update `src/api/division.ts` (or `src/api/noc.ts`) to return `externalActivityCount` in the divisions list
- [x] **UI**: Update `src/components/dashboard/division-progress.tsx` to display `externalActivityCount` instead of `_count.activities`
- [x] **Validation**: Run `bun run sync:noc` and verify the values in the Dashboard UI

## Completed
- DB schema updated with `externalActivityCount`.
- Migration `20260330074700_add_external_activity_count_to_division` applied.
- Sync script updated to capture `totalKegiatan`.
- API and UI updated to use the new count.
- Verified sync correctly populates the counts in the database and dashboard.
