import { createDeadline } from "../deadline";
import {
	type AIProvider,
	AiProviderError,
	type ChatMessage,
	type ChatOptions,
	type ChatResult,
	type ToolCall,
	type ToolSpec,
} from "./types";

export interface OpenAICompatibleConfig {
	/** Base URL yang diakhiri `/v1` (mis. proxy Claude). */
	baseUrl: string;
	apiKey: string;
	model: string;
	/** null = tidak dikirim (model reasoning via proxy menolak temperature). */
	temperature: number | null;
	/** null = tidak dikirim. */
	maxTokens: number | null;
	timeoutMs: number;
}

export const PROVIDER_ERROR_MESSAGES = {
	config: "Konfigurasi layanan AI salah (periksa URL, API key, atau model).",
	busy: "Layanan AI sedang sibuk, coba lagi sebentar.",
	unavailable: "Layanan AI sedang tidak tersedia.",
	bad_response: "Respons layanan AI tidak dapat dibaca.",
} as const;

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

interface OpenAIToolCall {
	id?: string;
	function?: { name?: string; arguments?: string };
}

interface OpenAIResponse {
	choices?: Array<{
		message?: { content?: string | null; tool_calls?: OpenAIToolCall[] };
	}>;
	usage?: { prompt_tokens?: number; completion_tokens?: number };
}

function toOpenAIMessage(m: ChatMessage): Record<string, unknown> {
	if (m.role === "tool") {
		return { role: "tool", tool_call_id: m.toolCallId, content: m.content };
	}
	if (m.role === "assistant" && m.toolCalls?.length) {
		return {
			role: "assistant",
			content: m.content || null,
			tool_calls: m.toolCalls.map((c) => ({
				id: c.id,
				type: "function",
				function: { name: c.name, arguments: JSON.stringify(c.args) },
			})),
		};
	}
	return { role: m.role, content: m.content };
}

function toOpenAITool(t: ToolSpec) {
	return {
		type: "function",
		function: {
			name: t.name,
			description: t.description,
			parameters: t.parameters,
		},
	};
}

function parseArgs(raw: string | undefined): Record<string, unknown> {
	if (!raw) return {};
	try {
		const parsed: unknown = JSON.parse(raw);
		return parsed && typeof parsed === "object" && !Array.isArray(parsed)
			? (parsed as Record<string, unknown>)
			: {};
	} catch {
		// LLM kadang mengirim JSON rusak — diperlakukan sebagai tanpa argumen;
		// tool memvalidasi argumennya sendiri.
		return {};
	}
}

function errorForStatus(status: number): AiProviderError {
	if (status === 429) {
		return new AiProviderError("busy", PROVIDER_ERROR_MESSAGES.busy, status);
	}
	if (status >= 500) {
		return new AiProviderError(
			"unavailable",
			PROVIDER_ERROR_MESSAGES.unavailable,
			status,
		);
	}
	// 401/403 (kunci), 404 (URL/model), 3xx (redirect tidak diikuti), 4xx lain
	return new AiProviderError("config", PROVIDER_ERROR_MESSAGES.config, status);
}

/** Provider untuk endpoint `/chat/completions` bergaya OpenAI (mis. proxy Claude). */
export class OpenAICompatibleProvider implements AIProvider {
	constructor(
		private readonly config: OpenAICompatibleConfig,
		private readonly fetchImpl: FetchLike = fetch,
	) {}

	async chat(
		messages: ChatMessage[],
		opts: ChatOptions = {},
	): Promise<ChatResult> {
		const body: Record<string, unknown> = {
			model: this.config.model,
			messages: messages.map(toOpenAIMessage),
		};
		if (opts.tools?.length) {
			body.tools = opts.tools.map(toOpenAITool);
			body.tool_choice = "auto";
		}
		if (this.config.temperature !== null) {
			body.temperature = this.config.temperature;
		}
		if (this.config.maxTokens !== null) body.max_tokens = this.config.maxTokens;

		const url = `${this.config.baseUrl.replace(/\/+$/, "")}/chat/completions`;
		const deadline = createDeadline(this.config.timeoutMs, opts.signal);
		let res: Response;
		try {
			res = await this.fetchImpl(url, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					authorization: `Bearer ${this.config.apiKey}`,
				},
				body: JSON.stringify(body),
				redirect: "manual",
				signal: deadline.signal,
			});
		} catch (err) {
			// Timeout, abort giliran, atau jaringan — detail tidak diteruskan ke user
			throw new AiProviderError(
				"unavailable",
				`${PROVIDER_ERROR_MESSAGES.unavailable} (${(err as Error)?.name ?? "error"})`,
			);
		} finally {
			deadline.dispose();
		}

		if (!res.ok) throw errorForStatus(res.status);

		let json: OpenAIResponse;
		try {
			json = (await res.json()) as OpenAIResponse;
		} catch {
			throw new AiProviderError(
				"bad_response",
				PROVIDER_ERROR_MESSAGES.bad_response,
				res.status,
			);
		}
		return parseResponse(json);
	}
}

function parseResponse(json: OpenAIResponse): ChatResult {
	const message = json.choices?.[0]?.message;
	if (!message) {
		throw new AiProviderError(
			"bad_response",
			PROVIDER_ERROR_MESSAGES.bad_response,
		);
	}
	const usage = json.usage
		? {
				inputTokens: json.usage.prompt_tokens ?? 0,
				outputTokens: json.usage.completion_tokens ?? 0,
			}
		: undefined;

	const toolCalls: ToolCall[] = (message.tool_calls ?? [])
		.filter((c) => c.function?.name)
		.map((c, i) => ({
			id: c.id || `call_${i}`,
			name: c.function?.name ?? "",
			args: parseArgs(c.function?.arguments),
		}));

	if (toolCalls.length > 0) {
		return {
			type: "tool_calls",
			toolCalls,
			text: message.content ?? undefined,
			usage,
		};
	}
	return { type: "text", text: message.content ?? "", usage };
}
