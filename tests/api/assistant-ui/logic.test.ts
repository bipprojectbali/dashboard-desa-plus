import { describe, expect, it } from "bun:test";
import {
	canSend,
	chatErrorMessage,
	embeddedState,
	fillTemplate,
	formatRetryAfter,
	isFabRoute,
	isSubmitKey,
	pageTitleFrom,
	remainingChars,
	shouldFetchStatus,
	shouldShowFab,
	sourceLabels,
} from "@/components/assistant/assistant.logic";
import { suggestionsFor } from "@/components/assistant/assistant-suggestions";
import { assistantTexts } from "@/locales/assistant";
import type { AssistantStatusDto } from "@/types/ai-assistant-chat";

/** Logika murni panel AI assistant (F1-c) — tanpa render React. */

const id = assistantTexts.id;
const en = assistantTexts.en;
const READY: AssistantStatusDto = {
	enabled: true,
	assistantName: "Sari",
	maxInputChars: 2000,
	slots: { chat: true, pointer: true, voice: true },
};
const VERIFIED = { emailVerified: true };
const ALLOWED = ["use-ai-assistant", "view-dashboard"];

describe("aturan tampil FAB", () => {
	it("rute: tidak ada di /admin, /signin, /signup; ada di dashboard, /profile, /wall", () => {
		for (const p of ["/admin", "/admin/help", "/signin", "/signup"])
			expect(isFabRoute(p)).toBe(false);
		for (const p of [
			"/",
			"/keuangan-anggaran",
			"/profile",
			"/profile/edit",
			"/wall",
			"/administrasi",
		])
			expect(isFabRoute(p)).toBe(true);
	});

	it("status hanya diminta untuk sesi terverifikasi (TV /wall tanpa login tidak memanggil)", () => {
		expect(shouldFetchStatus({ pathname: "/wall", user: null })).toBe(false);
		expect(
			shouldFetchStatus({
				pathname: "/profile",
				user: { emailVerified: false },
			}),
		).toBe(false);
		expect(
			shouldFetchStatus({
				pathname: "/profile",
				user: { emailVerified: null },
			}),
		).toBe(false);
		expect(shouldFetchStatus({ pathname: "/wall", user: VERIFIED })).toBe(true);
		expect(shouldFetchStatus({ pathname: "/admin", user: VERIFIED })).toBe(
			false,
		);
	});

	it("tampil hanya bila enabled, slot chat siap, dan izin use-ai-assistant", () => {
		const base = {
			pathname: "/",
			user: VERIFIED,
			status: READY,
			allowed: ALLOWED,
		};
		expect(shouldShowFab(base)).toBe(true);
		expect(
			shouldShowFab({ ...base, status: { ...READY, enabled: false } }),
		).toBe(false);
		expect(
			shouldShowFab({
				...base,
				status: { ...READY, slots: { ...READY.slots, chat: false } },
			}),
		).toBe(false);
		expect(shouldShowFab({ ...base, status: undefined })).toBe(false);
		expect(shouldShowFab({ ...base, allowed: ["view-dashboard"] })).toBe(false);
		expect(shouldShowFab({ ...base, allowed: null })).toBe(false);
		expect(shouldShowFab({ ...base, user: null })).toBe(false);
		expect(shouldShowFab({ ...base, pathname: "/admin/users" })).toBe(false);
	});
});

describe("template nama asisten", () => {
	it("sapaan & disclaimer memakai nama dari config, tidak 'Jenna' tetap", () => {
		for (const t of [id, en]) {
			const greeting = fillTemplate(t.greeting, { name: "Sari" });
			const disclaimer = fillTemplate(t.disclaimer, { name: "Sari" });
			expect(greeting).toContain("Sari");
			expect(disclaimer.startsWith("Sari ")).toBe(true);
			expect(`${t.greeting}${t.disclaimer}${t.fabLabel}`).not.toContain(
				"Jenna",
			);
		}
		expect(fillTemplate(id.fabLabel, { name: "Jenna" })).toBe("Tanya Jenna");
	});

	it("placeholder tak dikenal dibiarkan", () => {
		expect(fillTemplate("{name} {x}", { name: "A" })).toBe("A {x}");
	});
});

describe("composer", () => {
	it("sisa karakter; 0 = tanpa batas", () => {
		expect(remainingChars("abc", 10)).toBe(7);
		expect(remainingChars("x".repeat(12), 10)).toBe(-2);
		expect(remainingChars("abc", 0)).toBeNull();
	});

	it("tombol kirim: isi tidak kosong, dalam batas, tidak sedang menunggu", () => {
		expect(canSend("Halo", 10, false)).toBe(true);
		expect(canSend("   \n", 10, false)).toBe(false);
		expect(canSend("x".repeat(11), 10, false)).toBe(false);
		expect(canSend("x".repeat(5000), 0, false)).toBe(true);
		expect(canSend("Halo", 10, true)).toBe(false);
	});

	it("Enter kirim; Shift+Enter & komposisi IME tidak", () => {
		expect(isSubmitKey({ key: "Enter", shiftKey: false })).toBe(true);
		expect(isSubmitKey({ key: "Enter", shiftKey: true })).toBe(false);
		expect(
			isSubmitKey({ key: "Enter", shiftKey: false, isComposing: true }),
		).toBe(false);
		expect(isSubmitKey({ key: "a", shiftKey: false })).toBe(false);
	});
});

