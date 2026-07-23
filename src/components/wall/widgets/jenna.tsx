import { BarChart } from "@mantine/charts";
import { Group, SimpleGrid, Stack, Text } from "@mantine/core";
import type { WallJenna } from "@/types/wall";
import { StatRow } from "../stat-row";
import { WALL_THEME } from "../wall-theme";

// ── KPI ──────────────────────────────────────────────────────────────────────

const KPI_TILES: Array<{
	key: keyof WallJenna["kpi"];
	label: string;
	color: string;
	suffix?: string;
}> = [
	{
		key: "interaksiHariIni",
		label: "Interaksi Hari Ini",
		color: WALL_THEME.ACCENT,
	},
	{
		key: "jawabanOtomatis",
		label: "Jawaban Otomatis",
		color: WALL_THEME.OK,
		suffix: "%",
	},
	{ key: "belumDitindak", label: "Belum Ditindak", color: WALL_THEME.WARN },
	{ key: "waktuRespon", label: "Waktu Respon", color: WALL_THEME.INFO },
];

/** KPI chatbot Jenna: 4 tile ringkas (interaksi, jawaban otomatis, belum ditindak, waktu respon). */
export function JennaKpiBody({ data }: { data: WallJenna["kpi"] }) {
	return (
		<SimpleGrid cols={2} spacing="sm" style={{ height: "100%" }}>
			{KPI_TILES.map((tile) => {
				const raw = data[tile.key];
				const value =
					typeof raw === "number"
						? `${raw.toLocaleString("id-ID")}${tile.suffix ?? ""}`
						: String(raw);
				return (
					<Stack
						key={tile.key}
						gap={2}
						justify="center"
						style={{
							padding: "10px 14px",
							borderRadius: 12,
							background: WALL_THEME.TRACK,
						}}
					>
						<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }}>
							{tile.label}
						</Text>
						<Text
							fw={800}
							style={{ fontSize: 28, color: tile.color, lineHeight: 1.1 }}
						>
							{value}
						</Text>
					</Stack>
				);
			})}
		</SimpleGrid>
	);
}

// ── INTERAKSI MINGGUAN ────────────────────────────────────────────────────────

/** Interaksi chatbot mingguan (bar). */
export function JennaInteraksiBody({ data }: { data: WallJenna["mingguan"] }) {
	return (
		<BarChart
			h="100%"
			data={data}
			dataKey="day"
			series={[{ name: "count", color: WALL_THEME.ACCENT }]}
			withLegend={false}
		/>
	);
}

// ── TOPIK TERBANYAK ───────────────────────────────────────────────────────────

/** Topik pertanyaan terbanyak (list + bar proporsi). */
export function JennaTopikBody({ data }: { data: WallJenna["topik"] }) {
	const max = Math.max(...data.map((t) => t.count), 1);
	return (
		<Stack gap="sm" justify="center" style={{ height: "100%" }}>
			{data.slice(0, 7).map((t) => (
				<StatRow
					key={t.topic}
					label={t.topic}
					value={`${t.count.toLocaleString("id-ID")}x`}
					color={WALL_THEME.ACCENT}
					fraction={t.count / max}
				/>
			))}
		</Stack>
	);
}

// ── JAM TERSIBUK ──────────────────────────────────────────────────────────────

/** Jam tersibuk: distribusi persentase per slot waktu (progress bar). */
export function JennaJamSibukBody({ data }: { data: WallJenna["jamSibuk"] }) {
	return (
		<Stack gap="md" justify="center" style={{ height: "100%" }}>
			{data.map((s) => (
				<div key={s.slot}>
					<Group justify="space-between" mb={4}>
						<Text size="sm" style={{ color: WALL_THEME.TEXT }}>
							{s.slot}
						</Text>
						<Text fw={700} size="sm" style={{ color: WALL_THEME.TEXT }}>
							{s.pct}%
						</Text>
					</Group>
					<div
						style={{
							height: 8,
							borderRadius: 999,
							background: WALL_THEME.TRACK,
							overflow: "hidden",
						}}
					>
						<div
							style={{
								width: `${s.pct}%`,
								height: "100%",
								borderRadius: 999,
								background: WALL_THEME.ACCENT,
								transition: "width 400ms ease",
							}}
						/>
					</div>
				</div>
			))}
		</Stack>
	);
}
