import {
	actionResult,
	type PointerRegistryDeps,
	resolveRoute,
} from "./pointer.guard";
import type { ToolDefinition } from "./types";

/** `buka_halaman` — pindah ke halaman dashboard terdaftar (aksi `navigate`, dijalankan browser). */
export function createBukaHalamanTool(
	deps: PointerRegistryDeps = {},
): ToolDefinition {
	return {
		name: "buka_halaman",
		description:
			"Buka sebuah halaman dashboard di layar pengguna. Pakai HANYA bila pengguna meminta membuka/pindah ke halaman. Tool ini tidak mengambil data.",
		parameters: {
			type: "object",
			properties: {
				route: {
					type: "string",
					description: "Rute halaman, mis. /keuangan-anggaran.",
				},
			},
			required: ["route"],
			additionalProperties: false,
		},
		requiredFeature: "use-ai-assistant",
		async handler(args, ctx) {
			const r = resolveRoute(args.route, ctx, deps);
			if (!r.ok) return { ok: false, error: r.error };
			return actionResult(
				[{ type: "navigate", route: r.value.route }],
				`Halaman ${r.value.label} dibuka di layar pengguna.`,
			);
		},
	};
}
