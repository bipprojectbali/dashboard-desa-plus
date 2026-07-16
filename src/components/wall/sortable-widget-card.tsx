import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActionIcon } from "@mantine/core";
import type { WallSnapshot } from "@/types/wall";
import { WALL_THEME } from "./wall-theme";
import { WidgetSlot } from "./widget-slot";

interface SortableWidgetCardProps {
	id: string;
	snapshot: WallSnapshot | null | undefined;
	onRemove: (id: string) => void;
}

/**
 * Pembungkus widget untuk mode EDIT: draggable (dnd-kit sortable) dengan
 * tombol ✕ untuk melepas. Seluruh kartu jadi handle drag; ✕ di-stop-propagation
 * supaya klik hapus tak memicu drag.
 */
export function SortableWidgetCard({
	id,
	snapshot,
	onRemove,
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
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		cursor: "grab",
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
		</div>
	);
}
