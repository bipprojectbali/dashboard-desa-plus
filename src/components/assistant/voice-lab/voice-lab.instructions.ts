import { LIVE_INSTRUCTIONS_MAX } from "./voice-lab.constants";

export type InstructionIssue = "tooLong";

/** Periksa instruksi sesi GPT-Live sebelum sesi dibuka; null = valid (kosong = tanpa instruksi). */
export function validateLiveInstructions(
	text: string,
): InstructionIssue | null {
	return text.trim().length > LIVE_INSTRUCTIONS_MAX ? "tooLong" : null;
}
