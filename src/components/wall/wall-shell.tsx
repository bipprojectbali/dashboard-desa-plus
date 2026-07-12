import { Text } from "@mantine/core";
import type { WallSnapshot } from "@/types/wall";
import { KpiStrip } from "./kpi-strip";
import { OpsPanel } from "./ops-panel";
import { DemografiKinerjaScene } from "./scenes/demografi-kinerja-scene";
import { KeuanganScene } from "./scenes/keuangan-scene";
import { PengaduanScene } from "./scenes/pengaduan-scene";
import { useSceneRotation } from "./use-scene-rotation";
import { WallHeader } from "./wall-header";
import { WALL_THEME } from "./wall-theme";

interface WallShellProps {
	snapshot: WallSnapshot | undefined;
	live: boolean;
}

const SCENE_LABELS = ["Keuangan", "Pengaduan & Layanan", "Demografi & Kinerja"];

/** Grid tetap: header, KPI strip, area scene (rotasi) + ops panel. */
export function WallShell({ snapshot, live }: WallShellProps) {
	const sceneIndex = useSceneRotation(SCENE_LABELS.length);

	const scenes = [
		<KeuanganScene key="keuangan" data={snapshot?.keuangan ?? null} />,
		<PengaduanScene key="pengaduan" data={snapshot?.pengaduan ?? null} />,
		<DemografiKinerjaScene
			key="demografi-kinerja"
			demografi={snapshot?.demografi ?? null}
			divisi={snapshot?.divisi ?? null}
		/>,
	];

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

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 320px",
					gap: 18,
					minHeight: 0,
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 8,
						minHeight: 0,
					}}
				>
					<Text size="sm" style={{ color: WALL_THEME.TEXT_DIM }}>
						{SCENE_LABELS[sceneIndex]}
					</Text>
					<div style={{ flex: 1, minHeight: 0 }}>{scenes[sceneIndex]}</div>
				</div>
				<OpsPanel system={snapshot?.system ?? null} />
			</div>
		</div>
	);
}
