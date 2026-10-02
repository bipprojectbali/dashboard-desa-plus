import { describe, expect, it } from "bun:test";
import { SESSION_LIMITS } from "@/components/assistant/voice-lab/voice-lab.constants";
import { buildExport } from "@/components/assistant/voice-lab/voice-lab.export";
import {
	evaluateSession,
	remainingMs,
	startSession,
	touchSession,
} from "@/components/assistant/voice-lab/voice-lab.session";
import {
	percentile,
	summarize,
	summarizeByPath,
	type TurnMetrics,
} from "@/components/assistant/voice-lab/voice-lab.stats";
import {
	chunkText,
	stripMarkdown,
	takeSentences,
	wordOverlap,
} from "@/components/assistant/voice-lab/voice-lab.text";
import {
	computeRms,
	createVad,
	type VadEvent,
} from "@/components/assistant/voice-lab/voice-lab.vad";

const CFG = { threshold: 0.05, silenceMs: 500, minSpeechMs: 100 };

function run(
	vad: ReturnType<typeof createVad>,
	frames: Array<[number, number]>,
) {
	const events: VadEvent[] = [];
	for (const [rms, t] of frames) {
		const e = vad.push(rms, t);
		if (e) events.push(e);
	}
	return events;
}

describe("computeRms", () => {
	it("hening = 0, gelombang konstan 0.5 = 0.5, kosong = 0", () => {
		expect(computeRms([0, 0, 0])).toBe(0);
		expect(computeRms([0.5, -0.5, 0.5, -0.5])).toBeCloseTo(0.5);
		expect(computeRms([])).toBe(0);
	});
});

describe("VAD energi", () => {
	it("mulai bicara setelah minSpeechMs, selesai setelah silenceMs hening", () => {
		const vad = createVad(() => CFG);
		const events = run(vad, [
			[0.01, 0],
			[0.2, 100],
			[0.2, 150],
			[0.2, 200], // 100ms suara → mulai
			[0.2, 600],
			[0.01, 700],
			[0.01, 1000],
			[0.01, 1100], // 500ms sejak suara terakhir (600) → selesai
		]);
		expect(events).toEqual([
			{ type: "speech-start", at: 100 },
			{ type: "speech-end", at: 600, detectedAt: 1100 },
		]);
		expect(vad.isSpeaking()).toBe(false);
	});

	it("suara lebih singkat dari minSpeechMs (klik/batuk) tidak dihitung", () => {
		const vad = createVad(() => CFG);
		const events = run(vad, [
			[0.3, 0],
			[0.3, 50],
			[0.01, 80],
			[0.01, 2000],
		]);
		expect(events).toEqual([]);
	});

	it("jeda lebih pendek dari silenceMs tidak memutus ucapan", () => {
		const vad = createVad(() => CFG);
		const events = run(vad, [
			[0.2, 0],
			[0.2, 100],
			[0.01, 300],
			[0.2, 450],
			[0.2, 900],
		]);
		expect(events.map((e) => e.type)).toEqual(["speech-start"]);
		expect(vad.isSpeaking()).toBe(true);
	});

	it("ambang bisa diubah live: ucapan pelan baru terdeteksi setelah ambang diturunkan", () => {
		const cfg = { ...CFG };
		const vad = createVad(() => cfg);
		expect(
			run(vad, [
				[0.03, 0],
				[0.03, 200],
			]),
		).toEqual([]);
		cfg.threshold = 0.02;
		expect(
			run(vad, [
				[0.03, 300],
				[0.03, 450],
			]),
		).toHaveLength(1);
	});

	it("durasi hening yang lebih panjang menunda akhir ucapan", () => {
		const cfg = { ...CFG, silenceMs: 1500 };
		const vad = createVad(() => cfg);
		const events = run(vad, [
			[0.2, 0],
			[0.2, 100],
			[0.01, 700],
			[0.01, 1500],
		]);
		expect(events.map((e) => e.type)).toEqual(["speech-start"]);
		expect(run(vad, [[0.01, 1700]]).map((e) => e.type)).toEqual(["speech-end"]);
	});

	it("reset membersihkan status bicara", () => {
		const vad = createVad(() => CFG);
		run(vad, [
			[0.2, 0],
			[0.2, 150],
		]);
		expect(vad.isSpeaking()).toBe(true);
		vad.reset();
		expect(vad.isSpeaking()).toBe(false);
	});
});

describe("statistik p50/p95", () => {
	it("nearest-rank", () => {
		const v = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
		expect(percentile(v, 50)).toBe(50);
		expect(percentile(v, 95)).toBe(100);
		expect(percentile([7], 95)).toBe(7);
		expect(percentile([], 50)).toBeNull();
	});

	it("summarize mengabaikan null dan tidak mengubah urutan input", () => {
		const input = [300, null, 100, 200];
		expect(summarize(input)).toEqual({ count: 3, p50: 200, p95: 300 });
		expect(input).toEqual([300, null, 100, 200]);
	});

	it("ringkasan per jalur memisahkan v2 dan v1b", () => {
		const t = (
			id: number,
			path: "v2" | "v1b",
			firstAudioMs: number | null,
		): TurnMetrics => ({
			id,
			path,
			endMethod: "vad",
			transcriptMs: 400,
			firstTokenMs: 900,
			firstAudioMs,
			overlap: null,
		});
		const s = summarizeByPath([
			t(1, "v2", 1000),
			t(2, "v2", 2000),
			t(3, "v1b", 500),
		]);
		expect(s.v2.firstAudioMs).toEqual({ count: 2, p50: 1000, p95: 2000 });
		expect(s.v1b.firstAudioMs).toEqual({ count: 1, p50: 500, p95: 500 });
		expect(summarizeByPath([]).v2.transcriptMs.p50).toBeNull();
	});
});

