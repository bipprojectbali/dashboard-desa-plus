import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { searchPublishedFaq } from "@/api/assistant/tools/faq.repo";
import { lookupFaqTool } from "@/api/assistant/tools/faq.tool";
import { prisma } from "@/utils/db";
import { newRunId } from "./assistant-admin.helpers";
import { assertTestDatabase } from "./test-database";

/** `lookup_faq` di Postgres nyata: full-text awalan, hanya FAQ terpublikasi. */
assertTestDatabase();

// Kata unik per run agar tidak bentrok dengan FAQ lain di DB test.
const TAG = `zq${newRunId().replace(/\W/g, "")}`; // test-only

beforeAll(async () => {
	await prisma.faq.createMany({
		data: [
			{
				question: `Bagaimana cara ekspor ${TAG}?`,
				answer: "Buka menu lalu klik tombol Ekspor.",
				category: TAG,
			},
			{
				question: `Cara ganti kata sandi ${TAG}`,
				answer: "Buka Profil, pilih Keamanan.",
				category: TAG,
			},
			{
				question: `Draft rahasia ${TAG}`,
				answer: "Belum terbit.",
				category: TAG,
				isPublished: false,
			},
		],
	});
});

afterAll(async () => {
	await prisma.faq.deleteMany({ where: { category: TAG } });
	await prisma.$disconnect();
});

describe("searchPublishedFaq", () => {
	it("cocok dengan awalan kata & paling relevan dulu", async () => {
		const hits = await searchPublishedFaq(`ekspor ${TAG}`);
		const mine = hits.filter((h) => h.category === TAG);
		expect(mine[0]?.question).toBe(`Bagaimana cara ekspor ${TAG}?`);
	});

	it("FAQ belum terbit tidak pernah muncul", async () => {
		const hits = await searchPublishedFaq(`draft rahasia ${TAG}`);
		expect(hits.some((h) => h.question.startsWith("Draft rahasia"))).toBe(
			false,
		);
	});

	it("input berisi sintaks tsquery tidak error", async () => {
		expect(await searchPublishedFaq("a & | ! ( ) :*")).toEqual([]);
		await expect(
			searchPublishedFaq(`'); DROP ${TAG} | !`),
		).resolves.toBeArray();
	});
});

describe("lookup_faq (tool asli)", () => {
	it("mengembalikan pertanyaan & jawaban dari DB", async () => {
		const res = await lookupFaqTool.handler(
			{ pertanyaan: `kata sandi ${TAG}` },
			{
				user: { id: "u", role: "user" },
				allowedFeatures: new Set(),
				now: new Date(),
			},
		);
		expect(JSON.stringify(res)).toContain("Buka Profil, pilih Keamanan.");
	});
});
