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
import { WALL_COLS, WALL_ROWS, WALL_SLOTS } from "./wall-layout-utils";
import { WALL_THEME } from "./wall-theme";
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

const gridStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: `repeat(${WALL_COLS}, 1fr)`,
	gridTemplateRows: `repeat(${WALL_ROWS}, 1fr)`,
	gap: 18,
	height: "100%",
	minHeight: 0,
};

/**
 * Grid 3×2 widget wall. `display` = read-only (dipakai `/wall` 24/7).
 * `edit` = drag-and-drop reorder + ✕ hapus + tile "＋ Tambah" di slot kosong
 * (dipakai preview halaman admin).
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

	const canAdd = order.length < WALL_SLOTS;

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
