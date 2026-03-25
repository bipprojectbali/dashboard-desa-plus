import { createFileRoute } from "@tanstack/react-router";
import KeamananSettings from "@/components/pengaturan/keamanan";

export const Route = createFileRoute("/pengaturan/keamanan")({
	component: RouteComponent,
});

function RouteComponent() {
	return <KeamananSettings />;
}
