import { useRef } from "react";
import {
	clampGeom,
	WALL_BENTO_COL,
	WALL_BENTO_ROW,
	type WidgetGeom,
} from "./wall-bento";
import { WALL_THEME } from "./wall-theme";

interface ResizeHandleProps {
	/** Geometri tile saat ini (titik awal drag). */
	geom: WidgetGeom;
	/** Dipanggil tiap langkah sel berubah selama drag (sudah di-clamp). */
	onResize: (geom: WidgetGeom) => void;
}

interface DragState {
	startX: number;
	startY: number;
	startW: number;
	startH: number;
	colStep: number;
	rowStep: number;
}

/**
 * Baca ukuran langkah sel aktual dari grid: lebar track kolom (auto-fill,
 * dinamis) + gap, dan tinggi baris tetap ({@link WALL_BENTO_ROW}) + gap. Dipakai
 * mengonversi delta pointer (px) → jumlah sel saat resize. Fallback ke unit
 * dasar bila komputasi gagal (mis. grid belum layout).
 */
function readGridSteps(gridEl: Element): { colStep: number; rowStep: number } {
	const cs = getComputedStyle(gridEl);
	const cols = cs.gridTemplateColumns
		.split(" ")
		.map((t) => Number.parseFloat(t))
		.filter((n) => Number.isFinite(n));
	const colUnit = cols[0] ?? WALL_BENTO_COL;
	const colGap = Number.parseFloat(cs.columnGap) || 0;
	const rowGap = Number.parseFloat(cs.rowGap) || 0;
	return {
		colStep: colUnit + colGap,
		rowStep: WALL_BENTO_ROW + rowGap,
	};
}

/**
 * Handle drag-resize di pojok kanan-bawah tile (mode edit). Tarik → snap ke
 * sel grid: delta pointer dibagi ukuran langkah sel, dijepit ke batas
 * {@link clampGeom}. `stopPropagation` di pointerdown mencegah drag-reorder
 * dnd-kit ikut aktif (kartu adalah handle drag). Pakai pointer capture supaya
 * drag terus terlacak walau kursor keluar dari handle.
 */
export function ResizeHandle({ geom, onResize }: ResizeHandleProps) {
	const ref = useRef<HTMLButtonElement>(null);
	const drag = useRef<DragState | null>(null);

	const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
		// Cegah sortable dnd-kit memulai drag & seleksi teks.
		e.stopPropagation();
		e.preventDefault();
		const gridEl = ref.current?.closest("[data-wall-grid]");
		if (!gridEl) return;
		const steps = readGridSteps(gridEl);
		drag.current = {
			startX: e.clientX,
			startY: e.clientY,
			startW: geom.w,
			startH: geom.h,
			...steps,
		};
		ref.current?.setPointerCapture(e.pointerId);
	};

	const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
		const d = drag.current;
		if (!d) return;
		const dCols = Math.round((e.clientX - d.startX) / d.colStep);
		const dRows = Math.round((e.clientY - d.startY) / d.rowStep);
		onResize(clampGeom({ w: d.startW + dCols, h: d.startH + dRows }));
	};

	const endDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
		if (!drag.current) return;
		drag.current = null;
		ref.current?.releasePointerCapture?.(e.pointerId);
	};

	return (
		<button
			ref={ref}
			type="button"
			aria-label="Ubah ukuran widget"
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={endDrag}
			onPointerCancel={endDrag}
			style={{
				position: "absolute",
				right: 4,
				bottom: 4,
				width: 22,
				height: 22,
				padding: 0,
				display: "flex",
				alignItems: "flex-end",
				justifyContent: "flex-end",
				border: "none",
				background: "transparent",
				color: WALL_THEME.TEXT_DIM,
				cursor: "nwse-resize",
				touchAction: "none",
				lineHeight: 1,
			}}
		>
			{/* Glyph pojok resize (◢) — kontras rendah, hanya isyarat mode edit. */}
			<svg
				width="12"
				height="12"
				viewBox="0 0 12 12"
				fill="none"
				aria-hidden="true"
			>
				<title>Ubah ukuran</title>
				<path
					d="M11 1v10H1"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					opacity="0.5"
				/>
				<path
					d="M11 5v6H5"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
			</svg>
		</button>
	);
}
