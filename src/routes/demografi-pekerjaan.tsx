import { createFileRoute } from "@tanstack/react-router";
import DemografiPekerjaan from "../components/demografi-pekerjaan";

export const Route = createFileRoute("/demografi-pekerjaan")({
	component: DemografiPekerjaan,
});
