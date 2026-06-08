import {
	Alert,
	Button,
	Grid,
	GridCol,
	Group,
	Skeleton,
	Stack,
} from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
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

const SosialPage = () => {
	const t = useTranslate();
	const [kesehatanStats, setKesehatanStats] = useState<KesehatanStats | null>(
		null,
	);
	const [posyandus, setPosyandus] = useState<PosyanduForCount[] | null>(null);
	const [events, setEvents] = useState<EventBudaya[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
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
			if (kesehatan.success) setKesehatanStats(kesehatan.data);
			if (posyandu.success)
				setPosyandus(
					(posyandu.data as PosyanduForCount[]).filter((p) => p.isActive),
				);
			if (eventBudaya.success) setEvents(eventBudaya.data);
		} catch (err) {
			console.error("Failed to fetch sosial data", err);
			setError("Gagal memuat data sosial. Periksa koneksi dan coba lagi.");
		} finally {
			setLoading(false);
		}
	}, []);

	const handleForceRefresh = useCallback(async () => {
		try {
			await fetch("/api/sosial/cache-invalidate", { method: "POST" });
		} catch {
			// lanjut fetch meskipun invalidate gagal
		}
		await fetchData();
	}, [fetchData]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useAutoRefresh(fetchData);

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
			<Group justify="flex-end">
				<Button
					variant="subtle"
					size="xs"
					leftSection={<IconRefresh size={14} />}
					onClick={fetchData}
					loading={loading}
				>
					Refresh
				</Button>
				<Button
					variant="light"
					size="xs"
					color="orange"
					leftSection={<IconRefresh size={14} />}
					onClick={handleForceRefresh}
					loading={loading}
					title="Hapus cache dan ambil data terbaru dari sumber"
				>
					Paksa Refresh
				</Button>
			</Group>
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
