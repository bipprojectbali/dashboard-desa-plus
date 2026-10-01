import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { runAssistantRetention } from "@/jobs/assistant-retention";
import type { AiAssistantAdminOverviewDto } from "@/types/ai-assistant-admin";
import { prisma } from "@/utils/db";
import {
	ADMIN,
	call,
	newRunId,
	SETTINGS_BODY,
	signUp,
	snapshotAssistantConfig,
	type TestUser,
} from "./assistant-admin.helpers";
import { assertTestDatabase } from "./test-database";

/**
 * P3: status asisten, guard admin, pengaturan, dan job retensi dengan sesi
 * Better Auth nyata. Pengaturan & slot di DB test disimpan lalu dipulihkan.
 */
assertTestDatabase();

const RUN_ID = newRunId();
const EMAIL_DOMAIN = "p3-assistant-admin.test.local"; // test-only
const email = (label: string) => `${label}-${RUN_ID}@${EMAIL_DOMAIN}`;
const DENIED_ROLE = `p3-denied-${RUN_ID}`; // test-only

let admin: TestUser;
let member: TestUser;
let unverified: TestUser;
let denied: TestUser;
let restoreConfig: () => Promise<void>;

beforeAll(async () => {
	restoreConfig = await snapshotAssistantConfig();
	[admin, member, unverified, denied] = await Promise.all([
		signUp(email("admin"), "admin"),
		signUp(email("member"), "member"),
		signUp(email("unverified"), "unverified"),
		signUp(email("denied"), "denied"),
	]);
	// Role diubah di DB setelah sign-up: cookie sesi masih memuat role lama,
	// jadi test ini juga membuktikan guard membaca role dari DB.
	await prisma.user.update({
		where: { id: admin.id },
		data: { role: "admin", emailVerified: true },
	});
	await prisma.user.updateMany({
		where: { id: { in: [member.id, denied.id] } },
		data: { emailVerified: true },
	});
	await prisma.user.update({
		where: { id: denied.id },
		data: { role: DENIED_ROLE },
	});
	await prisma.rolePermission.create({
		data: { role: DENIED_ROLE, feature: "use-ai-assistant", allowed: false },
	});
});

afterAll(async () => {
	await prisma.rolePermission.deleteMany({ where: { role: DENIED_ROLE } });
	await restoreConfig();
	await prisma.user.deleteMany({
		where: { email: { endsWith: `-${RUN_ID}@${EMAIL_DOMAIN}` } },
	});
	await prisma.$disconnect();
});

describe("GET /api/assistant/status", () => {
	it("tanpa sesi → 401", async () => {
		expect((await call("GET", "/api/assistant/status", {})).status).toBe(401);
	});
	it("user belum terverifikasi → 403", async () => {
		const res = await call("GET", "/api/assistant/status", {
			cookie: unverified.cookie,
		});
		expect(res.status).toBe(403);
	});
	it("API key milik user terverifikasi → 403 (sesi browser saja)", async () => {
		const key = `p3-key-${RUN_ID}`; // test-only
		await prisma.apiKey.create({
			data: { name: "p3", key, userId: member.id },
		});
		const res = await call("GET", "/api/assistant/status", {
			"x-api-key": key,
		});
		expect(res.status).toBe(403);
	});
	it("role tanpa izin use-ai-assistant → 403", async () => {
		const res = await call("GET", "/api/assistant/status", {
			cookie: denied.cookie,
		});
		expect(res.status).toBe(403);
	});
	it("user terverifikasi → hanya boolean + nama", async () => {
		const res = await call("GET", "/api/assistant/status", {
			cookie: member.cookie,
		});
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(Object.keys(body).sort()).toEqual([
			"assistantName",
			"enabled",
			"maxInputChars",
			"slots",
		]);
		expect(body.slots).toEqual({ chat: false, pointer: false, voice: false });
	});
});

describe("guard /api/admin/ai-assistant", () => {
	it("non-admin → 403", async () => {
		expect((await call("GET", ADMIN, { cookie: member.cookie })).status).toBe(
			403,
		);
	});
	it("API key milik admin → 403", async () => {
		const key = `p3-admin-key-${RUN_ID}`; // test-only
		await prisma.apiKey.create({
			data: { name: "p3-admin", key, userId: admin.id },
		});
		expect((await call("GET", ADMIN, { "x-api-key": key })).status).toBe(403);
	});
	it("admin sesi browser → overview lengkap", async () => {
		const res = await call("GET", ADMIN, { cookie: admin.cookie });
		expect(res.status).toBe(200);
		const body = (await res.json()) as AiAssistantAdminOverviewDto;
		expect(body.providers.map((p) => p.feature)).toEqual([
			"chat",
			"pointer",
			"voice",
		]);
		expect(body.kioskCandidates.some((c) => c.id === member.id)).toBe(true);
		expect(body.kioskCandidates.some((c) => c.id === unverified.id)).toBe(
			false,
		);
		expect(typeof body.cryptoConfigured).toBe("boolean");
	});
});

describe("PUT settings", () => {
	it("rentang di luar batas → 422 JSON", async () => {
		const res = await call(
			"PUT",
			`${ADMIN}/settings`,
			{ cookie: admin.cookie },
			{
				...SETTINGS_BODY,
				historyWindow: 1,
			},
		);
		expect(res.status).toBe(422);
		expect((await res.json()).error).toContain("historyWindow");
	});
	it("akun kiosk belum terverifikasi → 422", async () => {
		const res = await call(
			"PUT",
			`${ADMIN}/settings`,
			{ cookie: admin.cookie },
			{
				...SETTINGS_BODY,
				kioskUserId: unverified.id,
			},
		);
		expect(res.status).toBe(422);
	});
	it("valid → tersimpan, cache dibuang, dicatat tanpa isi", async () => {
		const res = await call(
			"PUT",
			`${ADMIN}/settings`,
			{ cookie: admin.cookie },
			{
				...SETTINGS_BODY,
				enabled: true,
				assistantName: "  Asisten Desa  ",
				kioskUserId: member.id,
			},
		);
		expect(res.status).toBe(200);
		expect((await res.json()).assistantName).toBe("Asisten Desa");
		const status = await call("GET", "/api/assistant/status", {
			cookie: member.cookie,
		});
		expect(await status.json()).toMatchObject({
			enabled: true,
			assistantName: "Asisten Desa",
		});
		const log = await prisma.activityLog.findFirstOrThrow({
			where: { userId: admin.id, action: "assistant-settings-update" },
		});
		expect(JSON.parse(log.detail ?? "{}").changed).toContain("assistantName");
	});
});

describe("job retensi", () => {
	it("hapus percakapan lebih tua dari retentionDays; 0 = simpan", async () => {
		const old = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000);
		const conv = await prisma.assistantConversation.create({
			data: { userId: member.id, updatedAt: old },
		});
		await call(
			"PUT",
			`${ADMIN}/settings`,
			{ cookie: admin.cookie },
			{
				...SETTINGS_BODY,
				retentionDays: 0,
			},
		);
		await runAssistantRetention();
		expect(
			await prisma.assistantConversation.count({ where: { id: conv.id } }),
		).toBe(1);

		await call(
			"PUT",
			`${ADMIN}/settings`,
			{ cookie: admin.cookie },
			{
				...SETTINGS_BODY,
				retentionDays: 90,
			},
		);
		expect(await runAssistantRetention()).toBeGreaterThanOrEqual(1);
		expect(
			await prisma.assistantConversation.count({ where: { id: conv.id } }),
		).toBe(0);
	});
});
