import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import api from "@/api";
import en from "@/locales/en";
import id from "@/locales/id";

/**
 * F1-d: halaman Bantuan (/bantuan & /admin/help) memakai panel asisten yang
 * sama (mode tertanam), stub POST /api/jenna/chat terhapus tanpa sisa.
 */

const ROOT = join(import.meta.dir, "../../..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

function sourceFiles(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) return sourceFiles(path);
		return /\.(ts|tsx)$/.test(name) ? [path] : [];
	});
}

const HELP_PAGES = [
	"src/components/help-page.tsx",
	"src/routes/admin/help.tsx",
];

describe("halaman Bantuan memakai panel asisten yang sama", () => {
	for (const page of HELP_PAGES) {
		it(`${page} merender <AssistantEmbedded /> tanpa salinan logika chat`, () => {
			const src = read(page);
			expect(src).toContain(
				'import { AssistantEmbedded } from "@/components/assistant/assistant-embedded";',
			);
			expect(src).toContain("<AssistantEmbedded />");
			for (const leftover of [
				"/api/jenna/chat",
				"setMessages",
				"inputValue",
				"QUICK_REPLIES",
			])
				expect(src).not.toContain(leftover);
			expect(src).not.toMatch(/Saya Jenna/);
		});
	}

	it("panel tertanam & drawer FAB memakai komponen isi yang sama", () => {
		const content = 'from "./assistant-panel-content"';
		expect(read("src/components/assistant/assistant-embedded.tsx")).toContain(
			content,
		);
		expect(read("src/components/assistant/assistant-panel.tsx")).toContain(
			content,
		);
	});
});

describe("stub /api/jenna/chat dihapus", () => {
	it("POST /api/jenna/chat → 404", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/jenna/chat", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ message: "halo", history: [] }),
			}),
		);
		expect(res.status).toBe(404);
	});

	it("tidak ada impor atau pemanggilan tersisa di src/", () => {
		const offenders = sourceFiles(join(ROOT, "src")).filter((f) => {
			const src = readFileSync(f, "utf8");
			return /\/api\/jenna\/chat|jennaChat|from "\.\/jenna"/.test(src);
		});
		expect(offenders).toEqual([]);
	});

	it("teks sapaan/disclaimer Jenna lama sudah dipensiunkan dari locale", () => {
		for (const t of [id.help, en.help] as Record<string, unknown>[]) {
			expect(t.jennaGreeting).toBeUndefined();
			expect(t.jennaDisclaimer).toBeUndefined();
		}
	});
});
