import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sosial")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/sosial"!</div>;
}
