import type { UiAction } from "@/types/ai-assistant-pointer";
import { findPointerTarget } from "./registry";

/** Tool penunjuk — bukan sumber data, jadi tidak tampil sebagai label "Sumber". */
export const POINTER_TOOL_NAMES: ReadonlySet<string> = new Set([
	"buka_halaman",
	"tunjukkan_elemen",
	"klik_elemen",
	"pilih",
]);

/**
 * Tool data → target registry kartu modulnya, untuk label "Sumber" yang bisa
 * diklik (P3). Modul tanpa target di sini tetap berupa teks biasa.
 */
export const SOURCE_POINTER_TARGETS: Readonly<Record<string, string>> = {
	ringkasan_beranda: "beranda.total-penduduk",
	kinerja_divisi: "divisi.teraktif",
	ringkasan_keuangan: "keuangan.kpi-total",
};

/**
 * Target kartu modul untuk sebuah tool, atau undefined bila tidak ada /
 * user tidak punya izin modulnya (izin dicek ulang di klien).
 */
export function sourceTargetFor(
	tool: string,
	allowed: readonly string[],
): string | undefined {
	const id = SOURCE_POINTER_TARGETS[tool];
	const target = findPointerTarget(id);
	return target && allowed.includes(target.requiredFeature) ? id : undefined;
}

/** Aksi untuk menunjuk target: navigasi dulu bila rute saat ini berbeda. */
export function pointActionsFor(
	targetId: string,
	currentRoute: string,
): UiAction[] {
	const target = findPointerTarget(targetId);
	if (!target) return [];
	const point: UiAction = { type: "pointTo", target: target.id };
	return currentRoute === target.route
		? [point]
		: [{ type: "navigate", route: target.route }, point];
}
