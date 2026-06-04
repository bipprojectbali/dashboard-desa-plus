import { Alert, Button, Grid, GridCol, Skeleton, Stack } from "@mantine/core";
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

const DESA_API =
	typeof import.meta.env !== "undefined" && import.meta.env?.VITE_DESA_API_URL
		? import.meta.env.VITE_DESA_API_URL
		: "https://desa-darmasaba-stg.wibudev.com";

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
				fetch(`${DESA_API}/api/kesehatan/ringkasankesehatan/stats`),
				fetch(`${DESA_API}/api/kesehatan/posyandu/find-many`),
				fetch(`${DESA_API}/api/desa/eventbudaya/find-upcoming`),
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