describe("pesan error ramah", () => {
	it("409 / 503 / jaringan / sesi / izin / 404", () => {
		expect(chatErrorMessage({ status: 409 }, id, 2000)).toBe(
			id.errors.notReady,
		);
		expect(chatErrorMessage({ status: 503 }, id, 2000)).toBe(
			id.errors.unavailable,
		);
		expect(chatErrorMessage({ status: 500 }, en, 2000)).toBe(
			en.errors.unavailable,
		);
		expect(chatErrorMessage({ status: null }, id, 2000)).toBe(
			id.errors.network,
		);
		expect(chatErrorMessage({ status: 401 }, id, 2000)).toBe(id.errors.session);
		expect(chatErrorMessage({ status: 403 }, id, 2000)).toBe(
			id.errors.forbidden,
		);
		expect(chatErrorMessage({ status: 404 }, id, 2000)).toBe(
			id.errors.notFound,
		);
	});

	it("422 menyebut batas karakter", () => {
		expect(chatErrorMessage({ status: 422 }, id, 2000)).toBe(
			"Pesan terlalu panjang. Maksimal 2.000 karakter.",
		);
		expect(chatErrorMessage({ status: 422 }, id, 0)).toBe(id.errors.empty);
	});

	it("429 memakai Retry-After yang mudah dibaca", () => {
		expect(chatErrorMessage({ status: 429, retryAfterSec: 30 }, id, 2000)).toBe(
			"Batas pemakaian tercapai. Coba lagi dalam 30 detik.",
		);
		expect(
			chatErrorMessage({ status: 429, retryAfterSec: 3700 }, en, 2000),
		).toBe("Usage limit reached. Try again in 2 hours.");
		expect(formatRetryAfter(61, id)).toBe("2 menit");
		expect(formatRetryAfter(0, id)).toBe("1 detik");
	});
});

describe("label sumber & konteks halaman", () => {
	it("toolsUsed → nama modul sesuai bahasa; tak dikenal apa adanya", () => {
		expect(sourceLabels(["ringkasan_keuangan", "lookup_faq"], id)).toEqual([
			"Keuangan & Anggaran",
			"FAQ Bantuan",
		]);
		expect(sourceLabels(["statistik_demografi", "tool_baru"], en)).toEqual([
			"Demographics & Occupations",
			"tool_baru",
		]);
	});

	it("judul halaman dari document.title", () => {
		expect(pageTitleFrom("Keuangan & Anggaran — Dashboard Desa Plus")).toBe(
			"Keuangan & Anggaran",
		);
		expect(pageTitleFrom("Dashboard Desa Plus")).toBe("");
	});
});

describe("saran pertanyaan per rute & izin", () => {
	it("hanya modul yang diizinkan", () => {
		expect(
			suggestionsFor("/", ["use-ai-assistant", "view-dashboard"], "id"),
		).toEqual(["Ringkas kondisi desa hari ini"]);
		expect(
			suggestionsFor(
				"/",
				["use-ai-assistant", "view-dashboard", "view-pengaduan"],
				"id",
			),
		).toHaveLength(2);
		expect(
			suggestionsFor("/keuangan-anggaran", ["use-ai-assistant"], "id"),
		).toEqual([]);
	});

	it("bahasa en, rute tanpa daftar memakai saran Beranda, /bantuan cukup use-ai-assistant", () => {
		expect(
			suggestionsFor("/kinerja-divisi", ["view-kinerja-divisi"], "en"),
		).toEqual(["Which division is the most active?"]);
		expect(suggestionsFor("/wall", ["view-dashboard"], "id")).toEqual([
			"Ringkas kondisi desa hari ini",
		]);
		expect(suggestionsFor("/bantuan", ["use-ai-assistant"], "id")).toEqual([
			"Bagaimana cara mengekspor data?",
		]);
	});
});

describe("mode tertanam (halaman Bantuan)", () => {
	const base = {
		user: VERIFIED,
		status: READY,
		statusError: undefined,
		allowed: ALLOWED,
	};

	it("status tetap diminta di /admin/help bila tertanam, tidak untuk FAB", () => {
		expect(shouldFetchStatus({ pathname: "/admin/help", user: VERIFIED })).toBe(
			false,
		);
		expect(
			shouldFetchStatus({
				pathname: "/admin/help",
				user: VERIFIED,
				embedded: true,
			}),
		).toBe(true);
		expect(
			shouldFetchStatus({
				pathname: "/bantuan",
				user: { emailVerified: false },
				embedded: true,
			}),
		).toBe(false);
	});

	it("ready / loading / no-access / inactive", () => {
		expect(embeddedState(base)).toBe("ready");
		expect(embeddedState({ ...base, status: undefined })).toBe("loading");
		expect(embeddedState({ ...base, allowed: null })).toBe("loading");
		expect(embeddedState({ ...base, user: null })).toBe("no-access");
		expect(embeddedState({ ...base, statusError: 403 })).toBe("no-access");
		expect(embeddedState({ ...base, allowed: ["view-dashboard"] })).toBe(
			"no-access",
		);
		expect(
			embeddedState({ ...base, status: { ...READY, enabled: false } }),
		).toBe("inactive");
		expect(
			embeddedState({
				...base,
				status: { ...READY, slots: { ...READY.slots, chat: false } },
			}),
		).toBe("inactive");
		expect(embeddedState({ ...base, statusError: 500 })).toBe("inactive");
		expect(embeddedState({ ...base, statusError: null })).toBe("inactive");
	});

	it("/admin/help memakai saran /bantuan", () => {
		expect(suggestionsFor("/admin/help", ["use-ai-assistant"], "id")).toEqual([
			"Bagaimana cara mengekspor data?",
		]);
	});
});
