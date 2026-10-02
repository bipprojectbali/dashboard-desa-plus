import {
	AI_CLICKABLE_ATTR,
	findPointerRoute,
	findPointerTarget,
	POINTER_ROUTES,
	POINTER_TARGETS,
	type PointerRoute,
	type PointerTarget,
	parseUiAction,
} from "@/config/assistant-pointer";
import type { UiActionOutcome } from "@/types/ai-assistant-pointer";
import {
	pointAtElement,
	prefersReducedMotion,
	sleep,
	waitForAnchor,
} from "./pointer-dom";
import { pickSelectOption } from "./pointer-select";
import {
	beginPointerSequence,
	endPointerSequence,
	releasePointerTarget,
} from "./pointer-store";

export interface PointerEnv {
	doc: Document;
	targets: readonly PointerTarget[];
	routes: readonly PointerRoute[];
	/** Pindah rute (mis. router.navigate). Tanpa ini aksi `navigate` ditolak. */
	navigate?: (route: string) => void | Promise<void>;
	reducedMotion: () => boolean;
	pointAt: (el: HTMLElement, reducedMotion: boolean) => Promise<void>;
	/** Batas tunggu elemen muncul (halaman pindah + data dimuat). */
	anchorTimeoutMs: number;
	/** Jeda agar kursor terlihat sebelum klik/pilih; 0 saat reduced motion. */
	settleMs: number;
}

export const DEFAULT_ANCHOR_TIMEOUT_MS = 5000;
export const DEFAULT_SETTLE_MS = 400;

function resolveEnv(env: Partial<PointerEnv>): PointerEnv {
	return {
		doc: env.doc ?? document,
		targets: env.targets ?? POINTER_TARGETS,
		routes: env.routes ?? POINTER_ROUTES,
		navigate: env.navigate,
		reducedMotion: env.reducedMotion ?? prefersReducedMotion,
		pointAt: env.pointAt ?? pointAtElement,
		anchorTimeoutMs: env.anchorTimeoutMs ?? DEFAULT_ANCHOR_TIMEOUT_MS,
		settleMs: env.settleMs ?? DEFAULT_SETTLE_MS,
	};
}

/**
 * Jalankan satu aksi dari server. Aksi/target di luar registry ditolak;
 * `click` hanya pada target `view` yang terdaftar boleh-diklik DAN elemennya
 * bertanda `data-ai-clickable`; tombol `write` tidak pernah ditekan.
 */
export async function executeUiAction(
	raw: unknown,
	partialEnv: Partial<PointerEnv> = {},
): Promise<UiActionOutcome> {
	const env = resolveEnv(partialEnv);
	const action = parseUiAction(raw);
	if (!action) return { ok: false, reason: "invalid-action" };

	if (action.type === "navigate") {
		if (!findPointerRoute(action.route, env.routes))
			return { ok: false, reason: "unknown-route" };
		if (!env.navigate) return { ok: false, reason: "navigate-unavailable" };
		releasePointerTarget();
		await env.navigate(action.route);
		return { ok: true };
	}

	const target = findPointerTarget(action.target, env.targets);
	if (!target) return { ok: false, reason: "unknown-target" };
	if (action.type !== "pointTo" && target.kind !== "view")
		return { ok: false, reason: "forbidden-target" };
	if (action.type === "click" && !target.clickable)
		return { ok: false, reason: "not-clickable" };
	if (action.type === "pilih" && !target.pilih)
		return { ok: false, reason: "forbidden-target" };

	const el = await waitForAnchor(env.doc, target.id, env.anchorTimeoutMs);
	if (!el) return { ok: false, reason: "anchor-timeout" };
	if (action.type === "click" && el.getAttribute(AI_CLICKABLE_ATTR) !== "true")
		return { ok: false, reason: "not-clickable" };

	const reduced = env.reducedMotion();
	await env.pointAt(el, reduced);
	if (action.type === "pointTo") return { ok: true };

	if (!reduced && env.settleMs > 0) await sleep(env.settleMs);
	if (action.type === "click") {
		el.click();
		return { ok: true };
	}
	return pickSelectOption(env.doc, el, action.value, env.anchorTimeoutMs);
}

/**
 * Jalankan daftar aksi berurutan; berhenti di kegagalan pertama. Kursor tetap
 * tampil di antara aksi (tidak memudar) dan baru memudar setelah rangkaian selesai.
 */
export async function executeUiActions(
	actions: readonly unknown[],
	env: Partial<PointerEnv> = {},
): Promise<UiActionOutcome> {
	beginPointerSequence();
	try {
		for (const action of actions) {
			const outcome = await executeUiAction(action, env);
			if (!outcome.ok) return outcome;
		}
		return { ok: true };
	} finally {
		endPointerSequence();
	}
}
