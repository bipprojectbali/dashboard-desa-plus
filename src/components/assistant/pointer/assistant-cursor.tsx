import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useSnapshot } from "valtio";
import { cursorPosition, pointerStore, refreshPointer } from "./pointer-store";

/** Di atas konten/FAB (190), di bawah modal Mantine (200+ tidak menutupi; overlay ini tak menangkap klik). */
const CURSOR_Z_INDEX = 195;
const RING_PAD = 6;
const MOVE_MS = 600;

const PULSE_CSS = `
@keyframes assistant-pointer-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(31,65,174,.45); } 50% { box-shadow: 0 0 0 10px rgba(31,65,174,0); } }
.assistant-pointer-ring { animation: assistant-pointer-pulse 1.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .assistant-pointer-ring { animation: none; } }
`;

/**
 * Kursor virtual + ring sorotan untuk fitur penunjuk. Tidak menangkap klik
 * (`pointer-events: none`) dan disembunyikan dari pembaca layar. Dipasang ke
 * panel chat di F2-b; digerakkan oleh `executeUiAction`.
 */
export function AssistantCursor() {
	const { rect, animate } = useSnapshot(pointerStore);

	useEffect(() => {
		if (!rect) return;
		let frame = 0;
		const onMove = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(refreshPointer);
		};
		window.addEventListener("scroll", onMove, true);
		window.addEventListener("resize", onMove);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("scroll", onMove, true);
			window.removeEventListener("resize", onMove);
		};
	}, [rect]);

	if (!rect || typeof document === "undefined") return null;
	const pos = cursorPosition(rect);
	const transition = animate
		? `transform ${MOVE_MS}ms cubic-bezier(.22,.8,.3,1)`
		: "none";

	return createPortal(
		<div
			aria-hidden="true"
			data-testid="assistant-pointer"
			style={{
				position: "fixed",
				inset: 0,
				pointerEvents: "none",
				zIndex: CURSOR_Z_INDEX,
			}}
		>
			<style>{PULSE_CSS}</style>
			<div
				className="assistant-pointer-ring"
				style={{
					position: "fixed",
					left: rect.x - RING_PAD,
					top: rect.y - RING_PAD,
					width: rect.width + RING_PAD * 2,
					height: rect.height + RING_PAD * 2,
					border: "3px solid #1F41AE",
					borderRadius: 18,
					background: "rgba(31,65,174,.06)",
				}}
			/>
			<svg
				width="28"
				height="28"
				viewBox="0 0 24 24"
				style={{
					position: "fixed",
					left: 0,
					top: 0,
					transform: `translate(${pos.x}px, ${pos.y}px)`,
					transition,
					filter: "drop-shadow(0 2px 4px rgba(0,0,0,.35))",
				}}
			>
				<title>Penunjuk</title>
				<path
					d="M4 2l16 9-7 2-3 7z"
					fill="#1F41AE"
					stroke="#fff"
					strokeWidth="1.5"
					strokeLinejoin="round"
				/>
			</svg>
		</div>,
		document.body,
	);
}
