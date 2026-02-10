import { createFileRoute } from "@tanstack/react-router";
import { protectedRouteMiddleware } from "../../middleware/authMiddleware";

export const Route = createFileRoute("/admin/settings")({
	beforeLoad: protectedRouteMiddleware,
	component: DashboardSettingsComponent,
});

function DashboardSettingsComponent() {
	return <div>Hello from /admin/settings!</div>;
}
