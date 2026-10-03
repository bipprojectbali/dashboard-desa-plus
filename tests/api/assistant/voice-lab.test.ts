import { describe, expect, it } from "bun:test";
import api from "@/api";
import {
	emptyProviderConfig,
	type ProviderConfigRow,
	type ProviderSlot,
} from "@/api/assistant/config/settings.repo";
import { SAFETY_IDENTIFIER_HEADER } from "@/api/assistant/voice/voice.constants";
import { hashSafetyIdentifier } from "@/api/assistant/voice/voice.slot";
import {
	createLiveSession,
	createTranscribeToken,
	getVoiceLabConfig,
	openTtsStream,
	relayTranscribeCall,
	type VoiceLabDeps,
} from "@/api/assistant/voice-lab/voice-lab.service";

// test-only: kunci & ID palsu
const FAKE_KEY = "sk-test-voice-slot-key";
const FAKE_SDP = "v=0\r\no=- 1 1 IN IP4 127.0.0.1\r\ns=-\r\n";
const ADMIN = { id: "user-admin-1", authMethod: "session" as const };

type Configs = Record<ProviderSlot, ProviderConfigRow>;

function configs(voice: Partial<ProviderConfigRow> = {}): Configs {
	return {
		chat: {
			...emptyProviderConfig("chat"),
			enabled: true,
			baseUrl: "https://chat.example.test/v1",
			apiKeyEnc: "enc-chat",
			model: "m",
		},
		pointer: emptyProviderConfig("pointer"),
		voice: {
			...emptyProviderConfig("voice"),
			enabled: true,
			baseUrl: "https://voice.example.test/v1/",
			apiKeyEnc: "enc-voice",
			...voice,
		},
	};
}

interface Call {
	url: string;
	init: RequestInit;
}

function makeDeps(
	voice: Partial<ProviderConfigRow> = {},
	respond: (call: Call) => Response = () => Response.json({}),
) {
	const calls: Call[] = [];
	const decrypted: string[] = [];
	const deps: VoiceLabDeps = {
		checkAdmin: async () => null,
		loadConfigs: async () => configs(voice),
		decrypt: async (payload) => {
			decrypted.push(payload);
			return FAKE_KEY;
		},
		fetchImpl: async (url, init) => {
			const call = { url, init };
			calls.push(call);
			return respond(call);
		},
	};
	return { deps, calls, decrypted };
}

describe("voice-lab akses", () => {
	it("tanpa sesi → 401 JSON di semua endpoint", async () => {
		const cases: Array<[string, string, unknown?]> = [
			["GET", "/api/admin/ai-assistant/voice-lab/config"],
			["POST", "/api/admin/ai-assistant/voice-lab/transcribe-token", {}],
			[
				"POST",
				"/api/admin/ai-assistant/voice-lab/transcribe-call",
				{ sdp: FAKE_SDP },
			],
			[
				"POST",
				"/api/admin/ai-assistant/voice-lab/live-session",
				{ sdp: FAKE_SDP },
			],
			["POST", "/api/admin/ai-assistant/voice-lab/tts", { text: "halo" }],
		];
		for (const [method, path, body] of cases) {
			const res = await api.handle(
				new Request(`http://localhost${path}`, {
					method,
					headers: { "content-type": "application/json" },
					body: body === undefined ? undefined : JSON.stringify(body),
				}),
			);
			expect(res.status).toBe(401);
		}
	});

	it("non-admin → 403 dan tidak menyentuh slot maupun OpenAI", async () => {
		const { deps, calls, decrypted } = makeDeps();
		deps.checkAdmin = async () => ({ status: 403, error: "Hanya admin" });
		const results = [
			await getVoiceLabConfig(ADMIN, deps),
			await createTranscribeToken(ADMIN, {}, deps),
			await relayTranscribeCall(ADMIN, { sdp: FAKE_SDP }, deps),
			await createLiveSession(ADMIN, { sdp: FAKE_SDP }, deps),
			await openTtsStream(ADMIN, { text: "halo" }, undefined, deps),
		];
		for (const r of results) {
			expect(r.ok).toBe(false);
			if (!r.ok) expect(r.status).toBe(403);
		}
		expect(calls).toHaveLength(0);
		expect(decrypted).toHaveLength(0);
	});
});

