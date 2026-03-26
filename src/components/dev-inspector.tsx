import { useCallback, useEffect, useRef, useState } from "react";

interface CodeInfo {
	relativePath: string;
	line: string;
	column: string;
}

/**
 * Extracts data-inspector-* from fiber props or DOM attributes.
 * Handles React 19 fiber tree walk-up and DOM attribute fallbacks.
 */
function getCodeInfoFromElement(element: HTMLElement): CodeInfo | null {
	// Strategy 1: React internal props __reactProps$ (most accurate in R19)
	for (const key of Object.keys(element)) {
		if (key.startsWith("__reactProps$")) {
			// biome-ignore lint/suspicious/noExplicitAny: React internals
			const props = (element as any)[key];
			if (props?.["data-inspector-relative-path"]) {
				return {
					relativePath: props["data-inspector-relative-path"],
					line: props["data-inspector-line"] || "1",
					column: props["data-inspector-column"] || "1",
				};
			}
		}
		// Strategy 2: Walk fiber tree __reactFiber$
		if (key.startsWith("__reactFiber$")) {
			// biome-ignore lint/suspicious/noExplicitAny: React internals
			let f = (element as any)[key];
			while (f) {
				const p = f.pendingProps || f.memoizedProps;
				if (p?.["data-inspector-relative-path"]) {
					return {
						relativePath: p["data-inspector-relative-path"],
						line: p["data-inspector-line"] || "1",
						column: p["data-inspector-column"] || "1",
					};
				}
				// Fallback: _debugSource (React < 19)
				const src = f._debugSource ?? f._debugOwner?._debugSource;
				if (src?.fileName && src?.lineNumber) {
					return {
						relativePath: src.fileName,
						line: String(src.lineNumber),
						column: String(src.columnNumber ?? 1),
					};
				}
				f = f.return;
			}
		}
	}

	// Strategy 3: Universal DOM attribute fallback
	const rp = element.getAttribute("data-inspector-relative-path");
	if (rp) {
		return {
			relativePath: rp,
			line: element.getAttribute("data-inspector-line") || "1",
			column: element.getAttribute("data-inspector-column") || "1",
		};
	}

	return null;
}

/** Walks up DOM tree until source info is found. */
function findCodeInfo(target: HTMLElement): CodeInfo | null {
	let el: HTMLElement | null = target;
	while (el) {
		const info = getCodeInfoFromElement(el);
		if (info) return info;
		el = el.parentElement;
	}
	return null;
}

function openInEditor(info: CodeInfo) {
	fetch("/__open-in-editor", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			relativePath: info.relativePath,
			lineNumber: info.line,
			columnNumber: info.column,
		}),
	});
}

export function DevInspector({ children }: { children: React.ReactNode }) {
	const [active, setActive] = useState(false);
	const overlayRef = useRef<HTMLDivElement | null>(null);
	const tooltipRef = useRef<HTMLDivElement | null>(null);
	const lastInfoRef = useRef<CodeInfo | null>(null);

	const updateOverlay = useCallback((target: HTMLElement | null) => {
		const ov = overlayRef.current;
		const tt = tooltipRef.current;
		if (!ov || !tt) return;

		if (!target) {
			ov.style.display = "none";
			tt.style.display = "none";
			lastInfoRef.current = null;
			return;
		}

		const info = findCodeInfo(target);
		if (!info) {
			ov.style.display = "none";
			tt.style.display = "none";
			lastInfoRef.current = null;
			return;
		}

		lastInfoRef.current = info;

		const rect = target.getBoundingClientRect();
		ov.style.display = "block";
		ov.style.top = `${rect.top + window.scrollY}px`;
		ov.style.left = `${rect.left + window.scrollX}px`;
		ov.style.width = `${rect.width}px`;
		ov.style.height = `${rect.height}px`;

		tt.style.display = "block";
		tt.textContent = `${info.relativePath}:${info.line}`;
		const ttTop = rect.top + window.scrollY - 24;
		tt.style.top = `${ttTop > 0 ? ttTop : rect.bottom + window.scrollY + 4}px`;
		tt.style.left = `${rect.left + window.scrollX}px`;
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: updateOverlay is stable
	useEffect(() => {
		if (!active) return;

		const onMouseOver = (e: MouseEvent) =>
			updateOverlay(e.target as HTMLElement);

		const onClick = (e: MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			const info = lastInfoRef.current ?? findCodeInfo(e.target as HTMLElement);
			if (info) {
				const loc = `${info.relativePath}:${info.line}:${info.column}`;
				console.log("[DevInspector] Open:", loc);
				openInEditor(info);
			}
			setActive(false);
		};

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") setActive(false);
		};

		document.addEventListener("mouseover", onMouseOver, true);
		document.addEventListener("click", onClick, true);
		document.addEventListener("keydown", onKeyDown);
		document.body.style.cursor = "crosshair";

		return () => {
			document.removeEventListener("mouseover", onMouseOver, true);
			document.removeEventListener("click", onClick, true);
			document.removeEventListener("keydown", onKeyDown);
			document.body.style.cursor = "";
			if (overlayRef.current) overlayRef.current.style.display = "none";
			if (tooltipRef.current) tooltipRef.current.style.display = "none";
		};
	}, [active, updateOverlay]);

	// Hotkey: Ctrl+Shift+Cmd+C (macOS) / Ctrl+Shift+Alt+C
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (
				e.key.toLowerCase() === "c" &&
				e.ctrlKey &&
				e.shiftKey &&
				(e.metaKey || e.altKey)
			) {
				e.preventDefault();
				setActive((prev) => !prev);
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, []);

	return (
		<>
			{children}
			<div
				ref={overlayRef}
				style={{
					display: "none",
					position: "absolute",
					pointerEvents: "none",
					border: "2px solid #3b82f6",
					backgroundColor: "rgba(59,130,246,0.1)",
					zIndex: 99999,
					transition: "all 0.05s ease",
				}}
			/>
			<div
				ref={tooltipRef}
				style={{
					display: "none",
					position: "absolute",
					pointerEvents: "none",
					backgroundColor: "#1e293b",
					color: "#e2e8f0",
					fontSize: "12px",
					fontFamily: "monospace",
					padding: "2px 6px",
					borderRadius: "3px",
					zIndex: 100000,
					whiteSpace: "nowrap",
				}}
			/>
		</>
	);
}
