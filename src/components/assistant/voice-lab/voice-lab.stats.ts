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
	/** Akhir ucapan → audio pertama terdengar. */
	firstAudioMs: number | null;
	/** Hanya V1-B: kemiripan kata teks Claude vs transkrip ucapan GPT-Live (0..1). */
	overlap: number | null;
}

export type MetricKey = "transcriptMs" | "firstTokenMs" | "firstAudioMs";
export const METRIC_KEYS: readonly MetricKey[] = [
	"transcriptMs",
	"firstTokenMs",
	"firstAudioMs",
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

/** Ringkasan p50/p95 per jalur untuk tiap metrik. */
export function summarizeByPath(
	turns: TurnMetrics[],
): Record<VoiceLabPath, PathSummary> {
	const build = (path: VoiceLabPath): PathSummary => {
		const own = turns.filter((t) => t.path === path);
		return {
			transcriptMs: summarize(own.map((t) => t.transcriptMs)),
			firstTokenMs: summarize(own.map((t) => t.firstTokenMs)),
			firstAudioMs: summarize(own.map((t) => t.firstAudioMs)),
		};
	};
	return { v2: build("v2"), v1b: build("v1b") };
}
