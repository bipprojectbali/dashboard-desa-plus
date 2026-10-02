import {
	AI_CLICKABLE_ATTR,
	findPointerRoute,
	findPointerTarget,
	isWallRoute,
	POINTER_ROUTES,
	POINTER_TARGETS,
	type PointerRoute,
	type PointerTarget,
	parseUiAction,
	WALL_TARGETS,
} from "@/config/assistant-pointer";
import type { UiActionOutcome } from "@/types/ai-assistant-pointer";
import {
	beginPointerRun,
	endPointerRun,
	type PointerRun,
	withPointerNavigation,
} from "./pointer-cancel";
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
	/** Rute klien saat ini; `/wall` membatasi aksi ke penunjukan widget `wall.*`. */
	pathname: () => string;
	/** Jeda agar kursor terlihat sebelum klik/pilih; 0 saat reduced motion. */
	settleMs: number;
}

export const DEFAULT_ANCHOR_TIMEOUT_MS = 5000;
export const DEFAULT_SETTLE_MS = 400;

export function resolvePointerEnv(env: Partial<PointerEnv>): PointerEnv {
	return {
		doc: env.doc ?? document,
		targets: env.targets ?? POINTER_TARGETS,
		routes: env.routes ?? POINTER_ROUTES,
		navigate: env.navigate,
		pathname:
			env.pathname ??
			(() => (env.doc ?? document).defaultView?.location.pathname ?? ""),
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
	run?: PointerRun,
): Promise<UiActionOutcome> {
	const env = resolvePointerEnv(partialEnv);
	const cancelled = (): UiActionOutcome => ({ ok: false, reason: "cancelled" });
	if (run?.cancelled) return cancelled();
	const action = parseUiAction(raw);
	// Panduan bertahap punya sesi sendiri (guide-session), bukan aksi tunggal.
	if (!action || action.type === "guide")
		return { ok: false, reason: "invalid-action" };

	// Lapisan kedua (server juga menolak): di layar NOC tidak ada navigasi/klik/pilih dan hanya widget wall.* yang ditunjuk.
	const onWall = isWallRoute(env.pathname());
	if (onWall && action.type !== "pointTo")
		return { ok: false, reason: "wall-restricted" };

	if (action.type === "navigate") {
		if (!findPointerRoute(action.route, env.routes))
			return { ok: false, reason: "unknown-route" };
		if (!env.navigate) return { ok: false, reason: "navigate-unavailable" };
		releasePointerTarget();
		const navigate = env.navigate;
		await withPointerNavigation(() => navigate(action.route));
		return run?.cancelled ? cancelled() : { ok: true };
	}

	const target = findPointerTarget(
		action.target,
		onWall ? WALL_TARGETS : env.targets,
	);
	if (!target) return { ok: false, reason: "unknown-target" };
	if (action.type !== "pointTo" && target.kind !== "view")
		return { ok: false, reason: "forbidden-target" };
	if (action.type === "click" && !target.clickable)
		return { ok: false, reason: "not-clickable" };
	if (action.type === "pilih" && !target.pilih)
		return { ok: false, reason: "forbidden-target" };

	const el = await waitForAnchor(
		env.doc,
		target.id,
		env.anchorTimeoutMs,
		undefined,
		() => run?.cancelled === true,
	);
	if (run?.cancelled) return cancelled();
	if (!el) return { ok: false, reason: "anchor-timeout" };
	if (action.type === "click" && el.getAttribute(AI_CLICKABLE_ATTR) !== "true")
		return { ok: false, reason: "not-clickable" };

	const reduced = env.reducedMotion();
	await env.pointAt(el, reduced);
	if (run?.cancelled) return cancelled();
	if (action.type === "pointTo") return { ok: true };

	if (!reduced && env.settleMs > 0) await sleep(env.settleMs);
	if (run?.cancelled) return cancelled();
	if (action.type === "click") {
		el.click();
		return { ok: true };
	}
	return pickSelectOption(env.doc, el, action.value, env.anchorTimeoutMs);
}

/**
 * Jalankan daftar aksi berurutan; berhenti di kegagalan pertama. Kursor tetap
 * tampil di antara aksi (tidak memudar) dan baru memudar setelah rangkaian selesai.
 * Rangkaian ini terdaftar sebagai run aktif: pemicu pembatalan (pointer-cancel)
 * menghentikannya dengan hasil `cancelled`, yang oleh pemanggil diperlakukan senyap.
 */
export async function executeUiActions(
	actions: readonly unknown[],
	env: Partial<PointerEnv> = {},
): Promise<UiActionOutcome> {
	beginPointerSequence();
	const run = beginPointerRun();
	try {
		for (const action of actions) {
			const outcome = await executeUiAction(action, env, run);
			if (!outcome.ok) return outcome;
		}
		return { ok: true };
	} finally {
		endPointerRun(run);
		endPointerSequence();
	}
}
