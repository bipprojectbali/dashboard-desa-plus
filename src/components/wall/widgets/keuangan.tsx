import { LineChart } from "@mantine/charts";
import { Badge, Grid, Group, Stack, Text } from "@mantine/core";
import { formatM } from "@/components/keuangan/format";
import type { WallKeuangan } from "@/types/wall";
import { HorizontalBar } from "../horizontal-bar";
import { MoreIndicator } from "../more-indicator";
import { StatRow } from "../stat-row";
import type { WidgetGeom } from "../wall-bento";
import {
	LIST_ITEM_COMPACT_PX,
	LIST_ITEM_TALL_PX,
	maxVisibleItems,
} from "../wall-item-cap";
import { WALL_THEME } from "../wall-theme";

const BULAN = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"Mei",
	"Jun",
	"Jul",
	"Agu",
	"Sep",
	"Okt",
	"Nov",
	"Des",
];

/** 4 KPI ringkas: total APBDes, realisasi %, pemasukan, pengeluaran. */
export function KeuanganKpiBody({ data }: { data: WallKeuangan }) {
	const items = [
		{
			label: "Total APBDes",
			value: formatM(data.totalBudget),
			color: WALL_THEME.ACCENT,
		},
		{
			label: "Realisasi",
			value: `${data.realisasiPercent}%`,
			color: WALL_THEME.OK,
		},
		{
			label: "Pemasukan",
			value: formatM(data.totalIncomeReal),
			color: WALL_THEME.INFO,
		},
		{
			label: "Pengeluaran",
			value: formatM(data.totalExpenseReal),
			color: WALL_THEME.WARN,
		},
	];
	return (
		<Grid gutter="sm" style={{ height: "100%", alignContent: "center" }}>
			{items.map((item) => (
				<Grid.Col key={item.label} span={6}>
					<Stack gap={4} align="center">
						<Text
							size="xs"
							style={{ color: WALL_THEME.TEXT_DIM, textAlign: "center" }}
						>
							{item.label}
						</Text>
						<Text
							fw={800}
							style={{ fontSize: 26, color: item.color, lineHeight: 1 }}
						>
							{item.value}
						</Text>
					</Stack>
				</Grid.Col>
			))}
		</Grid>
	);
}

/** Arus kas bulanan: line income vs expense (12 titik). */
export function KeuanganArusBody({ data }: { data: WallKeuangan["monthly"] }) {
	const rows = data.map((m, i) => ({
		bulan: BULAN[i] ?? `${i + 1}`,
		Pemasukan: m.income,
		Pengeluaran: m.expense,
	}));
	return (
		<LineChart
			h="100%"
			data={rows}
			dataKey="bulan"
			series={[
				{ name: "Pemasukan", color: WALL_THEME.INFO },
				{ name: "Pengeluaran", color: WALL_THEME.WARN },
			]}
			curveType="monotone"
			withLegend
		/>
	);
}

/**
 * Alokasi anggaran per bidang (bar horizontal). Memakai `HorizontalBar`
 * bersama (bukan `BarChart` mentah) supaya lebar sumbu-Y label sektor
 * dibatasi (`Y_AXIS_WIDTH`) dan dipotong dengan ellipsis (`truncateTick`) —
 * tanpa itu, nama sektor panjang ("Bidang Penyelenggaraan Pemerintahan
 * Desa" dst.) melipat jadi beberapa baris dan tumpang tindih antar bar saat
 * widget dipendekkan.
 */
export function KeuanganAlokasiBody({
	data,
}: {
	data: WallKeuangan["allocation"];
}) {
	const rows = data.map((a) => ({
		sektor: a.sector,
		Anggaran: Math.round(a.amount / 1_000_000),
	}));
	return (
		<HorizontalBar
			data={rows}
			dataKey="sektor"
			valueKey="Anggaran"
			color={WALL_THEME.ACCENT}
		/>
	);
}

