import { Grid, GridCol, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import { useTranslate } from "@/hooks/useTranslate";
import { Beasiswa } from "./sosial/beasiswa";
import { EventCalendar } from "./sosial/event-calendar";
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

const SosialPage = () => {
	const t = useTranslate();
	const [kesehatanStats, setKesehatanStats] = useState<KesehatanStats | null>(
		null,
	);
	const [posyandus, setPosyandus] = useState<PosyanduForCount[] | null>(null);

	useEffect(() => {
		async function fetchData() {
			try {
				const [kesehatanRes, posyanduRes] = await Promise.all([
					fetch(`${DESA_API}/api/kesehatan/ringkasankesehatan/stats`),
					fetch(`${DESA_API}/api/kesehatan/posyandu/find-many`),
				]);
				const [kesehatan, posyandu] = await Promise.all([
					kesehatanRes.json(),
					posyanduRes.json(),
				]);
				if (kesehatan.success) setKesehatanStats(kesehatan.data);
				if (posyandu.success)
					setPosyandus(
						(posyandu.data as PosyanduForCount[]).filter((p) => p.isActive),
					);
			} catch {
				// ignore
			}
		}
		fetchData();
	}, []);

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
			<SummaryCards data={summaryData} />

			<Grid gutter="md">
				<GridCol span={{ base: 12, lg: 6 }}>
					<HealthStats data={healthData} />
				</GridCol>
				<GridCol span={{ base: 12, lg: 6 }}>
					<PosyanduSchedule />
				</GridCol>
			</Grid>

			<Grid gutter="md">
				<GridCol span={{ base: 12, lg: 6 }}>
					<Pendidikan />
				</GridCol>
				<GridCol span={{ base: 12, lg: 6 }}>
					<Beasiswa />
				</GridCol>
			</Grid>

			<EventCalendar />
		</Stack>
	);
};

export default SosialPage;
