import { describe, expect, it } from "bun:test";
import {
	type AssistantSettingsValues,
	DEFAULT_ASSISTANT_SETTINGS,
	emptyProviderConfig,
} from "@/api/assistant/config/settings.repo";
import { SAFETY_IDENTIFIER_HEADER } from "@/api/assistant/voice/voice.constants";
import type { VoiceServiceDeps } from "@/api/assistant/voice/voice.context";
import {
	closeVoiceSession,
	extendVoiceSession,
	heartbeatVoiceSession,
	isVoiceSessionLive,
} from "@/api/assistant/voice/voice.lifecycle";
import {
	acceptVoiceConsent,
	startVoiceSession,
} from "@/api/assistant/voice/voice.service";
import { hashSafetyIdentifier } from "@/api/assistant/voice/voice.slot";
import { createMemoryVoiceRepo } from "./__fixtures__/memory-voice-repo";

/** Service mode suara: urutan cek, kunci satu sesi, sesi basi, menit nyata, kuota. Tanpa OpenAI asli. */

// test-only: kunci & SDP palsu
const FAKE_KEY = "sk-test-voice-key";
const OFFER = "v=0\r\no=- 1 1 IN IP4 127.0.0.1\r\ns=-\r\n";
const ANSWER = "v=0\r\no=- 2 2 IN IP4 127.0.0.1\r\ns=answer\r\n";
const T0 = new Date("2026-10-01T02:00:00Z"); // 10:00 WITA

function principal(id = "u1") {
	return {
		user: { id, role: "user" },
		allowedFeatures: ["use-ai-assistant", "use-ai-voice"],
	};
}

interface Upstream {
	url: string;
	headers: Headers;
	body: { session: Record<string, unknown> };
}

function setup(
	o: Partial<AssistantSettingsValues> = {},
	{ consent = true, slotReady = true, upstreamOk = true } = {},
) {
	const memory = createMemoryVoiceRepo();
	if (consent) memory.consents.add("u1");
	let clock = T0;
	const calls: Upstream[] = [];
	const settings = {
		...DEFAULT_ASSISTANT_SETTINGS,
		enabled: true,
		assistantName: "Sari",
		...o,
	};
	const deps: VoiceServiceDeps = {
		loadSettings: async () => settings,
		repo: memory.repo,
		now: () => clock,
		slot: {
			loadConfigs: async () => ({
				chat: emptyProviderConfig("chat"),
				pointer: emptyProviderConfig("pointer"),
				voice: slotReady
					? {
							...emptyProviderConfig("voice"),
							enabled: true,
							baseUrl: "https://voice.example.test/v1",
							apiKeyEnc: "enc-voice",
						}
					: emptyProviderConfig("voice"),
			}),
			decrypt: async () => FAKE_KEY,
		},
		fetchImpl: async (url, init) => {
			calls.push({
				url: String(url),
				headers: new Headers(init?.headers),
				body: JSON.parse(String(init?.body)),
			});
			return upstreamOk
				? Response.json({
						session: { id: "live-1" },
						transport: { sdp: ANSWER },
					})
				: new Response("boom", { status: 500 });
		},
	};
	const at = (seconds: number) => {
		clock = new Date(T0.getTime() + seconds * 1000);
	};
	const start = (user = principal()) =>
		startVoiceSession(user, { sdp: OFFER }, deps);
	return { ...memory, deps, calls, at, start, settings };
}

async function started(s: ReturnType<typeof setup>): Promise<string> {
	const res = await s.start();
	if (!res.ok) throw new Error(`start gagal: ${res.status} ${res.error}`);
	return res.value.sessionId;
}

