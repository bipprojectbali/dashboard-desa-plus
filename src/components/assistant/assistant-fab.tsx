import { ActionIcon, Tooltip } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
import { lazy, Suspense, useCallback, useRef, useState } from "react";
import { useSnapshot } from "valtio";
import {
	assistantStore,
	closeAssistant,
	openAssistant,
} from "@/store/assistant";
import { fillTemplate } from "./assistant.logic";
import { AssistantReturnButton } from "./assistant-return-button";
import { AssistantCursor, cancelPointer, usePointerCancel } from "./pointer";
import { useAssistantAccess, useAssistantText } from "./use-assistant-access";

const AssistantPanel = lazy(() =>
	import("./assistant-panel").then((m) => ({ default: m.AssistantPanel })),
);

export type AssistantVariant = "default" | "wall";

/** z-index di atas konten & header AppShell, di bawah modal Mantine (200). */
const FAB_Z_INDEX = 190;

/**
 * Tombol AI melayang kanan bawah + panel (dimuat lazy saat pertama dibuka).
 * Tidak dirender bila user tidak memenuhi syarat (lihat shouldShowFab).
 */
export function AssistantFab({
	variant = "default",
}: {
	variant?: AssistantVariant;
}) {
	const access = useAssistantAccess();
	const text = useAssistantText();
	const { open } = useSnapshot(assistantStore);
	const fabRef = useRef<HTMLButtonElement>(null);
	const [panelLoaded, setPanelLoaded] = useState(false);

	usePointerCancel();

	const handleClose = useCallback(() => {
		cancelPointer();
		closeAssistant();
		// Panel tidak mengunci fokus, jadi fokus dikembalikan manual ke FAB.
		requestAnimationFrame(() => fabRef.current?.focus());
	}, []);

	if (!access.visible || !access.status) return null;
	const label = fillTemplate(text.fabLabel, {
		name: access.status.assistantName,
	});

	return (
		<>
			<AssistantCursor />
			<AssistantReturnButton />
			<Tooltip label={label} position="left" withArrow>
				<ActionIcon
					ref={fabRef}
					aria-label={label}
					aria-expanded={open}
					size={56}
					radius="xl"
					variant="gradient"
					gradient={{ from: "#1e3a5f", to: "#2563eb", deg: 135 }}
					onClick={() => {
						setPanelLoaded(true);
						openAssistant();
					}}
					style={{
						position: "fixed",
						// Di /wall, tombol "Layar penuh" menempati pojok kanan bawah.
						bottom: variant === "wall" ? 56 : 24,
						right: 24,
						zIndex: FAB_Z_INDEX,
						boxShadow: "0 4px 16px rgba(37,99,235,0.35)",
					}}
				>
					<IconSparkles size={26} />
				</ActionIcon>
			</Tooltip>
			{panelLoaded || open ? (
				<Suspense fallback={null}>
					<AssistantPanel
						status={access.status}
						allowed={access.allowed}
						pathname={access.pathname}
						withHeader={variant !== "wall"}
						onClose={handleClose}
					/>
				</Suspense>
			) : null}
		</>
	);
}
