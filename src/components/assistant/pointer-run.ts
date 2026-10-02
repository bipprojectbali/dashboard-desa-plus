import { parseUiAction } from "@/config/assistant-pointer";
import { suspendPanelForPointer } from "@/store/assistant-return";
import type { UiActionOutcome } from "@/types/ai-assistant-pointer";
import {
	endGuide,
	executeUiActions,
	type GuideOptions,
	type PointerEnv,
	startGuide,
} from "./pointer";

/**
 * Jalankan aksi penunjuk dari panel. Panel yang sedang diperbesar ditutup
 * sementara lebih dulu (P6); mode 440px tetap terbuka. Aksi kosong = tidak
 * melakukan apa-apa (panel tidak disentuh). Aksi `guide` memulai panduan
 * bertahap (menggantikan aksi lain); aksi biasa mengakhiri panduan yang
 * sedang berjalan.
 */
export async function runPointerActions(
	actions: readonly unknown[],
	env: Partial<PointerEnv>,
	options: GuideOptions = {},
): Promise<UiActionOutcome> {
	if (actions.length === 0) return { ok: true };
	suspendPanelForPointer();
	const guide = actions.find((a) => parseUiAction(a)?.type === "guide");
	if (guide) return startGuide(guide, env, options);
	endGuide();
	return executeUiActions(actions, env);
}
