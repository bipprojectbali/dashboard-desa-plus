import { Group, Stack, Text } from "@mantine/core";
import type { SystemHealth } from "@/utils/system-health";
import { Gauge } from "../gauge";
import { StatusLight } from "../status-light";
import type { WidgetGeom } from "../wall-bento";
import { WALL_THEME } from "../wall-theme";

function latency(ms: number | null): string {
	return ms == null ? "—" : `${ms}ms`;
}

/**
 * Isi widget status sistem NOC: gauge CPU/MEM/DISK + status DB/API + last-sync.
 * Inner-only (tanpa frame/judul sendiri) — dibungkus WidgetCard di renderer,
 * seperti widget lain. Menggantikan `ops-panel.tsx` yang punya frame ganda.
 *
 * 3 gauge (110px) berdampingan butuh ~330px+, lebih lebar dari 1 kolom bento
 * (300px). Tanpa `wrap="nowrap"`, `Group` melipat gauge ke-3 ke baris baru
 * saat widget dipersempit, dan baris baru itu terpotong tengah oleh
 * `overflow: hidden` kartu — sama seperti donut chart sebelum diperbaiki
 * ({@link import("../donut-body").DonutBody}). Sekarang gauge menyusut saat
 * widget kecil (lebar 1 kolom atau tinggi 1 baris) dan barisnya dikunci
 * `nowrap` agar selalu satu baris, tak pernah melipat.
 */
export function OpsBody({
	data,
	geom,
}: {
	data: SystemHealth;
	geom?: WidgetGeom;
}) {
	const compact = (geom?.w ?? 1) <= 1 || (geom?.h ?? 1) <= 1;
	const gaugeSize = compact ? 70 : 110;
	const gaugeThickness = compact ? 7 : 10;
	return (
		<Stack gap={compact ? "xs" : "md"} style={{ height: "100%" }}>
			<Group justify="space-around" wrap="nowrap" gap={compact ? 4 : "md"}>
				<Gauge
					label="CPU"
					value={data.cpuPct}
					size={gaugeSize}
					thickness={gaugeThickness}
				/>
				<Gauge
					label="MEM"
					value={data.memPct}
					size={gaugeSize}
					thickness={gaugeThickness}
				/>
				<Gauge
					label="DISK"
					value={data.diskUsedPct}
					size={gaugeSize}
					thickness={gaugeThickness}
				/>
			</Group>

			<Stack gap={compact ? 4 : 10}>
				<StatusLight
					label="Database"
					ok={data.db.ok}
					detail={latency(data.db.latencyMs)}
				/>
				<StatusLight
					label="Desa API"
					ok={data.desaApi.ok}
					detail={latency(data.desaApi.latencyMs)}
				/>
				<StatusLight
					label="NOC API"
					ok={data.nocApi.ok}
					detail={latency(data.nocApi.latencyMs)}
				/>
			</Stack>

			{/* Baris paling tak kritis — dilepas dulu saat widget diperkecil ke
			ukuran minimum (w=1 & h=1) supaya 3 baris status di atas tetap utuh
			terlihat, alih-alih ikut terpotong tengah karena kehabisan tinggi. */}
			{(geom?.w ?? 1) <= 1 && (geom?.h ?? 1) <= 1 ? null : (
				<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }}>
					Sync terakhir:{" "}
					{data.lastSync
						? `${data.lastSync.type} · ${data.lastSync.status} · ${new Date(
								data.lastSync.startedAt,
							).toLocaleString("id-ID")}`
						: "—"}
				</Text>
			)}
		</Stack>
	);
}
