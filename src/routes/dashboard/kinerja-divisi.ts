import { createFileRoute } from "@tanstack/react-router";
import KinerjaDivisi from "../../app/components/kinerja-divisi";
export const Route = createFileRoute("/dashboard/kinerja-divisi")({
	component: KinerjaDivisi,
});
