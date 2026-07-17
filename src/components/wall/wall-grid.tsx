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
	spanStyle,
	WALL_BENTO_COL,
	WALL_BENTO_ROW,
	type WidgetGeom,
} from "./wall-bento";
import {
	resolveSizes,
	WALL_MAX_SLOTS,
	type WallSizeMap,
} from "./wall-layout-utils";
import { WALL_THEME } from "./wall-theme";
import { WidgetSlot } from "./widget-slot";

interface WallGridProps {
	order: string[];
	snapshot: WallSnapshot | null | undefined;
	/** Override ukuran per widget; kosong/null → semua pakai default preset. */
	sizes?: WallSizeMap | null;
	mode: "display" | "edit";
	/** edit: dipanggil saat drag selesai dengan index asal & tujuan. */
	onReorder?: (from: number, to: number) => void;
	/** edit: dipanggil saat widget dilepas. */
	onRemove?: (id: string) => void;
	/** edit: dipanggil saat tile "＋ Tambah" diklik. */
	onAdd?: () => void;
	/** edit: dipanggil saat handle resize menggeser ukuran widget. */
	onResize?: (id: string, geom: WidgetGeom) => void;
}

/**
 * Grid bento: kolom auto-fill unit dasar {@link WALL_BENTO_COL}px (jumlah kolom
 * mengikuti lebar layar), baris tetap {@link WALL_BENTO_ROW}px. Tiap tile
 * menempati span kolom×baris sesuai geometri widget (inline `span w/h`) —
 * donut hero besar, tren lebar, list tinggi, KPI kecil — menghasilkan tata
 * letak asimetris. `span` berlebih di layar sempit di-clamp otomatis oleh CSS
 * Grid ke jumlah kolom yang muat, jadi tak pernah overflow horizontal.
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

/**
 * Grid widget wall responsif. `display` = read-only (dipakai `/wall` 24/7).
 * `edit` = drag-and-drop reorder + ✕ hapus + ◢ resize + tile "＋ Tambah"
 * (dipakai mode edit inline & preview halaman admin).
 */
export function WallGrid({
	order,
	snapshot,
	sizes,
	mode,
	onReorder,
	onRemove,
	onAdd,
	onResize,
}: WallGridProps) {
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
	);

	// Geometri final tiap widget (override tersimpan → clamp, selain itu default).
	const geoms = resolveSizes(order, sizes);

	if (mode === "display") {
		return (
			<div data-wall-grid style={gridStyle}>
				{order.map((id) => (
					<div
						key={id}
						style={{ ...spanStyle(geoms[id] ?? { w: 1, h: 1 }), minHeight: 0 }}
					>
						<WidgetSlot id={id} snapshot={snapshot} />
					</div>
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
				<div data-wall-grid style={gridStyle}>
					{order.map((id) => (
						<SortableWidgetCard
							key={id}
							id={id}
							snapshot={snapshot}
							geom={geoms[id] ?? { w: 1, h: 1 }}
							onRemove={(wid) => onRemove?.(wid)}
							onResize={(wid, g) => onResize?.(wid, g)}
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
