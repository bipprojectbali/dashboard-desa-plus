import { expect, test } from "@playwright/test";

const MOCK_USER = {
	id: "user_1",
	name: "Admin Desa",
	email: "admin@example.com",
	role: "admin",
};

const STUB_REPLY =
	"Terima kasih atas pertanyaan Anda. Saat ini saya adalah versi awal dari asisten virtual. Tim kami sedang mengembangkan kemampuan saya lebih lanjut.";

test.describe("Jenna Virtual Assistant Chat", () => {
	test.beforeEach(async ({ page }) => {
		await page.route("**/api/session", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ data: { user: MOCK_USER } }),
			});
		});

		await page.route("**/api/jenna/analytics", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					stats: {
						interaksiHariIni: 42,
						changeFromYesterday: 5,
						jawabanOtomatis: 95,
						jawabanOtomatisCount: 40,
						waktuRespon: "< 1 detik",
						belumDitindak: 2,
					},
					chartMingguan: [],
					topTopics: [],
					jamTersibuk: [],
				}),
			});
		});
	});

	test("kirim pesan ke Jenna dan respons muncul di chat", async ({ page }) => {
		await page.route("**/api/jenna/chat", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ reply: STUB_REPLY }),
			});
		});

		await page.goto("/bantuan");

		const chatInput = page.locator(
			'input[placeholder*="ketik"], input[placeholder*="Ketik"], input[placeholder*="pesan"], textarea[placeholder*="pesan"]',
		);
		await expect(chatInput.first()).toBeVisible({ timeout: 10000 });

		await chatInput.first().fill("Bagaimana cara mengakses data demografi?");

		const sendButton = page.locator(
			'button[aria-label*="Kirim"], button[aria-label*="kirim"], button[aria-label*="send"], button[aria-label*="Send"]',
		);
		await sendButton.first().click();

		await expect(page.locator(`text=${STUB_REPLY}`).first()).toBeVisible({
			timeout: 10000,
		});
	});

	test("pesan user muncul di chat setelah dikirim", async ({ page }) => {
		const userMessage = "Apa saja fitur yang tersedia di dashboard?";

		await page.route("**/api/jenna/chat", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ reply: STUB_REPLY }),
			});
		});

		await page.goto("/bantuan");

		const chatInput = page.locator(
			'input[placeholder*="ketik"], input[placeholder*="Ketik"], input[placeholder*="pesan"], textarea',
		);
		await expect(chatInput.first()).toBeVisible({ timeout: 10000 });

		await chatInput.first().fill(userMessage);

		const sendButton = page.locator(
			'button[aria-label*="Kirim"], button[aria-label*="kirim"], button[aria-label*="send"]',
		);
		await sendButton.first().click();

		await expect(page.locator(`text=${userMessage}`).first()).toBeVisible({
			timeout: 5000,
		});
	});

	test("Jenna menampilkan salam pembuka saat halaman dibuka", async ({
		page,
	}) => {
		await page.goto("/bantuan");

		const jennaGreeting = page.locator(
			'[class*="chat"], [class*="message"], [data-sender="jenna"]',
		);
		const greetingText = page
			.locator("text=Halo")
			.or(page.locator("text=Selamat datang"));
		await expect(greetingText.first().or(jennaGreeting.first())).toBeVisible({
			timeout: 10000,
		});
	});

	test("API error ditangani dengan pesan fallback", async ({ page }) => {
		await page.route("**/api/jenna/chat", async (route) => {
			await route.fulfill({
				status: 500,
				contentType: "application/json",
				body: JSON.stringify({ error: "Internal Server Error" }),
			});
		});

		await page.goto("/bantuan");

		const chatInput = page.locator(
			'input[placeholder*="ketik"], input[placeholder*="Ketik"], input[placeholder*="pesan"], textarea',
		);
		await expect(chatInput.first()).toBeVisible({ timeout: 10000 });

		await chatInput.first().fill("Test pesan error");
		const sendButton = page.locator(
			'button[aria-label*="Kirim"], button[aria-label*="kirim"]',
		);
		await sendButton.first().click();

		const errorOrFallback = page
			.locator("text=terjadi kesalahan")
			.or(page.locator("text=Terjadi kesalahan"))
			.or(page.locator("text=koneksi gagal"))
			.or(page.locator("text=Koneksi gagal"));
		await expect(errorOrFallback.first()).toBeVisible({ timeout: 8000 });
	});
});
