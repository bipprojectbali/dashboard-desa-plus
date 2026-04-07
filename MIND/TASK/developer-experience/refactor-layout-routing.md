# Task: Refactor Layout and Routing

## Goal
Centralize the application layout (`AppShell`, `Sidebar`, `Header`) into a unified component and simplify individual route components to improve maintainability and developer experience.

## Sub-tasks

### 1. Unified Layout Component
- [ ] Create `src/components/layout/main-layout.tsx`.
- [ ] Move `AppShell` logic, sidebar toggle state, and color scheme handling to this component.
- [ ] Ensure `children` prop renders the `Outlet` or page content.

### 2. Root Route Configuration
- [ ] Update `src/routes/__root.tsx`.
- [ ] Implement conditional rendering:
    - Wrap `Outlet` with `MainLayout` for protected routes.
    - Render `Outlet` directly for `signin`, `signup`, and other public routes.
- [ ] Ensure `authStore` is correctly populated.

### 3. Breadcrumb Enhancement
- [ ] Update `src/components/header.tsx` to include dynamic breadcrumbs.
- [ ] Use `useLocation` or TanStack Router hooks to derive the current path segments.

### 4. Surgical Cleanup (The big one)
- [ ] Remove `AppShell` and its dependencies from `src/routes/index.tsx`.
- [ ] Remove from `src/routes/kinerja-divisi.tsx`.
- [ ] Remove from `src/routes/pengaduan-layanan-publik.tsx`.
- [ ] Remove from `src/routes/jenna-analytic.tsx`.
- [ ] Remove from `src/routes/demografi-pekerjaan.tsx`.
- [ ] Remove from `src/routes/keuangan-anggaran.tsx`.
- [ ] Remove from `src/routes/bumdes.tsx`.
- [ ] Remove from `src/routes/sosial.tsx`.
- [ ] Remove from `src/routes/keamanan.tsx`.
- [ ] Remove from `src/routes/bantuan.tsx`.
- [ ] Remove from `src/routes/profile/index.tsx`.
- [ ] Remove from `src/routes/profile/edit.tsx`.
- [ ] Refactor `src/routes/pengaturan/route.tsx` to integrate with the new `MainLayout`.

## Verification
- [ ] All routes should still display the sidebar and header correctly.
- [ ] Sidebar state (open/collapsed) should persist during navigation.
- [ ] `signin` and `signup` pages should NOT have the sidebar/header.
- [ ] Breadcrumbs should accurately reflect the current route.
- [ ] No regression in authentication (unauthorized users redirected).
