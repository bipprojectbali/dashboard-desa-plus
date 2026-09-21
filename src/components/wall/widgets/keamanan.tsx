import { Badge, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconAlertTriangle, IconCamera, IconMapPin } from "@tabler/icons-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ComponentType } from "react";
import { useEffect, useRef } from "react";
import type { WallKeamanan } from "@/types/wall";
import { MoreIndicator } from "../more-indicator";
import type { WidgetGeom } from "../wall-bento";
import { LIST_ITEM_TALL_PX, maxVisibleItems } from "../wall-item-cap";
import { WALL_THEME } from "../wall-theme";

// ── KPI ────────────────────────────────────────────────────────────────────────

interface KpiIconDef {
	Icon: ComponentType<{ size?: number; color?: string }>;
	color: string;
}

const KPI_DEFS: Array<{
	key: keyof WallKeamanan["kpi"];
	label: string;
	icon: KpiIconDef;
}> = [
	{
		key: "cctvOnline",
		label: "CCTV Aktif",
		icon: { Icon: IconCamera, color: WALL_THEME.OK },
	},
	{
		key: "laporanMingguIni",
		label: "Laporan Minggu Ini",
		icon: { Icon: IconAlertTriangle, color: WALL_THEME.WARN },
	},
];

function KeamananKpiTile({
	value,
	label,
	icon,
}: {
	value: number;
	label: string;
	icon: KpiIconDef;
}) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 14,
				minWidth: 0,
				overflow: "hidden",
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
			<div style={{ minWidth: 0, overflow: "hidden" }}>
				<Text
					fw={800}
					style={{ fontSize: 26, color: WALL_THEME.TEXT, lineHeight: 1.1 }}
				>
					{value.toLocaleString("id-ID")}
				</Text>
				<Text
					size="xs"
					style={{
						color: WALL_THEME.TEXT_DIM,
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis",
					}}
				>
					{label}
				</Text>
			</div>
		</div>
	);
}

/** 2 KPI tile: CCTV Aktif + Laporan Minggu Ini. */
export function KeamananKpiBody({ data }: { data: WallKeamanan["kpi"] }) {
	return (
		<SimpleGrid cols={2} spacing="sm" style={{ height: "100%" }}>
			{KPI_DEFS.map((d) => (
				<KeamananKpiTile
					key={d.key}
					value={data[d.key]}
					label={d.label}
					icon={d.icon}
				/>
			))}
		</SimpleGrid>
	);
}

// ── Daftar CCTV ────────────────────────────────────────────────────────────────

/** Daftar CCTV dengan badge Online/Offline dan lokasi. Item ditampilkan sesuai tinggi widget (tanpa scroll — wall kiosk/TV). */
export function KeamananCctvBody({
	data,
	geom,
}: {
	data: WallKeamanan["cctv"];
	geom?: WidgetGeom;
}) {
	const cap = maxVisibleItems(geom, LIST_ITEM_TALL_PX);
	const visible = data.slice(0, cap);
	return (
		<Stack gap={8} style={{ height: "100%", overflow: "hidden" }}>
			{visible.map((c) => (
				<div
					key={c.id}
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 12,
						padding: "10px 14px",
						background: WALL_THEME.CARD,
						border: `1px solid ${WALL_THEME.BORDER}`,
						borderRadius: 10,
					}}
				>
					<div style={{ minWidth: 0 }}>
						<Text
							size="sm"
							fw={600}
							style={{ color: WALL_THEME.TEXT }}
							truncate
						>
							{c.kode} — {c.nama}
						</Text>
						<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }} truncate>
							<IconMapPin size={10} style={{ marginRight: 4 }} />
							{c.lokasi}
						</Text>
					</div>
					<Badge
						size="sm"
						variant="filled"
						color={c.status === "Online" ? "green" : "gray"}
						style={{ flexShrink: 0 }}
					>
						{c.status}
					</Badge>
				</div>
			))}
			{data.length === 0 && (
				<Text size="sm" style={{ color: WALL_THEME.TEXT_DIM }}>
					Tidak ada data CCTV.
				</Text>
			)}
			<MoreIndicator count={data.length - visible.length} />
		</Stack>
	);
}

