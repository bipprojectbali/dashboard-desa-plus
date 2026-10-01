import {
	findPointerRoute,
	findPointerTarget,
	POINTER_ROUTES,
	POINTER_TARGETS,
	type PointerRoute,
	type PointerTarget,
} from "@/config/assistant-pointer";
import type { UiAction } from "@/types/ai-assistant-pointer";
import type { ToolContext, ToolResult } from "./types";

/** Registry bisa disuntik agar test deterministik. */
export interface PointerRegistryDeps {
	targets?: readonly PointerTarget[];
	routes?: readonly PointerRoute[];
}

export const WRITE_TARGET_NOTE =
	"Elemen ini mengubah data, jadi AI tidak menekannya. Katakan kepada pengguna untuk menekannya sendiri.";

type Resolved<T> = { ok: true; value: T } | { ok: false; error: string };

/** Aksi hasil tool dibungkus `actions` (kontrak 04 §3) + catatan opsional untuk LLM. */
export function actionResult(
	actions: UiAction[],
	catatan?: string,
): ToolResult {
	return { ok: true, data: catatan ? { actions, catatan } : { actions } };
}

function allowed(ctx: Pick<ToolContext, "allowedFeatures">, feature: string) {
	return ctx.allowedFeatures.has(feature);
}

/** Rute terdaftar yang boleh dibuka user ini — dipakai di pesan error agar LLM bisa memperbaiki argumen. */
export function listAllowedRoutes(
	ctx: Pick<ToolContext, "allowedFeatures">,
	routes: readonly PointerRoute[] = POINTER_ROUTES,
): string[] {
	return routes
		.filter((r) => allowed(ctx, r.requiredFeature))
		.map((r) => r.route);
}

export function resolveRoute(
	value: unknown,
	ctx: Pick<ToolContext, "allowedFeatures">,
	deps: PointerRegistryDeps = {},
): Resolved<PointerRoute> {
	const routes = deps.routes ?? POINTER_ROUTES;
	const route = findPointerRoute(value, routes);
	if (!route) {
		return {
			ok: false,
			error: `Rute tidak terdaftar. Rute yang tersedia: ${listAllowedRoutes(ctx, routes).join(", ") || "(tidak ada)"}.`,
		};
	}
	if (!allowed(ctx, route.requiredFeature)) {
		return {
			ok: false,
			error: `Pengguna tidak punya akses ke halaman ${route.label}.`,
		};
	}
	return { ok: true, value: route };
}

export type TargetMode = "point" | "click" | "pilih";

/**
 * Cek target terdaftar + izin user + jenis aksi. `point` boleh untuk target
 * `write` (hanya ditunjuk); `click`/`pilih` hanya untuk `view` yang ditandai.
 */
export function resolveTarget(
	value: unknown,
	mode: TargetMode,
	ctx: Pick<ToolContext, "allowedFeatures">,
	deps: PointerRegistryDeps = {},
): Resolved<PointerTarget> {
	const targets = deps.targets ?? POINTER_TARGETS;
	const target = findPointerTarget(value, targets);
	if (!target) {
		const ids = targets
			.filter((t) => allowed(ctx, t.requiredFeature))
			.map((t) => t.id);
		return {
			ok: false,
			error: `Target tidak terdaftar. Target yang tersedia: ${ids.join(", ") || "(tidak ada)"}.`,
		};
	}
	if (!allowed(ctx, target.requiredFeature)) {
		return {
			ok: false,
			error: `Pengguna tidak punya akses ke modul untuk target ${target.id}.`,
		};
	}
	if (mode !== "point" && target.kind !== "view") {
		return {
			ok: false,
			error: `Target ${target.id} mengubah data dan hanya boleh ditunjuk. ${WRITE_TARGET_NOTE}`,
		};
	}
	if (mode === "click" && !target.clickable) {
		return {
			ok: false,
			error: `Target ${target.id} tidak ditandai boleh diklik. Gunakan tunjukkan_elemen.`,
		};
	}
	if (mode === "pilih" && !target.pilih) {
		return {
			ok: false,
			error: `Target ${target.id} bukan kontrol pilihan.`,
		};
	}
	return { ok: true, value: target };
}