/** Laporan APBDes: 2 kolom (pendapatan/belanja) + baris total. Item per kolom ditampilkan sesuai tinggi widget (tanpa scroll — wall kiosk/TV). */
export function KeuanganLaporanBody({
	data,
	geom,
}: {
	data: WallKeuangan["report"];
	geom?: WidgetGeom;
}) {
	const maxIncome = Math.max(...data.income.map((i) => i.amount), 1);
	const maxExpense = Math.max(...data.expenses.map((e) => e.amount), 1);
	const cap = maxVisibleItems(geom, LIST_ITEM_TALL_PX);
	const visibleIncome = data.income.slice(0, cap);
	const visibleExpenses = data.expenses.slice(0, cap);

	return (
		<Stack gap="md" style={{ height: "100%", overflow: "hidden" }}>
			<Grid gutter="md">
				<Grid.Col span={6}>
					<Text
						fw={700}
						size="xs"
						style={{ color: WALL_THEME.INFO, marginBottom: 6 }}
					>
						PENDAPATAN
					</Text>
					<Stack gap="xs">
						{visibleIncome.map((item) => (
							<StatRow
								key={item.category}
								label={item.category}
								value={formatM(item.amount)}
								color={WALL_THEME.INFO}
								fraction={item.amount / maxIncome}
							/>
						))}
						<MoreIndicator count={data.income.length - visibleIncome.length} />
					</Stack>
				</Grid.Col>
				<Grid.Col span={6}>
					<Text
						fw={700}
						size="xs"
						style={{ color: WALL_THEME.WARN, marginBottom: 6 }}
					>
						BELANJA
					</Text>
					<Stack gap="xs">
						{visibleExpenses.map((item) => (
							<StatRow
								key={item.category}
								label={item.category}
								value={formatM(item.amount)}
								color={WALL_THEME.WARN}
								fraction={item.amount / maxExpense}
							/>
						))}
						<MoreIndicator
							count={data.expenses.length - visibleExpenses.length}
						/>
					</Stack>
				</Grid.Col>
			</Grid>
			<Group
				justify="space-between"
				pt="xs"
				style={{ borderTop: `1px solid ${WALL_THEME.BORDER}` }}
			>
				<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }}>
					Total Realisasi Pendapatan
				</Text>
				<Text fw={700} style={{ color: WALL_THEME.INFO }}>
					{formatM(data.totalIncome)}
				</Text>
			</Group>
			<Group justify="space-between">
				<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }}>
					Total Realisasi Belanja
				</Text>
				<Text fw={700} style={{ color: WALL_THEME.WARN }}>
					{formatM(data.totalExpense)}
				</Text>
			</Group>
		</Stack>
	);
}

/** Dana bantuan & hibah: source + nominal + badge status. Item ditampilkan sesuai tinggi widget (tanpa scroll — wall kiosk/TV). */
export function KeuanganBantuanBody({
	data,
	geom,
}: {
	data: WallKeuangan["aid"];
	geom?: WidgetGeom;
}) {
	const cap = maxVisibleItems(geom, LIST_ITEM_COMPACT_PX);
	const visible = data.slice(0, cap);
	return (
		<Stack
			gap="sm"
			justify="center"
			style={{ height: "100%", overflow: "hidden" }}
		>
			{visible.map((a) => (
				<Group key={a.source} justify="space-between" wrap="nowrap">
					<Text
						size="sm"
						style={{
							color: WALL_THEME.TEXT,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
							flex: 1,
						}}
					>
						{a.source}
					</Text>
					<Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
						<Text fw={700} style={{ color: WALL_THEME.ACCENT }}>
							{formatM(a.amount)}
						</Text>
						<Badge
							size="xs"
							color={a.status === "cair" ? "green" : "yellow"}
							variant="light"
						>
							{a.status}
						</Badge>
					</Group>
				</Group>
			))}
			<MoreIndicator count={data.length - visible.length} />
		</Stack>
	);
}

/** Skor SDGs — dipakai ulang oleh widgets/beranda.tsx (shape identik). Item ditampilkan sesuai tinggi widget (tanpa scroll — wall kiosk/TV). */
export function KeuanganSdgsBody({
	data,
	geom,
}: {
	data: Array<{ title: string; score: number; image: string | null }>;
	geom?: WidgetGeom;
}) {
	function scoreColor(score: number): string {
		if (score >= 80) return WALL_THEME.OK;
		if (score >= 60) return WALL_THEME.ACCENT;
		return WALL_THEME.WARN;
	}
	const cap = maxVisibleItems(geom, LIST_ITEM_TALL_PX);
	const visible = data.slice(0, cap);
	return (
		<Stack
			gap="sm"
			justify="center"
			style={{ height: "100%", overflow: "hidden" }}
		>
			{visible.map((s) => (
				<StatRow
					key={s.title}
					label={s.title}
					value={s.score.toFixed(1)}
					color={scoreColor(s.score)}
					fraction={s.score / 100}
				/>
			))}
			<MoreIndicator count={data.length - visible.length} />
		</Stack>
	);
}