// ── Laporan Publik ─────────────────────────────────────────────────────────────

const LAPORAN_STATUS_COLOR: Record<string, string> = {
	Selesai: "green",
	Proses: "yellow",
	Gagal: "red",
	Baru: "blue",
};

/** Daftar laporan publik dengan badge status berwarna. Item ditampilkan sesuai tinggi widget (tanpa scroll — wall kiosk/TV). */
export function KeamananLaporanBody({
	data,
	geom,
}: {
	data: WallKeamanan["laporanPublik"];
	geom?: WidgetGeom;
}) {
	const cap = maxVisibleItems(geom, LIST_ITEM_TALL_PX);
	const visible = data.slice(0, cap);
	return (
		<Stack gap={8} style={{ height: "100%", overflow: "hidden" }}>
			{visible.map((l) => (
				<div
					key={l.id}
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 12,
						padding: "10px 14px",
						background: WALL_THEME.CARD,
						border: `1px solid ${WALL_THEME.BORDER}`,
						borderRadius: 10,
					}}
				>
					<div style={{ minWidth: 0 }}>
						<Text
							size="sm"
							fw={600}
							style={{ color: WALL_THEME.TEXT }}
							truncate
						>
							{l.judul}
						</Text>
						<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }} truncate>
							<IconMapPin size={10} style={{ marginRight: 4 }} />
							{l.lokasi}
							{l.tanggalWaktu ? ` · ${l.tanggalWaktu}` : ""}
						</Text>
					</div>
					<Badge
						size="sm"
						variant="filled"
						color={LAPORAN_STATUS_COLOR[l.status] ?? "gray"}
						style={{ flexShrink: 0 }}
					>
						{l.status}
					</Badge>
				</div>
			))}
			{data.length === 0 && (
				<Text size="sm" style={{ color: WALL_THEME.TEXT_DIM }}>
					Tidak ada laporan publik.
				</Text>
			)}
			<MoreIndicator count={data.length - visible.length} />
		</Stack>
	);
}

// ── Peta CCTV (Leaflet) ────────────────────────────────────────────────────────

const markerIcon = L.icon({
	iconUrl: "/marker-icon.png",
	iconRetinaUrl: "/marker-icon-2x.png",
	shadowUrl: "/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

/** Peta Leaflet titik CCTV — reuse pola CctvMap dari halaman /keamanan. */
export function KeamananPetaBody({ data }: { data: WallKeamanan["cctv"] }) {
	const mapRef = useRef<HTMLDivElement>(null);
	const leafletMap = useRef<L.Map | null>(null);

	useEffect(() => {
		if (!mapRef.current || leafletMap.current) return;

		const validItems = data.filter((c) => c.latitude && c.longitude);
		const first = validItems[0];
		const center: [number, number] = first
			? [first.latitude, first.longitude]
			: [-8.6705, 115.212];

		const map = L.map(mapRef.current, { center, zoom: 14 });
		leafletMap.current = map;

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: "© OpenStreetMap contributors",
		}).addTo(map);

		for (const cctv of validItems) {
			L.marker([cctv.latitude, cctv.longitude], { icon: markerIcon })
				.addTo(map)
				.bindPopup(
					`<b>${cctv.kode}</b><br>${cctv.nama}<br><small>${cctv.lokasi}</small><br><span style="color:${cctv.status === "Online" ? "green" : "gray"}">${cctv.status}</span>`,
				);
		}

		if (validItems.length > 1) {
			const bounds = L.latLngBounds(
				validItems.map((c) => [c.latitude, c.longitude]),
			);
			map.fitBounds(bounds, { padding: [40, 40] });
		}

		return () => {
			map.remove();
			leafletMap.current = null;
		};
	}, [data]);

	return (
		<div
			ref={mapRef}
			style={{
				height: "100%",
				minHeight: 300,
				borderRadius: 10,
				border: `1px solid ${WALL_THEME.BORDER}`,
				zIndex: 0,
			}}
		/>
	);
}
