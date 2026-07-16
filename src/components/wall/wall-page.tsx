import { Button, Center, MantineProvider, Stack, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSnapshot } from "valtio";
import "@mantine/charts/styles.css";
import { authStore } from "@/store/auth";
import { fetchWallLayout } from "./fetch-wall-layout";
import { fetchWallSnapshot } from "./fetch-wall-snapshot";
import { resolveLayout } from "./wall-layout-utils";
import { WallShell } from "./wall-shell";
import {
	WALL_LAYOUT_REFETCH_MS,
	WALL_REFETCH_MS,
	WALL_THEME,
} from "./wall-theme";

interface WallPageProps {
	accessKey?: string;
}

/**
 * Halaman NOC wall: satu fetch di level page, prop-drill ke widget bodoh.
 * Force dark via MantineProvider tersarang (scoped, auto-restore saat unmount).
 * Refresh 24/7 dengan interval tetap — lepas dari toggle global dashboard.
 */
export function WallPage({ accessKey }: WallPageProps) {
	const [fsFailed, setFsFailed] = useState(false);

	const { data, isError, error } = useQuery({
		queryKey: ["wall", "snapshot", accessKey ?? ""],
		queryFn: () => fetchWallSnapshot(accessKey),
		refetchInterval: WALL_REFETCH_MS,
		refetchOnWindowFocus: false,
	});

	// Layout global (singleton DB). Stateless read: admin simpan → nyampe TV
	// dalam 1 siklus refetch. Gagal fetch → resolveLayout(undefined) = default.
	const { data: layoutOrder } = useQuery({
		queryKey: ["wall", "layout"],
		queryFn: fetchWallLayout,
		refetchInterval: WALL_LAYOUT_REFETCH_MS,
		refetchOnWindowFocus: false,
	});

	const order = resolveLayout(layoutOrder);

	// Admin login terdeteksi bahkan di route publik (__root beforeLoad selalu
	// set authStore dari sesi). Publik/TV → user null → canEdit false.
	const { user } = useSnapshot(authStore);
	const canEdit = user?.role === "admin";

	const requestFullscreen = () => {
		document.documentElement
			.requestFullscreen?.()
			.catch(() => setFsFailed(true));
	};

	return (
		<MantineProvider forceColorScheme="dark">
			{/* Denyut indikator LIVE — keyframe scoped ke halaman wall. */}
			<style>{`@keyframes wallLivePulse { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } } .wall-live-dot { animation: wallLivePulse 1.4s ease-in-out infinite; }`}</style>
			<div style={{ background: WALL_THEME.PAGE_BG, minHeight: "100vh" }}>
				{isError ? (
					<Center h="100vh">
						<Stack align="center" gap="sm">
							<Text fw={700} style={{ color: WALL_THEME.DANGER }}>
								Gagal memuat data wall
							</Text>
							<Text size="sm" style={{ color: WALL_THEME.TEXT_DIM }}>
								{error instanceof Error
									? error.message
									: "Kesalahan tak terduga"}
							</Text>
							<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }}>
								Mencoba lagi otomatis…
							</Text>
						</Stack>
					</Center>
				) : (
					<WallShell
						snapshot={data}
						order={order}
						live={!isError}
						canEdit={canEdit}
					/>
				)}

				{/* Fallback fullscreen dalam app; kiosk browser tetap jalur utama. */}
				{!fsFailed ? (
					<Button
						size="xs"
						variant="default"
						onClick={requestFullscreen}
						style={{
							position: "fixed",
							bottom: 12,
							right: 12,
							opacity: 0.85,
							background: WALL_THEME.CARD,
							borderColor: WALL_THEME.BORDER,
							color: WALL_THEME.TEXT,
						}}
					>
						Layar penuh
					</Button>
				) : null}
			</div>
		</MantineProvider>
	);
}
