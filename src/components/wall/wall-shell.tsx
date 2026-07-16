import type { WallSnapshot } from "@/types/wall";
import { KpiStrip } from "./kpi-strip";
import { WallGrid } from "./wall-grid";
import { WallHeader } from "./wall-header";
import { WALL_THEME } from "./wall-theme";

interface WallShellProps {
	snapshot: WallSnapshot | undefined;
	order: string[];
	live: boolean;
}

/** Grid tetap: header, KPI strip, grid widget 3×2 (mode display, tanpa rotasi). */
export function WallShell({ snapshot, order, live }: WallShellProps) {
	return (
		<div
			style={{
				display: "grid",
				gridTemplateRows: "auto auto 1fr",
				gap: 18,
				height: "100vh",
				padding: 20,
				background: WALL_THEME.PAGE_BG,
				boxSizing: "border-box",
			}}
		>
			<WallHeader live={live} />
			<KpiStrip kpi={snapshot?.kpi ?? null} />
			<div style={{ minHeight: 0 }}>
				<WallGrid order={order} snapshot={snapshot} mode="display" />
			</div>
		</div>
	);
}
