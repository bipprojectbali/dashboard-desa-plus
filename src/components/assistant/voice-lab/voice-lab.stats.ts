import type { SendMode } from "../voice/voice-answer-sender";
import type { VoiceLabPath } from "./voice-lab.constants";

/** Pengukuran per giliran bicara; semua `*Ms` = selisih dari akhir ucapan (null bila belum/tak terjadi). */
export interface TurnMetrics {
	id: number;
	path: VoiceLabPath;
	endMethod: "vad" | "manual";
	/** Akhir ucapan → transkrip final. */
	transcriptMs: number | null;
	/** Akhir ucapan → token Claude pertama. */
	firstTokenMs: number | null;
	/** Hanya V1-B: akhir ucapan → potongan/kalimat pertama jawaban dikirim ke GPT-Live. */
	firstSentenceSentMs: number | null;
	/** Akhir ucapan → audio pertama terdengar. */
	firstAudioMs: number | null;
	/** Akhir ucapan → awal suara jawaban (setelah kalimat pengisi; V2: sama dengan audio pertama). */
	answerAudioMs: number | null;
	/** Hanya V1-B: kemiripan kata teks Claude vs transkrip ucapan GPT-Live (0..1). */
	overlap: number | null;
	/** Hanya V1-B: cara jawaban dikirim. */
	sendMode: SendMode | null;
	/** Hanya V1-B: skor pencocokan angka (cocok/total, 0..1; null bila jawaban tanpa angka/giliran terputus). */
	matchScore: number | null;
	/** Hanya V1-B: ada angka yang hilang/berubah/bertambah. */
	numbersChanged: boolean | null;
}

export type MetricKey =
	| "transcriptMs"
	| "firstTokenMs"
	| "firstSentenceSentMs"
	| "firstAudioMs"
	| "answerAudioMs";
export const METRIC_KEYS: readonly MetricKey[] = [
	"transcriptMs",
	"firstTokenMs",
	"firstSentenceSentMs",
	"firstAudioMs",
	"answerAudioMs",
];

export interface Summary {
	count: number;
	p50: number | null;
	p95: number | null;
}

/** Persentil nearest-rank; null bila tidak ada data. */
export function percentile(values: number[], p: number): number | null {
	if (values.length === 0) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const rank = Math.max(1, Math.ceil((p / 100) * sorted.length));
	return sorted[Math.min(rank, sorted.length) - 1] ?? null;
}

export function summarize(values: Array<number | null>): Summary {
	const nums = values.filter((v): v is number => v !== null);
	return {
		count: nums.length,
		p50: percentile(nums, 50),
		p95: percentile(nums, 95),
	};
}

export type PathSummary = Record<MetricKey, Summary>;

function summarizeTurns(own: TurnMetrics[]): PathSummary {
	const out = {} as PathSummary;
	for (const key of METRIC_KEYS) out[key] = summarize(own.map((t) => t[key]));
	return out;
}

/** Ringkasan p50/p95 per jalur untuk tiap metrik. */
export function summarizeByPath(
	turns: TurnMetrics[],
): Record<VoiceLabPath, PathSummary> {
	const build = (path: VoiceLabPath) =>
		summarizeTurns(turns.filter((t) => t.path === path));
	return { v2: build("v2"), v1b: build("v1b") };
}

/** Kelompok perbandingan: V2, V1-B utuh, V1-B per kalimat. */
export const MODE_GROUPS = ["v2", "v1b-whole", "v1b-sentence"] as const;
export type ModeGroup = (typeof MODE_GROUPS)[number];
export type ModeSummary = PathSummary & { matchScore: Summary };

export function modeGroupOf(t: TurnMetrics): ModeGroup {
	if (t.path === "v2") return "v2";
	return t.sendMode === "sentence" ? "v1b-sentence" : "v1b-whole";
}

/** Ringkasan p50/p95 per mode kirim (termasuk skor pencocokan). */
export function summarizeByMode(
	turns: TurnMetrics[],
): Record<ModeGroup, ModeSummary> {
	const build = (group: ModeGroup): ModeSummary => {
		const own = turns.filter((t) => modeGroupOf(t) === group);
		return {
			...summarizeTurns(own),
			matchScore: summarize(own.map((t) => t.matchScore)),
		};
	};
	return {
		v2: build("v2"),
		"v1b-whole": build("v1b-whole"),
		"v1b-sentence": build("v1b-sentence"),
	};
}