describe("voice-lab slot Suara", () => {
	it("slot kosong → error jelas, TIDAK jatuh balik ke slot Chat", async () => {
		const { deps, calls, decrypted } = makeDeps({
			baseUrl: null,
			apiKeyEnc: null,
		});
		const r = await createTranscribeToken(ADMIN, {}, deps);
		expect(r.ok).toBe(false);
		if (!r.ok) {
			expect(r.status).toBe(409);
			expect(r.code).toBe("voice_slot_empty");
			expect(r.error).toContain("slot Suara");
		}
		expect(calls).toHaveLength(0);
		expect(decrypted).not.toContain("enc-chat");
	});

	it("slot nonaktif → error, tanpa panggilan OpenAI", async () => {
		const { deps, calls } = makeDeps({ enabled: false });
		const r = await openTtsStream(ADMIN, { text: "halo" }, undefined, deps);
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.code).toBe("voice_slot_disabled");
		expect(calls).toHaveLength(0);
	});

	it("config melaporkan slot siap tanpa membocorkan baseUrl/kunci", async () => {
		const { deps } = makeDeps();
		const r = await getVoiceLabConfig(ADMIN, deps);
		expect(r.ok).toBe(true);
		const text = JSON.stringify(r);
		expect(text).not.toContain(FAKE_KEY);
		expect(text).not.toContain("voice.example.test");
		if (r.ok) expect(r.value.slotReady).toBe(true);
	});

	it("config pada slot kosong: slotReady false + alasan", async () => {
		const { deps } = makeDeps({ apiKeyEnc: null });
		const r = await getVoiceLabConfig(ADMIN, deps);
		expect(r.ok && r.value.slotReady).toBe(false);
		if (r.ok) expect(r.value.slotError?.code).toBe("voice_slot_empty");
	});
});

describe("voice-lab token transkripsi", () => {
	const upstreamOk = () =>
		Response.json({ value: "ek_temp_123", expires_at: 1_900_000_000 });

	it("memanggil client_secrets di baseUrl slot, kunci hanya di header ke OpenAI", async () => {
		const { deps, calls } = makeDeps({}, upstreamOk);
		const r = await createTranscribeToken(ADMIN, { language: "id" }, deps);
		expect(r.ok).toBe(true);
		expect(calls).toHaveLength(1);
		expect(calls[0]?.url).toBe(
			"https://voice.example.test/v1/realtime/client_secrets",
		);
		const headers = calls[0]?.init.headers as Record<string, string>;
		expect(headers.Authorization).toBe(`Bearer ${FAKE_KEY}`);
		const body = JSON.parse(String(calls[0]?.init.body));
		expect(body.session.type).toBe("transcription");
		expect(body.session.audio.input.turn_detection).toBeNull();
		expect(body.session.audio.input.transcription.languages).toEqual(["id"]);
		expect(body.expires_after.seconds).toBeGreaterThan(0);
		expect(body.expires_after.seconds).toBeLessThanOrEqual(600);
	});

	it("respons ke browser memuat token sementara, bukan kunci slot", async () => {
		const { deps } = makeDeps({}, upstreamOk);
		const r = await createTranscribeToken(ADMIN, {}, deps);
		expect(r.ok).toBe(true);
		if (r.ok) {
			expect(r.value.value).toBe("ek_temp_123");
			expect(r.value.callsUrl).toBe(
				"https://voice.example.test/v1/realtime/calls",
			);
		}
		expect(JSON.stringify(r)).not.toContain(FAKE_KEY);
	});

	it("Safety-Identifier = hash ID user (bukan ID/email mentah)", async () => {
		const { deps, calls } = makeDeps({}, upstreamOk);
		await createTranscribeToken(
			{ ...ADMIN, id: "user-with-email@example.test" },
			{},
			deps,
		);
		const headers = calls[0]?.init.headers as Record<string, string>;
		const sent = headers[SAFETY_IDENTIFIER_HEADER];
		expect(sent).toBe(hashSafetyIdentifier("user-with-email@example.test"));
		expect(sent).toMatch(/^[0-9a-f]{64}$/);
		expect(sent).not.toContain("example.test");
	});

	it("validasi model/bahasa/delay: pola salah → 422 tanpa panggilan OpenAI", async () => {
		const { deps, calls } = makeDeps({}, upstreamOk);
		for (const input of [
			{ model: "bad model!" },
			{ model: "x".repeat(65) },
			{ language: "indonesia" },
			{ delay: "ultra" },
		]) {
			const r = await createTranscribeToken(ADMIN, input, deps);
			expect(r.ok).toBe(false);
			if (!r.ok) expect(r.status).toBe(422);
		}
		expect(calls).toHaveLength(0);
	});

	it("OpenAI menolak → 502 dengan kode HTTP, kunci tidak bocor", async () => {
		const { deps } = makeDeps({}, () =>
			Response.json(
				{ error: { message: "unsupported session type" } },
				{ status: 400 },
			),
		);
		const r = await createTranscribeToken(ADMIN, {}, deps);
		expect(r.ok).toBe(false);
		if (!r.ok) {
			expect(r.status).toBe(502);
			expect(r.error).toContain("HTTP 400");
			expect(r.error).not.toContain(FAKE_KEY);
		}
	});

	it("respons OpenAI tanpa token → 502 bentuk tidak sesuai", async () => {
		const { deps } = makeDeps({}, () => Response.json({ nope: true }));
		const r = await createTranscribeToken(ADMIN, {}, deps);
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.status).toBe(502);
	});

	it("jaringan gagal → 502 tanpa melempar", async () => {
		const { deps } = makeDeps();
		deps.fetchImpl = async () => {
			throw new TypeError("network down");
		};
		const r = await createTranscribeToken(ADMIN, {}, deps);
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.status).toBe(502);
	});
});

