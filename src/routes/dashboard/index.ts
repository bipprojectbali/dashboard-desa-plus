import { createFileRoute } from "@tanstack/react-router";
import { DashboardContent } from "../../app/components/dashboard-content";
export const Route = createFileRoute("/dashboard/")({
	component: DashboardContent,
});
