import { Grid, Stack } from "@mantine/core";
import { ActivityCard } from "./kinerja-divisi/activity-card";
import { ArchiveCard } from "./kinerja-divisi/archive-card";
import { DiscussionPanel } from "./kinerja-divisi/discussion-panel";
import { DivisionList } from "./kinerja-divisi/division-list";
import { DocumentChart } from "./kinerja-divisi/document-chart";
import { EventCard } from "./kinerja-divisi/event-card";
import { ProgressChart } from "./kinerja-divisi/progress-chart";

// Data for program kegiatan (Section 1)
const programKegiatanData = [
	{
		title: "Rakor 2025",
		date: "3 Juli 2025",
		progress: 90,
		status: "Selesai" as const,
	},
	{
		title: "Pemutakhiran Indeks Desa",
		date: "3 Juli 2025",
		progress: 85,
		status: "Selesai" as const,
	},
	{
		title: "Mengurus Akta Cerai Warga",
		date: "3 Juli 2025",
		progress: 80,
		status: "Selesai" as const,
	},
	{
		title: "Pasek 7 Desa Adat",
		date: "3 Juli 2025",
		progress: 92,
		status: "Selesai" as const,
	},
];

// Data for arsip digital (Section 5)
const archiveData = [
	{ name: "Surat Keputusan" },
	{ name: "Dokumentasi" },
	{ name: "Laporan Keuangan" },
	{ name: "Notulensi Rapat" },
];

const KinerjaDivisi = () => {
	return (
		<Stack gap="lg">
			{/* SECTION 1 — PROGRAM KEGIATAN */}
			<Grid gutter="md">
				{programKegiatanData.map((kegiatan, index) => (
					<Grid.Col key={index} span={{ base: 12, md: 6, lg: 3 }}>
						<ActivityCard
							title={kegiatan.title}
							date={kegiatan.date}
							progress={kegiatan.progress}
							status={kegiatan.status}
						/>
					</Grid.Col>
				))}
			</Grid>

			{/* SECTION 2 — GRID DASHBOARD (3 Columns) */}
			<Grid gutter="lg">
				{/* Left Column - Division List */}
				<Grid.Col span={{ base: 12, lg: 3 }}>
					<DivisionList />
				</Grid.Col>

				{/* Middle Column - Document Chart */}
				<Grid.Col span={{ base: 12, lg: 5 }}>
					<DocumentChart />
				</Grid.Col>

				{/* Right Column - Progress Chart */}
				<Grid.Col span={{ base: 12, lg: 4 }}>
					<ProgressChart />
				</Grid.Col>
			</Grid>

			{/* SECTION 3 — DISCUSSION PANEL */}
			<DiscussionPanel />

			{/* SECTION 4 — ACARA HARI INI */}
			<EventCard />

			{/* SECTION 5 — ARSIP DIGITAL PERANGKAT DESA */}
			<Grid gutter="md">
				{archiveData.map((item, index) => (
					<Grid.Col key={index} span={{ base: 12, md: 6 }}>
						<ArchiveCard item={item} />
					</Grid.Col>
				))}
			</Grid>
		</Stack>
	);
};

export default KinerjaDivisi;
