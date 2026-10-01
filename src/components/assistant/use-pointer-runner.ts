import { useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import { pointActionsFor } from "@/config/assistant-pointer";
import { setAssistantError } from "@/store/assistant";
import type { UiAction } from "@/types/ai-assistant-pointer";
import { runPointerActions } from "./pointer-run";
import { useAssistantText } from "./use-assistant-access";

/**
 * Penjalan aksi penunjuk untuk panel: navigasi lewat router, gerak/animasi
 * mengikuti prefers-reduced-motion (default executor). Kegagalan sisi klien
 * (mis. elemen tak muncul) dilaporkan sebagai pesan di panel.
 */
export function usePointerRunner() {
	const router = useRouter();
	const text = useAssistantText();

	const run = useCallback(
		async (actions: readonly UiAction[]) => {
			try {
				const outcome = await runPointerActions(actions, {
					navigate: (route) => router.navigate({ to: route }),
				});
				if (!outcome.ok) setAssistantError(text.pointerFailed);
			} catch {
				// Navigasi/DOM gagal di tengah aksi: jawaban AI tetap sah, cukup beri tahu user.
				setAssistantError(text.pointerFailed);
			}
		},
		[router, text],
	);

	/** Label "Sumber" diklik: tunjuk kartu modul tanpa memanggil AI (tanpa kuota). */
	const pointToSource = useCallback(
		(targetId: string) =>
			run(pointActionsFor(targetId, router.state.location.pathname)),
		[run, router],
	);

	return { run, pointToSource };
}
