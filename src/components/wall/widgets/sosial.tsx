import { Group, SimpleGrid, Stack, Text } from "@mantine/core";
import {
	IconAlertTriangle,
	IconBabyCarriage,
	IconBuildingCommunity,
	IconCalendarEvent,
	IconHeartbeat,
	IconMoodSmile,
	IconSchool,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import type { WallSosial } from "@/types/wall";
import { StatRow } from "../stat-row";
import { WALL_CATEGORICAL, WALL_THEME } from "../wall-theme";

// ── KPI Kesehatan ─────────────────────────────────────────────────────────────

interface KpiIconDef {
	Icon: ComponentType<{ size?: number; color?: string }>;
	color: string;
}

const SOSIAL_KPI_ICONS: KpiIconDef[] = [
	{ Icon: IconHeartbeat, color: WALL_THEME.DANGER },
	{ Icon: IconBabyCarriage, color: WALL_THEME.INFO },
	{ Icon: IconAlertTriangle, color: WALL_THEME.WARN },
	{ Icon: IconBuildingCommunity, color: WALL_THEME.OK },
];

const SOSIAL_KPI_LABELS = [
	{ key: "ibuHamilAktif" as const, label: "Ibu Hamil Aktif" },
	{ key: "balitaTerdaftar" as const, label: "Balita Terdaftar" },
	{ key: "alertStunting" as const, label: "Alert Stunting" },
	{ key: "posyanduAktif" as const, label: "Posyandu Aktif" },
];

function SosialKpiTile({
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
					{value.toLocaleString("id-ID")}
				</Text>
				<Text
					size="xs"
					style={{ color: WALL_THEME.TEXT_DIM, whiteSpace: "nowrap" }}
				>
					{label}
				</Text>
			</div>
		</div>
	);
}

/** 4 KPI tile: Ibu Hamil Aktif, Balita Terdaftar, Alert Stunting, Posyandu Aktif. */
export function SosialKpiBody({ data }: { data: WallSosial["kpi"] }) {
	return (
		<SimpleGrid cols={2} spacing="sm" style={{ height: "100%" }}>
			{SOSIAL_KPI_LABELS.map((item, i) => (
				<SosialKpiTile
					key={item.key}
					value={data[item.key]}
					label={item.label}
					icon={SOSIAL_KPI_ICONS[i % SOSIAL_KPI_ICONS.length]!}
				/>
			))}
		</SimpleGrid>
	);
}

// ── Statistik Kesehatan ───────────────────────────────────────────────────────

/** Progress bar proporsi per kategori kesehatan (ibu hamil, balita, stunting). */
export function SosialKesehatanBody({
	data,
}: {
	data: WallSosial["kesehatan"];
}) {
	return (
		<Stack gap="md" justify="center" style={{ height: "100%" }}>
			{data.map((item) => (
				<StatRow
					key={item.label}
					label={item.label}
					value={`${item.value}%`}
					color={item.color}
					fraction={item.value / 100}
				/>
			))}
		</Stack>
	);
}

// ── Jadwal Posyandu ────────────────────────────────────────────────────────────

/** Daftar posyandu aktif + jadwal. */
export function SosialPosyanduBody({ data }: { data: WallSosial["posyandu"] }) {
	return (
		<Stack gap={6} style={{ height: "100%", overflow: "hidden" }}>
			{data.map((item, i) => (
				<div
					key={item.id || i}
					style={{
						display: "flex",
						alignItems: "flex-start",
						gap: 10,
						padding: "8px 12px",
						background: WALL_THEME.CARD,
						borderLeft: `3px solid ${WALL_CATEGORICAL[i % WALL_CATEGORICAL.length]}`,
						borderRadius: 8,
					}}
				>
					<div style={{ flex: 1, minWidth: 0 }}>
						<Text
							size="sm"
							fw={600}
							style={{ color: WALL_THEME.TEXT }}
							lineClamp={1}
						>
							{item.name}
						</Text>
						<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }}>
							{item.jadwal}
						</Text>
					</div>
					{item.time && (
						<Text
							size="xs"
							fw={700}
							style={{
								color: WALL_CATEGORICAL[i % WALL_CATEGORICAL.length],
								flexShrink: 0,
							}}
						>
							{item.time}
						</Text>
					)}
				</div>
			))}
		</Stack>
	);
}

