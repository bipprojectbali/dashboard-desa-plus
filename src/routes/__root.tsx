/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation */
import { protectedRouteMiddleware } from "@/middleware/authMiddleware";
import { authStore } from "@/store/auth";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { Button, Center, Stack, Text, Title } from "@mantine/core";
import {
	createRootRoute,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { MainLayout } from "@/components/layout/main-layout";

type ErrorBoundaryState = { hasError: boolean; message: string };

class ErrorBoundary extends Component<
	{ children: ReactNode },
	ErrorBoundaryState
> {
	state: ErrorBoundaryState = { hasError: false, message: "" };

	static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
		const message =
			error instanceof Error ? error.message : "Terjadi kesalahan tak terduga";
		return { hasError: true, message };
	}

	componentDidCatch(error: unknown, info: ErrorInfo) {
		console.error("[ErrorBoundary]", error, info.componentStack);
	}

	render() {
		if (this.state.hasError) {
			return (
				<Center h="100vh">
					<Stack align="center" gap="md" maw={480} px="md">
						<Title order={2} c="red">
							Terjadi Kesalahan
						</Title>
						<Text c="dimmed" ta="center" size="sm">
							{this.state.message}
						</Text>
						<Button
							variant="light"
							color="red"
							onClick={() => {
								this.setState({ hasError: false, message: "" });
								window.location.href = "/";
							}}
						>
							Kembali ke Beranda
						</Button>
					</Stack>
				</Center>
			);
		}
		return this.props.children;
	}
}

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
	const routerState = useRouterState();
	const pathname = routerState.location.pathname;
	const isPublicRoute = ["/signin", "/signup", "/admin", "/profile"].some(
		(path) => pathname.startsWith(path),
	);

	if (isPublicRoute) {
		return (
			<ErrorBoundary>
				<Outlet />
			</ErrorBoundary>
		);
	}

	return (
		<ErrorBoundary>
			<MainLayout routeKey={pathname}>
				<Outlet />
			</MainLayout>
		</ErrorBoundary>
	);
}