describe("voice-lab relay & sesi live", () => {
	it("relay transkripsi: multipart sdp+session ke /realtime/calls, mengembalikan SDP answer", async () => {
		const { deps, calls } = makeDeps(
			{},
			() => new Response("v=0\r\nanswer\r\n"),
		);
		const r = await relayTranscribeCall(ADMIN, { sdp: FAKE_SDP }, deps);
		expect(r.ok && r.value.sdp.startsWith("v=0")).toBe(true);
		expect(calls[0]?.url).toBe("https://voice.example.test/v1/realtime/calls");
		const form = calls[0]?.init.body as FormData;
		expect(form.get("sdp")).toContain("v=0");
		expect(JSON.parse(String(form.get("session"))).type).toBe("transcription");
		const headers = calls[0]?.init.headers as Record<string, string>;
		expect(headers["Content-Type"]).toBeUndefined();
		expect(headers[SAFETY_IDENTIFIER_HEADER]).toMatch(/^[0-9a-f]{64}$/);
	});

	it("sesi live: delegasi klien, transport webrtc, mengembalikan id + SDP answer", async () => {
		const { deps, calls } = makeDeps({}, () =>
			Response.json({
				session: { id: "live_1" },
				transport: { sdp: "v=0 answer" },
			}),
		);
		const r = await createLiveSession(
			ADMIN,
			{ sdp: FAKE_SDP, instructions: "Singkat saja" },
			deps,
		);
		expect(r.ok && r.value).toEqual({ sessionId: "live_1", sdp: "v=0 answer" });
		expect(calls[0]?.url).toBe("https://voice.example.test/v1/live/sessions");
		const body = JSON.parse(String(calls[0]?.init.body));
		expect(body.session.delegation).toEqual({ type: "client" });
		expect(body.session.model).toBe("gpt-live-1");
		expect(body.transport.type).toBe("webrtc");
		expect(JSON.stringify(r)).not.toContain(FAKE_KEY);
	});

	it("SDP bukan SDP / terlalu besar → 422", async () => {
		const { deps, calls } = makeDeps();
		for (const sdp of ["", "hello", `v=0${"a".repeat(70_000)}`]) {
			const r = await createLiveSession(ADMIN, { sdp }, deps);
			expect(r.ok).toBe(false);
			if (!r.ok) expect(r.status).toBe(422);
		}
		expect(calls).toHaveLength(0);
	});
});

describe("voice-lab TTS", () => {
	it("meneruskan badan audio dari /audio/speech dengan model & suara default", async () => {
		const { deps, calls } = makeDeps(
			{},
			() => new Response(new Uint8Array([1, 2, 3])),
		);
		const r = await openTtsStream(
			ADMIN,
			{ text: "Selamat pagi" },
			undefined,
			deps,
		);
		expect(r.ok).toBe(true);
		if (r.ok) {
			expect(new Uint8Array(await r.value.arrayBuffer())).toEqual(
				new Uint8Array([1, 2, 3]),
			);
		}
		expect(calls[0]?.url).toBe("https://voice.example.test/v1/audio/speech");
		const body = JSON.parse(String(calls[0]?.init.body));
		expect(body).toMatchObject({
			model: "gpt-4o-mini-tts",
			voice: "coral",
			input: "Selamat pagi",
			response_format: "mp3",
		});
	});

	it("teks kosong, terlalu panjang, atau suara/model tak valid → 422", async () => {
		const { deps, calls } = makeDeps();
		for (const input of [
			{ text: "   " },
			{ text: "a".repeat(4001) },
			{ text: "halo", voice: "Bad Voice" },
			{ text: "halo", model: "../x" },
			{ text: "halo", instructions: "i".repeat(501) },
		]) {
			const r = await openTtsStream(ADMIN, input, undefined, deps);
			expect(r.ok).toBe(false);
			if (!r.ok) expect(r.status).toBe(422);
		}
		expect(calls).toHaveLength(0);
	});

	it("teks yang dikirim ke OpenAI tidak muncul di pesan error", async () => {
		const { deps } = makeDeps({}, () => new Response("boom", { status: 500 }));
		const r = await openTtsStream(
			ADMIN,
			{ text: "nomor rahasia 12345" },
			undefined,
			deps,
		);
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error).not.toContain("12345");
	});
});
