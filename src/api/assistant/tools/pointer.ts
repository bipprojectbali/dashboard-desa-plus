import { createBukaHalamanTool } from "./buka-halaman.tool";
import { createKlikElemenTool } from "./klik-elemen.tool";
import { createPilihTool } from "./pilih.tool";
import { createTunjukkanElemenTool } from "./tunjukkan-elemen.tool";
import type { ToolDefinition } from "./types";

/** Tool penunjuk fitur 2 (rancangan 05 §4); didaftarkan di `ASSISTANT_TOOLS`, aksinya dijalankan panel. */
export const POINTER_TOOLS: readonly ToolDefinition[] = [
	createBukaHalamanTool(),
	createTunjukkanElemenTool(),
	createKlikElemenTool(),
	createPilihTool(),
];

const POINTER_TOOL_NAMES: ReadonlySet<string> = new Set(
	POINTER_TOOLS.map((t) => t.name),
);

/** True bila daftar tool user memuat tool penunjuk (untuk lapisan prompt). */
export function hasPointerTools(tools: readonly ToolDefinition[]): boolean {
	return tools.some((t) => POINTER_TOOL_NAMES.has(t.name));
}
