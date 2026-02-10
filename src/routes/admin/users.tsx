import { createFileRoute } from "@tanstack/react-router";
import { protectedRouteMiddleware } from "../../middleware/authMiddleware";

export const Route = createFileRoute("/admin/users")({
	beforeLoad: protectedRouteMiddleware,
	component: DashboardUsersComponent,
});

function DashboardUsersComponent() {
	return <div>Hello from /admin/users!</div>;
}
