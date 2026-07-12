import { createFileRoute } from "@tanstack/react-router";
import { WallPage } from "@/components/wall/wall-page";

type WallSearch = { key?: string };

export const Route = createFileRoute("/wall")({
	// Tangkap ?key untuk soft kiosk token; server yang memvalidasi.
	validateSearch: (search: Record<string, unknown>): WallSearch => ({
		key: typeof search.key === "string" ? search.key : undefined,
	}),
	component: WallRoute,
});

function WallRoute() {
	const { key } = Route.useSearch();
	return <WallPage accessKey={key} />;
}