describe("batas sesi uji", () => {
	const T0 = 1_000_000;
	it("ok sebelum batas; idle setelah 2 menit tanpa aktivitas", () => {
		const c = startSession(T0);
		expect(evaluateSession(c, T0 + SESSION_LIMITS.idleMs - 1)).toBe("ok");
		expect(evaluateSession(c, T0 + SESSION_LIMITS.idleMs)).toBe("idle");
	});

	it("aktivitas menunda idle tetapi tidak melewati batas 10 menit", () => {
		let c = startSession(T0);
		c = touchSession(c, T0 + SESSION_LIMITS.idleMs - 1000);
		expect(evaluateSession(c, T0 + SESSION_LIMITS.idleMs + 1000)).toBe("ok");
		c = touchSession(c, T0 + SESSION_LIMITS.maxMs - 1000);
		expect(evaluateSession(c, T0 + SESSION_LIMITS.maxMs)).toBe("cap");
	});

	it("remainingMs = yang lebih dekat antara idle dan cap, tidak negatif", () => {
		const c = startSession(T0);
		expect(remainingMs(c, T0)).toBe(SESSION_LIMITS.idleMs);
		const late = touchSession(c, T0 + SESSION_LIMITS.maxMs - 1000);
		expect(remainingMs(late, T0 + SESSION_LIMITS.maxMs - 500)).toBe(500);
		expect(remainingMs(c, T0 + SESSION_LIMITS.maxMs * 2)).toBe(0);
	});
});

describe("teks", () => {
	it("takeSentences memotong kalimat lengkap dan menyisakan yang belum selesai", () => {
		const r = takeSentences("Halo, apa kabar? Saya baik. Hari ini cuaca", 5);
		expect(r.sentences).toEqual(["Halo, apa kabar?", "Saya baik."]);
		expect(r.rest).toBe("Hari ini cuaca");
	});

	it("kalimat sangat pendek digabung ke kalimat berikutnya", () => {
		const r = takeSentences("Ya. Baik sekali kabar desa hari ini. ", 12);
		expect(r.sentences).toEqual(["Ya. Baik sekali kabar desa hari ini."]);
		expect(r.rest).toBe("");
	});

	it("stripMarkdown membuang simbol & blok kode", () => {
		expect(
			stripMarkdown("## Judul\n- **tebal** [tautan](http://x.test) `kode`"),
		).toBe("Judul tebal tautan kode");
		expect(stripMarkdown("a ```x = 1``` b")).toBe("a b");
	});

	it("wordOverlap: sama = 1, beda total = 0, parafrasa di antaranya", () => {
		expect(
			wordOverlap("Jumlah penduduk 5000 jiwa", "jumlah penduduk 5000 jiwa!"),
		).toBe(1);
		expect(wordOverlap("alpha beta", "gamma delta")).toBe(0);
		expect(wordOverlap("", "apa")).toBe(0);
		const mid = wordOverlap(
			"Penduduk Darmasaba berjumlah lima ribu jiwa",
			"Ada sekitar lima ribu orang di Darmasaba",
		);
		expect(mid).toBeGreaterThan(0.1);
		expect(mid).toBeLessThan(0.7);
	});
});

describe("ekspor hasil", () => {
	const turn: TurnMetrics = {
		id: 1,
		path: "v2",
		endMethod: "manual",
		transcriptMs: 300,
		firstTokenMs: 800,
		firstAudioMs: 1200,
		overlap: null,
	};
	const base = {
		generatedAt: new Date("2026-10-02T00:00:00Z"),
		browser: "Chrome",
		settings: { ttsVoice: "coral" },
		texts: new Map([[1, { userText: "rahasia", answerText: "jawaban" }]]),
	};

	it("tanpa includeText: tidak ada teks, hanya angka", () => {
		const out = buildExport([turn], { ...base, includeText: false });
		expect(JSON.stringify(out)).not.toContain("rahasia");
		expect(out.summary.v2.firstAudioMs.p50).toBe(1200);
	});

	it("dengan includeText: teks ikut, tetap tanpa field kunci/audio", () => {
		const out = buildExport([turn], { ...base, includeText: true });
		expect(out.turns[0]?.userText).toBe("rahasia");
		const json = JSON.stringify(out).toLowerCase();
		expect(json).not.toContain("apikey");
		expect(json).not.toContain('audio":');
	});
});

describe("voice-lab chunkText", () => {
	it("teks pendek tetap satu potongan", () => {
		expect(chunkText("Halo dunia.", 100)).toEqual(["Halo dunia."]);
	});

	it("memotong di batas kalimat dan tiap potongan ≤ max", () => {
		const text = "Kalimat satu. Kalimat dua. Kalimat tiga. Kalimat empat.";
		const parts = chunkText(text, 30);
		expect(parts.length).toBeGreaterThan(1);
		for (const p of parts) expect(p.length).toBeLessThanOrEqual(30);
		expect(parts.join(" ")).toBe(text);
	});

	it("tanpa spasi sama sekali: dipotong paksa pada max, tidak ada teks hilang", () => {
		const parts = chunkText("a".repeat(25), 10);
		expect(parts.join("")).toBe("a".repeat(25));
		for (const p of parts) expect(p.length).toBeLessThanOrEqual(10);
	});
});
