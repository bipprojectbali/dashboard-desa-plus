import { readSseStream } from "@/utils/sse-parser";
import type { ChatResult, TokenUsage, ToolCall } from "./types";

/**
 * Akumulasi stream `/chat/completions` (`stream: true`): teks `delta.content`
 * diteruskan ke `onDelta`, potongan `delta.tool_calls` digabung per `index`
 * (id & nama di potongan pertama, argumen JSON bersambung), usage dari chunk
 * terakhir (`stream_options.include_usage`).
 */

interface StreamToolCallDelta {
	index?: number;
	id?: string;
	function?: { name?: string; arguments?: string };
}

interface StreamChunk {
	choices?: Array<{
		delta?: { content?: string | null; tool_calls?: StreamToolCallDelta[] };
	}>;
	usage?: { prompt_tokens?: number; completion_tokens?: number } | null;
}

/** Stream berakhir tanpa data terbaca / chunk bukan JSON. */
export class StreamFormatError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "StreamFormatError";
	}
}

export function createStreamAccumulator(
	onDelta: (text: string) => void,
	parseArgs: (raw: string | undefined) => Record<string, unknown>,
) {
	let text = "";
	let sawChunk = false;
	let usage: TokenUsage | undefined;
	const calls = new Map<number, { id?: string; name: string; args: string }>();

	return {
		push(chunk: StreamChunk) {
			sawChunk = true;
			if (chunk.usage) {
				usage = {
					inputTokens: chunk.usage.prompt_tokens ?? 0,
					outputTokens: chunk.usage.completion_tokens ?? 0,
				};
			}
			const delta = chunk.choices?.[0]?.delta;
			if (delta?.content) {
				text += delta.content;
				onDelta(delta.content);
			}
			for (const tc of delta?.tool_calls ?? []) {
				const index = tc.index ?? 0;
				const current = calls.get(index) ?? { name: "", args: "" };
				if (tc.id) current.id = tc.id;
				if (tc.function?.name) current.name += tc.function.name;
				if (tc.function?.arguments) current.args += tc.function.arguments;
				calls.set(index, current);
			}
		},
		result(): ChatResult {
			if (!sawChunk) throw new StreamFormatError("Empty stream");
			const toolCalls: ToolCall[] = [...calls.entries()]
				.sort(([a], [b]) => a - b)
				.filter(([, c]) => c.name)
				.map(([i, c]) => ({
					id: c.id || `call_${i}`,
					name: c.name,
					args: parseArgs(c.args),
				}));
			return toolCalls.length > 0
				? { type: "tool_calls", toolCalls, text: text || undefined, usage }
				: { type: "text", text, usage };
		},
	};
}

/** Baca body SSE provider sampai `[DONE]`/habis lalu kembalikan hasil akhir. */
export async function readOpenAIStream(
	body: ReadableStream<Uint8Array>,
	onDelta: (text: string) => void,
	parseArgs: (raw: string | undefined) => Record<string, unknown>,
): Promise<ChatResult> {
	const acc = createStreamAccumulator(onDelta, parseArgs);
	let badChunk = false;
	await readSseStream(body, ({ data }) => {
		if (data === "[DONE]" || badChunk) return;
		try {
			acc.push(JSON.parse(data) as StreamChunk);
		} catch {
			// Satu chunk rusak membuat hasil tidak bisa dipercaya → gagal di akhir.
			badChunk = true;
		}
	});
	if (badChunk) throw new StreamFormatError("Invalid JSON chunk in stream");
	return acc.result();
}
