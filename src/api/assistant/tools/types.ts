import type { FeatureKey } from "@/utils/permission";
import type { JsonSchemaObject } from "../provider/types";

/** Konteks satu giliran. Otorisasi hanya dari `user`/`allowedFeatures` (sesi), bukan dari argumen LLM. */
export interface ToolContext {
	user: { id: string; role: string };
	/** Hasil resolveAllowedFeatures() untuk role user. */
	allowedFeatures: ReadonlySet<string>;
	/** Petunjuk halaman dari klien — TIDAK dipakai untuk otorisasi. */
	pageRoute?: string;
	/** Disuntik agar test deterministik. */
	now: Date;
	/** Abort saat batas waktu tool/giliran habis. */
	signal?: AbortSignal;
}

export type ToolResult =
	| { ok: true; data: unknown }
	| { ok: false; error: string };

export interface ToolDefinition {
	/** snake_case, bahasa Indonesia, unik. */
	name: string;
	/** Dibaca LLM untuk memilih tool. */
	description: string;
	parameters: JsonSchemaObject;
	/** Izin yang wajib dimiliki user agar tool dikirim ke LLM & boleh dijalankan. */
	requiredFeature: FeatureKey;
	handler(args: Record<string, unknown>, ctx: ToolContext): Promise<ToolResult>;
}
