import { FEATURES, loadAllowedFeatures } from "@/utils/permission";
import type { ToolSpec } from "../provider/types";
import { ringkasanBerandaTool } from "./beranda.tool";
import { statistikDemografiTool } from "./demografi.tool";
import { kinerjaDivisiTool } from "./divisi.tool";
import { lookupFaqTool } from "./faq.tool";
import { ringkasanKeuanganTool } from "./keuangan.tool";
import { statistikPengaduanTool } from "./pengaduan.tool";
import type { ToolContext, ToolDefinition } from "./types";

/** Semua tool assistant (baca-saja, rancangan 04 §4). Satu file per tool: `<domain>.tool.ts`. */
export const ASSISTANT_TOOLS: readonly ToolDefinition[] = [
	ringkasanBerandaTool,
	ringkasanKeuanganTool,
	statistikPengaduanTool,
	statistikDemografiTool,
	kinerjaDivisiTool,
	lookupFaqTool,
];

/** Tool yang boleh dipakai user: hanya yang `requiredFeature`-nya dimiliki. Hanya daftar ini yang dikirim ke LLM. */
export function getAvailableTools(
	ctx: Pick<ToolContext, "allowedFeatures">,
	tools: readonly ToolDefinition[] = ASSISTANT_TOOLS,
): ToolDefinition[] {
	return tools.filter((t) => ctx.allowedFeatures.has(t.requiredFeature));
}

/** Bentuk tool untuk dikirim ke provider (tanpa handler). */
export function toToolSpecs(tools: readonly ToolDefinition[]): ToolSpec[] {
	return tools.map(({ name, description, parameters }) => ({
		name,
		description,
		parameters,
	}));
}

/** Label modul data (`view-*`) yang tidak diizinkan — untuk catatan ketersediaan di prompt. */
export function getUnavailableModules(
	allowedFeatures: ReadonlySet<string>,
): string[] {
	return FEATURES.filter(
		(f) => f.key.startsWith("view-") && !allowedFeatures.has(f.key),
	).map((f) => f.label);
}

/** Rakit ToolContext dari user sesi; izin dibaca dari DB (error DB dilempar, tidak jatuh ke default). */
export async function buildToolContext(
	input: {
		user: { id: string; role: string };
		pageRoute?: string;
		now?: Date;
	},
	deps: { loadAllowed?: typeof loadAllowedFeatures } = {},
): Promise<ToolContext> {
	const allowed = await (deps.loadAllowed ?? loadAllowedFeatures)(
		input.user.role,
	);
	return {
		user: input.user,
		allowedFeatures: new Set(allowed),
		pageRoute: input.pageRoute,
		now: input.now ?? new Date(),
	};
}
