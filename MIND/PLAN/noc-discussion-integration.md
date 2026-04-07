# Plan: NOC Discussion Integration for Kinerja Divisi

## Overview
Integrate the Discussion Panel in the Kinerja Divisi page with the NOC API (`/api/noc/latest-discussion`) to ensure real-time discussion data from the NOC system is displayed.

## Objectives
- Update the backend to prioritize fetching discussions from the NOC external API.
- Ensure the frontend `DiscussionPanel` correctly maps and displays the integrated data.
- Maintain local database fallback for resilience.

## Proposed Changes
1. **Backend Integration**: Modify `/api/noc/latest-discussion` in `src/api/noc.ts` to fetch from `nocExternalClient` first.
2. **Frontend Update**: Update `DiscussionPanel.tsx` to call the NOC endpoint and map the fields correctly (e.g., `senderName` to `sender`, `createdAt` to `date`).
3. **Database Sync**: Ensure the `sync-noc.ts` script already handles discussions (verified in previous task).

## Verification Strategy
- Manual testing of the Discussion Panel to ensure data loads.
- Verify field mapping (Message, Sender, Division, Date).
