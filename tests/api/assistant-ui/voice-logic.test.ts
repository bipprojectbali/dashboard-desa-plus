import { beforeEach, describe, expect, it } from "bun:test";
import { VoiceApiError } from "@/components/assistant/voice/voice.api";
import {
	formatClock,
	isIdleTimeout,
	projectBeat,
	remainingSeconds,
	shouldInviteExtend,
	stopCloseReason,
	voiceDisabledReason,
	voiceErrorMessage,
	voiceStopMessage,
} from "@/components/assistant/voice/voice.logic";
import { createAnswerSender } from "@/components/assistant/voice/voice-answer-sender";
import { toSpokenPiece } from "@/components/assistant/voice/voice-controller";
import { assistantTexts } from "@/locales/assistant";
import { assistantVoiceTexts } from "@/locales/assistant-voice";
import {
	addUserBubble,
	assistantStore,
	historyToBubbles,
	receiveAnswer,
	startNewConversation,
} from "@/store/assistant";
import { isVoiceActive, resetVoice, voiceStore } from "@/store/assistant-voice";
import type { AssistantHistoryMessageDto } from "@/types/ai-assistant-chat";

/** Mode suara panel Jenna (S1): logika murni, store, dan pengiriman jawaban per kalimat. */

const t = assistantVoiceTexts.id;
const text = assistantTexts.id;

describe("sisa waktu & ajakan perpanjang", () => {
	it("sisa = batas sesi bila jatah harian tak terbatas", () => {
		expect(
			remainingSeconds({
				elapsedSeconds: 100,
				maxSeconds: 600,
				remainingTodaySeconds: null,
			}),
		).toBe(500);
	});

	it("sisa = jatah harian bila lebih dulu habis, tidak pernah negatif", () => {
		const beat = {
			elapsedSeconds: 100,
			maxSeconds: 600,
			remainingTodaySeconds: 40,
		};
		expect(remainingSeconds(beat)).toBe(40);
		expect(
			remainingSeconds({
				...beat,
				elapsedSeconds: 700,
				remainingTodaySeconds: 0,
			}),
		).toBe(0);
	});

	it("ajak perpanjang hanya di menit terakhir batas sesi", () => {
		const beat = {
			elapsedSeconds: 545,
			maxSeconds: 600,
			remainingTodaySeconds: null,
		};
		expect(shouldInviteExtend(beat)).toBe(true);
		expect(shouldInviteExtend({ ...beat, elapsedSeconds: 500 })).toBe(false);
		expect(shouldInviteExtend({ ...beat, elapsedSeconds: 600 })).toBe(false);
	});

	it("tidak ajak perpanjang bila jatah harian yang habis duluan", () => {
		expect(
			shouldInviteExtend({
				elapsedSeconds: 545,
				maxSeconds: 600,
				remainingTodaySeconds: 30,
			}),
		).toBe(false);
	});

	it("projectBeat menggeser hitungan lokal antar-heartbeat", () => {
		const beat = {
			elapsedSeconds: 30,
			maxSeconds: 600,
			remainingTodaySeconds: 50,
		};
		expect(projectBeat(beat, 7.9)).toEqual({
			elapsedSeconds: 37,
			maxSeconds: 600,
			remainingTodaySeconds: 43,
		});
		expect(projectBeat(beat, 90).remainingTodaySeconds).toBe(0);
		expect(projectBeat(beat, -5)).toEqual(beat);
		expect(
			projectBeat({ ...beat, remainingTodaySeconds: null }, 5)
				.remainingTodaySeconds,
		).toBeNull();
	});

	it("formatClock m:ss", () => {
		expect(formatClock(0)).toBe("0:00");
		expect(formatClock(65.7)).toBe("1:05");
		expect(formatClock(-3)).toBe("0:00");
	});
});

describe("mati otomatis saat hening", () => {
	it("mati setelah idleOffSeconds tanpa aktivitas", () => {
		expect(isIdleTimeout("ready", 0, 120_000, 120)).toBe(true);
		expect(isIdleTimeout("listening", 0, 119_999, 120)).toBe(false);
	});

	it("tidak mati saat menjawab, saat off, atau bila dinonaktifkan (0)", () => {
		expect(isIdleTimeout("answering", 0, 999_999, 120)).toBe(false);
		expect(isIdleTimeout("off", 0, 999_999, 120)).toBe(false);
		expect(isIdleTimeout("ready", 0, 999_999, 0)).toBe(false);
	});
});

