/** Akses mikrofon, pengukur level, dan cek dukungan browser untuk mode suara. */

export interface MicOptions {
	deviceId: string;
	echoCancellation: boolean;
	noiseSuppression: boolean;
}

/** Mode suara hanya didukung di Chrome/Edge desktop. */
export function isSupportedBrowser(): boolean {
	if (typeof navigator === "undefined") return false;
	const ua = navigator.userAgent;
	const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
	const chromium =
		/Chrome\/|Edg\//.test(ua) && !/OPR\/|SamsungBrowser/.test(ua);
	return chromium && !mobile;
}

export async function openMic(opts: MicOptions): Promise<MediaStream> {
	if (!navigator.mediaDevices?.getUserMedia)
		throw new Error("Browser tidak mendukung akses mikrofon");
	return navigator.mediaDevices.getUserMedia({
		audio: {
			echoCancellation: opts.echoCancellation,
			noiseSuppression: opts.noiseSuppression,
			autoGainControl: true,
			...(opts.deviceId ? { deviceId: { exact: opts.deviceId } } : {}),
		},
	});
}

export function stopStream(stream: MediaStream | null): void {
	stream?.getTracks().forEach((t) => {
		t.stop();
	});
}

export async function listInputDevices(): Promise<MediaDeviceInfo[]> {
	const all = await navigator.mediaDevices.enumerateDevices();
	return all.filter((d) => d.kind === "audioinput");
}

/** Pengaturan yang benar-benar diterapkan browser pada track pertama. */
export function appliedSettings(stream: MediaStream): {
	echoCancellation?: boolean;
	noiseSuppression?: boolean;
	label: string;
} {
	const track = stream.getAudioTracks()[0];
	const s = track?.getSettings() ?? {};
	return {
		echoCancellation: s.echoCancellation,
		noiseSuppression: s.noiseSuppression,
		label: track?.label ?? "",
	};
}

export const LEVEL_SAMPLE_MS = 50;

export interface LevelMeter {
	stop(): void;
}

/** Ukur RMS stream tiap `LEVEL_SAMPLE_MS` (dipakai meter UI dan VAD). */
export function createLevelMeter(
	stream: MediaStream,
	onSample: (rms: number, nowMs: number) => void,
): LevelMeter {
	const ctx = new AudioContext();
	const analyser = ctx.createAnalyser();
	analyser.fftSize = 1024;
	ctx.createMediaStreamSource(stream).connect(analyser);
	const buf = new Float32Array(analyser.fftSize);
	const timer = setInterval(() => {
		analyser.getFloatTimeDomainData(buf);
		let sum = 0;
		for (const v of buf) sum += v * v;
		onSample(Math.sqrt(sum / buf.length), performance.now());
	}, LEVEL_SAMPLE_MS);
	return {
		stop() {
			clearInterval(timer);
			void ctx.close().catch(() => undefined);
		},
	};
}

/** Batas tunggu pengumpulan kandidat ICE pada cek WebRTC. */
const ICE_CHECK_TIMEOUT_MS = 2500;

export interface WebRtcCheck {
	supported: boolean;
	candidates: number;
	detail: string;
}

/** Cek dasar WebRTC: bisa membuat offer dan mengumpulkan kandidat ICE lokal. */
export async function checkWebRtc(): Promise<WebRtcCheck> {
	if (typeof RTCPeerConnection === "undefined")
		return {
			supported: false,
			candidates: 0,
			detail: "RTCPeerConnection tidak ada",
		};
	const pc = new RTCPeerConnection();
	let candidates = 0;
	try {
		pc.createDataChannel("check");
		pc.addTransceiver("audio", { direction: "recvonly" });
		const done = new Promise<void>((resolve) => {
			pc.onicecandidate = (e) => {
				if (e.candidate) candidates++;
				else resolve();
			};
			setTimeout(resolve, ICE_CHECK_TIMEOUT_MS);
		});
		await pc.setLocalDescription(await pc.createOffer());
		await done;
		return {
			supported: true,
			candidates,
			detail: candidates > 0 ? "OK" : "Tidak ada kandidat ICE (jaringan/VPN?)",
		};
	} catch (err) {
		return { supported: false, candidates, detail: (err as Error).message };
	} finally {
		pc.close();
	}
}
