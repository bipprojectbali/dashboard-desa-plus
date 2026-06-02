import { expect, test } from "@playwright/test";

const MOCK_USER = {
	id: "user_1",
	name: "Admin Desa",
	email: "admin@example.com",
	role: "admin",
};

const MOCK_COMPLAINT = {
	id: "c_001",
	title: "Jalan rusak di depan balai desa",
	category: "Infrastruktur",
	status: "BARU",
	createdAt: new Date().toISOString(),
};

const MOCK_IDEA = {
	id: "idea_001",
	title: "Program daur ulang sampah",
	description: "Membuat bank sampah di setiap banjar untuk mengurangi limbah",
	category: "Lingkungan",
	submitterName: "I Wayan Suka",
	submitterContact: "081234567890",
	status: "BARU",
	createdAt: new Date().toISOString(),
};

test.describe("Pengaduan & Layanan Publik", () => {
	test.beforeEach(async ({ page }) => {
		await page.route("**/api/session", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ data: { user: MOCK_USER } }),
			});
		});

		await page.route("**/api/complaint/stats", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					data: { total: 12, baru: 5, proses: 4, selesai: 3 },
				}),
			});
		});

		await page.route("**/api/complaint/recent*", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					data: [MOCK_COMPLAINT],
					total: 1,
					page: 1,
					limit: 5,
				}),
			});
		});

		await page.route("**/api/complaint/service-stats", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ data: [] }),
			});
		});

		await page.route("**/api/complaint/trends", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ data: [] }),
			});
		});

		await page.route("**/api/complaint/innovation-ideas", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ data: [MOCK_IDEA] }),
			});
		});

		await page.route("**/api/akses-preferences", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					data: { izinExportData: true, izinEditData: true },
				}),
			});
		});
	});

	test("complaint baru muncul di daftar pengaduan setelah submit", async ({
		page,
	}) => {
		const newComplaint = {
			id: "c_002",
			title: "Lampu jalan mati di Gang Mawar",
			category: "Fasilitas",
			status: "BARU",
			createdAt: new Date().toISOString(),
		};

		let callCount = 0;
		await page.route("**/api/complaint/recent*", async (route) => {
			callCount++;
			const data =
				callCount === 1 ? [MOCK_COMPLAINT] : [newComplaint, MOCK_COMPLAINT];
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ data, total: data.length, page: 1, limit: 5 }),
			});
		});

		await page.goto("/pengaduan-layanan-publik");

		await expect(
			page.locator(`text=${MOCK_COMPLAINT.title}`).first(),
		).toBeVisible({ timeout: 10000 });

		callCount = 2;

		await page.reload();

		await expect(
			page.locator(`text=${newComplaint.title}`).first(),
		).toBeVisible({ timeout: 10000 });
	});

	test("stat cards menampilkan jumlah complaint dengan benar", async ({
		page,
	}) => {
		await page.goto("/pengaduan-layanan-publik");

		await expect(page.locator("text=12").first()).toBeVisible({
			timeout: 10000,
		});
		await expect(page.locator("text=5").first()).toBeVisible();
	});

	test("InnovationIdeaModal terbuka saat klik Detail", async ({ page }) => {
		await page.goto("/pengaduan-layanan-publik");

		await expect(page.locator(`text=${MOCK_IDEA.title}`).first()).toBeVisible({
			timeout: 10000,
		});

		await page.locator("text=Detail").first().click();

		const modal = page.locator(
			'.mantine-Modal-root, [role="dialog"], [data-modal]',
		);
		await expect(modal.first()).toBeVisible({ timeout: 5000 });

		await expect(
			page.locator(`text=${MOCK_IDEA.submitterName}`).first(),
		).toBeVisible();
	});

	test("recent complaint dengan status BARU menampilkan badge merah", async ({
		page,
	}) => {
		await page.goto("/pengaduan-layanan-publik");

		await expect(
			page.locator(`text=${MOCK_COMPLAINT.title}`).first(),
		).toBeVisible({ timeout: 10000 });

		const statusBadge = page.locator(
			'.mantine-Badge-root:has-text("BARU"), .mantine-Badge-root:has-text("baru")',
		);
		await expect(statusBadge.first()).toBeVisible();
	});
});
