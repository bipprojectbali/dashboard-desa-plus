import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import api from "@/api";
import { prisma } from "@/utils/db";
import { VITE_PUBLIC_URL } from "@/utils/env";
import { assertTestDatabase } from "./test-database";

/**
 * Temuan 8: role dibaca dari DB, bukan dari cookieCache sesi (30 hari), sehingga
 * penurunan/kenaikan role langsung berlaku untuk sesi lama. Jalan terhadap
 * TEST_DATABASE_URL (`bun run test:db`), data dibuat & dihapus sendiri.
 */
assertTestDatabase();

const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const EMAIL_DOMAIN = "role-from-db.test.local"; // test-only
const PASSWORD = "Test-password-123"; // test-only
const ADMIN_PATH = "/api/admin/users";

const url = (path: string) => `http://localhost${path}`;
const get = (path: string, cookie: string) =>
	api.handle(new Request(url(path), { headers: { cookie } }));
const setRole = (userId: string, role: string) =>
	prisma.user.update({ where: { id: userId }, data: { role } });

let userId: string;
let cookie: string;

beforeAll(async () => {
	const email = `admin-${RUN_ID}@${EMAIL_DOMAIN}`;
	const res = await api.handle(
		new Request(url("/api/auth/sign-up/email"), {
			method: "POST",
			headers: { "content-type": "application/json", origin: VITE_PUBLIC_URL },
			body: JSON.stringify({ email, password: PASSWORD, name: "role-test" }),
		}),
	);
	if (res.status !== 200) {
		throw new Error(`sign-up gagal: ${res.status} ${await res.text()}`);
	}
	const user = await prisma.user.findUniqueOrThrow({ where: { email } });
	userId = user.id;
	await prisma.user.update({
		where: { id: userId },
		data: { role: "admin", emailVerified: true },
	});
	// Login SETELAH dipromosikan: cookie sesi ini membawa cache role "admin", jadi
	// penurunan role berikutnya hanya terlihat bila role dibaca dari DB.
	const login = await api.handle(
		new Request(url("/api/auth/sign-in/email"), {
			method: "POST",
			headers: { "content-type": "application/json", origin: VITE_PUBLIC_URL },
			body: JSON.stringify({ email, password: PASSWORD }),
		}),
	);
	if (login.status !== 200) {
		throw new Error(`sign-in gagal: ${login.status} ${await login.text()}`);
	}
	cookie = login.headers
		.getSetCookie()
		.map((c) => c.split(";")[0])
		.join("; ");
});

afterAll(async () => {
	await prisma.user.deleteMany({
		where: { email: { endsWith: `-${RUN_ID}@${EMAIL_DOMAIN}` } },
	});
	await prisma.$disconnect();
});

describe("role dari DB, bukan cookie cache sesi", () => {
	it("admin dengan sesi yang sudah di-cache → 200 di endpoint admin", async () => {
		// Panggilan sesi lebih dulu supaya cookieCache Better Auth terisi.
		await get("/api/session", cookie);
		expect((await get(ADMIN_PATH, cookie)).status).toBe(200);
	});

	it("role diturunkan di DB → request berikutnya dengan cookie lama langsung 403", async () => {
		await setRole(userId, "user");
		try {
			expect((await get(ADMIN_PATH, cookie)).status).toBe(403);
		} finally {
			await setRole(userId, "admin");
		}
	});

	it("role dinaikkan di DB → langsung 200 tanpa login ulang", async () => {
		await setRole(userId, "user");
		expect((await get(ADMIN_PATH, cookie)).status).toBe(403);
		await setRole(userId, "admin");
		expect((await get(ADMIN_PATH, cookie)).status).toBe(200);
	});

	it("/api/session melaporkan role terbaru dari DB", async () => {
		await setRole(userId, "user");
		try {
			const res = await get("/api/session", cookie);
			const body = (await res.json()) as { data: { user: { role: string } } };
			expect(body.data.user.role).toBe("user");
		} finally {
			await setRole(userId, "admin");
		}
	});
});
