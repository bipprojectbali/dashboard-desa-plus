import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/pengaturan")({
	component: () => (
		<div className="p-2">
			<Outlet />
		</div>
	),
});