describe("start sesi suara", () => {
	it("berhasil: SDP direlay dengan instruksi persona & safety id ter-hash", async () => {
		const s = setup();
		const res = await s.start();
		expect(res).toMatchObject({
			ok: true,
			value: {
				sdp: ANSWER,
				maxSeconds: 600,
				idleOffSeconds: 120,
				remainingTodaySeconds: 3600,
			},
		});
		expect(s.calls).toHaveLength(1);
		const call = s.calls[0];
		expect(call?.url).toBe("https://voice.example.test/v1/live/sessions");
		expect(call?.headers.get(SAFETY_IDENTIFIER_HEADER)).toBe(
			hashSafetyIdentifier("u1"),
		);
		expect(call?.headers.get("authorization")).toBe(`Bearer ${FAKE_KEY}`);
		expect(call?.body.session.model).toBe("gpt-live-1");
		expect(call?.body.session).not.toHaveProperty("voice");
		const instructions = String(call?.body.session.instructions);
		expect(instructions).toContain("Kamu Sari");
		expect(instructions.length).toBeLessThanOrEqual(500);
		expect(s.sessions[0]?.status).toBe("active");
	});

	it("voiceName diisi admin ikut dikirim", async () => {
		const s = setup({ voiceName: "marin" });
		await started(s);
		expect(s.calls[0]?.body.session.voice).toBe("marin");
	});

	it("belum setuju mikrofon → 403; setelah setuju → boleh", async () => {
		const s = setup({}, { consent: false });
		expect(await s.start()).toMatchObject({
			status: 403,
			code: "voice_consent_required",
		});
		await acceptVoiceConsent(principal(), s.deps);
		expect((await s.start()).ok).toBe(true);
	});

	it("asisten mati → 409 voice_disabled; slot Suara kosong → 409", async () => {
		expect(await setup({ enabled: false }).start()).toMatchObject({
			status: 409,
			code: "voice_disabled",
		});
		const empty = setup({}, { slotReady: false });
		expect(await empty.start()).toMatchObject({
			status: 409,
			code: "voice_slot_empty",
		});
		expect(empty.calls).toHaveLength(0);
	});

	it("start gagal di OpenAI tidak ditagih dan tidak mengunci", async () => {
		const s = setup({}, { upstreamOk: false });
		expect(await s.start()).toMatchObject({
			ok: false,
			code: "upstream_failed",
		});
		expect(s.sessions[0]).toMatchObject({
			status: "failed",
			endReason: "start_failed",
			billedSeconds: 0,
		});
		expect(await s.repo.findOpenSessions("u1")).toHaveLength(0);
		expect(await s.repo.sumBilledSince("u1", T0)).toBe(0);
	});
});

describe("satu sesi per user", () => {
	it("tab kedua ditolak 409, sesi pertama tidak terputus", async () => {
		const s = setup();
		const first = await started(s);
		expect(await s.start()).toMatchObject({
			status: 409,
			code: "voice_session_active",
		});
		expect(s.sessions.find((r) => r.id === first)?.status).toBe("active");
		expect(s.calls).toHaveLength(1);
	});

	it("dua start bersamaan: hanya satu yang menang, yang kalah tidak ditagih", async () => {
		const s = setup();
		const results = await Promise.all([s.start(), s.start()]);
		expect(results.filter((r) => r.ok)).toHaveLength(1);
		expect(results.find((r) => !r.ok)).toMatchObject({ status: 409 });
		expect(s.sessions.find((r) => r.endReason === "duplicate")).toMatchObject({
			status: "failed",
			billedSeconds: 0,
		});
	});

	it("heartbeat basi melepas kunci; sesi lama ditagih sampai heartbeat terakhir", async () => {
		const s = setup();
		const old = await started(s);
		s.at(15);
		await heartbeatVoiceSession(principal(), old, s.deps);
		s.at(80);
		expect(await isVoiceSessionLive("u1", old, s.deps)).toBe(false);
		expect((await s.start()).ok).toBe(true);
		expect(s.sessions.find((r) => r.id === old)).toMatchObject({
			endReason: "stale",
			billedSeconds: 15,
		});
	});
});

