import { afterAll, afterEach, beforeAll, describe, expect, it } from "bun:test";
import api from "@/api";
import { prisma } from "@/utils/db";
import { VITE_PUBLIC_URL } from "@/utils/env";
import { assertTestDatabase } from "./test-database";

/**
 * Regresi GHSA-g38m-r43w-p2q7: penyerang mendaftar email/password memakai email
 * korban (emailVerified=false sampai admin memverifikasi), lalu korban login GitHub
 * dengan email itu. OAuth TIDAK boleh tertaut ke akun milik penyerang. Endpoint
 * GitHub dipalsukan lewat globalThis.fetch; data dibuat & dihapus sendiri.
 */
assertTestDatabase();

const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const EMAIL_DOMAIN = "oauth-linking.test.local"; // test-only
const PASSWORD = "Test-password-123"; // test-only

const url = (path: string) => `http://localhost${path}`;
const realFetch = globalThis.fetch;

function mockGitHub(email: string, githubId: number) {
	globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
		const target = typeof input === "string" ? input : input.toString();
		const json = (body: unknown) =>
			new Response(JSON.stringify(body), {
				headers: { "content-type": "application/json" },
			});
		if (target.startsWith("https://github.com/login/oauth/access_token"))
			return json({
				access_token: "gho_test",
				token_type: "bearer",
				scope: "user:email",
			});
		if (target.startsWith("https://api.github.com/user/emails"))
			return json([{ email, primary: true, verified: true }]);
		if (target.startsWith("https://api.github.com/user"))
			return json({
				id: githubId,
				login: `gh-${githubId}`,
				name: "Korban",
				email,
				avatar_url: null,
			});
		return realFetch(input, init);
	}) as typeof fetch;
}

async function signUp(email: string) {
	const res = await api.handle(
		new Request(url("/api/auth/sign-up/email"), {
			method: "POST",
			headers: { "content-type": "application/json", origin: VITE_PUBLIC_URL },
			body: JSON.stringify({ email, password: PASSWORD, name: "penyerang" }),
		}),
	);
	if (res.status !== 200)
		throw new Error(
			`sign-up ${email} gagal: ${res.status} ${await res.text()}`,
		);
	return prisma.user.findUniqueOrThrow({ where: { email } });
}

/** Jalankan alur login GitHub penuh; kembalikan header Location dari callback. */
async function githubLogin(): Promise<string> {
	const start = await api.handle(
		new Request(url("/api/auth/sign-in/social"), {
			method: "POST",
			headers: { "content-type": "application/json", origin: VITE_PUBLIC_URL },
			body: JSON.stringify({ provider: "github", callbackURL: "/" }),
		}),
	);
	if (start.status !== 200)
		throw new Error(
			`sign-in/social gagal: ${start.status} ${await start.text()}`,
		);
	const { url: authUrl } = (await start.json()) as { url: string };
	const state = new URL(authUrl).searchParams.get("state");
	if (!state) throw new Error(`state tidak ada di URL otorisasi: ${authUrl}`);
	const cookie = start.headers
		.getSetCookie()
		.map((c) => c.split(";")[0])
		.join("; ");
	const callback = await api.handle(
		new Request(
			url(`/api/auth/callback/github?code=test-code&state=${state}`),
			{
				headers: { cookie },
			},
		),
	);
	return callback.headers.get("location") ?? "";
}

const githubAccounts = (userId: string) =>
	prisma.account.count({ where: { userId, providerId: "github" } });

beforeAll(() => {
	if (!process.env.BETTER_AUTH_SECRET)
		throw new Error("BETTER_AUTH_SECRET wajib diset untuk test OAuth");
});

afterEach(() => {
	globalThis.fetch = realFetch;
});

afterAll(async () => {
	await prisma.user.deleteMany({
		where: { email: { endsWith: `-${RUN_ID}@${EMAIL_DOMAIN}` } },
	});
	await prisma.$disconnect();
});

describe("OAuth account linking ke akun email/password", () => {
	it("email pre-registered belum diverifikasi admin → GitHub TIDAK tertaut", async () => {
		const email = `korban-${RUN_ID}@${EMAIL_DOMAIN}`;
		const attacker = await signUp(email);
		expect(attacker.emailVerified).toBe(false);

		mockGitHub(email, 910001);
		const location = await githubLogin();

		expect(location).toContain("account_not_linked");
		expect(await githubAccounts(attacker.id)).toBe(0);
		const after = await prisma.user.findUniqueOrThrow({
			where: { id: attacker.id },
		});
		// GitHub menyatakan email terverifikasi; itu tidak boleh melewati verifikasi admin.
		expect(after.emailVerified).toBe(false);
	});

	it("akun yang sudah diverifikasi admin → GitHub tertaut (kontrol mock)", async () => {
		const email = `verified-${RUN_ID}@${EMAIL_DOMAIN}`;
		const user = await signUp(email);
		await prisma.user.update({
			where: { id: user.id },
			data: { emailVerified: true },
		});

		mockGitHub(email, 910002);
		const location = await githubLogin();

		expect(location).not.toContain("error");
		expect(await githubAccounts(user.id)).toBe(1);
	});
});
