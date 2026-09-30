import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import api from "@/api";
import { prisma } from "@/utils/db";
import { VITE_PUBLIC_URL } from "@/utils/env";
import { assertTestDatabase } from "./test-database";

/**
 * P-1: apiMiddleware menolak user yang belum diverifikasi admin, baik lewat
 * sesi Better Auth nyata maupun API key. Jalan terhadap TEST_DATABASE_URL
 * (`bun run test:db`), data dibuat & dihapus sendiri.
 */
assertTestDatabase();

const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const EMAIL_DOMAIN = "p1-verified-user.test.local"; // test-only
const PASSWORD = "Test-password-123"; // test-only
const DATA_PATH = "/api/keuangan/apbdes-detail";
const PERMISSIONS_PATH = "/api/my-permissions/";

type TestUser = { id: string; cookie: string };

function url(path: string) {
	return `http://localhost${path}`;
}

async function signUp(label: string): Promise<TestUser> {
	const email = `${label}-${RUN_ID}@${EMAIL_DOMAIN}`;
	const res = await api.handle(
		new Request(url("/api/auth/sign-up/email"), {
			method: "POST",
			headers: { "content-type": "application/json", origin: VITE_PUBLIC_URL },
			body: JSON.stringify({ email, password: PASSWORD, name: label }),
		}),
	);
	if (res.status !== 200) {
		throw new Error(
			`sign-up ${label} gagal: ${res.status} ${await res.text()}`,
		);
	}
	const cookie = res.headers
		.getSetCookie()
		.map((c) => c.split(";")[0])
		.join("; ");
	const user = await prisma.user.findUniqueOrThrow({ where: { email } });
	return { id: user.id, cookie };
}

function get(path: string, headers: Record<string, string>) {
	return api.handle(new Request(url(path), { headers }));
}

async function setVerified(userId: string, emailVerified: boolean | null) {
	await prisma.user.update({ where: { id: userId }, data: { emailVerified } });
}

async function createApiKey(userId: string, label: string) {
	const key = `p1-test-key-${label}-${RUN_ID}`; // test-only
	await prisma.apiKey.create({ data: { name: label, key, userId } });
	return key;
}

let unverified: TestUser;
let verified: TestUser;

beforeAll(async () => {
	unverified = await signUp("unverified");
	verified = await signUp("verified");
	await setVerified(verified.id, true);
});

afterAll(async () => {
	await prisma.user.deleteMany({
		where: { email: { endsWith: `-${RUN_ID}@${EMAIL_DOMAIN}` } },
	});
	await prisma.$disconnect();
});

describe("sesi user belum terverifikasi", () => {
	it("sign-up membuat user dengan emailVerified false", async () => {
		const user = await prisma.user.findUniqueOrThrow({
			where: { id: unverified.id },
		});
		expect(user.emailVerified).toBe(false);
	});

	it(`GET ${DATA_PATH} → 403 dengan pesan verifikasi`, async () => {
		const res = await get(DATA_PATH, { cookie: unverified.cookie });
		expect(res.status).toBe(403);
		expect(await res.json()).toEqual({
			message: "Akun menunggu verifikasi admin",
		});
	});

	it(`GET ${PERMISSIONS_PATH} → 403`, async () => {
		const res = await get(PERMISSIONS_PATH, { cookie: unverified.cookie });
		expect(res.status).toBe(403);
	});

	it("emailVerified null (user lama) juga → 403", async () => {
		await setVerified(unverified.id, null);
		try {
			const res = await get(PERMISSIONS_PATH, { cookie: unverified.cookie });
			expect(res.status).toBe(403);
		} finally {
			await setVerified(unverified.id, false);
		}
	});

	it("POST /api/profile/update tetap boleh", async () => {
		const res = await api.handle(
			new Request(url("/api/profile/update"), {
				method: "POST",
				headers: {
					"content-type": "application/json",
					cookie: unverified.cookie,
				},
				body: JSON.stringify({ name: "Nama Baru" }),
			}),
		);
		expect(res.status).toBe(200);
		const body = (await res.json()) as { user: { id: string; name: string } };
		expect(body.user.id).toBe(unverified.id);
		expect(body.user.name).toBe("Nama Baru");
	});

	it("GET /api/session tetap jalan (di luar middleware)", async () => {
		const res = await get("/api/session", { cookie: unverified.cookie });
		expect(res.status).toBe(200);
		const body = (await res.json()) as { data: { user: { id: string } } };
		expect(body.data.user.id).toBe(unverified.id);
	});
});

describe("sesi user terverifikasi", () => {
	it(`GET ${PERMISSIONS_PATH} → 200 seperti biasa`, async () => {
		const res = await get(PERMISSIONS_PATH, { cookie: verified.cookie });
		expect(res.status).toBe(200);
		const body = (await res.json()) as { allowed: string[] };
		expect(Array.isArray(body.allowed)).toBe(true);
	});

	it("verifikasi dicabut admin → 403 walau cookie sesi lama masih dipakai", async () => {
		await setVerified(verified.id, false);
		try {
			const res = await get(PERMISSIONS_PATH, { cookie: verified.cookie });
			expect(res.status).toBe(403);
		} finally {
			await setVerified(verified.id, true);
		}
	});
});

describe("API key", () => {
	it("milik user belum terverifikasi → 403", async () => {
		const key = await createApiKey(unverified.id, "unverified");
		const res = await get(DATA_PATH, { "x-api-key": key });
		expect(res.status).toBe(403);
		expect(await res.json()).toEqual({
			message: "Akun menunggu verifikasi admin",
		});
	});

	it("milik user belum terverifikasi via Bearer → 403", async () => {
		const key = await createApiKey(unverified.id, "unverified-bearer");
		const res = await get(PERMISSIONS_PATH, { authorization: `Bearer ${key}` });
		expect(res.status).toBe(403);
	});

	it("milik user terverifikasi → 200", async () => {
		const key = await createApiKey(verified.id, "verified");
		const res = await get(PERMISSIONS_PATH, { "x-api-key": key });
		expect(res.status).toBe(200);
	});
});

describe("tanpa sesi", () => {
	it(`GET ${DATA_PATH} → 401 (perilaku lama tetap)`, async () => {
		const res = await get(DATA_PATH, {});
		expect(res.status).toBe(401);
	});
});
