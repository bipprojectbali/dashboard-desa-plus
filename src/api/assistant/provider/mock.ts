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
 * berurutan; bila skrip habis, mengembalikan jawaban teks default.
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
		if (step === undefined) return { type: "text", text: "OK" };
		if (step instanceof Error) throw step;
		if (typeof step === "function") return step(messages, opts);
		return step;
	}
}