// ── Pendidikan ────────────────────────────────────────────────────────────────

/** Jumlah siswa per jenjang + footer lembaga/pengajar. */
export function SosialPendidikanBody({
	data,
}: {
	data: WallSosial["pendidikan"];
}) {
	const total = data.perJenjang.reduce((s, j) => s + j.jumlahSiswa, 0);
	return (
		<Stack gap="sm" justify="space-between" style={{ height: "100%" }}>
			<Stack gap="sm">
				{data.perJenjang.map((j, i) => (
					<StatRow
						key={j.nama}
						label={j.nama}
						value={j.jumlahSiswa}
						color={WALL_CATEGORICAL[i % WALL_CATEGORICAL.length] as string}
						fraction={total > 0 ? j.jumlahSiswa / total : 0}
					/>
				))}
			</Stack>
			<Group justify="space-between" align="baseline">
				<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }}>
					<IconSchool
						size={12}
						style={{ marginRight: 4, verticalAlign: "middle" }}
					/>
					{data.jumlahLembaga} lembaga · {data.jumlahPengajar} pengajar
				</Text>
				<Text fw={700} size="sm" style={{ color: WALL_THEME.ACCENT }}>
					{total.toLocaleString("id-ID")} siswa
				</Text>
			</Group>
		</Stack>
	);
}

// ── Beasiswa ──────────────────────────────────────────────────────────────────

/** Total penerima beasiswa + breakdown L/P + periode. */
export function SosialBeasiswaBody({ data }: { data: WallSosial["beasiswa"] }) {
	const total = data.total || data.lakiLaki + data.perempuan;
	const items = [
		{ label: "Laki-laki", value: data.lakiLaki, color: WALL_THEME.ACCENT },
		{ label: "Perempuan", value: data.perempuan, color: WALL_THEME.VIOLET },
	];
	return (
		<Stack gap="sm" justify="space-between" style={{ height: "100%" }}>
			<Stack gap={4} align="center">
				<Text
					fw={800}
					style={{ fontSize: 40, color: WALL_THEME.TEXT, lineHeight: 1 }}
				>
					{total.toLocaleString("id-ID")}
				</Text>
				<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }}>
					Penerima Beasiswa{data.periode ? ` ${data.periode}` : ""}
				</Text>
			</Stack>
			<Stack gap="xs">
				{items.map((item) => (
					<StatRow
						key={item.label}
						label={item.label}
						value={item.value}
						color={item.color}
						fraction={total > 0 ? item.value / total : 0}
					/>
				))}
			</Stack>
		</Stack>
	);
}

// ── Event Budaya ──────────────────────────────────────────────────────────────

/** Daftar event budaya mendatang. */
export function SosialEventBody({ data }: { data: WallSosial["event"] }) {
	return (
		<Stack gap={6} style={{ height: "100%", overflow: "hidden" }}>
			{data.map((item, i) => (
				<div
					key={item.id || i}
					style={{
						display: "flex",
						alignItems: "flex-start",
						gap: 10,
						padding: "8px 12px",
						background: WALL_THEME.CARD,
						borderLeft: `3px solid ${WALL_CATEGORICAL[i % WALL_CATEGORICAL.length]}`,
						borderRadius: 8,
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: 28,
							height: 28,
							borderRadius: 6,
							background: `${WALL_CATEGORICAL[i % WALL_CATEGORICAL.length]}22`,
							flexShrink: 0,
						}}
					>
						<IconCalendarEvent
							size={14}
							color={WALL_CATEGORICAL[i % WALL_CATEGORICAL.length]}
						/>
					</div>
					<div style={{ flex: 1, minWidth: 0 }}>
						<Text
							size="sm"
							fw={600}
							style={{ color: WALL_THEME.TEXT }}
							lineClamp={1}
						>
							{item.title}
						</Text>
						<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }}>
							{item.location}
							{item.startDate ? ` · ${item.startDate}` : ""}
						</Text>
					</div>
				</div>
			))}
		</Stack>
	);
}
