import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/bumdes")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/bumdes"!</div>;
}
