import { describe, expect, it } from "bun:test";
import api from "@/api";
import {
	type ChatServiceDeps,
	type ChatTurnInput,
	runChatTurn,
} from "@/api/assistant/chat/chat.service";
import { DEFAULT_ASSISTANT_SETTINGS } from "@/api/assistant/config/settings.repo";
import { ACCESS_MESSAGES } from "@/api/assistant/http/access";
import { SlidingWindowRateLimiter } from "@/api/assistant/limits/usage";
import { MockProvider } from "@/api/assistant/provider/mock";
import { VOICE_SESSION_MESSAGES } from "@/api/assistant/voice/voice.constants";
import {
	billableSeconds,
	dailyVoiceLimitSeconds,
	isStaleSession,
	remainingTodaySeconds,
	settleStaleSession,
	type VoiceSessionRow,
} from "@/api/assistant/voice/voice.quota";
import {
	createMemoryRepo,
	enabledSettings,
} from "./__fixtures__/memory-chat-repo";

/** Giliran suara lewat jalur chat yang sama + hitungan menit murni + guard route. */

const NOW = new Date("2026-10-01T02:00:00Z");
const VOICE_FEATURES = ["use-ai-assistant", "use-ai-voice"];

function setup(o: Partial<ChatServiceDeps> = {}) {
	const memory = createMemoryRepo();
	const provider = new MockProvider([{ type: "text", text: "Dua kalimat." }]);
	const liveChecks: string[] = [];
	const deps: ChatServiceDeps = {
		loadSettings: async () => enabledSettings(),
		resolveProvider: async () => ({
			ok: true,
			provider,
			slot: "chat",
			model: "mock",
		}),
		getUsage: async () => ({ messagesToday: 0, tokensToday: 0 }),
		rateLimiter: new SlidingWindowRateLimiter(),
		tools: [],
		repo: memory.repo,
		now: () => NOW,
		voiceSessionLive: async (_userId, id) => {
			liveChecks.push(id);
			return id === "vs-live";
		},
		...o,
	};
	const turn = (
		input: Partial<ChatTurnInput> = {},
		features = VOICE_FEATURES,
	) =>
		runChatTurn(
			{
				principal: {
					user: { id: "u1", role: "user" },
					allowedFeatures: features,
				},
				message: "Berapa anggaran desa?",
				modality: "voice",
				voiceSessionId: "vs-live",
				...input,
			},
			deps,
		);
	return { ...memory, provider, liveChecks, turn };
}

describe("runChatTurn — modality voice", () => {
	it("tanpa izin use-ai-voice → 403, provider tidak dipanggil", async () => {
		const s = setup();
		expect(await s.turn({}, ["use-ai-assistant"])).toEqual({
			ok: false,
			status: 403,
			error: ACCESS_MESSAGES.noVoicePermission,
		});
		expect(s.provider.calls).toHaveLength(0);
	});

	it("sesi suara tidak hidup / tidak dikirim → 409", async () => {
		const s = setup();
		for (const voiceSessionId of ["vs-ended", undefined]) {
			expect(await s.turn({ voiceSessionId })).toEqual({
				ok: false,
				status: 409,
				error: VOICE_SESSION_MESSAGES.ended,
			});
		}
		expect(s.liveChecks).toEqual(["vs-ended"]);
		expect(s.messages).toHaveLength(0);
	});

	it("giliran suara tersimpan dengan modality voice dan memakai prompt suara", async () => {
		const s = setup();
		const res = await s.turn();
		expect(res.ok).toBe(true);
		expect(s.messages.map((m) => [m.role, m.modality])).toEqual([
			["user", "voice"],
			["assistant", "voice"],
		]);
		const system = s.provider.calls[0]?.messages[0]?.content ?? "";
		expect(system).toContain("DIBACAKAN");
		expect(system).toContain("2–4 kalimat");
	});

	it("chat teks biasa tidak memeriksa sesi suara dan tetap modality text", async () => {
		const s = setup();
		const res = await s.turn(
			{ modality: undefined, voiceSessionId: undefined },
			["use-ai-assistant"],
		);
		expect(res.ok).toBe(true);
		expect(s.liveChecks).toHaveLength(0);
		expect(s.messages.every((m) => m.modality === "text")).toBe(true);
		const system = s.provider.calls[0]?.messages[0]?.content ?? "";
		expect(system).not.toContain("DIBACAKAN");
	});

	it("giliran suara memakan kuota pesan teks yang sama", async () => {
		const s = setup({
			getUsage: async () => ({
				messagesToday: DEFAULT_ASSISTANT_SETTINGS.dailyMessageLimitPerUser,
				tokensToday: 0,
			}),
		});
		expect(await s.turn()).toMatchObject({ ok: false, status: 429 });
	});
});

const SETTINGS = {
	...DEFAULT_ASSISTANT_SETTINGS,
	kioskUserId: "kiosk",
	voiceDailyMinutesUser: 60,
	voiceDailyMinutesKiosk: 0,
	voiceSessionMaxMinutes: 10,
};

function row(o: Partial<VoiceSessionRow> = {}): VoiceSessionRow {
	return {
		id: "vs-1",
		userId: "u1",
		status: "active",
		startedAt: NOW,
		lastHeartbeatAt: NOW,
		endedAt: null,
		billedSeconds: 0,
		extendedSeconds: 0,
		endReason: null,
		...o,
	};
}

const plus = (seconds: number) => new Date(NOW.getTime() + seconds * 1000);

describe("hitungan menit suara", () => {
	it("batas harian per user vs kiosk; 0 = tanpa batas", () => {
		expect(dailyVoiceLimitSeconds(SETTINGS, "u1")).toBe(3600);
		expect(dailyVoiceLimitSeconds(SETTINGS, "kiosk")).toBeNull();
		expect(remainingTodaySeconds(null, 9999)).toBeNull();
		expect(remainingTodaySeconds(3600, 4000)).toBe(0);
	});

	it("tagihan = waktu nyata, maksimal batas sesi + perpanjangan", () => {
		expect(billableSeconds(row(), plus(90), SETTINGS)).toBe(90);
		expect(billableSeconds(row(), plus(5000), SETTINGS)).toBe(600);
		expect(
			billableSeconds(row({ extendedSeconds: 60 }), plus(5000), SETTINGS),
		).toBe(660);
		expect(billableSeconds(row(), plus(-5), SETTINGS)).toBe(0);
	});

	it("sesi basi setelah 45 dtk tanpa heartbeat, ditagih sampai heartbeat terakhir", () => {
		const r = row({ lastHeartbeatAt: plus(30) });
		expect(isStaleSession(r, plus(75))).toBe(false);
		expect(isStaleSession(r, plus(76))).toBe(true);
		expect(isStaleSession(row({ status: "ended" }), plus(999))).toBe(false);
		expect(settleStaleSession(r, SETTINGS)).toEqual({
			endedAt: plus(30),
			billedSeconds: 30,
			endReason: "stale",
		});
	});
});

describe("route /api/assistant/voice — tanpa sesi login", () => {
	const paths: [string, object][] = [
		["consent", { accepted: true }],
		["sessions", { sdp: "v=0" }],
		["sessions/vs-1/heartbeat", {}],
		["sessions/vs-1/extend", {}],
		["sessions/vs-1/close", { reason: "user" }],
	];
	for (const [path, body] of paths) {
		it(`POST ${path} → 401`, async () => {
			const res = await api.handle(
				new Request(`http://localhost/api/assistant/voice/${path}`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(body),
				}),
			);
			expect(res.status).toBe(401);
		});
	}
});
