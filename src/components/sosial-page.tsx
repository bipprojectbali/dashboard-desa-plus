import { Alert, Button, Grid, GridCol, Skeleton, Stack } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useTranslate } from "@/hooks/useTranslate";
import { Beasiswa } from "./sosial/beasiswa";
import { EventCalendar } from "./sosial/event-calendar";
import { HealthRecords } from "./sosial/health-records";
import { HealthStats } from "./sosial/health-stats";
import { Pendidikan } from "./sosial/pendidikan";
import { PosyanduSchedule } from "./sosial/posyandu-schedule";
import { SummaryCards } from "./sosial/summary-cards";

interface KesehatanStats {
	ibuHamilAktif: number;
	balitaTerdaftar: number;
	alertStunting: number;
	imunisasiLengkapPct: number;
	pemeriksaanRutinPct: number;
	giziBaikPct: number;
	targetStuntingPct: number;
}

interface PosyanduForCount {
	isActive: boolean;
}

interface EventBudaya {
	id: string;
	nama: string;
	tanggal: string;
	lokasi: string;
}

interface SosialPageData {
	kesehatanStats: KesehatanStats | null;
	posyandus: PosyanduForCount[] | null;
	events: EventBudaya[] | null;
}

async function fetchSosialData(): Promise<SosialPageData> {
	const [kesehatanRes, posyanduRes, eventsRes] = await Promise.all([
		fetch("/api/sosial/kesehatan/stats"),
		fetch("/api/sosial/posyandu/find-many"),
		fetch("/api/sosial/event-budaya/find-upcoming"),
	]);
	const [kesehatan, posyandu, eventBudaya] = await Promise.all([
		kesehatanRes.json(),
		posyanduRes.json(),
		eventsRes.json(),
	]);

	return {
		kesehatanStats: kesehatan.success ? kesehatan.data : null,
		posyandus: posyandu.success
			? (posyandu.data as PosyanduForCount[]).filter((p) => p.isActive)
			: null,
		events: eventBudaya.success ? eventBudaya.data : null,
	};
}

const EMPTY_SOSIAL: SosialPageData = {
	kesehatanStats: null,
	posyandus: null,
	events: null,
};

const SosialPage = () => {
	const t = useTranslate();

	const {
		data = EMPTY_SOSIAL,
		isLoading: loading,
		isError,
		refetch,
	} = useApiQuery(["sosial", "page"], fetchSosialData, { autoRefresh: true });
	const { kesehatanStats, posyandus, events } = data;
	const error = isError
		? "Gagal memuat data sosial. Periksa koneksi dan coba lagi."
		: null;

	// Refresh manual: bust server cache lalu ambil ulang (hanya saat user klik).
	const handleForceRefresh = async () => {
		try {
			await fetch("/api/sosial/cache-invalidate", { method: "POST" });
		} catch {
			// lanjut fetch meskipun invalidate gagal
		}
		await refetch();
	};

	const summaryData = kesehatanStats
		? {
				ibuHamil: kesehatanStats.ibuHamilAktif,
				balita: kesehatanStats.balitaTerdaftar,
				alertStunting: kesehatanStats.alertStunting,
				posyanduAktif: posyandus ? posyandus.length : 0,
			}
		: undefined;

	const healthData = kesehatanStats
		? [
				{
					label: t.sosial.imunisasiLengkap,
					value: kesehatanStats.imunisasiLengkapPct,
					color: "green",
				},
				{
					label: t.sosial.pemeriksaanRutin,
					value: kesehatanStats.pemeriksaanRutinPct,
					color: "blue",
				},
				{
					label: t.sosial.giziBaik,
					value: kesehatanStats.giziBaikPct,
					color: "teal",
				},
				{
					label: t.sosial.targetStunting,
					value: kesehatanStats.targetStuntingPct,
					color: "red",
				},
			]
		: undefined;

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
						onClick={handleForceRefresh}
						mt="xs"
					>
						Coba lagi
					</Button>
				</Alert>
			)}

			{loading ? (
				<Skeleton height={120} radius="xl" />
			) : (
				<SummaryCards data={summaryData} />
			)}

			<Grid gutter="md">
				<GridCol span={{ base: 12, lg: 6 }}>
					{loading ? (
						<Skeleton height={200} radius="xl" />
					) : (
						<HealthStats data={healthData} />
					)}
				</GridCol>
				<GridCol span={{ base: 12, lg: 6 }}>
					{loading ? (
						<Skeleton height={200} radius="xl" />
					) : (
						<PosyanduSchedule />
					)}
				</GridCol>
			</Grid>

			<Grid gutter="md">
				<GridCol span={{ base: 12, lg: 6 }}>
					{loading ? <Skeleton height={200} radius="xl" /> : <Pendidikan />}
				</GridCol>
				<GridCol span={{ base: 12, lg: 6 }}>
					{loading ? <Skeleton height={200} radius="xl" /> : <Beasiswa />}
				</GridCol>
			</Grid>

			{loading ? (
				<Skeleton height={300} radius="xl" />
			) : (
				<EventCalendar data={events ?? undefined} />
			)}

			<HealthRecords />
		</Stack>
	);
};

export default SosialPage;
