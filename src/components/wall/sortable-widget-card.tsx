import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActionIcon } from "@mantine/core";
import type { WallSnapshot } from "@/types/wall";
import { ResizeHandle } from "./resize-handle";
import { spanStyle, type WidgetGeom } from "./wall-bento";
import { WALL_THEME } from "./wall-theme";
import { WidgetSlot } from "./widget-slot";

interface SortableWidgetCardProps {
	id: string;
	snapshot: WallSnapshot | null | undefined;
	/** Geometri span {w,h} tile ini di grid. */
	geom: WidgetGeom;
	onRemove: (id: string) => void;
	/** Dipanggil saat handle resize menggeser ukuran (sudah di-clamp). */
	onResize: (id: string, geom: WidgetGeom) => void;
}

/**
 * Pembungkus widget untuk mode EDIT: draggable (dnd-kit sortable) dengan tombol
 * ✕ untuk melepas + handle ◢ untuk resize. Seluruh kartu jadi handle drag;
 * ✕ & handle resize di-stop-propagation supaya tak memicu drag. Span diterapkan
 * inline (dinamis per widget) di node draggable; `position: relative` supaya
 * handle resize absolut ter-anchor di pojok kartu.
 */
export function SortableWidgetCard({
	id,
	snapshot,
	geom,
	onRemove,
	onResize,
}: SortableWidgetCardProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style: React.CSSProperties = {
		...spanStyle(geom),
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		cursor: "grab",
		position: "relative",
		height: "100%",
		minHeight: 0,
		touchAction: "none",
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<WidgetSlot
				id={id}
				snapshot={snapshot}
				actions={
					<ActionIcon
						variant="subtle"
						color="red"
						size="sm"
						aria-label={`Lepas widget ${id}`}
						onPointerDown={(e) => e.stopPropagation()}
						onClick={(e) => {
							e.stopPropagation();
							onRemove(id);
						}}
						style={{ color: WALL_THEME.DANGER }}
					>
						✕
					</ActionIcon>
				}
			/>
			<ResizeHandle geom={geom} onResize={(g) => onResize(id, g)} />
		</div>
	);
}
