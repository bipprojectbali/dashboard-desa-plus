import { BarChart } from "@mantine/charts";
import { SimpleGrid, Stack, Text } from "@mantine/core";
import {
	IconCalendarEvent,
	IconCheck,
	IconFileText,
	IconUsers,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import type { WallBeranda, WallBerandaKpiTile } from "@/types/wall";
import { DonutBody } from "../donut-body";
import { StatRow } from "../stat-row";
import { WALL_CATEGORICAL, WALL_THEME } from "../wall-theme";
import { KeuanganSdgsBody } from "./keuangan";

// ── KPI ──────────────────────────────────────────────────────────────────────

interface TileIcon {
	Icon: ComponentType<{ size?: number; color?: string }>;
	color: string;
}

const KPI_ICONS: TileIcon[] = [
	{ Icon: IconFileText, color: WALL_THEME.ACCENT },
	{ Icon: IconCalendarEvent, color: WALL_THEME.WARN },
	{ Icon: IconCheck, color: WALL_THEME.OK },
	{ Icon: IconUsers, color: WALL_THEME.VIOLET },
];

function KpiTile({ tile, icon }: { tile: WallBerandaKpiTile; icon: TileIcon }) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 14,
				background: WALL_THEME.CARD,
				border: `1px solid ${WALL_THEME.BORDER}`,
				borderLeft: `3px solid ${icon.color}`,
				borderRadius: 12,
				padding: "14px 18px",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					width: 38,
					height: 38,
					borderRadius: 10,
					background: `${icon.color}22`,
					flexShrink: 0,
				}}
			>
				<icon.Icon size={20} color={icon.color} />
			</div>
			<div style={{ minWidth: 0 }}>
				<Text
					fw={800}
					style={{ fontSize: 26, color: WALL_THEME.TEXT, lineHeight: 1.1 }}
				>
					{tile.value.toLocaleString("id-ID")}
				</Text>
				<Text
					size="xs"
					style={{ color: WALL_THEME.TEXT_DIM, whiteSpace: "nowrap" }}
				>
					{tile.label}
				</Text>
				<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }}>
					{tile.sublabel}
				</Text>
			</div>
		</div>
	);
}

/** 4 stat tile: Surat Minggu Ini, Pengaduan Aktif, Layanan Selesai, Total Penduduk. */
export function BerandaKpiBody({ data }: { data: WallBeranda["kpi"] }) {
	return (
		<SimpleGrid cols={2} spacing="sm" style={{ height: "100%" }}>
			{data.slice(0, 4).map((tile, i) => (
				<KpiTile
					key={tile.label}
					tile={tile}
					icon={KPI_ICONS[i % KPI_ICONS.length]!}
				/>
			))}
		</SimpleGrid>
	);
}

// ── SURAT TREND ───────────────────────────────────────────────────────────────

/** Tren pengajuan surat 7 bulan (bar). */
export function BerandaSuratTrendBody({
	data,
}: {
	data: WallBeranda["suratTrend"];
}) {
	return (
		<BarChart
			h="100%"
			data={data}
			dataKey="month"
			series={[{ name: "count", color: WALL_THEME.INFO }]}
			withLegend={false}
		/>
	);
}

// ── KEPUASAN ─────────────────────────────────────────────────────────────────

/** Tingkat kepuasan (donut + legenda). */
export function BerandaKepuasanBody({
	data,
}: {
	data: WallBeranda["kepuasan"];
}) {
	const rows = data.map((s) => ({
		name: s.category,
		value: s.value,
		color: s.color,
	}));
	return <DonutBody data={rows} unit="responden" />;
}

// ── DIVISI ───────────────────────────────────────────────────────────────────

/** Divisi teraktif (list bar kegiatan). */
export function BerandaDivisiBody({ data }: { data: WallBeranda["divisi"] }) {
	const max = Math.max(...data.map((d) => d.activityCount), 1);
	return (
		<Stack gap="sm" justify="center" style={{ height: "100%" }}>
			{data.slice(0, 7).map((d) => (
				<StatRow
					key={d.id}
					label={d.name}
					value={d.activityCount}
					color={WALL_THEME.ACCENT}
					fraction={d.activityCount / max}
					numeric
				/>
			))}
		</Stack>
	);
}

// ── KALENDER ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleDateString("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

/** Kalender kegiatan mendatang (daftar event). */
export function BerandaKalenderBody({
	data,
}: {
	data: WallBeranda["kalender"];
}) {
	return (
		<Stack gap="sm" style={{ height: "100%", overflowY: "auto" }}>
			{data.slice(0, 8).map((ev, i) => (
				<div
					key={ev.id}
					style={{
						borderLeft: `3px solid ${WALL_CATEGORICAL[i % WALL_CATEGORICAL.length]}`,
						paddingLeft: 10,
					}}
				>
					<Text
						size="sm"
						fw={600}
						style={{ color: WALL_THEME.TEXT, lineHeight: 1.3 }}
					>
						{ev.title}
					</Text>
					<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }}>
						{formatDate(ev.startDate)}
						{ev.divisi ? ` · ${ev.divisi}` : ""}
					</Text>
				</div>
			))}
		</Stack>
	);
}

// ── APBDES ───────────────────────────────────────────────────────────────────

/** Realisasi APBDes per kategori (StatRow dengan fraksi realisasi/anggaran). */
export function BerandaApbdesBody({ data }: { data: WallBeranda["apbdes"] }) {
	return (
		<Stack gap="md" justify="center" style={{ height: "100%" }}>
			{data.map((item) => (
				<div key={item.category}>
					<StatRow
						label={item.category}
						value={`${item.percentage.toFixed(1)}%`}
						color={item.color}
						fraction={item.anggaran > 0 ? item.realisasi / item.anggaran : 0}
					/>
					<Text
						size="xs"
						style={{
							color: WALL_THEME.TEXT_DIM,
							marginTop: 2,
							paddingLeft: 16,
						}}
					>
						Rp {item.realisasi.toLocaleString("id-ID")} /{" "}
						{item.anggaran.toLocaleString("id-ID")}
					</Text>
				</div>
			))}
		</Stack>
	);
}

// ── SDGS ─────────────────────────────────────────────────────────────────────

/**
 * Skor SDGs dari halaman beranda — reuse KeuanganSdgsBody karena shape identik:
 * `{ title, score, image }[]`. Tipe berbeda tapi struktural compatible.
 */
export function BerandaSdgsBody({ data }: { data: WallBeranda["sdgs"] }) {
	return <KeuanganSdgsBody data={data} />;
}
