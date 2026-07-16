import { Button, Group } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { initBufferFrom } from "@/store/wall-layout";
import type { WallSnapshot } from "@/types/wall";
import { KpiStrip } from "./kpi-strip";
import { LiveClock } from "./live-clock";
import { WallGrid } from "./wall-grid";
import { WallHeader } from "./wall-header";
import { WallLayoutEditor } from "./wall-layout-editor";
import type { WidgetId } from "./wall-layout-utils";
import { WALL_THEME } from "./wall-theme";

interface WallShellProps {
	snapshot: WallSnapshot | undefined;
	order: string[];
	live: boolean;
	/** true → admin login: tampilkan tombol Atur + izinkan mode edit inline. */
	canEdit: boolean;
}

/**
 * Grid tetap: header, KPI strip, grid widget 3×2. Publik → display statis.
 * Admin (canEdit) → tombol Atur di header masuk mode edit inline (drag/drop),
 * TV/publik tak pernah lihat kontrol. Backend tetap gate PUT admin-only.
 */
export function WallShell({ snapshot, order, live, canEdit }: WallShellProps) {
	const [mode, setMode] = useState<"display" | "edit">("display");

	// Kalau status admin hilang (mis. sesi habis), paksa kembali display.
	useEffect(() => {
		if (!canEdit && mode === "edit") setMode("display");
	}, [canEdit, mode]);

	const enterEdit = () => {
		initBufferFrom(order as WidgetId[]);
		setMode("edit");
	};

	// Admin display: tombol Atur BERSAMA jam — jangan gantikan jam (TV tetap
	// butuh jam). Publik → undefined → header render LiveClock seperti biasa.
	const headerActions =
		canEdit && mode === "display" ? (
			<Group gap="lg" align="center" wrap="nowrap">
				<Button
					variant="light"
					leftSection={<IconPencil size={16} />}
					onClick={enterEdit}
				>
					Atur
				</Button>
				<LiveClock />
			</Group>
		) : undefined;

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
			<WallHeader live={live} actions={headerActions} />
			<KpiStrip kpi={snapshot?.kpi ?? null} />
			<div style={{ minHeight: 0 }}>
				{mode === "edit" && canEdit ? (
					<WallLayoutEditor
						snapshot={snapshot}
						seed={{ mode: "order", order: order as WidgetId[] }}
						onDone={() => setMode("display")}
						onSaved={() => setMode("display")}
					/>
				) : (
					<WallGrid order={order} snapshot={snapshot} mode="display" />
				)}
			</div>
		</div>
	);
}
