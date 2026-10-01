import { POINTER_TARGETS } from "@/config/assistant-pointer";
import {
	actionResult,
	type PointerRegistryDeps,
	resolveTarget,
	WRITE_TARGET_NOTE,
} from "./pointer.guard";
import type { ToolDefinition } from "./types";

/** `tunjukkan_elemen` — gulir + kursor + sorotan ke elemen terdaftar (aksi `pointTo`). */
export function createTunjukkanElemenTool(
	deps: PointerRegistryDeps = {},
): ToolDefinition {
	const ids = (deps.targets ?? POINTER_TARGETS).map((t) => t.id);
	return {
		name: "tunjukkan_elemen",
		description:
			"Tunjuk sebuah bagian halaman dashboard (kartu, grafik, tombol) di layar pengguna: layar digulir dan elemen disorot. Pakai HANYA bila pengguna meminta ditunjukkan ('tunjukkan', 'di mana'). Bila halaman lain sedang terbuka, halaman target dibuka lebih dulu. Tool ini tidak mengambil data.",
		parameters: {
			type: "object",
			properties: {
				target: {
					type: "string",
					description:
						"ID target terdaftar, mis. keuangan.laporan. Bila tidak yakin, panggil dan baca daftar target dari pesan error.",
					...(ids.length > 0 ? { enum: ids } : {}),
				},
			},
			required: ["target"],
			additionalProperties: false,
		},
		requiredFeature: "use-ai-assistant",
		async handler(args, ctx) {
			const r = resolveTarget(args.target, "point", ctx, deps);
			if (!r.ok) return { ok: false, error: r.error };
			const t = r.value;
			const actions: Parameters<typeof actionResult>[0] = [];
			if (ctx.pageRoute !== t.route)
				actions.push({ type: "navigate", route: t.route });
			actions.push({ type: "pointTo", target: t.id });
			return actionResult(
				actions,
				t.kind === "write"
					? `${t.label} ditunjuk. ${WRITE_TARGET_NOTE}`
					: `${t.label} ditunjuk di layar pengguna.`,
			);
		},
	};
}
