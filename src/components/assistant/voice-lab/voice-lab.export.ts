import type { VoiceLabPath } from "./voice-lab.constants";
import {
	type PathSummary,
	summarizeByPath,
	type TurnMetrics,
} from "./voice-lab.stats";

/** Isi ekspor hasil uji: hanya angka + pengaturan (tanpa audio, tanpa kunci). */
export interface VoiceLabExport {
	generatedAt: string;
	browser: string;
	settings: Record<string, string | number | boolean>;
	turns: Array<TurnMetrics & { userText?: string; answerText?: string }>;
	summary: Record<VoiceLabPath, PathSummary>;
}

export interface ExportOptions {
	generatedAt: Date;
	browser: string;
	settings: Record<string, string | number | boolean>;
	/** Teks transkrip/jawaban per id giliran — hanya dipakai bila `includeText`. */
	texts?: Map<number, { userText: string; answerText: string }>;
	includeText: boolean;
}

export function buildExport(
	turns: TurnMetrics[],
	opts: ExportOptions,
): VoiceLabExport {
	return {
		generatedAt: opts.generatedAt.toISOString(),
		browser: opts.browser,
		settings: opts.settings,
		turns: turns.map((t) => {
			const text = opts.includeText ? opts.texts?.get(t.id) : undefined;
			return text ? { ...t, ...text } : { ...t };
		}),
		summary: summarizeByPath(turns),
	};
}
