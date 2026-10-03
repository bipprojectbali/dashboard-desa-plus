import { proxy } from "valtio";
import type { VoiceHeartbeatResponse } from "@/types/ai-assistant-voice";

/**
 * State tampilan mode suara panel asisten. Level modul (seperti
 * assistantStore): sesi tetap hidup saat panel ditutup sementara oleh penunjuk
 * Fitur 2 atau saat layout berganti karena navigasi.
 */

export type VoiceStatus =
	| "off"
	| "connecting"
	| "ready"
	| "listening"
	| "answering";

export type VoiceBeat = Pick<
	VoiceHeartbeatResponse,
	"elapsedSeconds" | "maxSeconds" | "remainingTodaySeconds"
>;

interface VoiceState {
	status: VoiceStatus;
	sessionId: string | null;
	/** Transkrip ucapan user yang sedang berjalan. */
	transcript: string;
	/** Laporan waktu terakhir dari server (heartbeat/start). */
	beat: VoiceBeat | null;
	/** `Date.now()` saat `beat` diterima — dasar hitung mundur lokal. */
	beatAt: number;
	/** Detak 1 detik untuk tampilan sisa waktu. */
	now: number;
	answerMuted: boolean;
	micMuted: boolean;
	/** Pesan berakhir/galat terakhir (null = tidak ada). */
	notice: string | null;
	consentOpen: boolean;
}

const idle = () => ({
	status: "off" as VoiceStatus,
	sessionId: null,
	transcript: "",
	beat: null,
	beatAt: 0,
	answerMuted: false,
	micMuted: false,
});

export const voiceStore = proxy<VoiceState>({
	...idle(),
	now: 0,
	notice: null,
	consentOpen: false,
});

/** Kembalikan ke Off; `notice` menjelaskan kenapa (null = dimatikan user). */
export function resetVoice(notice: string | null) {
	Object.assign(voiceStore, idle(), { notice });
}

export function isVoiceActive(): boolean {
	return voiceStore.status !== "off";
}
