/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation */
import { protectedRouteMiddleware } from "@/middleware/authMiddleware";
import { authStore } from "@/store/auth";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
	component: RootComponent,
	beforeLoad: async ({ location }) => {
		// Apply protected route middleware for all routes
		// The middleware will determine which routes are public vs protected
		const context = await protectedRouteMiddleware({ location });
		
		// Only set auth store if we have user data (for protected routes)
		if (context?.user) {
			authStore.user = context?.user as any;
			authStore.session = context?.session as any;
		}
	},
});

function RootComponent() {
	return <Outlet />;
}
