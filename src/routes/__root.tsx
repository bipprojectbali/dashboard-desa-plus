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
import { Component, type ErrorInfo, type ReactNode, useEffect } from "react";
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

const APP_NAME = "Dashboard Desa Plus";

const PAGE_TITLES: Record<string, string> = {
	"/": "Dashboard",
	"/keuangan-anggaran": "Keuangan & Anggaran",
	"/kinerja-divisi": "Kinerja Divisi",
	"/demografi-pekerjaan": "Demografi & Pekerjaan",
	"/pengaduan-layanan-publik": "Pengaduan Layanan Publik",
	"/bumdes": "BUMDes",
	"/sosial": "Sosial",
	"/bantuan": "Bantuan",
	"/jenna-analytic": "Jenna Analytics",
	"/keamanan": "Keamanan",
	"/signin": "Masuk",
	"/signup": "Daftar",
	"/profile/edit": "Edit Profil",
	"/profile": "Profil",
	"/pengaturan/akses-dan-tim": "Akses & Tim — Pengaturan",
	"/pengaturan/keamanan": "Keamanan — Pengaturan",
	"/pengaturan/notifikasi": "Notifikasi — Pengaturan",
	"/pengaturan/sinkronisasi": "Sinkronisasi — Pengaturan",
	"/pengaturan/umum": "Pengaturan Umum",
	"/admin/audit-log": "Audit Log — Admin",
	"/admin/apikey": "API Key — Admin",
	"/admin/help": "Bantuan — Admin",
	"/admin/preferences": "Preferensi — Admin",
	"/admin/roles": "Peran — Admin",
	"/admin/settings": "Pengaturan — Admin",
	"/admin/system-health": "Kesehatan Sistem — Admin",
	"/admin/users": "Pengguna — Admin",
	"/admin": "Admin Dashboard",
	"/users": "Pengguna",
};

function getPageTitle(pathname: string): string {
	if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
	if (pathname.startsWith("/users/")) return "Detail Pengguna";
	return "";
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

	useEffect(() => {
		const pageTitle = getPageTitle(pathname);
		document.title = pageTitle ? `${pageTitle} — ${APP_NAME}` : APP_NAME;
	}, [pathname]);

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
