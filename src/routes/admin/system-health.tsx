import {
	ActionIcon,
	Badge,
	Box,
	Card,
	Container,
	Group,
	SimpleGrid,
	Skeleton,
	Stack,
	Text,
	Title,
	Tooltip,
} from "@mantine/core";
import { AreaChart } from "@mantine/charts";
import {
	IconActivity,
	IconCloudCheck,
	IconCloudX,
	IconDatabase,
	IconRefresh,
	IconRotateClockwise,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { protectedRouteMiddleware } from "../../middleware/authMiddleware";

export const Route = createFileRoute("/admin/system-health")({
	beforeLoad: protectedRouteMiddleware,
	component: SystemHealthPage,
});

interface HealthData {
	memPct: number;
	cpuPct: number;
	diskUsedPct: number;
	diskFreePct: number;
	db: { ok: boolean; latencyMs: number | null };
	desaApi: { ok: boolean; latencyMs: number | null };
	nocApi: { ok: boolean; latencyMs: number | null };
	lastSync: { type: string; status: string; startedAt: string } | null;
}

interface LatencyPoint {
	time: string;
	db: number | null;
	desaApi: number | null;
	nocApi: number | null;
}

const MAX_HISTORY = 20;

function StatusBadge({ ok }: { ok: boolean }) {
	return ok ? (
		<Badge color="green" variant="light" size="sm">
			Online
		</Badge>
	) : (
		<Badge color="red" variant="light" size="sm">
			Offline
		</Badge>
	);
}

function LatencyText({ ms }: { ms: number | null }) {
	if (ms === null) return <Text size="xs" c="dimmed">Timeout</Text>;
	const color = ms < 200 ? "green" : ms < 800 ? "orange" : "red";
	return (
		<Text size="xs" c={color} fw={500}>
			{ms} ms
		</Text>
	);
}

function StatusCard({
	title,
	icon,
	ok,
	latencyMs,
	extra,
	loading,
}: {
	title: string;
	icon: React.ReactNode;
	ok: boolean;
	latencyMs: number | null;
	extra?: React.ReactNode;
	loading?: boolean;
}) {
	return (
		<Card withBorder p="lg" radius="md">
			{loading ? (
				<Stack gap="xs">
					<Skeleton height={14} width="60%" />
					<Skeleton height={22} width="40%" />
					<Skeleton height={12} width="30%" />
				</Stack>
			) : (
				<Stack gap="xs">
					<Group justify="space-between">
						<Group gap="xs">
							<Box c={ok ? "green.6" : "red.6"}>{icon}</Box>
							<Text size="sm" c="dimmed">
								{title}
							</Text>
						</Group>
						<StatusBadge ok={ok} />
					</Group>
					<LatencyText ms={latencyMs} />
					{extra}
				</Stack>
			)}
		</Card>
	);
}

function SystemHealthPage() {
	const [health, setHealth] = useState<HealthData | null>(null);
	const [loading, setLoading] = useState(true);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const [history, setHistory] = useState<LatencyPoint[]>([]);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const fetchHealth = useCallback(async () => {
		try {
			const res = await fetch("/api/system/stats", { credentials: "include" });
			if (!res.ok) return;
			const json = (await res.json()) as { data: HealthData };
			const data = json.data;
			setHealth(data);
			setLastUpdated(new Date());

			const point: LatencyPoint = {
				time: new Date().toLocaleTimeString("id-ID", {
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				}),
				db: data.db.latencyMs,
				desaApi: data.desaApi.latencyMs,
				nocApi: data.nocApi.latencyMs,
			};
			setHistory((prev) => [...prev.slice(-(MAX_HISTORY - 1)), point]);
		} catch {
			// fetch failed - don't update state
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchHealth();
		intervalRef.current = setInterval(fetchHealth, 30_000);
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [fetchHealth]);

	const formatSyncTime = (iso: string) =>
		new Date(iso).toLocaleString("id-ID", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});

	const syncExtra = health?.lastSync ? (
		<Stack gap={2}>
			<Text size="xs" c="dimmed">
				Tipe:{" "}
				<Text span fw={500} c="default">
					{health.lastSync.type}
				</Text>
			</Text>
			<Text size="xs" c="dimmed">
				Status:{" "}
				<Text
					span
					fw={500}
					c={health.lastSync.status === "success" ? "green" : "orange"}
				>
					{health.lastSync.status}
				</Text>
			</Text>
			<Text size="xs" c="dimmed">
				{formatSyncTime(health.lastSync.startedAt)}
			</Text>
		</Stack>
	) : (
		<Text size="xs" c="dimmed">
			Belum ada sync
		</Text>
	);

	return (
		<Container size="xl" py="xl">
			<Group justify="space-between" mb="lg" align="flex-start">
				<Stack gap={2}>
					<Title order={2}>System Health</Title>
					<Text size="sm" c="dimmed">
						Status konektivitas dan latency komponen sistem
					</Text>
					{lastUpdated && (
						<Text size="xs" c="dimmed">
							Diperbarui:{" "}
							{lastUpdated.toLocaleTimeString("id-ID")} · auto-refresh 30s
						</Text>
					)}
				</Stack>
				<Tooltip label="Refresh sekarang">
					<ActionIcon
						variant="light"
						size="lg"
						onClick={() => {
							setLoading(true);
							fetchHealth();
						}}
						loading={loading}
					>
						<IconRefresh size={18} />
					</ActionIcon>
				</Tooltip>
			</Group>

			<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="xl">
				<StatusCard
					title="PostgreSQL"
					icon={<IconDatabase size={18} />}
					ok={health?.db.ok ?? false}
					latencyMs={health?.db.latencyMs ?? null}
					loading={loading}
				/>
				<StatusCard
					title="Desa API"
					icon={
						health?.desaApi.ok ? (
							<IconCloudCheck size={18} />
						) : (
							<IconCloudX size={18} />
						)
					}
					ok={health?.desaApi.ok ?? false}
					latencyMs={health?.desaApi.latencyMs ?? null}
					loading={loading}
				/>
				<StatusCard
					title="NOC API"
					icon={
						health?.nocApi.ok ? (
							<IconCloudCheck size={18} />
						) : (
							<IconCloudX size={18} />
						)
					}
					ok={health?.nocApi.ok ?? false}
					latencyMs={health?.nocApi.latencyMs ?? null}
					loading={loading}
				/>
				<StatusCard
					title="Last Sync"
					icon={<IconRotateClockwise size={18} />}
					ok={health?.lastSync?.status === "success"}
					latencyMs={null}
					extra={syncExtra}
					loading={loading}
				/>
			</SimpleGrid>

			<Card withBorder p="lg" radius="md">
				<Group justify="space-between" mb="md">
					<Group gap="xs">
						<IconActivity size={18} />
						<Title order={4}>Latency History</Title>
					</Group>
					<Text size="xs" c="dimmed">
						{history.length} titik data (maks {MAX_HISTORY})
					</Text>
				</Group>

				{history.length < 2 ? (
					<Stack align="center" py="xl" gap="xs">
						<IconActivity
							size={40}
							stroke={1.2}
							color="var(--mantine-color-dimmed)"
						/>
						<Text c="dimmed" size="sm">
							Mengumpulkan data latency...
						</Text>
						<Text c="dimmed" size="xs">
							Minimal 2 titik data diperlukan untuk menampilkan grafik
						</Text>
					</Stack>
				) : (
					<Box style={{ minWidth: 0, width: "100%" }}>
						<AreaChart
							h={220}
							data={history}
							dataKey="time"
							series={[
								{ name: "db", color: "orange.6", label: "Database (ms)" },
								{ name: "desaApi", color: "blue.5", label: "Desa API (ms)" },
								{ name: "nocApi", color: "green.5", label: "NOC API (ms)" },
							]}
							connectNulls={false}
							withDots={history.length <= 10}
							withLegend
							curveType="monotone"
							gridAxis="xy"
							tooltipAnimationDuration={150}
							yAxisProps={{ tickCount: 5 }}
							xAxisProps={{
								tick: { fontSize: 11 },
								interval: Math.max(0, Math.floor(history.length / 6) - 1),
							}}
						/>
					</Box>
				)}
			</Card>
		</Container>
	);
}
