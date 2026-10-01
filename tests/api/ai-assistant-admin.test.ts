import { afterEach, describe, expect, it, mock } from "bun:test";
import {
	AdminEndpointUnavailableError,
	fetchOverview,
	saveProvider,
} from "@/components/admin/ai-assistant/ai-assistant.api";
import {
	buildProviderUpdate,
	DEFAULT_SETTINGS,
	emptyProviderSlot,
	normalizeProviders,
	providerToForm,
	slotBadge,
	slotUnusedLabel,
	validateBaseUrl,
	validateSettings,
} from "@/components/admin/ai-assistant/ai-assistant.logic";
import type { ProviderSlotDto } from "@/types/ai-assistant-admin";

/**
 * Halaman admin AI Assistant (UI tahap paralel P2): logika form & klien API.
 * Endpoint sebenarnya dibuat di P3 — di sini fetch di-mock.
 */

const originalFetch = globalThis.fetch;
afterEach(() => {
	globalThis.fetch = originalFetch;
});

function mockFetch(response: Response) {
	const fn = mock(async (_url: string, _init?: RequestInit) => response);
	globalThis.fetch = fn as unknown as typeof fetch;
	return fn;
}

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});

describe("DEFAULT_SETTINGS", () => {
	it("sama dengan default kolom AssistantSettings di schema.prisma", async () => {
		const schema = await Bun.file("prisma/schema.prisma").text();
		const block =
			schema.match(/model AssistantSettings \{([\s\S]*?)\n\}/)?.[1] ?? "";
		const defaultOf = (field: string) =>
			block.match(
				new RegExp(`\\n\\s*${field}\\s+\\S+\\s+@default\\(([^)]+)\\)`),
			)?.[1];
		expect(defaultOf("enabled")).toBe(String(DEFAULT_SETTINGS.enabled));
		expect(defaultOf("assistantName")).toBe(
			`"${DEFAULT_SETTINGS.assistantName}"`,
		);
		for (const key of [
			"dailyMessageLimitPerUser",
			"dailyTokenLimitGlobal",
			"ratePerMinutePerUser",
			"maxInputChars",
			"historyWindow",
			"retentionDays",
			"dailyMessageLimitKiosk",
		] as const) {
			expect(Number(defaultOf(key))).toBe(DEFAULT_SETTINGS[key]);
		}
	});

	it("default lolos validasi", () => {
		expect(validateSettings(DEFAULT_SETTINGS)).toEqual({});
	});
});

describe("validateSettings", () => {
	it("menolak nama kosong, catatan >1000 char, dan angka di luar rentang", () => {
		const errors = validateSettings({
			...DEFAULT_SETTINGS,
			assistantName: "  ",
			personaNote: "x".repeat(1001),
			ratePerMinutePerUser: 0,
			historyWindow: 2.5,
			dailyMessageLimitKiosk: -1,
		});
		expect(Object.keys(errors).sort()).toEqual(
			[
				"assistantName",
				"dailyMessageLimitKiosk",
				"historyWindow",
				"personaNote",
				"ratePerMinutePerUser",
			].sort(),
		);
	});

	it("0 boleh untuk batas yang berarti 'tanpa batas'", () => {
		expect(
			validateSettings({
				...DEFAULT_SETTINGS,
				dailyMessageLimitPerUser: 0,
				retentionDays: 0,
			}),
		).toEqual({});
	});
});

describe("validateBaseUrl", () => {
	it("menerima https yang diakhiri /v1 dan http localhost", () => {
		expect(validateBaseUrl("https://claude-proxy.example.com/v1")).toBeNull();
		expect(validateBaseUrl("https://claude-proxy.example.com/v1/")).toBeNull();
		expect(validateBaseUrl("http://localhost:4000/v1")).toBeNull();
		expect(validateBaseUrl("")).toBeNull();
	});

	it("menolak http publik, tanpa /v1, dan URL rusak", () => {
		expect(validateBaseUrl("http://proxy.example.com/v1")).toMatch(/https/);
		expect(validateBaseUrl("https://proxy.example.com/api")).toMatch(/\/v1/);
		expect(validateBaseUrl("bukan url")).toBe("URL tidak valid");
	});
});

