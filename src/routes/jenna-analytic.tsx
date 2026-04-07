import { createFileRoute } from "@tanstack/react-router";
import JennaAnalytic from "@/components/jenna-analytic";

export const Route = createFileRoute("/jenna-analytic")({
	component: JennaAnalytic,
});
