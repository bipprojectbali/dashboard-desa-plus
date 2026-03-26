import { createFileRoute } from "@tanstack/react-router";
import BumdesPage from "@/components/bumdes-page";

export const Route = createFileRoute("/bumdes")({
	component: BumdesPage,
});