describe("pesan berhenti & galat", () => {
	it("stop 'ended' dari server tidak perlu dikabari balik", () => {
		expect(stopCloseReason("ended")).toBeNull();
		expect(stopCloseReason("quota")).toBe("quota");
		expect(stopCloseReason("max_duration")).toBe("max_duration");
	});

	it("pesan berhenti per penyebab", () => {
		expect(voiceStopMessage("idle", t)).toBe(t.ended.idle);
		expect(voiceStopMessage("max_duration", t)).toBe(t.ended.maxDuration);
		expect(voiceStopMessage("quota", t)).toBe(t.ended.quota);
		expect(voiceStopMessage("ended", t)).toBe(t.ended.closed);
	});

	it("browser tidak didukung → tombol nonaktif dengan alasan", () => {
		expect(voiceDisabledReason(false, t)).toBe(t.unsupported);
		expect(voiceDisabledReason(true, t)).toBeNull();
	});

	it("galat sederhana id: mic ditolak, kuota, slot kosong, koneksi, tab kedua", () => {
		const err = (status: number | null, code: string | null, retry?: number) =>
			new VoiceApiError(status, code as never, "x", retry);
		expect(
			voiceErrorMessage(new DOMException("no", "NotAllowedError"), t, text),
		).toBe(t.errors.micDenied);
		expect(
			voiceErrorMessage(err(429, "voice_quota_exhausted", 3600), t, text),
		).toContain("1");
		expect(voiceErrorMessage(err(409, "voice_slot_empty"), t, text)).toBe(
			t.errors.slotEmpty,
		);
		expect(voiceErrorMessage(err(null, null), t, text)).toBe(
			t.errors.connectionLost,
		);
		expect(voiceErrorMessage(new Error("boom"), t, text)).toBe(
			t.errors.connectionLost,
		);
		expect(voiceErrorMessage(err(409, "voice_session_active"), t, text)).toBe(
			t.errors.secondTab,
		);
		expect(voiceErrorMessage(err(403, "voice_forbidden"), t, text)).toBe(
			t.errors.forbidden,
		);
		expect(voiceErrorMessage(err(500, null), t, text)).toBe(t.errors.failed);
	});

	it("teks en tersedia untuk semua kunci yang dipakai", () => {
		const en = assistantVoiceTexts.en;
		expect(en.errors.micDenied).not.toBe(t.errors.micDenied);
		expect(en.commentary.empty.length).toBeGreaterThan(0);
		expect(en.voiceMarker).toBe("Voice message");
	});
});

describe("store suara", () => {
	beforeEach(() => resetVoice(null));

	it("resetVoice mematikan sesi dan menyimpan pesan", () => {
		voiceStore.status = "listening";
		voiceStore.sessionId = "s1";
		voiceStore.transcript = "halo";
		expect(isVoiceActive()).toBe(true);
		resetVoice("selesai");
		expect<string>(voiceStore.status).toBe("off");
		expect(voiceStore.sessionId).toBeNull();
		expect(voiceStore.transcript).toBe("");
		expect(voiceStore.notice).toBe("selesai");
		expect(isVoiceActive()).toBe(false);
	});
});

describe("penanda 🎙 di riwayat chat", () => {
	beforeEach(() => startNewConversation());

	const hist = (
		id: string,
		modality: "text" | "voice",
	): AssistantHistoryMessageDto => ({
		id,
		role: "user",
		content: id,
		toolsUsed: [],
		modality,
		pageRoute: "/",
		status: "ok",
		createdAt: "2026-10-03T00:00:00.000Z",
	});

	it("riwayat server membawa modality voice", () => {
		const bubbles = historyToBubbles([hist("b", "text"), hist("a", "voice")]);
		expect(bubbles.map((b) => [b.id, b.modality])).toEqual([
			["a", "voice"],
			["b", undefined],
		]);
	});

	it("giliran suara: pertanyaan & jawaban ditandai voice", () => {
		addUserBubble("v1", "berapa penduduk?", "voice");
		receiveAnswer("v1", "c1", {
			id: "m1",
			role: "assistant",
			content: "Ada 1.250 jiwa.",
			toolsUsed: [],
			modality: "voice",
			createdAt: "2026-10-03T00:00:00.000Z",
		});
		expect(assistantStore.messages.map((m) => m.modality)).toEqual([
			"voice",
			"voice",
		]);
	});
});

describe("jawaban dibacakan per kalimat", () => {
	it("toSpokenPiece membuang markdown sebelum dibacakan", () => {
		const spoken = toSpokenPiece("Jumlah **penduduk** ada `1.250` jiwa.");
		expect(spoken).not.toContain("*");
		expect(spoken).not.toContain("`");
		expect(spoken).toContain("penduduk");
	});

	it("kalimat dikirim begitu lengkap, sisanya saat final", () => {
		const sent: string[] = [];
		const s = createAnswerSender({
			mode: "sentence",
			send: (c) => sent.push(c),
			isCancelled: () => false,
			transform: toSpokenPiece,
		});
		s.delta("Penduduk desa ada **1.250** jiwa. ");
		s.delta("Banjar terbanyak adalah Banjar Tengah.");
		expect(sent).toEqual(["Penduduk desa ada 1.250 jiwa."]);
		const total = s.finish(
			"Penduduk desa ada **1.250** jiwa. Banjar terbanyak adalah Banjar Tengah.",
		);
		expect(total).toBe(2);
		expect(sent[1]).toBe("Banjar terbanyak adalah Banjar Tengah.");
	});

	it("barge-in: kalimat yang belum terkirim dibuang", () => {
		const sent: string[] = [];
		let cancelled = false;
		const s = createAnswerSender({
			mode: "sentence",
			send: (c) => sent.push(c),
			isCancelled: () => cancelled,
			transform: toSpokenPiece,
		});
		s.delta("Kalimat pertama sudah lengkap. ");
		cancelled = true;
		s.delta("Kalimat kedua juga lengkap. ");
		s.finish("Kalimat pertama sudah lengkap. Kalimat kedua juga lengkap.");
		expect(sent).toEqual(["Kalimat pertama sudah lengkap."]);
	});
});
