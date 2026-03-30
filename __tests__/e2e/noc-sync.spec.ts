import { expect, test } from "@playwright/test";

test.describe("NOC Synchronization UI", () => {
	test.beforeEach(async ({ page }) => {
		// Mock the session API to simulate being logged in as an admin
		await page.route("**/api/session", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					data: {
						user: {
							id: "user_123",
							name: "Admin User",
							email: "admin@example.com",
							role: "admin",
						},
					},
				}),
			});
		});

		// Mock the last-sync API
		await page.route("**/api/noc/last-sync*", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					lastSyncedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
				}),
			});
		});
	});

	test("should navigate to NOC Sync page from sidebar", async ({ page }) => {
		await page.goto("/");

		// Open Settings/Pengaturan submenu if not open
		const settingsNavLink = page.locator('button:has-text("Pengaturan")');
		await settingsNavLink.click();

		// Click on Sinkronisasi NOC
		const syncNavLink = page.locator('a:has-text("Sinkronisasi NOC")');
		// In Mantine NavLink with navigate, it might be a button or div with role button depending on implementation
		// Based on Sidebar.tsx, it's a MantineNavLink which renders as a button or anchor
		const syncLink = page.getByRole("button", { name: "Sinkronisasi NOC" });
		await syncLink.click();

		// Verify we are on the sync page
		await expect(page).toHaveURL(/\/pengaturan\/sinkronisasi/);
		await expect(page.locator("h2")).toContainText("Sinkronisasi Data NOC");
	});

	test("should perform synchronization successfully", async ({ page }) => {
		await page.goto("/pengaturan/sinkronisasi");

		// Initial state check
		await expect(page.locator("text=Waktu Sinkronisasi Terakhir:")).toBeVisible();

		// Mock the sync API
		const now = new Date().toISOString();
		await page.route("**/api/noc/sync", async (route) => {
			if (route.request().method() === "POST") {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({
						success: true,
						message: "Sinkronisasi berhasil diselesaikan",
						lastSyncedAt: now,
					}),
				});
			}
		});

		// Click Sync button
		await page.click('button:has-text("Sinkronkan Sekarang")');

		// Verify success message
		await expect(page.locator("text=Sinkronisasi berhasil dilakukan")).toBeVisible();

		// Verify timestamp updated (it should show "beberapa detik yang lalu" or similar because of dayjs fromNow)
		// We can just check if the new time format is there or the relative time updated
		await expect(page.locator("text=beberapa detik yang lalu")).toBeVisible();
	});

	test("should handle synchronization error", async ({ page }) => {
		await page.goto("/pengaturan/sinkronisasi");

		// Mock the sync API failure
		await page.route("**/api/noc/sync", async (route) => {
			if (route.request().method() === "POST") {
				await route.fulfill({
					status: 200, // API returns 200 but with success: false for business logic errors
					contentType: "application/json",
					body: JSON.stringify({
						success: false,
						error: "Sinkronisasi gagal dijalankan",
					}),
				});
			}
		});

		// Click Sync button
		await page.click('button:has-text("Sinkronkan Sekarang")');

		// Verify error message
		await expect(page.locator("text=Sinkronisasi gagal dijalankan")).toBeVisible();
	});
});
