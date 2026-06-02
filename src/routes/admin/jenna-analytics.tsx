import {
	Alert,
	Badge,
	Box,
	Card,
	Container,
	Group,
	LoadingOverlay,
	NumberInput,
	Select,
	SimpleGrid,
	Stack,
	Table,
	Text,
	Title,
} from "@mantine/core";
import {
	IconAlertTriangle,
	IconBrain,
	IconClock,
	IconCurrencyDollar,
	IconUsers,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { protectedRouteMiddleware } from "../../middleware/authMiddleware";

export const Route = createFileRoute("/admin/jenna-analytics")({
	beforeLoad: protectedRouteMiddleware,
	component: JennaAnalyticsPage,
});

interface DailyUsage {
	date: string;
	cost: number;
	count: number;
}

interface TopUser {
	userId: string | null;
	name: string;
	email: string;
	totalCost: number;
	totalInputTokens: number;
	totalOutputTokens: number;
	requestCount: number;
}

interface JennaStats {
	month: number;
	year: number;
	totalCost: number;
	avgResponseTime: number;
	dailyUsage: DailyUsage[];
	topUsers: TopUser[];
	dailyCostLimit: number;
	todayCost: number;
	dailyLimitExceeded: boolean;
}

const MONTHS = [
	{ value: "1", label: "Januari" },
	{ value: "2", label: "Februari" },
	{ value: "3", label: "Maret" },
	{ value: "4", label: "April" },
	{ value: "5", label: "Mei" },
	{ value: "6", label: "Juni" },
	{ value: "7", label: "Juli" },
	{ value: "8", label: "Agustus" },
	{ value: "9", label: "September" },
	{ value: "10", label: "Oktober" },
	{ value: "11", label: "November" },
	{ value: "12", label: "Desember" },
];

function formatCost(val: number) {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	}).format(val);
}

function StatCard({
	icon: Icon,
	label,
	value,
	color,
}: {
	icon: React.FC<{ size?: number; stroke?: number }>;
	label: string;
	value: string;
	color: string;
}) {
	return (
		<Card withBorder radius="md" p="lg">
			<Group gap="sm" mb="xs">
				<Box
					style={{
						background: `var(--mantine-color-${color}-1)`,
						borderRadius: "50%",
						padding: 8,
						display: "flex",
					}}
				>
					<Icon size={20} stroke={1.5} />
				</Box>
				<Text size="sm" c="dimmed">
					{label}
				</Text>
			</Group>
			<Text fw={700} size="xl">
				{value}
			</Text>
		</Card>
	);
}

