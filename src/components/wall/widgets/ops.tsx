import { Group, Stack, Text } from "@mantine/core";
import type { SystemHealth } from "@/utils/system-health";
import { Gauge } from "../gauge";
import { StatusLight } from "../status-light";
import { WALL_THEME } from "../wall-theme";

function latency(ms: number | null): string {
	return ms == null ? "—" : `${ms}ms`;
}

/**
 * Isi widget status sistem NOC: gauge CPU/MEM/DISK + status DB/API + last-sync.
 * Inner-only (tanpa frame/judul sendiri) — dibungkus WidgetCard di renderer,
 * seperti widget lain. Menggantikan `ops-panel.tsx` yang punya frame ganda.
 */
export function OpsBody({ data }: { data: SystemHealth }) {
	return (
		<Stack gap="md" style={{ height: "100%" }}>
			<Group justify="space-around">
				<Gauge label="CPU" value={data.cpuPct} />
				<Gauge label="MEM" value={data.memPct} />
				<Gauge label="DISK" value={data.diskUsedPct} />
			</Group>

			<Stack gap={10}>
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

			<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }}>
				Sync terakhir:{" "}
				{data.lastSync
					? `${data.lastSync.type} · ${data.lastSync.status} · ${new Date(
							data.lastSync.startedAt,
						).toLocaleString("id-ID")}`
					: "—"}
			</Text>
		</Stack>
	);
}
