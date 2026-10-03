import { describe, expect, it } from "bun:test";
import { groupFaqByCategory } from "@/components/help/faq-by-category";
import type { FaqItem } from "@/components/help/help-content.types";
import {
	adminHelpPalette,
	helpCardStyle,
	userHelpPalette,
} from "@/components/help/help-palette";
import {
	bytesToBase64,
	canSubmitTicket,
	hasRequiredTicketFields,
	isScreenshotAccepted,
	MAX_SCREENSHOT_BYTES,
} from "@/components/help/support-ticket.logic";

const faq = (id: string, category: string): FaqItem => ({
	id,
	question: `Q${id}`,
	answer: `A${id}`,
	category,
	order: 0,
});

describe("groupFaqByCategory", () => {
	it("mengelompokkan per kategori dengan urutan masukan dipertahankan", () => {
		const grouped = groupFaqByCategory([
			faq("1", "Akses"),
			faq("2", "Data"),
			faq("3", "Akses"),
		]);
		expect(Object.keys(grouped)).toEqual(["Akses", "Data"]);
		expect(grouped.Akses?.map((f) => f.id)).toEqual(["1", "3"]);
		expect(grouped.Data?.map((f) => f.id)).toEqual(["2"]);
	});

	it("daftar kosong → objek kosong", () => {
		expect(groupFaqByCategory([])).toEqual({});
	});
});

describe("support ticket", () => {
	const full = {
		nama: "Budi",
		email: "b@contoh.com",
		kategori: "Lainnya",
		deskripsi: "Halaman tidak bisa dibuka",
	};

	it("syarat kirim: semua kolom wajib terisi", () => {
		expect(hasRequiredTicketFields(full)).toBe(true);
		expect(hasRequiredTicketFields({ ...full, kategori: null })).toBe(false);
		expect(hasRequiredTicketFields({ ...full, deskripsi: "" })).toBe(false);
	});

	it("tombol kirim butuh deskripsi minimal 10 karakter", () => {
		expect(canSubmitTicket(full)).toBe(true);
		expect(canSubmitTicket({ ...full, deskripsi: "123456789" })).toBe(false);
		expect(canSubmitTicket({ ...full, deskripsi: "1234567890" })).toBe(true);
		expect(canSubmitTicket({ ...full, email: "" })).toBe(false);
	});

	it("screenshot di atas 2 MB ditolak, null boleh (hapus lampiran)", () => {
		const big = new File([new Uint8Array(MAX_SCREENSHOT_BYTES + 1)], "a.png");
		const ok = new File([new Uint8Array(10)], "b.png");
		expect(isScreenshotAccepted(big)).toBe(false);
		expect(isScreenshotAccepted(ok)).toBe(true);
		expect(isScreenshotAccepted(null)).toBe(true);
	});

	it("bytesToBase64 sama dengan Buffer base64", () => {
		const bytes = new Uint8Array([0, 1, 127, 128, 255, 72, 105]);
		expect(bytesToBase64(bytes)).toBe(Buffer.from(bytes).toString("base64"));
		expect(bytesToBase64(new Uint8Array())).toBe("");
	});
});

describe("help palette", () => {
	it("pengguna: warna slate di mode gelap, putih di terang", () => {
		expect(userHelpPalette(true).cardBg).toBe("#1E293B");
		expect(userHelpPalette(false).cardBg).toBe("white");
		expect(userHelpPalette(true).faqItemBg).toBe("#263852ff");
	});

	it("admin: aksen amber di mode gelap", () => {
		expect(adminHelpPalette(true).cardBorder).toBe("rgba(251, 240, 223, 0.1)");
		expect(adminHelpPalette(false).codeBg).toBe("#f8fafc");
	});

	it("gaya kartu memakai border dari palet", () => {
		expect(helpCardStyle(userHelpPalette(true)).borderColor).toBe("#334155");
	});
});

describe("admin help content", () => {
	it("keeps stat counts in sync with the guide and FAQ lists", async () => {
		const { adminGuideItems, adminFaqItems, adminHelpStats } = await import(
			"@/components/help/admin-help-content"
		);
		const statValue = (label: string) =>
			adminHelpStats.find((s) => s.label === label)?.value;
		expect(statValue("Panduan Admin")).toBe(String(adminGuideItems.length));
		expect(statValue("FAQ Tersedia")).toBe(String(adminFaqItems.length));
	});
});
