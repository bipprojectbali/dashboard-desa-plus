import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/keamanan")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/keamanan"!</div>;
}
