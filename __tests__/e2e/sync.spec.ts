import { expect, test } from "@playwright/test";

const MOCK_ADMIN = {
	id: "user_1",
	name: "Admin Desa",
	email: "admin@example.com",
	role: "admin",
};

const MOCK_SYNC_LOG: {
	id: string;
	type: string;
	status: string;
	triggeredBy: string;
	durationMs: number;
	recordsAffected: number;
	errorMessage: null;
	startedAt: string;
} = {
	id: "log_001",
	type: "noc",
	status: "success",
	triggeredBy: "manual",
	durationMs: 1234,
	recordsAffected: 42,
	errorMessage: null,
	startedAt: new Date().toISOString(),
};

test.describe("Sinkronisasi NOC", () => {
	test.beforeEach(async ({ page }) => {
		await page.route("**/api/session", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ data: { user: MOCK_ADMIN } }),
			});
		});

		await page.route("**/api/noc/last-sync*", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					lastSyncedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
				}),
			});
		});

		await page.route("**/api/demografi/last-sync*", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ lastSyncedAt: null }),
			});
		});

		await page.route("**/api/admin/sync/logs*", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ data: [MOCK_SYNC_LOG] }),
			});
		});
	});

	test("trigger NOC sync berhasil → alert sukses muncul", async ({ page }) => {
		const syncedAt = new Date().toISOString();

		await page.route("**/api/noc/sync", async (route) => {
			if (route.request().method() === "POST") {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({
						success: true,
						message: "Sinkronisasi berhasil diselesaikan",
						lastSyncedAt: syncedAt,
					}),
				});
			} else {
				await route.continue();
			}
		});

		await page.goto("/pengaturan/sinkronisasi");

		const syncBtn = page
			.locator("button")
			.filter({ hasText: /Sinkronkan NOC|Sinkronkan Sekarang|sinkronkan/i })
			.first();
		await expect(syncBtn).toBeVisible({ timeout: 10000 });
		await syncBtn.click();

		const successAlert = page
			.locator(
				'.mantine-Alert-root[data-color="green"], [class*="Alert"][class*="green"], [role="alert"]',
			)
			.or(page.locator("text=Sinkronisasi berhasil"))
			.or(page.locator("text=berhasil diselesaikan"));
		await expect(successAlert.first()).toBeVisible({ timeout: 10000 });
	});

	test("SyncLog terbaru muncul di tabel riwayat sinkronisasi", async ({
		page,
	}) => {
		await page.goto("/pengaturan/sinkronisasi");

		await expect(
			page.locator("text=Riwayat Sinkronisasi").first(),
		).toBeVisible({ timeout: 10000 });

		const logRow = page
			.locator("table tbody tr, .mantine-Table-tr")
			.first();
		await expect(logRow).toBeVisible({ timeout: 8000 });

		await expect(
			page.locator("text=noc, text=success").or(page.locator("td:has-text('noc')")).first(),
		).toBeVisible();
	});

	test("trigger NOC sync gagal → alert error muncul", async ({ page }) => {
		await page.route("**/api/noc/sync", async (route) => {
			if (route.request().method() === "POST") {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({
						success: false,
						error: "Sinkronisasi gagal: koneksi NOC terputus",
					}),
				});
			} else {
				await route.continue();
			}
		});

		await page.goto("/pengaturan/sinkronisasi");

		const syncBtn = page
			.locator("button")
			.filter({ hasText: /Sinkronkan NOC|Sinkronkan Sekarang|sinkronkan/i })
			.first();
		await expect(syncBtn).toBeVisible({ timeout: 10000 });
		await syncBtn.click();

		const errorMsg = page
			.locator("text=gagal")
			.or(page.locator("text=Gagal"))
			.or(page.locator('[data-color="red"]'));
		await expect(errorMsg.first()).toBeVisible({ timeout: 10000 });
	});

	test("halaman sinkronisasi menampilkan waktu sync terakhir", async ({
		page,
	}) => {
		await page.goto("/pengaturan/sinkronisasi");

		await expect(
			page
				.locator("text=yang lalu")
				.or(page.locator("text=jam yang lalu"))
				.first(),
		).toBeVisible({ timeout: 10000 });
	});

	test("non-admin tidak dapat mengakses halaman sinkronisasi", async ({
		page,
	}) => {
		await page.route("**/api/session", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					data: {
						user: { ...MOCK_ADMIN, role: "user" },
					},
				}),
			});
		});

		await page.goto("/pengaturan/sinkronisasi");

		const restrictedMsg = page
			.locator("text=hanya dapat diakses oleh administrator")
			.or(page.locator("text=Unauthorized"))
			.or(page.locator('[data-color="orange"]'));
		await expect(restrictedMsg.first()).toBeVisible({ timeout: 8000 });
	});
});
