import { createFileRoute } from "@tanstack/react-router";
import KeamananSettings from "@/components/pengaturan/keamanan";

export const Route = createFileRoute("/dashboard/pengaturan/keamanan")({
	component: KeamananSettings,
});
