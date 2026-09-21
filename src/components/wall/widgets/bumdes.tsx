import { Badge, Grid, Group, Stack, Text } from "@mantine/core";
import { formatM } from "@/components/keuangan/format";
import type { WallBumdes } from "@/types/wall";
import { MoreIndicator } from "../more-indicator";
import { StatRow } from "../stat-row";
import type { WidgetGeom } from "../wall-bento";
import {
	LIST_ITEM_COMPACT_PX,
	LIST_ITEM_TALL_PX,
	maxVisibleItems,
} from "../wall-item-cap";
import { WALL_THEME } from "../wall-theme";

/** 4 KPI ringkas: UMKM aktif, terdaftar, omzet, kategori terbanyak. */
export function BumdesKpiBody({ data }: { data: WallBumdes["kpi"] }) {
	const items = [
		{
			label: "UMKM Aktif",
			value: String(data.umkmAktif),
			color: WALL_THEME.OK,
		},
		{
			label: "Total Terdaftar",
			value: String(data.totalUmkm),
			color: WALL_THEME.ACCENT,
		},
		{
			label: "Omzet Bulanan",
			value: formatM(data.omzetBulanan),
			color: WALL_THEME.INFO,
		},
		{
			label: "Kategori Terbanyak",
			value: data.kategoriTerbanyak || "—",
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
							style={{
								fontSize: item.label === "Kategori Terbanyak" ? 16 : 26,
								color: item.color,
								lineHeight: 1,
								textAlign: "center",
							}}
						>
							{item.value}
						</Text>
					</Stack>
				</Grid.Col>
			))}
		</Grid>
	);
}

/** Ringkasan penjualan: total, perubahan %, kategori aktif, transaksi. */
export function BumdesRingkasanBody({
	data,
}: {
	data: WallBumdes["ringkasan"];
}) {
	const trendColor =
		data.persentasePerubahan >= 0 ? WALL_THEME.OK : WALL_THEME.WARN;
	const items = [
		{
			label: "Total Penjualan",
			value: formatM(data.totalPenjualan),
			color: WALL_THEME.ACCENT,
		},
		{
			label: "vs Bulan Lalu",
			value: `${data.persentasePerubahan >= 0 ? "+" : ""}${data.persentasePerubahan.toFixed(1)}%`,
			color: trendColor,
		},
		{
			label: "Kategori Aktif",
			value: String(data.kategoriAktif),
			color: WALL_THEME.INFO,
		},
		{
			label: "Total Transaksi",
			value: String(data.totalTransaksi),
			color: WALL_THEME.TEXT,
		},
	];
	return (
		<Stack gap="sm" justify="center" style={{ height: "100%" }}>
			{items.map((item) => (
				<Group key={item.label} justify="space-between" wrap="nowrap">
					<Text size="sm" style={{ color: WALL_THEME.TEXT_DIM }}>
						{item.label}
					</Text>
					<Text fw={700} style={{ color: item.color }}>
						{item.value}
					</Text>
				</Group>
			))}
		</Stack>
	);
}

/** Top produk terlaris: rank + nama + revenue. Item ditampilkan sesuai tinggi widget (tanpa scroll — wall kiosk/TV). */
export function BumdesTopProdukBody({
	data,
	geom,
}: {
	data: WallBumdes["topProduk"];
	geom?: WidgetGeom;
}) {
	if (data.length === 0) {
		return (
			<Stack justify="center" align="center" style={{ height: "100%" }}>
				<Text size="sm" style={{ color: WALL_THEME.TEXT_DIM }}>
					Belum ada data produk
				</Text>
			</Stack>
		);
	}
	const cap = maxVisibleItems(geom, LIST_ITEM_TALL_PX);
	const visible = data.slice(0, cap);
	const maxPenjualan = Math.max(...data.map((p) => p.totalPenjualan), 1);
	return (
		<Stack gap="xs" style={{ height: "100%", overflow: "hidden" }}>
			{visible.map((p, i) => (
				<StatRow
					key={p.namaProduk}
					label={`${i + 1}. ${p.namaProduk}`}
					value={formatM(p.totalPenjualan)}
					color={i === 0 ? WALL_THEME.ACCENT : WALL_THEME.INFO}
					fraction={p.totalPenjualan / maxPenjualan}
				/>
			))}
			<MoreIndicator count={data.length - visible.length} />
		</Stack>
	);
}

/** Detail penjualan produk: tabel bulan ini/lalu + trend + stok. Item ditampilkan sesuai tinggi widget (tanpa scroll — wall kiosk/TV). */
export function BumdesDetailBody({
	data,
	geom,
}: {
	data: WallBumdes["detail"];
	geom?: WidgetGeom;
}) {
	if (data.length === 0) {
		return (
			<Stack justify="center" align="center" style={{ height: "100%" }}>
				<Text size="sm" style={{ color: WALL_THEME.TEXT_DIM }}>
					Belum ada data penjualan
				</Text>
			</Stack>
		);
	}
	const cap = maxVisibleItems(geom, LIST_ITEM_COMPACT_PX);
	const visible = data.slice(0, cap);
	return (
		<Stack gap="xs" style={{ height: "100%", overflow: "hidden" }}>
			{visible.map((item) => (
				<Group
					key={item.namaProduk}
					justify="space-between"
					wrap="nowrap"
					style={{
						borderBottom: `1px solid ${WALL_THEME.BORDER}`,
						paddingBottom: 4,
					}}
				>
					<Text
						size="xs"
						style={{
							color: WALL_THEME.TEXT,
							flex: 1,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{item.namaProduk}
					</Text>
					<Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
						<Text size="xs" style={{ color: WALL_THEME.INFO }}>
							{formatM(item.penjualanBulanIni)}
						</Text>
						<Badge
							size="xs"
							color={item.trend === "up" ? "green" : "red"}
							variant="light"
						>
							{item.trend === "up" ? "▲" : "▼"} {item.trendPersen.toFixed(1)}%
						</Badge>
						<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }}>
							Stok {item.stok}
						</Text>
					</Group>
				</Group>
			))}
			<MoreIndicator count={data.length - visible.length} />
		</Stack>
	);
}
