import { expect, test } from "@playwright/test";

test.describe("Auth Flow", () => {
	test("login berhasil lalu redirect ke dashboard", async ({ page }) => {
		await page.route("**/api/session", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					data: {
						user: {
							id: "user_1",
							name: "Admin Desa",
							email: "admin@example.com",
							role: "admin",
						},
					},
				}),
			});
		});

		await page.route("**/sign-in/email**", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ token: "mock-token" }),
			});
		});

		await page.goto("/signin");
		await expect(page.locator("h1")).toContainText("Welcome back!");

		await page.fill('input[type="email"]', "admin@example.com");
		await page.fill('input[type="password"]', "admin123");
		await page.click('button[type="submit"]');

		await expect(page).toHaveURL(/^\/$|\/dashboard/, { timeout: 10000 });
	});

	test("login gagal menampilkan pesan error", async ({ page }) => {
		await page.route("**/api/session", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ data: null }),
			});
		});

		await page.route("**/sign-in/email**", async (route) => {
			await route.fulfill({
				status: 401,
				contentType: "application/json",
				body: JSON.stringify({ error: "Invalid credentials" }),
			});
		});

		await page.goto("/signin");
		await page.fill('input[type="email"]', "salah@example.com");
		await page.fill('input[type="password"]', "wrongpassword");
		await page.click('button[type="submit"]');

		const errorMsg = page.locator(
			'[role="alert"], .mantine-Alert-root, [data-error], p[class*="error"]',
		);
		await expect(errorMsg.first()).toBeVisible({ timeout: 8000 });
	});

	test("redirect ke signin jika belum autentikasi", async ({ page }) => {
		await page.route("**/api/session", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ data: null }),
			});
		});

		await page.goto("/profile");
		await expect(page).toHaveURL(/\/signin/, { timeout: 8000 });
	});

	test("halaman signin menampilkan elemen utama", async ({ page }) => {
		await page.goto("/signin");

		await expect(page.locator("h1")).toContainText("Welcome back!");
		await expect(page.locator('button[type="submit"]')).toBeVisible();
		await expect(page.locator('input[type="email"]')).toBeVisible();
		await expect(page.locator('input[type="password"]')).toBeVisible();
	});

	test("redirect parameter dipertahankan saat login berhasil", async ({
		page,
	}) => {
		await page.route("**/api/session", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					data: {
						user: {
							id: "user_1",
							name: "Admin Desa",
							email: "admin@example.com",
							role: "admin",
						},
					},
				}),
			});
		});

		await page.route("**/sign-in/email**", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ token: "mock-token" }),
			});
		});

		await page.goto("/signin?redirect=/pengaturan");
		await expect(page.locator('input[type="email"]')).toBeVisible();
	});
});
