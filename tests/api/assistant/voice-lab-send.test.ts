import { describe, expect, it } from "bun:test";
import { VOICE_LAB_LIMITS } from "@/api/assistant/voice-lab/voice-lab.constants";
import {
	COMMENTARY_MAX_CHARS,
	createAnswerSender,
	type SendMode,
} from "@/components/assistant/voice/voice-answer-sender";
import {
	createSettleWatcher,
	isSettled,
	SETTLE_DEFAULTS,
} from "@/components/assistant/voice/voice-settle";
import {
	LIVE_INSTRUCTIONS_MAX,
	READ_EXACT_INSTRUCTION,
} from "@/components/assistant/voice-lab/voice-lab.constants";
import { validateLiveInstructions } from "@/components/assistant/voice-lab/voice-lab.instructions";
import {
	MODE_GROUPS,
	summarizeByMode,
	type TurnMetrics,
} from "@/components/assistant/voice-lab/voice-lab.stats";
import {
	banjarNamesFrom,
	MODULE_TERMS,
	mergeTerms,
} from "@/components/assistant/voice-lab/voice-lab.terms";

function mockSender(mode: SendMode) {
	const sent: string[] = [];
	const state = { cancelled: false, firstSends: 0 };
	const sender = createAnswerSender({
		mode,
		send: (c) => sent.push(c),
		isCancelled: () => state.cancelled,
		onFirstSend: () => state.firstSends++,
	});
	return { sender, sent, state };
}

const FINAL =
	"Penduduk desa ada 1.200 jiwa. Luas wilayah 3,5 km. Selesai dihitung.";

describe("pengirim jawaban V1-B", () => {
	it("per kalimat: kirim berurutan selagi Claude masih menulis", () => {
		const { sender, sent, state } = mockSender("sentence");
		sender.delta("Penduduk desa ada 1.200 jiwa. Lu");
		expect(sent).toEqual(["Penduduk desa ada 1.200 jiwa."]);
		sender.delta("as wilayah 3,5 km. Sele");
		sender.delta("sai dihitung.");
		expect(sender.finish(FINAL)).toBe(3);
		expect(sent).toEqual([
			"Penduduk desa ada 1.200 jiwa.",
			"Luas wilayah 3,5 km.",
			"Selesai dihitung.",
		]);
		expect(state.firstSends).toBe(1);
	});

	it("batal (Off/barge-in): sisa kalimat tidak dikirim", () => {
		const { sender, sent, state } = mockSender("sentence");
		sender.delta("Penduduk desa ada 1.200 jiwa. Lu");
		state.cancelled = true;
		sender.delta("as wilayah 3,5 km. Sele");
		expect(sender.finish(FINAL)).toBe(1);
		expect(sent).toEqual(["Penduduk desa ada 1.200 jiwa."]);
	});

	it("cancel() menghentikan pengiriman berikutnya", () => {
		const { sender, sent } = mockSender("sentence");
		sender.cancel();
		sender.delta("Penduduk desa ada 1.200 jiwa. Lu");
		expect(sender.finish(FINAL)).toBe(0);
		expect(sent).toEqual([]);
	});

	it("utuh: tidak mengirim saat stream, kirim teks final sekali", () => {
		const { sender, sent } = mockSender("whole");
		sender.delta("Penduduk desa ada 1.200 jiwa. Lu");
		expect(sent).toEqual([]);
		expect(sender.finish(FINAL)).toBe(1);
		expect(sent).toEqual([FINAL]);
	});

	it("teks pembuka sebelum tool tidak ikut dikirim", () => {
		const { sender, sent } = mockSender("sentence");
		sender.delta("Saya cek datanya dulu");
		sender.toolStarted();
		sender.delta("Jumlah KK ada 120 keluarga.");
		sender.finish("Jumlah KK ada 120 keluarga.");
		expect(sent).toEqual(["Jumlah KK ada 120 keluarga."]);
	});

	it("tanpa delta: teks final dipecah per kalimat", () => {
		const { sender, sent } = mockSender("sentence");
		expect(
			sender.finish("Kalimat pertama panjang. Kalimat kedua panjang."),
		).toBe(2);
		expect(sent).toEqual([
			"Kalimat pertama panjang.",
			"Kalimat kedua panjang.",
		]);
	});

	it("potongan terlalu panjang dibagi di bawah batas commentary", () => {
		const { sender, sent } = mockSender("whole");
		sender.finish("kata ".repeat(700));
		expect(sent.length).toBeGreaterThan(1);
		for (const c of sent)
			expect(c.length).toBeLessThanOrEqual(COMMENTARY_MAX_CHARS);
	});
});

