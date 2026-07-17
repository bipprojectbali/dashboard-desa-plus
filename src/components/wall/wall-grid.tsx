import {
	DndContext,
	type DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Text, UnstyledButton } from "@mantine/core";
import type { WallSnapshot } from "@/types/wall";
import { SortableWidgetCard } from "./sortable-widget-card";
import {
	bentoClass,
	bentoCss,
	WALL_BENTO_COL,
	WALL_BENTO_ROW,
} from "./wall-bento";
import { WALL_MAX_SLOTS } from "./wall-layout-utils";
import { WALL_THEME } from "./wall-theme";
import { getWidget } from "./widget-registry";
import { WidgetSlot } from "./widget-slot";

interface WallGridProps {
	order: string[];
	snapshot: WallSnapshot | null | undefined;
	mode: "display" | "edit";
	/** edit: dipanggil saat drag selesai dengan index asal & tujuan. */
	onReorder?: (from: number, to: number) => void;
	/** edit: dipanggil saat widget dilepas. */
	onRemove?: (id: string) => void;
	/** edit: dipanggil saat tile "＋ Tambah" diklik. */
	onAdd?: () => void;
}

/**
 * Grid bento: kolom auto-fill unit dasar {@link WALL_BENTO_COL}px (jumlah kolom
 * mengikuti lebar layar), baris tetap {@link WALL_BENTO_ROW}px. Tiap tile
 * menempati span kolom×baris sesuai ukuran widget (via class {@link bentoCss}) —
 * donut hero 2×2, tren 2×1, list 1×2, KPI 1×1 — menghasilkan tata letak
 * asimetris. Di layar sempit, tile lebar collapse ke 1 kolom (media query).
 */
const gridStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: `repeat(auto-fill, minmax(${WALL_BENTO_COL}px, 1fr))`,
	gridAutoRows: `${WALL_BENTO_ROW}px`,
	gridAutoFlow: "dense",
	gap: 18,
	minHeight: "100%",
	alignContent: "start",
};

/** Class span bento untuk sebuah widget id (kosong bila id tak dikenal → 1×1). */
function slotClass(id: string): string {
	const size = getWidget(id)?.size;
	return size ? bentoClass(size) : "";
}

/**
 * Grid widget wall responsif. `display` = read-only (dipakai `/wall` 24/7).
 * `edit` = drag-and-drop reorder + ✕ hapus + tile "＋ Tambah" (dipakai mode
 * edit inline & preview halaman admin).
 */
export function WallGrid({
	order,
	snapshot,
	mode,
	onReorder,
	onRemove,
	onAdd,
}: WallGridProps) {
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
	);

	if (mode === "display") {
		return (
			<>
				<style>{bentoCss}</style>
				<div style={gridStyle}>
					{order.map((id) => (
						<div key={id} className={slotClass(id)} style={{ minHeight: 0 }}>
							<WidgetSlot id={id} snapshot={snapshot} />
						</div>
					))}
				</div>
			</>
		);
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const from = order.indexOf(String(active.id));
		const to = order.indexOf(String(over.id));
		if (from === -1 || to === -1) return;
		onReorder?.(from, to);
	};

	const canAdd = order.length < WALL_MAX_SLOTS;

	return (
		<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
			<SortableContext items={order} strategy={rectSortingStrategy}>
				<style>{bentoCss}</style>
				<div style={gridStyle}>
					{order.map((id) => (
						<SortableWidgetCard
							key={id}
							id={id}
							snapshot={snapshot}
							className={slotClass(id)}
							onRemove={(wid) => onRemove?.(wid)}
						/>
					))}
					{canAdd ? (
						<UnstyledButton
							onClick={onAdd}
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								border: `2px dashed ${WALL_THEME.BORDER}`,
								borderRadius: 12,
								height: "100%",
								minHeight: 0,
								color: WALL_THEME.TEXT_DIM,
							}}
						>
							<Text fw={600}>＋ Tambah widget</Text>
						</UnstyledButton>
					) : null}
				</div>
			</SortableContext>
		</DndContext>
	);
}
