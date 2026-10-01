/**
 * Respons Server-Sent Events untuk `/api/assistant/chat/stream`. Header
 * mematikan cache & buffering proxy (nginx: `X-Accel-Buffering: no`);
 * komentar `: ping` berkala menjaga koneksi tetap hidup di balik proxy.
 */

export const SSE_HEADERS = {
	"content-type": "text/event-stream; charset=utf-8",
	"cache-control": "no-cache, no-transform",
	connection: "keep-alive",
	"x-accel-buffering": "no",
} as const;

export const SSE_PING_MS = 15_000;

/** Satu event SSE: `event: <nama>` + `data: <JSON satu baris>`. */
export function formatSseEvent(event: string, data: unknown): string {
	return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export type SseSend = (event: string, data: unknown) => void;

/**
 * Jalankan `run` sambil mengalirkan event-nya. Setelah klien memutus
 * (`signal`) atau stream ditutup, `send` diam-diam diabaikan.
 */
export function createSseResponse(
	run: (send: SseSend) => Promise<void>,
	signal?: AbortSignal,
	pingMs: number = SSE_PING_MS,
): Response {
	const encoder = new TextEncoder();
	const stream = new ReadableStream<Uint8Array>({
		async start(controller) {
			let closed = false;
			const write = (text: string) => {
				if (closed || signal?.aborted) return;
				try {
					controller.enqueue(encoder.encode(text));
				} catch {
					// Controller sudah ditutup runtime (klien pergi) — berhenti menulis.
					closed = true;
				}
			};
			const ping = setInterval(() => write(": ping\n\n"), pingMs);
			// Komentar pembuka agar header & koneksi langsung terkirim.
			write(": open\n\n");
			try {
				await run((event, data) => write(formatSseEvent(event, data)));
			} finally {
				clearInterval(ping);
				if (!closed) {
					closed = true;
					controller.close();
				}
			}
		},
	});
	return new Response(stream, { headers: SSE_HEADERS });
}
