/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation */
import { protectedRouteMiddleware } from "@/middleware/authMiddleware";
import { authStore } from "@/store/auth";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
	component: RootComponent,
	beforeLoad: async ({ location }) => {
		// Only apply auth middleware for routes that need it
		// Public routes: /, /signin, /signup
		const isPublicRoute =
			location.pathname === "/" ||
			location.pathname === "/signin" ||
			location.pathname === "/signup";

		if (isPublicRoute) {
			return;
		}

		// Apply protected route middleware for all other routes
		const context = await protectedRouteMiddleware({ location });
		authStore.user = context?.user as any;
		authStore.session = context?.session as any;
	},
});

function RootComponent() {
	return <Outlet />;
}