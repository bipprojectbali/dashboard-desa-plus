import { createFileRoute } from "@tanstack/react-router";
import AksesDanTimSettings from "@/components/pengaturan/akses-dan-tim";

export const Route = createFileRoute("/pengaturan/akses-dan-tim")({
	component: RouteComponent,
});

function RouteComponent() {
	return <AksesDanTimSettings />;
}
