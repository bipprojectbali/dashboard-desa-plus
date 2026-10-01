/** Kontrak provider LLM untuk AI assistant (format netral, bukan format vendor). */

export interface ToolCall {
	id: string;
	name: string;
	/** Argumen hasil parse JSON dari LLM; `{}` bila LLM mengirim JSON tidak valid. */
	args: Record<string, unknown>;
}

export interface ChatMessage {
	role: "system" | "user" | "assistant" | "tool";
	content: string;
	/** Hanya untuk role "assistant" yang meminta tool. */
	toolCalls?: ToolCall[];
	/** Hanya untuk role "tool": id panggilan yang dijawab. */
	toolCallId?: string;
}

/** Deskripsi tool yang dikirim ke LLM (subset JSON Schema). */
export interface ToolSpec {
	name: string;
	description: string;
	parameters: JsonSchemaObject;
}

export interface JsonSchemaObject {
	type: "object";
	properties: Record<string, JsonSchemaProperty>;
	required?: string[];
	additionalProperties?: boolean;
}

export interface JsonSchemaProperty {
	type: "string" | "number" | "integer" | "boolean";
	description?: string;
	enum?: ReadonlyArray<string | number>;
}

export interface TokenUsage {
	inputTokens: number;
	outputTokens: number;
}

export type ChatResult =
	| { type: "text"; text: string; usage?: TokenUsage }
	| {
			type: "tool_calls";
			toolCalls: ToolCall[];
			text?: string;
			usage?: TokenUsage;
	  };

export interface ChatOptions {
	tools?: ToolSpec[];
	signal?: AbortSignal;
	/**
	 * Diisi = minta jawaban di-stream: potongan teks dikirim ke sini selama
	 * dihasilkan; hasil akhir tetap dikembalikan utuh seperti tanpa stream.
	 */
	onDelta?: (text: string) => void;
}

export interface AIProvider {
	chat(messages: ChatMessage[], opts?: ChatOptions): Promise<ChatResult>;
}

/**
 * Kategori kegagalan provider — dipetakan ke pesan user/admin:
 * `config` = kredensial/URL/model salah (401/403/4xx lain), `busy` = 429,
 * `unavailable` = 5xx/timeout/jaringan, `bad_response` = respons tak terbaca.
 */
export type AiProviderErrorKind =
	| "config"
	| "busy"
	| "unavailable"
	| "bad_response";

/** Error provider tanpa isi body/header vendor (bisa memuat data sensitif). */
export class AiProviderError extends Error {
	constructor(
		readonly kind: AiProviderErrorKind,
		message: string,
		readonly status?: number,
	) {
		super(message);
		this.name = "AiProviderError";
	}
}
