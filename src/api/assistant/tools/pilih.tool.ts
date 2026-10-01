import { POINTER_TARGETS } from "@/config/assistant-pointer";
import { fetchApbdesEntriesRaw } from "../../sources/apbdes";
import type { ApbdesEntryRaw } from "../../transforms/apbdes";
import { mapKeuanganList } from "../../transforms/keuangan-apbdes";
import { parseTahun } from "./keuangan.tool";
import {
	actionResult,
	type PointerRegistryDeps,
	resolveTarget,
} from "./pointer.guard";
import type { ToolDefinition } from "./types";

export interface PilihToolDeps extends PointerRegistryDeps {
	/** Tahun APBDes yang benar-benar ada di data (opsi dropdown Keuangan). */
	loadTahun?: () => Promise<number[]>;
}

async function defaultLoadTahun(): Promise<number[]> {
	const entries: ApbdesEntryRaw[] = await fetchApbdesEntriesRaw();
	return mapKeuanganList(entries).map((y) => y.tahun);
}

/** `pilih` — pilih nilai pada kontrol tampilan terdaftar (mis. tahun Keuangan); nilai divalidasi dari data. */
export function createPilihTool(deps: PilihToolDeps = {}): ToolDefinition {
	const loadTahun = deps.loadTahun ?? defaultLoadTahun;
	const ids = (deps.targets ?? POINTER_TARGETS)
		.filter((t) => t.kind === "view" && t.pilih)
		.map((t) => t.id);
	return {
		name: "pilih",
		description:
			"Pilih sebuah nilai pada kontrol pilihan di halaman (mis. tahun anggaran di halaman Keuangan) supaya tampilan berganti. Hanya mengubah tampilan, bukan data. Pakai HANYA bila pengguna meminta mengganti pilihan.",
		parameters: {
			type: "object",
			properties: {
				target: {
					type: "string",
					description: "ID kontrol terdaftar, mis. keuangan.tahun.",
					...(ids.length > 0 ? { enum: ids } : {}),
				},
				nilai: {
					type: "string",
					description: "Nilai yang dipilih, mis. 2025.",
				},
			},
			required: ["target", "nilai"],
			additionalProperties: false,
		},
		requiredFeature: "use-ai-assistant",
		async handler(args, ctx) {
			const r = resolveTarget(args.target, "pilih", ctx, deps);
			if (!r.ok) return { ok: false, error: r.error };
			const t = r.value;
			const spec = t.pilih;
			if (!spec)
				return { ok: false, error: `Target ${t.id} bukan kontrol pilihan.` };
			let value: string;
			if (spec.kind === "tahun") {
				const tahun = parseTahun(args.nilai);
				if (typeof tahun !== "number")
					return {
						ok: false,
						error: "Nilai tahun tidak valid (contoh: 2025).",
					};
				const tersedia = await loadTahun();
				if (!tersedia.includes(tahun))
					return {
						ok: false,
						error: `Tahun ${tahun} tidak tersedia. Tahun yang tersedia: ${tersedia.join(", ") || "(tidak ada)"}.`,
					};
				value = String(tahun);
			} else {
				const nilai = typeof args.nilai === "string" ? args.nilai.trim() : "";
				if (!spec.values.includes(nilai))
					return {
						ok: false,
						error: `Nilai tidak valid. Pilihan: ${spec.values.join(", ")}.`,
					};
				value = nilai;
			}
			const actions: Parameters<typeof actionResult>[0] = [];
			if (ctx.pageRoute !== t.route)
				actions.push({ type: "navigate", route: t.route });
			actions.push({ type: "pilih", target: t.id, value });
			return actionResult(
				actions,
				`${t.label} diatur ke ${value} di layar pengguna.`,
			);
		},
	};
}