describe("heartbeat, perpanjang, tutup", () => {
	it("heartbeat melaporkan menit nyata dan sisa hari ini", async () => {
		const s = setup();
		const id = await started(s);
		s.at(30);
		expect(await heartbeatVoiceSession(principal(), id, s.deps)).toEqual({
			ok: true,
			value: {
				elapsedSeconds: 30,
				maxSeconds: 600,
				remainingTodaySeconds: 3570,
				stop: null,
			},
		});
		expect(await isVoiceSessionLive("u1", id, s.deps)).toBe(true);
	});

	it("batas sesi tercapai → stop max_duration; perpanjang menambah batas", async () => {
		const s = setup({ voiceSessionMaxMinutes: 1 });
		const id = await started(s);
		expect(await extendVoiceSession(principal(), id, s.deps)).toEqual({
			ok: true,
			value: { maxSeconds: 120 },
		});
		for (const t of [30, 60, 90]) {
			s.at(t);
			expect(
				(await heartbeatVoiceSession(principal(), id, s.deps)).ok && t,
			).toBe(t);
		}
		s.at(120);
		expect(await heartbeatVoiceSession(principal(), id, s.deps)).toMatchObject({
			ok: true,
			value: { stop: "max_duration" },
		});
		expect(s.sessions[0]).toMatchObject({
			status: "ended",
			billedSeconds: 120,
		});
		expect(await extendVoiceSession(principal(), id, s.deps)).toMatchObject({
			status: 409,
			code: "voice_session_ended",
		});
	});

	it("kuota menit harian habis saat berjalan → stop quota, start berikutnya 429", async () => {
		const s = setup({ voiceDailyMinutesUser: 1 });
		const id = await started(s);
		s.at(30);
		await heartbeatVoiceSession(principal(), id, s.deps);
		s.at(60);
		expect(await heartbeatVoiceSession(principal(), id, s.deps)).toMatchObject({
			ok: true,
			value: { stop: "quota", remainingTodaySeconds: 0 },
		});
		const again = await s.start();
		expect(again).toMatchObject({
			status: 429,
			code: "voice_quota_exhausted",
		});
		expect(!again.ok && again.retryAfterSec).toBeGreaterThan(0);
	});

	it("0 menit = tanpa batas; akun kiosk memakai kuota kiosk", async () => {
		const unlimited = setup({ voiceDailyMinutesUser: 0 });
		expect(await unlimited.start()).toMatchObject({
			value: { remainingTodaySeconds: null },
		});
		const kiosk = setup({ kioskUserId: "u1", voiceDailyMinutesKiosk: 5 });
		expect(await kiosk.start()).toMatchObject({
			value: { remainingTodaySeconds: 300 },
		});
	});

	it("tutup menagih waktu nyata dan idempoten", async () => {
		const s = setup();
		const id = await started(s);
		s.at(42);
		const close = () => closeVoiceSession(principal(), id, "user", s.deps);
		expect(await close()).toEqual({ ok: true, value: { billedSeconds: 42 } });
		s.at(100);
		expect(await close()).toEqual({ ok: true, value: { billedSeconds: 42 } });
		expect(s.sessions[0]).toMatchObject({ endReason: "user", status: "ended" });
	});

	it("sesi milik user lain → 404", async () => {
		const s = setup();
		const id = await started(s);
		const other = principal("u2");
		for (const res of [
			await heartbeatVoiceSession(other, id, s.deps),
			await extendVoiceSession(other, id, s.deps),
			await closeVoiceSession(other, id, "user", s.deps),
		])
			expect(res).toMatchObject({
				status: 404,
				code: "voice_session_not_found",
			});
		expect(await isVoiceSessionLive("u2", id, s.deps)).toBe(false);
	});

	it("admin mematikan asisten saat sesi berjalan → heartbeat menutup sesi", async () => {
		const s = setup();
		const id = await started(s);
		s.settings.enabled = false;
		s.at(20);
		expect(await heartbeatVoiceSession(principal(), id, s.deps)).toMatchObject({
			ok: true,
			value: { stop: "ended", elapsedSeconds: 20 },
		});
		expect(s.sessions[0]?.endReason).toBe("disabled");
	});
});
