/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation */
import { authStore } from "@/store/auth";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
	component: RootComponent,
	beforeLoad: async () => {
		// Fetch session but don't block navigation
		try {
			const res = await fetch("/api/session", {
				method: "GET",
				credentials: "include",
			});
			if (res.ok) {
				const { data } = await res.json();
				authStore.user = data?.user;
				authStore.session = data;
			}
		} catch {
			// Ignore errors, allow public access
		}
		return {};
	},
});

function RootComponent() {
	return <Outlet />;
}
