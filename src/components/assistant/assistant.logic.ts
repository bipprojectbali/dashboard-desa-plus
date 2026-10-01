import type { CSSProperties } from "react";
import type { AssistantText } from "@/locales/assistant";
import type {
	AssistantLang,
	AssistantStatusDto,
} from "@/types/ai-assistant-chat";

/** Logika murni panel AI assistant — tanpa React, diuji langsung. */

/** Lebar panel mode normal; /wall memberi ruang selebar ini agar panel NOC tidak tertutup. */
export const ASSISTANT_PANEL_WIDTH = 440;

/**
 * Gaya Drawer panel per bagian (`styles` Mantine). Hanya `content` (panel)
 * dan `body`; `inner` (pembungkus fixed selayar penuh) sengaja tidak diberi
 * gaya. Header di atas, body mengisi sisa tinggi: daftar pesan bergulir,
 * composer menempel di bawah.
 */
export function assistantPanelStyles(
	dark: boolean,
): Record<"content" | "body", CSSProperties> {
	return {
		content: {
			display: "flex",
			flexDirection: "column",
			overflow: "hidden",
			background: dark ? "#141d34" : "white",
			borderLeft: `1px solid ${dark ? "#26324f" : "#dbe3ee"}`,
		},
		body: {
			flex: 1,
			minHeight: 0,
			display: "flex",
			flexDirection: "column",
			padding: 0,
		},
	};
}

/** Rute tanpa FAB: admin memakai /admin/help (F1-d); signin/signup belum login. */
const FAB_EXCLUDED_PREFIXES = ["/admin", "/signin", "/signup"] as const;

export function isFabRoute(pathname: string): boolean {
	return !FAB_EXCLUDED_PREFIXES.some(
		(p) => pathname === p || pathname.startsWith(`${p}/`),
	);
}

/** Status hanya diminta untuk user login yang sudah diverifikasi (hindari 401/403 berulang, mis. TV /wall). */
export function shouldFetchStatus(input: {
	pathname: string;
	user: { emailVerified?: boolean | null } | null;
}): boolean {
	return isFabRoute(input.pathname) && input.user?.emailVerified === true;
}

/** FAB tampil: rute boleh, ada sesi, asisten aktif + slot chat siap, izin use-ai-assistant. */
export function shouldShowFab(input: {
	pathname: string;
	user: { emailVerified?: boolean | null } | null;
	status: AssistantStatusDto | null | undefined;
	allowed: readonly string[] | null | undefined;
}): boolean {
	return Boolean(
		shouldFetchStatus(input) &&
			input.status?.enabled &&
			input.status.slots.chat &&
			input.allowed?.includes("use-ai-assistant"),
	);
}

/** Ganti `{name}` (dan placeholder lain) di teks locale. */
export function fillTemplate(
	template: string,
	values: Record<string, string | number>,
): string {
	return template.replace(/\{(\w+)\}/g, (match, key: string) =>
		key in values ? String(values[key]) : match,
	);
}

/** Sisa karakter; null bila tanpa batas (maxInputChars 0). */
export function remainingChars(
	text: string,
	maxInputChars: number,
): number | null {
	return maxInputChars > 0 ? maxInputChars - text.length : null;
}

/** Tombol kirim aktif: ada isi, tidak melebihi batas, dan tidak sedang menunggu jawaban. */
export function canSend(
	text: string,
	maxInputChars: number,
	pending: boolean,
): boolean {
	if (pending || text.trim().length === 0) return false;
	return maxInputChars <= 0 || text.length <= maxInputChars;
}

/** Enter mengirim; Shift+Enter dan komposisi IME (mis. input aksara) tidak. */
export function isSubmitKey(e: {
	key: string;
	shiftKey: boolean;
	isComposing?: boolean;
}): boolean {
	return e.key === "Enter" && !e.shiftKey && !e.isComposing;
}

/** Label "Sumber" dari toolsUsed; nama tool tak dikenal ditampilkan apa adanya. */
export function sourceLabels(
	toolsUsed: readonly string[],
	text: AssistantText,
): string[] {
	return toolsUsed.map((name) => text.sources[name] ?? name);
}

/** Durasi Retry-After yang mudah dibaca (detik → detik/menit/jam, dibulatkan ke atas). */
export function formatRetryAfter(seconds: number, text: AssistantText): string {
	if (seconds < 60)
		return fillTemplate(text.duration.seconds, { n: Math.max(1, seconds) });
	if (seconds < 3600)
		return fillTemplate(text.duration.minutes, { n: Math.ceil(seconds / 60) });
	return fillTemplate(text.duration.hours, { n: Math.ceil(seconds / 3600) });
}

/** Kegagalan request chat yang sudah dipetakan dari HTTP. */
export interface ChatFailure {
	status: number | null;
	retryAfterSec?: number;
}

/** Pesan ramah untuk kegagalan chat (status null = jaringan). */
export function chatErrorMessage(
	failure: ChatFailure,
	text: AssistantText,
	maxInputChars: number,
): string {
	const e = text.errors;
	switch (failure.status) {
		case null:
			return e.network;
		case 401:
			return e.session;
		case 403:
			return e.forbidden;
		case 404:
			return e.notFound;
		case 409:
			return e.notReady;
		case 422:
			return maxInputChars > 0
				? fillTemplate(e.tooLong, { n: maxInputChars.toLocaleString("id-ID") })
				: e.empty;
		case 429:
			return fillTemplate(e.limited, {
				durasi: formatRetryAfter(failure.retryAfterSec ?? 60, text),
			});
		default:
			return e.unavailable;
	}
}

/**
 * Judul halaman dari document.title yang diset __root: "Keuangan — Dashboard
 * Desa Plus" → "Keuangan"; tanpa pemisah (hanya nama aplikasi) → "".
 */
export function pageTitleFrom(documentTitle: string): string {
	const sep = documentTitle.lastIndexOf(" — ");
	return sep > 0 ? documentTitle.slice(0, sep) : "";
}

export function toAssistantLang(lang: string): AssistantLang {
	return lang === "en" ? "en" : "id";
}
