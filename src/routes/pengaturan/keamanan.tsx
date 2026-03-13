import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pengaturan/keamanan")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/pengaturan/keamanan"!</div>;
}
