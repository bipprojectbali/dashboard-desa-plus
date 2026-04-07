import { Card, Grid, Stack } from "@mantine/core";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { apiClient } from "@/utils/api-client";
import { ActivityCard } from "./kinerja-divisi/activity-card";
import { ArchiveCard } from "./kinerja-divisi/archive-card";
import { DiscussionPanel } from "./kinerja-divisi/discussion-panel";
import { DivisionList } from "./kinerja-divisi/division-list";
import { DocumentChart } from "./kinerja-divisi/document-chart";
import { EventCard } from "./kinerja-divisi/event-card";
import { ProgressChart } from "./kinerja-divisi/progress-chart";

// Data for arsip digital (Section 5)
const archiveData = [
	{ name: "Surat Keputusan" },
	{ name: "Dokumentasi" },
	{ name: "Laporan Keuangan" },
	{ name: "Notulensi Rapat" },
];

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
	const [activities, setActivities] = useState<Activity[]>([]);
	const [todayEvents, setTodayEvents] = useState<EventData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
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
			} catch (error) {
				console.error("Failed to fetch performance data from NOC", error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	// Format events for EventCard
	const formattedEvents = todayEvents.map((event) => ({
		time: dayjs(event.startDate).format("HH:mm"),
		event: event.title,
	}));

	return (
		<Stack gap={"md"}>
			{/* SECTION 1 — PROGRAM KEGIATAN */}
			<Grid gutter={{ base: "xs", md: "md" }}>
				{activities.slice(0, 4).map((kegiatan) => (
					<Grid.Col key={kegiatan.id} span={{ base: 12, sm: 6, lg: 3 }}>
						<ActivityCard
							title={kegiatan.title}
							date={dayjs(kegiatan.createdAt).format("D MMMM YYYY")}
							progress={kegiatan.progress}
							status={
								kegiatan.status === "SELESAI"
									? "Selesai"
									: kegiatan.status === "BERJALAN"
										? "Berjalan"
										: "Tertunda"
							}
						/>
					</Grid.Col>
				))}
				{!loading && activities.length === 0 && (
					<Grid.Col span={12}>
						<Card p="md" radius="xl" withBorder ta="center" c="dimmed">
							Tidak ada aktivitas terbaru
						</Card>
					</Grid.Col>
				)}
			</Grid>

			{/* SECTION 2 — GRID DASHBOARD (3 Columns) */}
			<Grid gutter={{ base: "xs", md: "lg" }}>
				{/* Left Column - Division List */}
				<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
					<DivisionList />
				</Grid.Col>

				{/* Middle Column - Document Chart */}
				<Grid.Col span={{ base: 12, md: 6, lg: 5 }}>
					<DocumentChart />
				</Grid.Col>

				{/* Right Column - Progress Chart */}
				<Grid.Col span={{ base: 12, md: 12, lg: 4 }}>
					<ProgressChart />
				</Grid.Col>
			</Grid>

			{/* SECTION 3 — DISCUSSION PANEL */}
			<DiscussionPanel />

			{/* SECTION 4 — ACARA HARI INI */}
			<EventCard agendas={formattedEvents} />

			{/* SECTION 5 — ARSIP DIGITAL PERANGKAT DESA */}
			<Grid gutter={{ base: "xs", md: "md" }}>
				{archiveData.map((item) => (
					<Grid.Col key={item.name} span={{ base: 12, sm: 6 }}>
						<ArchiveCard item={item} />
					</Grid.Col>
				))}
			</Grid>
		</Stack>
	);
};

export default KinerjaDivisi;
