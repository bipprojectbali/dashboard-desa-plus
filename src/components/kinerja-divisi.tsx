import { Alert, Button, Card, Grid, Skeleton, Stack } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useTranslate } from "@/hooks/useTranslate";
import { apiClient } from "@/utils/api-client";
import { ActivityCard } from "./kinerja-divisi/activity-card";
import { ArchiveCard } from "./kinerja-divisi/archive-card";
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

interface EventData {
	id: string;
	title: string;
	startDate: string;
}

interface KinerjaOverview {
	activities: Activity[];
	todayEvents: EventData[];
}

async function fetchKinerjaOverview(): Promise<KinerjaOverview> {
	const [activityRes, eventRes] = await Promise.all([
		apiClient.GET("/api/noc/latest-projects", {
			params: { query: { idDesa: "desa1", limit: "10" } },
		}),
		apiClient.GET("/api/event/today"),
	]);

	return {
		activities: (activityRes.data?.data as Activity[]) ?? [],
		todayEvents: (eventRes.data?.data as EventData[]) ?? [],
	};
}

const EMPTY_OVERVIEW: KinerjaOverview = { activities: [], todayEvents: [] };

const KinerjaDivisi = () => {
	const t = useTranslate();

	const {
		data = EMPTY_OVERVIEW,
		isLoading: loading,
		isError,
		refetch,
	} = useApiQuery(["kinerja", "overview"], fetchKinerjaOverview, {
		autoRefresh: true,
	});
	const { activities, todayEvents } = data;
	const error = isError
		? "Gagal memuat data kinerja divisi. Periksa koneksi dan coba lagi."
		: null;

	const formattedEvents = todayEvents.map((event) => ({
		time: dayjs(event.startDate).format("HH:mm"),
		event: event.title,
	}));

	const archiveData = [
		{ name: t.kinerjaDivisi.suratKeputusan },
		{ name: t.kinerjaDivisi.dokumentasi },
		{ name: t.kinerjaDivisi.laporanKeuangan },
		{ name: t.kinerjaDivisi.notulensiRapat },
	];

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
								<Card p="md" radius="xl" withBorder ta="center" c="dimmed">
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
			{loading ? (
				<Skeleton height={180} radius="xl" />
			) : formattedEvents.length > 0 ? (
				<EventCard agendas={formattedEvents} />
			) : (
				<Card p="md" radius="xl" withBorder ta="center" c="dimmed">
					Tidak ada acara hari ini.
				</Card>
			)}

			{/* SECTION 5 — ARSIP DIGITAL PERANGKAT DESA */}
			<Grid gutter="md">
				{archiveData.map((item) => (
					<Grid.Col key={item.name} span={{ base: 12, md: 6 }}>
						<ArchiveCard item={item} />
					</Grid.Col>
				))}
			</Grid>
		</Stack>
	);
};

export default KinerjaDivisi;
