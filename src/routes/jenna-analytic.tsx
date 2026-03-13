import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/jenna-analytic")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/jenna-analytic"!</div>;
}
