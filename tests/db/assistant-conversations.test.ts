import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { startConversation } from "@/api/assistant/conversation/conversation.repo";
import type {
	AssistantConversationDto,
	AssistantHistoryMessageDto,
	AssistantPage,
} from "@/types/ai-assistant-chat";
import { prisma } from "@/utils/db";
import {
	call,
	newRunId,
	signUp,
	type TestUser,
} from "./assistant-admin.helpers";
import { assertTestDatabase } from "./test-database";

/**
 * `/api/assistant/conversations/*` dengan sesi nyata: hanya milik sendiri
 * (id user lain → 404), cursor, ganti judul, hapus. Tidak butuh provider.
 */
assertTestDatabase();

const RUN_ID = newRunId();
const EMAIL_DOMAIN = "f1b-assistant-conv.test.local"; // test-only
const email = (label: string) => `${label}-${RUN_ID}@${EMAIL_DOMAIN}`;
const BASE = "/api/assistant/conversations";

let alice: TestUser;
let bob: TestUser;
let unverified: TestUser;
let aliceConvs: string[] = [];
let bobConv: string;

beforeAll(async () => {
	[alice, bob, unverified] = await Promise.all([
		signUp(email("alice"), "alice"),
		signUp(email("bob"), "bob"),
		signUp(email("unverified"), "unverified"),
	]);
	await prisma.user.updateMany({
		where: { id: { in: [alice.id, bob.id] } },
		data: { emailVerified: true },
	});
	aliceConvs = [];
	for (const title of ["satu", "dua", "tiga"]) {
		const conv = await startConversation(alice.id, title, [
			{ role: "user", content: `${title}-q` },
			{ role: "assistant", content: `${title}-a`, toolsUsed: ["lookup_faq"] },
			{ role: "user", content: `${title}-gagal`, status: "error" },
		]);
		aliceConvs.push(conv.conversationId);
	}
	bobConv = (
		await startConversation(bob.id, "milik bob", [
			{ role: "user", content: "b" },
		])
	).conversationId;
});

afterAll(async () => {
	await prisma.user.deleteMany({
		where: { email: { endsWith: `-${RUN_ID}@${EMAIL_DOMAIN}` } },
	});
	await prisma.$disconnect();
});

const as = (u: TestUser) => ({ cookie: u.cookie });

describe("akses", () => {
	it("belum terverifikasi → 403", async () => {
		expect((await call("GET", BASE, as(unverified))).status).toBe(403);
	});
});

describe("daftar & isi percakapan", () => {
	it("daftar berhalaman cursor, terbaru dulu, hanya milik sendiri", async () => {
		const p1 = await call("GET", `${BASE}?limit=2`, as(alice));
		const page1 = (await p1.json()) as AssistantPage<AssistantConversationDto>;
		expect(page1.items.map((c) => c.title)).toEqual(["tiga", "dua"]);
		expect(page1.nextCursor).toBe(aliceConvs[1] ?? null);
		const p2 = await call(
			"GET",
			`${BASE}?limit=2&cursor=${page1.nextCursor}`,
			as(alice),
		);
		const page2 = (await p2.json()) as AssistantPage<AssistantConversationDto>;
		expect(page2.items.map((c) => c.title)).toEqual(["satu"]);
		expect(page2.nextCursor).toBeNull();
		expect(page2.items[0]?.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
	});

	it("pesan terbaru dulu, berhalaman, status error ikut terlihat", async () => {
		const res = await call(
			"GET",
			`${BASE}/${aliceConvs[0]}/messages?limit=2`,
			as(alice),
		);
		expect(res.status).toBe(200);
		const page =
			(await res.json()) as AssistantPage<AssistantHistoryMessageDto>;
		expect(page.items.map((m) => [m.content, m.status])).toEqual([
			["satu-gagal", "error"],
			["satu-a", "ok"],
		]);
		expect(page.items[1]?.toolsUsed).toEqual(["lookup_faq"]);
		const rest = await call(
			"GET",
			`${BASE}/${aliceConvs[0]}/messages?limit=2&cursor=${page.nextCursor}`,
			as(alice),
		);
		const page2 =
			(await rest.json()) as AssistantPage<AssistantHistoryMessageDto>;
		expect(page2.items.map((m) => m.content)).toEqual(["satu-q"]);
	});

	it("limit tidak valid → 422", async () => {
		expect((await call("GET", `${BASE}?limit=0`, as(alice))).status).toBe(422);
	});
});

describe("kepemilikan", () => {
	it("id milik user lain → 404 untuk baca, ganti judul, hapus", async () => {
		const path = `${BASE}/${bobConv}`;
		expect((await call("GET", `${path}/messages`, as(alice))).status).toBe(404);
		expect(
			(await call("PATCH", path, as(alice), { title: "dibajak" })).status,
		).toBe(404);
		expect((await call("DELETE", path, as(alice))).status).toBe(404);
		const still = await prisma.assistantConversation.findUnique({
			where: { id: bobConv },
		});
		expect(still?.title).toBe("milik bob");
	});

	it("id tidak ada → 404", async () => {
		expect((await call("DELETE", `${BASE}/tidak-ada`, as(alice))).status).toBe(
			404,
		);
	});
});

describe("ganti judul & hapus", () => {
	it("PATCH judul milik sendiri → DTO baru; judul kosong → 422", async () => {
		const path = `${BASE}/${aliceConvs[2]}`;
		const res = await call("PATCH", path, as(alice), {
			title: "  Judul baru  ",
		});
		expect(res.status).toBe(200);
		expect(((await res.json()) as AssistantConversationDto).title).toBe(
			"Judul baru",
		);
		expect(
			(await call("PATCH", path, as(alice), { title: "   " })).status,
		).toBe(422);
	});

	it("DELETE milik sendiri → pesan ikut terhapus, lalu 404", async () => {
		const id = aliceConvs[1] as string;
		const res = await call("DELETE", `${BASE}/${id}`, as(alice));
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
		expect(
			await prisma.assistantMessage.count({ where: { conversationId: id } }),
		).toBe(0);
		expect(
			(await call("GET", `${BASE}/${id}/messages`, as(alice))).status,
		).toBe(404);
	});
});
