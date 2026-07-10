import { Group, Stack, Text } from "@mantine/core";
import type { SystemHealth } from "@/utils/system-health";
import { Gauge } from "./gauge";
import { StatusLight } from "./status-light";
import { WALL_THEME } from "./wall-theme";

interface OpsPanelProps {
	system: SystemHealth | null;
}

function latency(ms: number | null): string {
	return ms == null ? "—" : `${ms}ms`;
}

/** Panel ops NOC: gauge CPU/MEM/DISK + status DB/API + last-sync. */
export function OpsPanel({ system }: OpsPanelProps) {
	return (
		<div
			style={{
				background: WALL_THEME.CARD,
				border: `1px solid ${WALL_THEME.BORDER}`,
				borderRadius: 12,
				padding: 18,
				height: "100%",
			}}
		>
			<Text fw={700} mb="md" style={{ color: WALL_THEME.TEXT }}>
				Status Sistem
			</Text>

			<Group justify="space-around" mb="lg">
				<Gauge label="CPU" value={system?.cpuPct ?? 0} />
				<Gauge label="MEM" value={system?.memPct ?? 0} />
				<Gauge label="DISK" value={system?.diskUsedPct ?? 0} />
			</Group>

			<Stack gap={10}>
				<StatusLight
					label="Database"
					ok={system?.db.ok ?? false}
					detail={latency(system?.db.latencyMs ?? null)}
				/>
				<StatusLight
					label="Desa API"
					ok={system?.desaApi.ok ?? false}
					detail={latency(system?.desaApi.latencyMs ?? null)}
				/>
				<StatusLight
					label="NOC API"
					ok={system?.nocApi.ok ?? false}
					detail={latency(system?.nocApi.latencyMs ?? null)}
				/>
			</Stack>

			<Text size="xs" mt="md" style={{ color: WALL_THEME.TEXT_DIM }}>
				Sync terakhir:{" "}
				{system?.lastSync
					? `${system.lastSync.type} · ${system.lastSync.status} · ${new Date(
							system.lastSync.startedAt,
						).toLocaleString("id-ID")}`
					: "—"}
			</Text>
		</div>
	);
}
