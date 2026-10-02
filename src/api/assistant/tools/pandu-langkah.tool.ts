import { isWallRoute, POINTER_TARGETS } from "@/config/assistant-pointer";
import {
	GUIDE_MAX_STEPS,
	GUIDE_MAX_TEXT,
	type GuideStep,
} from "@/types/ai-assistant-pointer";
import { getAssistantSettings } from "../config/settings.repo";
import {
	actionResult,
	type PointerRegistryDeps,
	resolveTarget,
	WRITE_TARGET_NOTE,
} from "./pointer.guard";
import type { ToolDefinition } from "./types";

export interface PanduLangkahDeps extends PointerRegistryDeps {
	/** Detik lanjut otomatis di /wall (default: pengaturan admin). */
	autoAdvanceSec?: () => Promise<number>;
}

async function adminAutoAdvanceSec(): Promise<number> {
	return (await getAssistantSettings()).guideAutoAdvanceSec;
}

/**
 * `pandu_langkah` — panduan bertahap (#43): 1–5 bagian ditunjuk satu per satu,
 * masing-masing dengan penjelasan singkat. Semua langkah divalidasi di sini
 * sebelum aksi `guide` dikirim; klien memvalidasi lagi.
 */
export function createPanduLangkahTool(
	deps: PanduLangkahDeps = {},
): ToolDefinition {
	const ids = (deps.targets ?? POINTER_TARGETS).map((t) => t.id);
	const readAutoAdvance = deps.autoAdvanceSec ?? adminAutoAdvanceSec;
	return {
		name: "pandu_langkah",
		description: `Pandu pengguna menelusuri beberapa bagian dashboard satu per satu (maksimal ${GUIDE_MAX_STEPS} langkah), tiap langkah menunjuk satu bagian dengan penjelasan singkat. Pakai HANYA bila pengguna meminta dipandu atau ditunjukkan beberapa bagian ('pandu saya', 'tunjukkan 3 bagian penting'); untuk satu bagian saja pakai tunjukkan_elemen. Tool ini hanya menunjuk, tidak mengambil data, dan tidak boleh berisi angka dari data. Tulis penjelasan yang sama juga di jawabanmu.`,
		parameters: {
			type: "object",
			properties: {
				langkah: {
					type: "array",
					description: `Urutan langkah panduan, 1 sampai ${GUIDE_MAX_STEPS} item.`,
					minItems: 1,
					maxItems: GUIDE_MAX_STEPS,
					items: {
						type: "object",
						properties: {
							target: {
								type: "string",
								description: "ID target terdaftar, mis. keuangan.laporan.",
								...(ids.length > 0 ? { enum: ids } : {}),
							},
							penjelasan: {
								type: "string",
								description: `Penjelasan singkat bagian ini, teks biasa, maksimal ${GUIDE_MAX_TEXT} karakter.`,
							},
						},
						required: ["target", "penjelasan"],
						additionalProperties: false,
					},
				},
			},
			required: ["langkah"],
			additionalProperties: false,
		},
		requiredFeature: "use-ai-assistant",
		async handler(args, ctx) {
			const raw = args.langkah;
			if (!Array.isArray(raw) || raw.length < 1 || raw.length > GUIDE_MAX_STEPS)
				return {
					ok: false,
					error: `langkah harus berisi 1 sampai ${GUIDE_MAX_STEPS} item.`,
				};
			const steps: GuideStep[] = [];
			let hasWrite = false;
			for (const [i, item] of raw.entries()) {
				const n = i + 1;
				const rec =
					typeof item === "object" && item !== null
						? (item as Record<string, unknown>)
						: {};
				const text =
					typeof rec.penjelasan === "string" ? rec.penjelasan.trim() : "";
				if (text === "")
					return { ok: false, error: `Langkah ${n}: penjelasan wajib diisi.` };
				if (text.length > GUIDE_MAX_TEXT)
					return {
						ok: false,
						error: `Langkah ${n}: penjelasan maksimal ${GUIDE_MAX_TEXT} karakter.`,
					};
				const r = resolveTarget(rec.target, "point", ctx, deps);
				if (!r.ok) return { ok: false, error: `Langkah ${n}: ${r.error}` };
				if (r.value.kind === "write") hasWrite = true;
				steps.push({ target: r.value.id, text });
			}
			const wall = isWallRoute(ctx.pageRoute);
			const autoAdvanceSec = wall ? await readAutoAdvance() : undefined;
			const catatan = `Panduan ${steps.length} langkah dimulai di layar pengguna; pengguna menekan Lanjut atau Stop sendiri${wall ? " (di layar NOC lanjut otomatis)" : ""}. Tulis ringkasan tiap langkah di jawabanmu.${hasWrite ? ` ${WRITE_TARGET_NOTE}` : ""}`;
			return actionResult(
				[
					{
						type: "guide",
						steps,
						...(autoAdvanceSec !== undefined ? { autoAdvanceSec } : {}),
					},
				],
				catatan,
			);
		},
	};
}
