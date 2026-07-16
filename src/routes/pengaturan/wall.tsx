import { createFileRoute } from "@tanstack/react-router";
import WallSettings from "@/components/pengaturan/wall";

export const Route = createFileRoute("/pengaturan/wall")({
	component: WallSettings,
});
