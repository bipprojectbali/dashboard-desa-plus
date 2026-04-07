import { createFileRoute } from "@tanstack/react-router";
import HelpPage from "@/components/help-page";

export const Route = createFileRoute("/bantuan")({
	component: HelpPage,
});
