import { suspendPanelForPointer } from "@/store/assistant-return";
import type { UiActionOutcome } from "@/types/ai-assistant-pointer";
import { executeUiActions, type PointerEnv } from "./pointer";

/**
 * Jalankan aksi penunjuk dari panel. Panel yang sedang diperbesar ditutup
 * sementara lebih dulu (P6); mode 440px tetap terbuka. Aksi kosong = tidak
 * melakukan apa-apa (panel tidak disentuh).
 */
export async function runPointerActions(
	actions: readonly unknown[],
	env: Partial<PointerEnv>,
): Promise<UiActionOutcome> {
	if (actions.length === 0) return { ok: true };
	suspendPanelForPointer();
	return executeUiActions(actions, env);
}
