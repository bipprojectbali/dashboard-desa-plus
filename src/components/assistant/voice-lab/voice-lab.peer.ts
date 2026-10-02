/** Koneksi WebRTC ke OpenAI: mikrofon keluar, data channel `oai-events`, audio masuk opsional. */

export interface PeerOptions {
	mic: MediaStream;
	/** Tukar SDP offer dengan answer (lewat server atau token sementara). */
	exchange(offerSdp: string): Promise<string>;
	onEvent(event: Record<string, unknown>): void;
	onClose(reason: string): void;
	/** Terima audio dari OpenAI (jalur V1-B). */
	onRemoteStream?(stream: MediaStream): void;
}

export interface Peer {
	send(event: Record<string, unknown>): boolean;
	close(): void;
}

/** Batas tunggu data channel terbuka setelah SDP answer diterapkan. */
const CHANNEL_OPEN_TIMEOUT_MS = 15_000;
const EVENTS_CHANNEL = "oai-events";

export async function openPeer(opts: PeerOptions): Promise<Peer> {
	const pc = new RTCPeerConnection();
	let closed = false;
	const close = (reason: string) => {
		if (closed) return;
		closed = true;
		pc.close();
		opts.onClose(reason);
	};

	for (const track of opts.mic.getAudioTracks()) pc.addTrack(track, opts.mic);
	if (opts.onRemoteStream) {
		const onStream = opts.onRemoteStream;
		pc.ontrack = (e) => {
			const stream = e.streams[0];
			if (stream) onStream(stream);
		};
	}
	pc.onconnectionstatechange = () => {
		if (
			pc.connectionState === "failed" ||
			pc.connectionState === "disconnected"
		)
			close(`Koneksi WebRTC ${pc.connectionState}`);
	};

	const channel = pc.createDataChannel(EVENTS_CHANNEL);
	channel.onmessage = (e) => {
		try {
			opts.onEvent(JSON.parse(String(e.data)) as Record<string, unknown>);
		} catch (err) {
			opts.onEvent({
				type: "client.parse_error",
				message: (err as Error).message,
			});
		}
	};
	channel.onclose = () => close("Data channel ditutup");

	const opened = new Promise<void>((resolve, reject) => {
		const timer = setTimeout(
			() => reject(new Error("Data channel tidak terbuka tepat waktu")),
			CHANNEL_OPEN_TIMEOUT_MS,
		);
		channel.onopen = () => {
			clearTimeout(timer);
			resolve();
		};
	});

	try {
		await pc.setLocalDescription(await pc.createOffer());
		const answer = await opts.exchange(pc.localDescription?.sdp ?? "");
		await pc.setRemoteDescription({ type: "answer", sdp: answer });
		await opened;
	} catch (err) {
		closed = true;
		pc.close();
		throw err;
	}

	return {
		send(event) {
			if (channel.readyState !== "open") return false;
			channel.send(JSON.stringify(event));
			return true;
		},
		close: () => close("Ditutup"),
	};
}
