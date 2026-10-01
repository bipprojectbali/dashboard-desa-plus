import { createBukaHalamanTool } from "./buka-halaman.tool";
import { createKlikElemenTool } from "./klik-elemen.tool";
import { createPilihTool } from "./pilih.tool";
import { createTunjukkanElemenTool } from "./tunjukkan-elemen.tool";
import type { ToolDefinition } from "./types";

/**
 * Tool penunjuk fitur 2 (rancangan 05 §4). SENGAJA tidak ada di `ASSISTANT_TOOLS`:
 * panel chat belum menjalankan `actions`, jadi AI tidak boleh menjanjikan aksi.
 * Didaftarkan di F2-b bersama pelaksana aksi di panel.
 */
export const POINTER_TOOLS: readonly ToolDefinition[] = [
	createBukaHalamanTool(),
	createTunjukkanElemenTool(),
	createKlikElemenTool(),
	createPilihTool(),
];
