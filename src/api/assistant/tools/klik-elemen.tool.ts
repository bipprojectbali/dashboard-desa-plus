import { POINTER_TARGETS } from "@/config/assistant-pointer";
import {
	actionResult,
	type PointerRegistryDeps,
	resolveTarget,
} from "./pointer.guard";
import type { ToolDefinition } from "./types";

/** `klik_elemen` — klik elemen TAMPILAN yang ditandai boleh-diklik (aksi `click`). Tombol tulis ditolak. */
export function createKlikElemenTool(
	deps: PointerRegistryDeps = {},
): ToolDefinition {
	const ids = (deps.targets ?? POINTER_TARGETS)
		.filter((t) => t.kind === "view" && t.clickable)
		.map((t) => t.id);
	return {
		name: "klik_elemen",
		description:
			"Klik elemen tampilan (tab, detail, muat ulang) pada halaman yang sedang terbuka, hanya untuk target yang ditandai boleh diklik. Tidak pernah dipakai untuk tombol yang mengubah data — itu hanya ditunjuk dengan tunjukkan_elemen. Pakai HANYA bila pengguna meminta.",
		parameters: {
			type: "object",
			properties: {
				target: {
					type: "string",
					description: "ID target terdaftar yang boleh diklik.",
					...(ids.length > 0 ? { enum: ids } : {}),
				},
			},
			required: ["target"],
			additionalProperties: false,
		},
		requiredFeature: "use-ai-assistant",
		async handler(args, ctx) {
			const r = resolveTarget(args.target, "click", ctx, deps);
			if (!r.ok) return { ok: false, error: r.error };
			const t = r.value;
			const actions: Parameters<typeof actionResult>[0] = [];
			if (ctx.pageRoute !== t.route)
				actions.push({ type: "navigate", route: t.route });
			actions.push({ type: "click", target: t.id });
			return actionResult(actions, `${t.label} diklik di layar pengguna.`);
		},
	};
}
