import { Alert, Button, Card, Grid, Skeleton, Stack } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { apiClient } from "@/utils/api-client";
import { ActivityCard } from "./kinerja-divisi/activity-card";
import { DiscussionPanel } from "./kinerja-divisi/discussion-panel";
import { DivisionList } from "./kinerja-divisi/division-list";
import { DocumentChart } from "./kinerja-divisi/document-chart";
import { EventCard } from "./kinerja-divisi/event-card";
import { ProgressChart } from "./kinerja-divisi/progress-chart";

interface Activity {
	id: string;
	title: string;
	createdAt: string;
	progress: number;
	status: "SELESAI" | "BERJALAN" | "TERTUNDA";
}

interface KinerjaOverview {
	activities: Activity[];
}

async function fetchKinerjaOverview(): Promise<KinerjaOverview> {
	const res = await apiClient.GET("/api/noc/latest-projects", {
		params: { query: { idDesa: "desa1", limit: "10" } },
	});
	return { activities: (res.data?.data as Activity[]) ?? [] };
}

const EMPTY_OVERVIEW: KinerjaOverview = { activities: [] };

const KinerjaDivisi = () => {
	const t = useTranslate();
	const dark = useIsDark();

	const {
		data = EMPTY_OVERVIEW,
		isLoading: loading,
		isError,
		refetch,
	} = useApiQuery(["kinerja", "overview"], fetchKinerjaOverview, {
		autoRefresh: true,
	});
	const { activities } = data;
	const error = isError
		? "Gagal memuat data kinerja divisi. Periksa koneksi dan coba lagi."
		: null;

	return (
		<Stack gap="lg">
			{error && (
				<Alert
					icon={<IconAlertCircle size={16} />}
					color="red"
					title="Gagal memuat data"
					radius="md"
				>
					{error}
					<Button
						size="xs"
						variant="light"
						color="red"
						leftSection={<IconRefresh size={14} />}
						onClick={() => refetch()}
						mt="xs"
					>
						Coba lagi
					</Button>
				</Alert>
			)}

			{/* SECTION 1 — PROGRAM KEGIATAN */}
			<Grid gutter="md">
				{loading ? (
					Array.from({ length: 4 }).map((_, i) => (
						<Grid.Col key={i} span={{ base: 12, md: 6, lg: 3 }}>
							<Skeleton height={160} radius="xl" />
						</Grid.Col>
					))
				) : (
					<>
						{activities.slice(0, 4).map((kegiatan) => (
							<Grid.Col key={kegiatan.id} span={{ base: 12, md: 6, lg: 3 }}>
								<ActivityCard
									title={kegiatan.title}
									date={dayjs(kegiatan.createdAt).format("D MMMM YYYY")}
									progress={kegiatan.progress}
									status={kegiatan.status}
								/>
							</Grid.Col>
						))}
						{activities.length === 0 && (
							<Grid.Col span={12}>
								<Card
									p="md"
									radius="xl"
									withBorder
									ta="center"
									c="dimmed"
									bg={dark ? "#1F293A" : undefined}
								>
									{t.kinerjaDivisi.tidakAdaAktivitas}
								</Card>
							</Grid.Col>
						)}
					</>
				)}
			</Grid>

			{/* SECTION 2 — GRID DASHBOARD (3 Columns) */}
			<Grid gutter="lg">
				{/* Left Column - Division List */}
				<Grid.Col span={{ base: 12, lg: 3 }}>
					{loading ? <Skeleton height={400} radius="xl" /> : <DivisionList />}
				</Grid.Col>

				{/* Middle Column - Document Chart */}
				<Grid.Col span={{ base: 12, lg: 5 }}>
					{loading ? <Skeleton height={400} radius="xl" /> : <DocumentChart />}
				</Grid.Col>

				{/* Right Column - Progress Chart */}
				<Grid.Col span={{ base: 12, lg: 4 }}>
					{loading ? <Skeleton height={400} radius="xl" /> : <ProgressChart />}
				</Grid.Col>
			</Grid>

			{/* SECTION 3 — DISCUSSION PANEL */}
			{loading ? <Skeleton height={200} radius="xl" /> : <DiscussionPanel />}

			{/* SECTION 4 — ACARA HARI INI */}
			{loading ? <Skeleton height={180} radius="xl" /> : <EventCard />}
		</Stack>
	);
};

export default KinerjaDivisi;
