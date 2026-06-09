import { Alert, Button, Card, Grid, Skeleton, Stack } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAksesPrefs } from "@/hooks/useAksesPrefs";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
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

const KinerjaDivisi = () => {
	const t = useTranslate();
	const { izinExportData } = useAksesPrefs();
	const [activities, setActivities] = useState<Activity[]>([]);
	const [todayEvents, setTodayEvents] = useState<EventData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const [activityRes, eventRes] = await Promise.all([
				apiClient.GET("/api/noc/latest-projects", {
					params: { query: { idDesa: "desa1", limit: "10" } },
				}),
				apiClient.GET("/api/event/today"),
			]);

			if (activityRes.data?.data) {
				setActivities(activityRes.data.data as Activity[]);
			}
			if (eventRes.data?.data) {
				setTodayEvents(eventRes.data.data as EventData[]);
			}
		} catch (err) {
			console.error("Failed to fetch performance data from NOC", err);
			setError(
				"Gagal memuat data kinerja divisi. Periksa koneksi dan coba lagi.",
			);
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchRef = useRef(fetchData);
	useEffect(() => {
		fetchRef.current = fetchData;
	}, [fetchData]);

	const handleForceRefresh = useCallback(async () => {
		await fetchRef.current();
	}, []);

	useEffect(() => {
		handleForceRefresh();
	}, [handleForceRefresh]);

	useAutoRefresh(handleForceRefresh);

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

	const handleExport = () => {
		const a = document.createElement("a");
		a.href = "/api/noc/export-activities?idDesa=desa1";
		a.download = `kinerja-divisi-${new Date().toISOString().slice(0, 10)}.pdf`;
		a.click();
	};

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
						onClick={fetchData}
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
