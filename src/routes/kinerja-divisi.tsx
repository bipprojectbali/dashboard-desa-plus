import { createFileRoute } from "@tanstack/react-router";
import KinerjaDivisi from "@/components/kinerja-divisi";

export const Route = createFileRoute("/kinerja-divisi")({
	component: KinerjaDivisi,
});
