import { isWallRoute, WALL_TARGETS } from "@/config/assistant-pointer";
import type { JsonSchemaProperty } from "../provider/types";
import { createBukaHalamanTool } from "./buka-halaman.tool";
import { createKlikElemenTool } from "./klik-elemen.tool";
import { createPanduLangkahTool } from "./pandu-langkah.tool";
import { createPilihTool } from "./pilih.tool";
import { createTunjukkanElemenTool } from "./tunjukkan-elemen.tool";
import type { ToolContext, ToolDefinition } from "./types";

/** Tool penunjuk fitur 2 (rancangan 05 §4); didaftarkan di `ASSISTANT_TOOLS`, aksinya dijalankan panel. */
export const POINTER_TOOLS: readonly ToolDefinition[] = [
	createBukaHalamanTool(),
	createTunjukkanElemenTool(),
	createKlikElemenTool(),
	createPilihTool(),
	createPanduLangkahTool(),
];

const POINTER_TOOL_NAMES: ReadonlySet<string> = new Set(
	POINTER_TOOLS.map((t) => t.name),
);

/** True bila daftar tool user memuat tool penunjuk (untuk lapisan prompt). */
export function hasPointerTools(tools: readonly ToolDefinition[]): boolean {
	return tools.some((t) => POINTER_TOOL_NAMES.has(t.name));
}

/**
 * Di `/wall` enum `tunjukkan_elemen` diganti widget layar NOC yang boleh ditunjuk
 * user ini; di halaman lain daftar tool tak berubah (target `wall.*` tidak ditawarkan).
 * Hanya penyempit tampilan — guard di handler tetap menolak sendiri.
 */
export function scopePointerTools(
	tools: readonly ToolDefinition[],
	ctx: Pick<ToolContext, "allowedFeatures" | "pageRoute">,
): ToolDefinition[] {
	if (!isWallRoute(ctx.pageRoute)) return [...tools];
	const ids = WALL_TARGETS.filter((t) =>
		ctx.allowedFeatures.has(t.requiredFeature),
	).map((t) => t.id);
	const withIds = (p: JsonSchemaProperty): JsonSchemaProperty => {
		const { enum: _old, ...rest } = p;
		return ids.length > 0 ? { ...rest, enum: ids } : rest;
	};
	return tools.map((t) => {
		const props = t.parameters.properties;
		if (t.name === "tunjukkan_elemen" && props.target)
			return withParameters(t, { ...props, target: withIds(props.target) });
		const steps = props.langkah;
		const stepTarget = steps?.items?.properties.target;
		if (t.name === "pandu_langkah" && steps?.items && stepTarget)
			return withParameters(t, {
				...props,
				langkah: {
					...steps,
					items: {
						...steps.items,
						properties: {
							...steps.items.properties,
							target: withIds(stepTarget),
						},
					},
				},
			});
		return t;
	});
}

function withParameters(
	tool: ToolDefinition,
	properties: Record<string, JsonSchemaProperty>,
): ToolDefinition {
	return { ...tool, parameters: { ...tool.parameters, properties } };
}
