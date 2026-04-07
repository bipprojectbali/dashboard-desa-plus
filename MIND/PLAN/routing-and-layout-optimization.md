# Plan: Routing and Layout Optimization

## Problem Statement
The current routing architecture is redundant and difficult to maintain. Every protected page (Dashboard, Kinerja Divisi, etc.) manually implements the `AppShell`, `Sidebar`, and `Header`. This leads to:
1.  **Code Duplication**: UI logic for the layout is copied across 10+ route files.
2.  **State Management Issues**: Sidebar open/collapsed state might reset or flicker during navigation.
3.  **Inconsistent UX**: Changes to the layout must be applied manually to all files.
4.  **No Breadcrumbs**: Hard for users to know their current location in the deep hierarchy (especially in Settings).

## Proposed Solution

### 1. Unified Root Layout
Refactor `src/routes/__root.tsx` to act as the primary layout manager.
-   Routes like `/signin` and `/signup` will be rendered without the `AppShell`.
-   All other routes (protected) will be wrapped in a single `AppShell` instance.
-   Use `useSidebarFullscreen` hook at the root level to manage global sidebar state.

### 2. Layout Component Extraction
Create a `src/components/layout/main-layout.tsx` component that contains the `AppShell` logic.
-   It will accept `children` (the `Outlet`).
-   It will handle the background colors, sidebar toggle logic, and responsive behavior.

### 3. Breadcrumb Integration
Enhance the `Header` component or create a dedicated breadcrumb component.
-   Automatically generate breadcrumbs based on the current TanStack Router path.
-   Display them in the header area.

### 4. Route Cleanup
Surgically remove the `AppShell`, `Sidebar`, and `Header` wrapping from:
-   `src/routes/index.tsx`
-   `src/routes/kinerja-divisi.tsx`
-   `src/routes/pengaduan-layanan-publik.tsx`
-   `src/routes/jenna-analytic.tsx`
-   `src/routes/demografi-pekerjaan.tsx`
-   `src/routes/keuangan-anggaran.tsx`
-   `src/routes/bumdes.tsx`
-   `src/routes/sosial.tsx`
-   `src/routes/keamanan.tsx`
-   `src/routes/bantuan.tsx`
-   `src/routes/profile/index.tsx`
-   `src/routes/profile/edit.tsx`
-   `src/routes/pengaturan/route.tsx` (This one is already a layout route, but can be simplified)

## Implementation Steps

1.  **Create MainLayout Component**: Move `AppShell` logic from `index.tsx` to a new shared component.
2.  **Update Root Route**: Modify `src/routes/__root.tsx` to conditionally wrap the `Outlet` with `MainLayout` based on the pathname.
3.  **Simplify Individual Routes**: Remove layout boilerplate from each route component, leaving only the page-specific content.
4.  **Add Breadcrumbs**: Implement the breadcrumb logic in the `Header` or `MainLayout`.
5.  **Verify Authentication Flow**: Ensure the `beforeLoad` auth check still works correctly with the new structure.