describe("penutupan giliran (settle)", () => {
	it("tunggu minimal, lalu tutup saat hening; batas keras tetap berlaku", () => {
		const { minWaitMs, quietMs, maxWaitMs } = SETTLE_DEFAULTS;
		expect(isSettled(0, Number.NEGATIVE_INFINITY, minWaitMs - 1)).toBe(false);
		expect(isSettled(0, Number.NEGATIVE_INFINITY, minWaitMs)).toBe(true);
		expect(isSettled(0, minWaitMs - 500, minWaitMs)).toBe(false);
		expect(isSettled(0, minWaitMs - 500, minWaitMs - 500 + quietMs)).toBe(true);
		expect(isSettled(0, maxWaitMs - 1, maxWaitMs)).toBe(true);
	});

	it("watcher memanggil done setelah hening; stopAll membatalkan", async () => {
		const cfg = { minWaitMs: 10, quietMs: 5, maxWaitMs: 1000, pollMs: 2 };
		const watcher = createSettleWatcher(() => performance.now(), cfg);
		await new Promise<void>((resolve) =>
			watcher.wait(performance.now(), resolve),
		);
		let called = false;
		watcher.wait(performance.now(), () => {
			called = true;
		});
		watcher.stopAll();
		await new Promise((r) => setTimeout(r, 30));
		expect(called).toBe(false);
	});
});

describe("instruksi bacakan persis", () => {
	it("batas klien sama dengan batas server", () => {
		expect(LIVE_INSTRUCTIONS_MAX).toBe(VOICE_LAB_LIMITS.instructionsMax);
	});

	it("validasi panjang (spasi di tepi diabaikan)", () => {
		expect(validateLiveInstructions(READ_EXACT_INSTRUCTION)).toBeNull();
		expect(
			validateLiveInstructions("a".repeat(LIVE_INSTRUCTIONS_MAX)),
		).toBeNull();
		expect(
			validateLiveInstructions("a".repeat(LIVE_INSTRUCTIONS_MAX + 1)),
		).toBe("tooLong");
		expect(validateLiveInstructions(`${" ".repeat(600)}a`)).toBeNull();
		expect(validateLiveInstructions("")).toBeNull();
	});
});

describe("daftar istilah", () => {
	it("nama banjar dari payload API", () => {
		expect(
			banjarNamesFrom({
				success: true,
				data: [{ nama: "Tengah" }, { name: "Kaja" }, { nama: "" }, {}],
			}),
		).toEqual(["Tengah", "Kaja"]);
		expect(banjarNamesFrom({ success: false, data: [] })).toEqual([]);
		expect(banjarNamesFrom(null)).toEqual([]);
	});

	it("gabung tanpa duplikat; label modul dari registry", () => {
		expect(
			mergeTerms(["Kesehatan", "Banjar"], ["kesehatan ", " Kaja"]),
		).toEqual(["Kesehatan", "Banjar", "Kaja"]);
		expect(MODULE_TERMS.length).toBeGreaterThan(0);
	});
});

describe("ringkasan per mode", () => {
	const turn = (
		id: number,
		path: "v2" | "v1b",
		sendMode: SendMode | null,
		firstAudioMs: number,
		matchScore: number | null,
	): TurnMetrics => ({
		id,
		path,
		endMethod: "vad",
		transcriptMs: 300,
		firstTokenMs: 800,
		firstSentenceSentMs: sendMode ? 1000 : null,
		firstAudioMs,
		answerAudioMs: firstAudioMs,
		overlap: null,
		sendMode,
		matchScore,
		numbersChanged: matchScore === null ? null : matchScore < 1,
	});

	it("memisahkan V2, V1-B utuh, V1-B per kalimat + skor cocok", () => {
		const s = summarizeByMode([
			turn(1, "v2", null, 1000, null),
			turn(2, "v1b", "whole", 3000, 1),
			turn(3, "v1b", "sentence", 1500, 0.5),
			turn(4, "v1b", "sentence", 1700, 1),
		]);
		expect(Object.keys(s)).toEqual([...MODE_GROUPS]);
		expect(s.v2.firstAudioMs.count).toBe(1);
		expect(s.v2.matchScore.p50).toBeNull();
		expect(s["v1b-whole"].matchScore).toEqual({ count: 1, p50: 1, p95: 1 });
		expect(s["v1b-sentence"].firstAudioMs).toEqual({
			count: 2,
			p50: 1500,
			p95: 1700,
		});
		expect(s["v1b-sentence"].matchScore).toEqual({
			count: 2,
			p50: 0.5,
			p95: 1,
		});
		expect(s["v1b-sentence"].firstSentenceSentMs.p50).toBe(1000);
	});
});
