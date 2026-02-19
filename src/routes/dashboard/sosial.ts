import { createFileRoute } from "@tanstack/react-router";
import SocialPage from "@/components/sosial-page";

export const Route = createFileRoute("/dashboard/sosial")({
	component: SocialPage,
});
