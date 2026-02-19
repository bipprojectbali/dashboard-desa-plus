import { createFileRoute } from "@tanstack/react-router";
import UmumSettings from "@/components/pengaturan/umum";

export const Route = createFileRoute("/dashboard/pengaturan/umum")({
	component: UmumSettings,
});
