import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useSnapshot } from "valtio";
import {
	LEAVE_FADE_MS,
	RING_FADE_MS,
	SPAWN_FADE_MS,
	SPAWN_SCALE,
} from "./pointer-motion";
import { pointerStore, refreshPointer } from "./pointer-store";

/** Di atas konten/FAB (190), di bawah modal Mantine (200+ tidak menutupi; overlay ini tak menangkap klik). */
const CURSOR_Z_INDEX = 195;
const RING_PAD = 6;
const CURSOR_SIZE = 28;
/** Ujung panah pada path (viewBox 24) dikalikan skala render, agar ujungnya tepat di titik tujuan. */
const CURSOR_TIP = { x: (4 * CURSOR_SIZE) / 24, y: (2 * CURSOR_SIZE) / 24 };

const PULSE_CSS = `
@keyframes assistant-pointer-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(31,65,174,.45); } 50% { box-shadow: 0 0 0 10px rgba(31,65,174,0); } }
.assistant-pointer-ring[data-visible="true"] { animation: assistant-pointer-pulse 1.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .assistant-pointer-ring { animation: none !important; } }
`;

/**
 * Kursor virtual + ring sorotan untuk fitur penunjuk. Posisi kursor digerakkan
 * `showPointer` (rAF) dan hanya di-set per frame — tanpa transisi CSS pada
 * posisi, sehingga ikut gulir/resize tidak "mengejar". Hanya opacity/skala
 * (spawn, pudar) dan ring yang bertransisi. Tidak menangkap klik
 * (`pointer-events: none`) dan disembunyikan dari pembaca layar.
 */
export function AssistantCursor() {
	const { cursor, rect, phase, ringVisible, animate } =
		useSnapshot(pointerStore);
	const active = cursor !== null;

	useEffect(() => {
		if (!active) return;
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
	}, [active]);

	if (!cursor || typeof document === "undefined") return null;
	const hidden = phase === "spawning" || phase === "leaving";
	const cursorTransition = animate
		? `opacity ${phase === "leaving" ? LEAVE_FADE_MS : SPAWN_FADE_MS}ms ease, transform ${SPAWN_FADE_MS}ms ease`
		: "none";

	return createPortal(
		<div
			aria-hidden="true"
			data-testid="assistant-pointer"
			data-phase={phase}
			style={{
				position: "fixed",
				inset: 0,
				pointerEvents: "none",
				zIndex: CURSOR_Z_INDEX,
			}}
		>
			<style>{PULSE_CSS}</style>
			{rect && (
				<div
					className="assistant-pointer-ring"
					data-testid="assistant-pointer-ring"
					data-visible={ringVisible}
					style={{
						position: "fixed",
						left: rect.x - RING_PAD,
						top: rect.y - RING_PAD,
						width: rect.width + RING_PAD * 2,
						height: rect.height + RING_PAD * 2,
						border: "3px solid #1F41AE",
						borderRadius: 18,
						background: "rgba(31,65,174,.06)",
						opacity: ringVisible ? 1 : 0,
						transition: animate ? `opacity ${RING_FADE_MS}ms ease` : "none",
					}}
				/>
			)}
			<div
				data-testid="assistant-pointer-cursor"
				style={{
					position: "fixed",
					left: 0,
					top: 0,
					transform: `translate(${cursor.x - CURSOR_TIP.x}px, ${cursor.y - CURSOR_TIP.y}px)`,
				}}
			>
				<svg
					width={CURSOR_SIZE}
					height={CURSOR_SIZE}
					viewBox="0 0 24 24"
					style={{
						display: "block",
						opacity: hidden ? 0 : 1,
						transform: `scale(${phase === "spawning" ? SPAWN_SCALE : 1})`,
						transformOrigin: `${CURSOR_TIP.x}px ${CURSOR_TIP.y}px`,
						transition: cursorTransition,
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
			</div>
		</div>,
		document.body,
	);
}
