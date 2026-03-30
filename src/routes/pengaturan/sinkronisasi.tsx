import { createFileRoute } from "@tanstack/react-router";
import SinkronisasiSettings from "@/components/pengaturan/sinkronisasi";

export const Route = createFileRoute("/pengaturan/sinkronisasi")({
	component: SinkronisasiSettings,
});
