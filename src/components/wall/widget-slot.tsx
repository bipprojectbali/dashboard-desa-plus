import type { ReactNode } from "react";
import type { WallSnapshot } from "@/types/wall";
import { WidgetCard } from "./widget-card";
import { getWidget } from "./widget-registry";

interface WidgetSlotProps {
	id: string;
	snapshot: WallSnapshot | null | undefined;
	/** Aksi header opsional (mis. tombol ✕ saat mode edit). */
	actions?: ReactNode;
}

/**
 * Render satu widget dari id + snapshot. Resolve definisi via registry,
 * ambil slice data (`selectData`), tampilkan empty state bila null.
 * Dipakai oleh grid display maupun edit — satu jalur render.
 */
export function WidgetSlot({ id, snapshot, actions }: WidgetSlotProps) {
	const def = getWidget(id);
	if (!def) {
		// Id tak dikenal (mis. layout lama pasca-rename widget) — jangan crash.
		return (
			<WidgetCard
				title={id}
				actions={actions}
				empty
				emptyLabel="Widget tak dikenal"
			/>
		);
	}

	const data = def.selectData(snapshot);
	const Body = def.Body;
	return (
		<WidgetCard title={def.title} actions={actions} empty={data == null}>
			{data != null ? <Body data={data} /> : null}
		</WidgetCard>
	);
}
