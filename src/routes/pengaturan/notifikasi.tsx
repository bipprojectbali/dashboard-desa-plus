import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pengaturan/notifikasi")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/pengaturan/notifikasi"!</div>;
}
