import { createFileRoute } from "@tanstack/react-router";
import SinkronisasiSettings from "@/components/pengaturan/sinkronisasi";
import { protectedRouteMiddleware } from "@/middleware/authMiddleware";

export const Route = createFileRoute("/pengaturan/sinkronisasi")({
	beforeLoad: protectedRouteMiddleware,
	component: RouteComponent,
});

function RouteComponent() {
	return <SinkronisasiSettings />;
}
