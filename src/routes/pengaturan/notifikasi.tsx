import { createFileRoute } from "@tanstack/react-router";
import NotifikasiSettings from "@/components/pengaturan/notifikasi";

export const Route = createFileRoute("/pengaturan/notifikasi")({
	component: RouteComponent,
});

function RouteComponent() {
	return <NotifikasiSettings />;
}
