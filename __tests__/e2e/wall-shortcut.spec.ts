import { expect, test } from "@playwright/test";

const MOCK_USER = {
	id: "user_1",
	name: "Admin Desa",
	email: "admin@example.com",
	role: "admin",
};

/**
 * Header menyediakan pintasan ke tampilan Wall NOC (/wall) yang dibuka di tab
 * baru, sehingga operator tidak perlu mengetik URL manual.
 */
test.describe("Pintasan Wall NOC di header", () => {
	test.beforeEach(async ({ page }) => {
		await page.route("**/api/session", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ data: { user: MOCK_USER } }),
			});
		});

		// Endpoint preferensi yang dipanggil MainLayout — stub agar layout render bersih.
		for (const path of [
			"**/api/umum-preferences",
			"**/api/akses-preferences",
		]) {
			await page.route(path, async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({ data: null }),
				});
			});
		}

		await page.route("**/api/my-permissions", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ allowed: ["view-dashboard"] }),
			});
		});
	});

	test("tombol Wall NOC tampil dan mengarah ke /wall di tab baru", async ({
		page,
	}) => {
		await page.goto("/");

		const wallButton = page.getByRole("link", { name: "Wall NOC" });
		await expect(wallButton).toBeVisible({ timeout: 10000 });
		await expect(wallButton).toHaveAttribute("href", "/wall");
		await expect(wallButton).toHaveAttribute("target", "_blank");
	});

	test("mengeklik pintasan membuka /wall pada tab baru", async ({ page }) => {
		await page.goto("/");

		const wallButton = page.getByRole("link", { name: "Wall NOC" });
		await expect(wallButton).toBeVisible({ timeout: 10000 });

		const popupPromise = page.waitForEvent("popup");
		await wallButton.click();
		const popup = await popupPromise;

		await expect(popup).toHaveURL(/\/wall/, { timeout: 10000 });
	});
});
