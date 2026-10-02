import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type {
	AiAssistantAdminOverviewDto,
	ProviderSlotDto,
	ProviderTestResultDto,
} from "@/types/ai-assistant-admin";
import { prisma } from "@/utils/db";
import {
	ADMIN,
	call,
	newRunId,
	signUp,
	slotBody,
	snapshotAssistantConfig,
	type TestUser,
} from "./assistant-admin.helpers";
import { assertTestDatabase } from "./test-database";

/**
 * P3: slot kredensial (simpan, pertahankan, hapus, tak terbaca) dan uji
 * koneksi ke proxy palsu lokal. API key tidak boleh muncul di respons/log.
 */
assertTestDatabase();

const RUN_ID = newRunId();
const EMAIL_DOMAIN = "p3-assistant-providers.test.local"; // test-only
const email = (label: string) => `${label}-${RUN_ID}@${EMAIL_DOMAIN}`;
const SECRET_KEY = `sk-p3-secret-${RUN_ID}`; // test-only

let admin: TestUser;
let member: TestUser;
let restoreConfig: () => Promise<void>;
let fakeProxy: ReturnType<typeof Bun.serve>;

beforeAll(async () => {
	restoreConfig = await snapshotAssistantConfig();
	[admin, member] = await Promise.all([
		signUp(email("admin"), "admin"),
		signUp(email("member"), "member"),
	]);
	await prisma.user.update({
		where: { id: admin.id },
		data: { role: "admin", emailVerified: true },
	});
	await prisma.user.update({
		where: { id: member.id },
		data: { emailVerified: true },
	});
	fakeProxy = Bun.serve({
		port: 0,
		fetch(req) {
			if (new URL(req.url).pathname.startsWith("/redirect"))
				return Response.redirect("https://elsewhere.example.test/v1", 302);
			return Response.json({
				choices: [{ message: { content: "OK" } }],
				usage: { prompt_tokens: 3, completion_tokens: 1 },
			});
		},
	});
});

afterAll(async () => {
	fakeProxy?.stop(true);
	await restoreConfig();
	await prisma.user.deleteMany({
		where: { email: { endsWith: `-${RUN_ID}@${EMAIL_DOMAIN}` } },
	});
	await prisma.$disconnect();
});

describe("PUT providers/:feature", () => {
	it("API key baru → terenkripsi, respons & log tanpa kunci", async () => {
		const res = await call(
			"PUT",
			`${ADMIN}/providers/chat`,
			{ cookie: admin.cookie },
			slotBody({
				apiKey: SECRET_KEY,
			}),
		);
		expect(res.status).toBe(200);
		const text = await res.text();
		expect(text).not.toContain(SECRET_KEY);
		const dto = JSON.parse(text) as ProviderSlotDto;
		expect(dto.apiKeyStatus).toBe("set");
		expect(dto.apiKeyHint).toBe(
			`${SECRET_KEY.slice(0, 4)}****${SECRET_KEY.slice(-4)}`,
		);
		const row = await prisma.aiProviderConfig.findUniqueOrThrow({
			where: { feature: "chat" },
		});
		expect(row.apiKeyEnc?.startsWith("v1:")).toBe(true);
		const logs = await prisma.activityLog.findMany({
			where: { userId: admin.id },
		});
		expect(JSON.stringify(logs)).not.toContain(SECRET_KEY);
		const overview = await call("GET", ADMIN, { cookie: admin.cookie });
		expect(await overview.text()).not.toContain(SECRET_KEY);
	});
	it("status menandai chat & pointer siap (fallback), voice tidak ikut chat", async () => {
		const res = await call("GET", "/api/assistant/status", {
			cookie: member.cookie,
		});
		expect((await res.json()).slots).toEqual({
			chat: true,
			pointer: true,
			voice: false,
		});
	});
	it("apiKey tidak dikirim → kunci dipertahankan", async () => {
		const before = await prisma.aiProviderConfig.findUniqueOrThrow({
			where: { feature: "chat" },
		});
		const res = await call(
			"PUT",
			`${ADMIN}/providers/chat`,
			{ cookie: admin.cookie },
			slotBody({
				label: "Ganti nama",
			}),
		);
		expect(res.status).toBe(200);
		const after = await prisma.aiProviderConfig.findUniqueOrThrow({
			where: { feature: "chat" },
		});
		expect(after.apiKeyEnc).toBe(before.apiKeyEnc);
	});
	it("http non-localhost & fitur tak dikenal → 422", async () => {
		const bad = await call(
			"PUT",
			`${ADMIN}/providers/chat`,
			{ cookie: admin.cookie },
			slotBody({
				baseUrl: "http://proxy.example.test/v1",
			}),
		);
		expect(bad.status).toBe(422);
		const unknown = await call(
			"PUT",
			`${ADMIN}/providers/other`,
			{ cookie: admin.cookie },
			slotBody(),
		);
		expect(unknown.status).toBe(422);
	});
	it("kunci tak bisa didekripsi → needs-reentry", async () => {
		await prisma.aiProviderConfig.create({
			data: {
				feature: "voice",
				apiKeyEnc: "v1:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
				apiKeyHint: "****",
			},
		});
		const res = await call("GET", ADMIN, { cookie: admin.cookie });
		const body = (await res.json()) as AiAssistantAdminOverviewDto;
		expect(
			body.providers.find((p) => p.feature === "voice")?.apiKeyStatus,
		).toBe("needs-reentry");
	});
	it('apiKey "" → kunci & hint dihapus', async () => {
		const res = await call(
			"PUT",
			`${ADMIN}/providers/voice`,
			{ cookie: admin.cookie },
			slotBody({
				apiKey: "",
			}),
		);
		const dto = (await res.json()) as ProviderSlotDto;
		expect(dto.apiKeyStatus).toBe("missing");
		expect(dto.apiKeyHint).toBeNull();
	});
});

describe("POST providers/:feature/test", () => {
	const proxyUrl = (path = "/v1") =>
		`http://localhost:${fakeProxy.port}${path}`;

	it("proxy menjawab → ok, lastTestOk tersimpan", async () => {
		await call(
			"PUT",
			`${ADMIN}/providers/chat`,
			{ cookie: admin.cookie },
			slotBody({
				baseUrl: proxyUrl(),
			}),
		);
		const res = await call("POST", `${ADMIN}/providers/chat/test`, {
			cookie: admin.cookie,
		});
		const result = (await res.json()) as ProviderTestResultDto;
		expect(result).toMatchObject({ ok: true, error: null });
		const row = await prisma.aiProviderConfig.findUniqueOrThrow({
			where: { feature: "chat" },
		});
		expect(row.lastTestOk).toBe(true);
	});
	it("redirect tidak diikuti → gagal dengan pesan tersaring", async () => {
		await call(
			"PUT",
			`${ADMIN}/providers/chat`,
			{ cookie: admin.cookie },
			slotBody({
				baseUrl: proxyUrl("/redirect/v1"),
			}),
		);
		const res = await call("POST", `${ADMIN}/providers/chat/test`, {
			cookie: admin.cookie,
		});
		const result = (await res.json()) as ProviderTestResultDto;
		expect(result.ok).toBe(false);
		expect(result.error).toContain("HTTP 302");
		expect(result.error).not.toContain(SECRET_KEY);
	});
	it("slot belum lengkap → ok false tanpa memanggil proxy", async () => {
		const res = await call("POST", `${ADMIN}/providers/pointer/test`, {
			cookie: admin.cookie,
		});
		expect((await res.json()).ok).toBe(false);
	});
});
