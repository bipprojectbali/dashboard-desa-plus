import { createFileRoute } from "@tanstack/react-router";
import SosialPage from "@/components/sosial-page";

export const Route = createFileRoute("/sosial")({
	component: SosialPage,
});
