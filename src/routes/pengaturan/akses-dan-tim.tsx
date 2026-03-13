import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pengaturan/akses-dan-tim")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/pengaturan/akses-dan-tim"!</div>;
}