function JennaAnalyticsPage() {
	const now = new Date();
	const [month, setMonth] = useState(String(now.getMonth() + 1));
	const [year, setYear] = useState(now.getFullYear());
	const [stats, setStats] = useState<JennaStats | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchStats = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const params = new URLSearchParams({ month, year: String(year) });
			const res = await fetch(`/api/admin/jenna/stats?${params}`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error("Gagal memuat data");
			const json = (await res.json()) as JennaStats;
			setStats(json);
		} catch {
			setError("Gagal memuat statistik Jenna");
		} finally {
			setLoading(false);
		}
	}, [month, year]);

	useEffect(() => {
		fetchStats();
	}, [fetchStats]);

	return (
		<Container size="xl" py="xl">
			<Group justify="space-between" mb="lg">
				<Stack gap={2}>
					<Title order={2}>Jenna Analytics</Title>
					<Text size="sm" c="dimmed">
						Statistik penggunaan asisten virtual Jenna
					</Text>
				</Stack>
				<Badge
					size="lg"
					variant="outline"
					color="violet"
					leftSection={<IconBrain size={14} />}
				>
					AI Usage
				</Badge>
			</Group>

			{/* Month/Year Filter */}
			<Group mb="lg" gap="sm">
				<Select
					label="Bulan"
					data={MONTHS}
					value={month}
					onChange={(v) => v && setMonth(v)}
					w={160}
				/>
				<NumberInput
					label="Tahun"
					value={year}
					onChange={(v) => typeof v === "number" && setYear(v)}
					min={2024}
					max={now.getFullYear()}
					w={120}
					allowDecimal={false}
				/>
			</Group>

			{/* Daily Limit Alert */}
			{stats?.dailyLimitExceeded && (
				<Alert
					icon={<IconAlertTriangle size={16} />}
					color="red"
					variant="filled"
					mb="md"
					title="Batas Biaya Harian Terlampaui"
				>
					Biaya hari ini ({formatCost(stats.todayCost)}) melebihi batas harian
					yang ditetapkan ({formatCost(stats.dailyCostLimit)}). Harap periksa
					penggunaan Jenna.
				</Alert>
			)}

			{/* Approaching Limit Warning */}
			{stats &&
				!stats.dailyLimitExceeded &&
				stats.dailyCostLimit > 0 &&
				stats.todayCost >= stats.dailyCostLimit * 0.8 && (
					<Alert
						icon={<IconAlertTriangle size={16} />}
						color="orange"
						variant="light"
						mb="md"
						title="Mendekati Batas Biaya Harian"
					>
						Biaya hari ini ({formatCost(stats.todayCost)}) sudah mencapai 80%
						dari batas harian ({formatCost(stats.dailyCostLimit)}).
					</Alert>
				)}

			{error && (
				<Alert color="red" mb="md">
					{error}
				</Alert>
			)}

			<div style={{ position: "relative" }}>
				<LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />

				{/* Stat Cards */}
				<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="lg">
					<StatCard
						icon={IconCurrencyDollar}
						label="Total Biaya Bulan Ini"
						value={stats ? formatCost(stats.totalCost) : "-"}
						color="green"
					/>
					<StatCard
						icon={IconCurrencyDollar}
						label="Biaya Hari Ini"
						value={stats ? formatCost(stats.todayCost) : "-"}
						color="orange"
					/>
					<StatCard
						icon={IconClock}
						label="Avg. Response Time"
						value={stats ? `${stats.avgResponseTime} ms` : "-"}
						color="blue"
					/>
					<StatCard
						icon={IconUsers}
						label="Total Request"
						value={
							stats
								? String(stats.dailyUsage.reduce((s, d) => s + d.count, 0))
								: "-"
						}
						color="violet"
					/>
				</SimpleGrid>

				{/* Daily Usage Chart */}
				<Card withBorder radius="md" p="lg" mb="lg">
					<Text fw={600} mb="md">
						Grafik Biaya Harian
					</Text>
					{stats && stats.dailyUsage.length > 0 ? (
						<ResponsiveContainer width="100%" height={280}>
							<LineChart
								data={stats.dailyUsage}
								margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="var(--mantine-color-default-border)"
								/>
								<XAxis
									dataKey="date"
									tick={{ fontSize: 11 }}
									tickFormatter={(v: string) =>
										new Date(v).toLocaleDateString("id-ID", {
											day: "2-digit",
											month: "short",
										})
									}
								/>
								<YAxis
									tick={{ fontSize: 11 }}
									tickFormatter={(v: number) =>
										new Intl.NumberFormat("id-ID", {
											notation: "compact",
											compactDisplay: "short",
										}).format(v)
									}
								/>
								<Tooltip
									formatter={(value: number) => [formatCost(value), "Biaya"]}
									labelFormatter={(label: string) =>
										new Date(label).toLocaleDateString("id-ID", {
											weekday: "long",
											day: "numeric",
											month: "long",
											year: "numeric",
										})
									}
								/>
								<Line
									type="monotone"
									dataKey="cost"
									stroke="var(--mantine-color-violet-6)"
									strokeWidth={2}
									dot={{ r: 3 }}
									activeDot={{ r: 5 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					) : (
						<Stack align="center" py="xl">
							<IconBrain
								size={48}
								stroke={1.2}
								color="var(--mantine-color-dimmed)"
							/>
							<Text c="dimmed" size="sm">
								Belum ada data penggunaan bulan ini
							</Text>
						</Stack>
					)}
				</Card>

				{/* Top 10 Users Table */}
				<Card withBorder radius="md" p="lg">
					<Text fw={600} mb="md">
						Top 10 Pengguna Berdasarkan Biaya
					</Text>
					{stats && stats.topUsers.length > 0 ? (
						<Table
							striped
							highlightOnHover
							verticalSpacing="sm"
							withTableBorder
						>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>#</Table.Th>
									<Table.Th>Pengguna</Table.Th>
									<Table.Th>Request</Table.Th>
									<Table.Th>Input Token</Table.Th>
									<Table.Th>Output Token</Table.Th>
									<Table.Th>Total Biaya</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{stats.topUsers.map((u, i) => (
									<Table.Tr key={u.userId ?? `anon-${i}`}>
										<Table.Td>
											<Text size="sm" c="dimmed">
												{i + 1}
											</Text>
										</Table.Td>
										<Table.Td>
											<Text size="sm" fw={500}>
												{u.name}
											</Text>
											<Text size="xs" c="dimmed">
												{u.email}
											</Text>
										</Table.Td>
										<Table.Td>
											<Badge variant="light" color="blue" size="sm">
												{u.requestCount}
											</Badge>
										</Table.Td>
										<Table.Td>
											<Text size="sm">
												{u.totalInputTokens.toLocaleString("id-ID")}
											</Text>
										</Table.Td>
										<Table.Td>
											<Text size="sm">
												{u.totalOutputTokens.toLocaleString("id-ID")}
											</Text>
										</Table.Td>
										<Table.Td>
											<Text size="sm" fw={600} c="green">
												{formatCost(u.totalCost)}
											</Text>
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					) : (
						<Stack align="center" py="xl">
							<IconUsers
								size={48}
								stroke={1.2}
								color="var(--mantine-color-dimmed)"
							/>
							<Text c="dimmed" size="sm">
								Belum ada data pengguna bulan ini
							</Text>
						</Stack>
					)}
				</Card>
			</div>
		</Container>
	);
}
