import type { AIProvider, ChatMessage, ChatOptions, ChatResult } from "./types";

/** Satu langkah skrip: hasil tetap, fungsi dari pesan masuk, atau error yang dilempar. */
export type MockStep =
	| ChatResult
	| Error
	| ((
			messages: ChatMessage[],
			opts: ChatOptions,
	  ) => ChatResult | Promise<ChatResult>);

export interface MockCall {
	messages: ChatMessage[];
	toolNames: string[];
}

/**
 * Provider deterministik untuk test (tanpa jaringan). Menjalankan `steps`
 * berurutan; bila skrip habis, mengembalikan jawaban teks default. Dengan
 * `onDelta`, teks hasil juga dikirim per kata (mensimulasikan stream).
 */
export class MockProvider implements AIProvider {
	readonly calls: MockCall[] = [];
	private index = 0;

	constructor(private readonly steps: MockStep[] = []) {}

	async chat(
		messages: ChatMessage[],
		opts: ChatOptions = {},
	): Promise<ChatResult> {
		this.calls.push({
			messages: messages.map((m) => ({ ...m })),
			toolNames: (opts.tools ?? []).map((t) => t.name),
		});
		const step = this.steps[this.index++];
		if (step instanceof Error) throw step;
		const result: ChatResult =
			step === undefined
				? { type: "text", text: "OK" }
				: typeof step === "function"
					? await step(messages, opts)
					: step;
		// Mode stream: teks dikirim per kata, seperti provider sungguhan.
		if (opts.onDelta && result.text) {
			for (const piece of splitIntoDeltas(result.text)) opts.onDelta(piece);
		}
		return result;
	}
}

/** Pecah teks per kata (spasi ikut di potongan) — gabungannya sama dengan teks asal. */
export function splitIntoDeltas(text: string): string[] {
	return text.match(/\S+\s*|\s+/g) ?? [];
}