describe("buildProviderUpdate", () => {
	const saved: ProviderSlotDto = {
		...emptyProviderSlot("chat"),
		baseUrl: "https://p.example.com/v1",
		model: "claude-sonnet",
		apiKeyStatus: "set",
		apiKeyHint: "sk-c****dc07",
	};

	it("tidak mengirim apiKey bila input kosong (key tersimpan dipertahankan)", () => {
		const body = buildProviderUpdate(providerToForm(saved));
		expect("apiKey" in body).toBe(false);
		expect(body.baseUrl).toBe("https://p.example.com/v1");
	});

	it("mengirim apiKey baru, atau string kosong saat dihapus", () => {
		const form = providerToForm(saved);
		expect(
			buildProviderUpdate({ ...form, apiKeyInput: " sk-new " }).apiKey,
		).toBe("sk-new");
		expect(
			buildProviderUpdate({ ...form, apiKeyInput: "sk-new", clearApiKey: true })
				.apiKey,
		).toBe("");
	});

	it("field teks kosong menjadi null dan slash akhir base URL dibuang", () => {
		const body = buildProviderUpdate({
			...providerToForm(emptyProviderSlot("voice")),
			label: " ",
			baseUrl: "https://p.example.com/v1/",
		});
		expect(body.label).toBeNull();
		expect(body.model).toBeNull();
		expect(body.baseUrl).toBe("https://p.example.com/v1");
	});
});

describe("slotBadge & normalizeProviders", () => {
	it("memberi label sesuai status slot", () => {
		const full = {
			...emptyProviderSlot("chat"),
			baseUrl: "https://x/v1",
			model: "m",
			apiKeyStatus: "set" as const,
		};
		expect(slotBadge(emptyProviderSlot("chat")).label).toBe("Belum diisi");
		expect(slotBadge(emptyProviderSlot("pointer")).label).toBe("Memakai Chat");
		expect(slotBadge({ ...full, enabled: true }).label).toBe("Aktif");
		expect(slotBadge(full).label).toBe("Tersimpan, nonaktif");
		expect(slotBadge({ ...full, apiKeyStatus: "needs-reentry" }).label).toBe(
			"API key perlu diisi ulang",
		);
	});

	it("slot Penunjuk berlabel 'Belum dipakai · memakai Chat'; slot lain tidak", () => {
		expect(slotUnusedLabel("pointer")).toBe("Belum dipakai · memakai Chat");
		expect(slotUnusedLabel("chat")).toBeNull();
		expect(slotUnusedLabel("voice")).toBeNull();
	});

	it("mengurutkan chat → pointer → voice dan melengkapi slot yang hilang", () => {
		const out = normalizeProviders([emptyProviderSlot("voice")]);
		expect(out.map((s) => s.feature)).toEqual(["chat", "pointer", "voice"]);
	});
});

describe("klien API admin", () => {
	it("404 → AdminEndpointUnavailableError", async () => {
		mockFetch(new Response("Not Found", { status: 404 }));
		await expect(fetchOverview()).rejects.toBeInstanceOf(
			AdminEndpointUnavailableError,
		);
	});

	it("HTML 200 dari fallback SPA → AdminEndpointUnavailableError", async () => {
		mockFetch(
			new Response("<!doctype html>", {
				status: 200,
				headers: { "content-type": "text/html" },
			}),
		);
		await expect(fetchOverview()).rejects.toBeInstanceOf(
			AdminEndpointUnavailableError,
		);
	});

	it("error server membawa konteks aksi dan status", async () => {
		mockFetch(json({ error: "Forbidden" }, 403));
		await expect(fetchOverview()).rejects.toThrow(
			"Memuat pengaturan AI gagal (403): Forbidden",
		);
	});

	it("PUT slot ke path fitur dengan body tanpa apiKey bila tidak diubah", async () => {
		const fn = mockFetch(json(emptyProviderSlot("chat")));
		await saveProvider(
			"chat",
			buildProviderUpdate(providerToForm(emptyProviderSlot("chat"))),
		);
		const [url, init] = fn.mock.calls[0] ?? [];
		expect(url).toBe("/api/admin/ai-assistant/providers/chat");
		expect(init?.method).toBe("PUT");
		expect(JSON.parse(String(init?.body))).not.toHaveProperty("apiKey");
	});
});
