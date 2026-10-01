import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { MockStep } from "@/api/assistant/provider/mock";
import { AiProviderError } from "@/api/assistant/provider/types";
import { prisma } from "@/utils/db";
import {
	newRunId,
	signUp,
	snapshotAssistantConfig,
	type TestUser,
} from "./assistant-admin.helpers";
import {
	createChatTestApp,
	readSseEvents,
	setAssistantSettings,
} from "./assistant-chat.helpers";
import { assertTestDatabase } from "./test-database";

/**
 * `POST /api/assistant/chat/stream` dengan sesi Better Auth nyata: urutan
 * event, error sebagai event (kode sama dengan /chat), kepemilikan, kuota,
 * dan pembatalan klien tanpa data setengah jadi.
 */
assertTestDatabase();

const RUN_ID = newRunId();
const EMAIL_DOMAIN = "f1e-assistant-stream.test.local"; // test-only
const email = (label: string) => `${label}-${RUN_ID}@${EMAIL_DOMAIN}`;

let member: TestUser;
let other: TestUser;
let unverified: TestUser;
let quota: TestUser;
let restoreConfig: () => Promise<void>;
const testApp = createChatTestApp();

beforeAll(async () => {
	restoreConfig = await snapshotAssistantConfig();
	[member, other, unverified, quota] = await Promise.all([
		signUp(email("member"), "member"),
		signUp(email("other"), "other"),
		signUp(email("unverified"), "unverified"),
		signUp(email("quota"), "quota"),
	]);
	await prisma.user.updateMany({
		where: { id: { in: [member.id, other.id, quota.id] } },
		data: { emailVerified: true },
	});
	await setAssistantSettings();
});

afterAll(async () => {
	await restoreConfig();
	await prisma.user.deleteMany({
		where: { email: { endsWith: `-${RUN_ID}@${EMAIL_DOMAIN}` } },
	});
	await prisma.$disconnect();
});

const stream = (
	user: TestUser,
	body: Record<string, unknown>,
	signal?: AbortSignal,
) => testApp.chatStream({ cookie: user.cookie }, body, signal);

describe("akses (respons HTTP biasa, bukan stream)", () => {
	it("tanpa sesi → 401; belum terverifikasi → 403; body tanpa message → 422", async () => {
		expect((await testApp.chatStream({}, { message: "hai" })).status).toBe(401);
		expect((await stream(unverified, { message: "hai" })).status).toBe(403);
		expect((await stream(member, {})).status).toBe(422);
	});
});

describe("alur stream", () => {
	it("status → delta → done; done sama dengan pesan tersimpan", async () => {
		testApp.script([
			{
				type: "tool_calls",
				toolCalls: [{ id: "c1", name: "ringkasan_keuangan", args: {} }],
			},
			{ type: "text", text: "Anggaran desa Rp 1.000." },
		]);
		const res = await stream(member, {
			message: "Berapa anggaran?",
			pageContext: { route: "/keuangan-anggaran", lang: "id" },
		});
		expect(res.status).toBe(200);
		expect(res.headers.get("content-type")).toContain("text/event-stream");
		const events = await readSseEvents(res);
		const names = events.map((e) => e.event);
		expect(names[0]).toBe("status");
		expect(names.at(-1)).toBe("done");
		expect(new Set(names.slice(1, -1))).toEqual(new Set(["delta"]));
		expect(events[0]?.data).toEqual({ tool: "ringkasan_keuangan" });
		const text = events
			.filter((e) => e.event === "delta")
			.map((e) => e.data.text)
			.join("");
		const done = events.at(-1)?.data as {
			conversationId: string;
			message: { id: string; content: string; toolsUsed: string[] };
			actions: unknown[];
		};
		expect(done.message.content).toBe(text);
		expect(done.actions).toEqual([]);
		const saved = await prisma.assistantMessage.findUnique({
			where: { id: done.message.id },
		});
		expect(saved).toMatchObject({
			content: "Anggaran desa Rp 1.000.",
			toolsUsed: ["ringkasan_keuangan"],
			conversationId: done.conversationId,
		});
	});

	it("asisten mati → event error 409", async () => {
		await setAssistantSettings({ enabled: false });
		const events = await readSseEvents(
			await stream(member, { message: "hai" }),
		);
		await setAssistantSettings();
		expect(events).toEqual([
			{ event: "error", data: expect.objectContaining({ status: 409 }) },
		]);
	});

	it("percakapan milik user lain → event error 404, tanpa menulis", async () => {
		testApp.script([{ type: "text", text: "ok" }]);
		const own = await readSseEvents(
			await stream(other, { message: "punya saya" }),
		);
		const conversationId = (own.at(-1)?.data as { conversationId: string })
			.conversationId;
		const events = await readSseEvents(
			await stream(member, { conversationId, message: "intip" }),
		);
		expect(events.map((e) => [e.event, e.data.status])).toEqual([
			["error", 404],
		]);
		expect(
			await prisma.assistantMessage.count({ where: { conversationId } }),
		).toBe(2);
	});
});

describe("batas & kegagalan", () => {
	it("503 tidak memakan kuota; kuota habis → error 429 + retryAfterSec", async () => {
		await setAssistantSettings({ dailyMessageLimitPerUser: 1 });
		testApp.script([
			new AiProviderError("unavailable", "upstream", 502),
			{ type: "text", text: "ok" },
		]);
		const failed = await readSseEvents(
			await stream(quota, { message: "satu" }),
		);
		const okEvents = await readSseEvents(
			await stream(quota, { message: "dua" }),
		);
		const limited = await readSseEvents(
			await stream(quota, { message: "tiga" }),
		);
		await setAssistantSettings();
		expect(failed.at(-1)).toMatchObject({
			event: "error",
			data: { status: 503, conversationId: expect.any(String) },
		});
		expect(okEvents.at(-1)?.event).toBe("done");
		expect(limited.at(-1)).toMatchObject({
			event: "error",
			data: { status: 429, retryAfterSec: expect.any(Number) },
		});
	});

	it("klien memutus di tengah stream → tidak ada percakapan/pesan tersimpan", async () => {
		const hang: MockStep = (_m, opts) =>
			new Promise((_, reject) => {
				opts.signal?.addEventListener("abort", () =>
					reject(new AiProviderError("unavailable", "aborted")),
				);
			});
		testApp.script([hang]);
		const before = await prisma.assistantMessage.count({
			where: { userId: member.id },
		});
		const controller = new AbortController();
		const res = await stream(
			member,
			{ message: "dibatalkan" },
			controller.signal,
		);
		setTimeout(() => controller.abort(), 20);
		const events = await readSseEvents(res);
		expect(events.filter((e) => e.event !== "delta")).toEqual([]);
		expect(
			await prisma.assistantMessage.count({ where: { userId: member.id } }),
		).toBe(before);
	});
});
