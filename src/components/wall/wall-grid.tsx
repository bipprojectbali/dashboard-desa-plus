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
import { WALL_MAX_SLOTS } from "./wall-layout-utils";
import {
	WALL_MIN_CARD_HEIGHT,
	WALL_MIN_CARD_WIDTH,
	WALL_THEME,
} from "./wall-theme";
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
 * Grid responsif auto-fill: jumlah kolom mengikuti lebar layar (tiap kartu
 * minimal {@link WALL_MIN_CARD_WIDTH}px). Baris memakai `auto-rows` bertinggi
 * minimum agar chart terbaca; saat widget sedikit mereka melar mengisi tinggi
 * (`minmax(H, 1fr)` via container), saat banyak grid tumbuh ke bawah & di-scroll.
 */
const gridStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: `repeat(auto-fill, minmax(${WALL_MIN_CARD_WIDTH}px, 1fr))`,
	gridAutoRows: `minmax(${WALL_MIN_CARD_HEIGHT}px, 1fr)`,
	gap: 18,
	minHeight: "100%",
	alignContent: "stretch",
};

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
			<div style={gridStyle}>
				{order.map((id) => (
					<WidgetSlot key={id} id={id} snapshot={snapshot} />
				))}
			</div>
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
				<div style={gridStyle}>
					{order.map((id) => (
						<SortableWidgetCard
							key={id}
							id={id}
							snapshot={snapshot}
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
