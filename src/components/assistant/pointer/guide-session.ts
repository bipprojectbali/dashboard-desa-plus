import {
	findPointerRoute,
	findPointerTarget,
	isWallRoute,
	parseUiAction,
	WALL_TARGETS,
} from "@/config/assistant-pointer";
import type {
	GuideAction,
	UiAction,
	UiActionOutcome,
} from "@/types/ai-assistant-pointer";
import { guideStore } from "./guide-store";
import { cancelPointer, onPointerCancel } from "./pointer-cancel";
import {
	executeUiActions,
	type PointerEnv,
	resolvePointerEnv,
} from "./pointer-executor";
import { beginPointerSequence, endPointerSequence } from "./pointer-store";

export interface GuideOptions {
	/** Dipanggil bila langkah gagal ditampilkan (bukan dibatalkan user). */
	onFailure?: () => void;
}

interface GuideSession {
	steps: GuideAction["steps"];
	env: Partial<PointerEnv>;
	onWall: boolean;
	autoAdvanceSec: number | null;
	options: GuideOptions;
	index: number;
	timer: ReturnType<typeof setTimeout> | null;
}

// Di luar proxy valtio: timer dan referensi env bukan state tampilan.
let session: GuideSession | null = null;

function targetOf(s: GuideSession, id: string) {
	const env = resolvePointerEnv(s.env);
	return findPointerTarget(id, s.onWall ? WALL_TARGETS : env.targets);
}

/** Lapisan kedua (server sudah memvalidasi): setiap langkah harus target & rute terdaftar. */
function allStepsValid(s: GuideSession): boolean {
	const env = resolvePointerEnv(s.env);
	return s.steps.every((step) => {
		const t = targetOf(s, step.target);
		return t && (s.onWall || findPointerRoute(t.route, env.routes));
	});
}

/** Hentikan panduan: bersihkan timer dan state kartu, lepas penahan kursor. Aman dipanggil berulang. */
export function endGuide(): void {
	const s = session;
	if (!s) return;
	session = null;
	if (s.timer) clearTimeout(s.timer);
	guideStore.active = false;
	guideStore.stage = "moving";
	guideStore.autoAdvanceSec = null;
	endPointerSequence();
}

async function runStep(
	s: GuideSession,
	index: number,
): Promise<UiActionOutcome> {
	if (s.timer) clearTimeout(s.timer);
	s.timer = null;
	s.index = index;
	const step = s.steps[index];
	const target = step ? targetOf(s, step.target) : undefined;
	if (!step || !target) {
		endGuide();
		return { ok: false, reason: "unknown-target" };
	}
	guideStore.stage = "moving";
	guideStore.index = index;
	guideStore.text = step.text;

	const actions: UiAction[] = [];
	if (!s.onWall && resolvePointerEnv(s.env).pathname() !== target.route)
		actions.push({ type: "navigate", route: target.route });
	actions.push({ type: "pointTo", target: step.target });
	const outcome = await executeUiActions(actions, s.env);
	if (session !== s) return { ok: false, reason: "cancelled" };
	if (!outcome.ok) {
		endGuide();
		if (outcome.reason !== "cancelled") s.options.onFailure?.();
		return outcome;
	}
	guideStore.stage = "shown";
	if (s.autoAdvanceSec !== null)
		s.timer = setTimeout(() => {
			if (session === s) void guideNext();
		}, s.autoAdvanceSec * 1000);
	return { ok: true };
}

/**
 * Mulai panduan bertahap dari aksi `guide`. Seluruh langkah divalidasi dulu;
 * satu saja tak valid → tak ada yang berjalan. Selesai saat langkah pertama
 * tampil; langkah berikutnya berjalan lewat guideNext (tanpa memanggil AI).
 */
export async function startGuide(
	raw: unknown,
	env: Partial<PointerEnv> = {},
	options: GuideOptions = {},
): Promise<UiActionOutcome> {
	endGuide();
	const action = parseUiAction(raw);
	if (!action || action.type !== "guide")
		return { ok: false, reason: "invalid-action" };
	const onWall = isWallRoute(resolvePointerEnv(env).pathname());
	const s: GuideSession = {
		steps: action.steps,
		env,
		onWall,
		// Lanjut otomatis hanya di layar NOC; halaman biasa selalu manual.
		autoAdvanceSec: onWall ? (action.autoAdvanceSec ?? null) : null,
		options,
		index: 0,
		timer: null,
	};
	if (!allStepsValid(s)) return { ok: false, reason: "unknown-target" };

	// Kursor ditahan selama panduan, jadi tidak memudar di antara langkah.
	beginPointerSequence();
	session = s;
	guideStore.active = true;
	guideStore.total = s.steps.length;
	guideStore.autoAdvanceSec = s.autoAdvanceSec;
	return runStep(s, 0);
}

/** Lanjut: langkah berikutnya, atau selesai bila sudah langkah terakhir. Hanya setelah langkah tampil. */
export async function guideNext(): Promise<void> {
	const s = session;
	if (!s || guideStore.stage !== "shown") return;
	if (s.index + 1 >= s.steps.length) {
		endGuide();
		return;
	}
	await runStep(s, s.index + 1);
}

/** Stop oleh user: sama dengan pembatalan penunjuk (sorotan hilang, panduan berakhir). */
export function guideStop(): void {
	cancelPointer();
	endGuide();
}

export function isGuideActive(): boolean {
	return session !== null;
}

// Gulir saat meluncur, Esc, navigasi manual, dan panel ditutup mengakhiri panduan.
onPointerCancel(endGuide);
