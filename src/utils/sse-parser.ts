/**
 * Parser Server-Sent Events inkremental (spesifikasi WHATWG, subset): potongan
 * teks dari stream boleh terpotong di mana saja. Dipakai server (stream
 * provider OpenAI-compatible) dan browser (`/api/assistant/chat/stream`).
 */

export interface SseEvent {
	/** Nama event; "message" bila baris `event:` tidak ada. */
	event: string;
	/** Gabungan baris `data:` (dipisah "\n"). */
	data: string;
}

export interface SseParser {
	/** Masukkan potongan teks berikutnya. */
	push(chunk: string): void;
	/** Akhiri stream: kirim event terakhir yang belum ditutup baris kosong. */
	end(): void;
}

/** Buat parser; `onEvent` dipanggil per event lengkap (komentar `:` diabaikan). */
export function createSseParser(onEvent: (e: SseEvent) => void): SseParser {
	let buffer = "";
	let event = "";
	let data: string[] = [];

	const dispatch = () => {
		if (data.length > 0)
			onEvent({ event: event || "message", data: data.join("\n") });
		event = "";
		data = [];
	};

	const handleLine = (line: string) => {
		if (line === "") return dispatch();
		if (line.startsWith(":")) return;
		const colon = line.indexOf(":");
		const field = colon === -1 ? line : line.slice(0, colon);
		let value = colon === -1 ? "" : line.slice(colon + 1);
		if (value.startsWith(" ")) value = value.slice(1);
		if (field === "event") event = value;
		else if (field === "data") data.push(value);
	};

	return {
		push(chunk) {
			buffer += chunk;
			const lines = buffer.split(/\r\n|\r|\n/);
			buffer = lines.pop() ?? "";
			for (const line of lines) handleLine(line);
		},
		end() {
			if (buffer) handleLine(buffer);
			buffer = "";
			dispatch();
		},
	};
}

/** Baca ReadableStream byte → event SSE sampai habis (atau signal abort). */
export async function readSseStream(
	body: ReadableStream<Uint8Array>,
	onEvent: (e: SseEvent) => void,
): Promise<void> {
	const reader = body.getReader();
	const decoder = new TextDecoder();
	const parser = createSseParser(onEvent);
	try {
		for (;;) {
			const { done, value } = await reader.read();
			if (done) break;
			parser.push(decoder.decode(value, { stream: true }));
		}
		parser.push(decoder.decode());
		parser.end();
	} finally {
		reader.releaseLock();
	}
}
