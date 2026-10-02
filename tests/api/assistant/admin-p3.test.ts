import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import {
	apiKeyActionOf,
	apiKeyStatusOf,
	toSlotDto,
} from "@/api/assistant/admin/admin.service";
import {
	formatFieldErrors,
	normalizeSettings,
	validateProviderBaseUrl,
	validateProviderUpdate,
	validateSettingsUpdate,
} from "@/api/assistant/admin/admin.validation";
import { maskApiKey } from "@/api/assistant/admin/api-key-hint";
import {
	DEFAULT_ASSISTANT_SETTINGS,
	emptyProviderConfig,
	type ProviderConfigRow,
	type ProviderSlot,
} from "@/api/assistant/config/settings.repo";
import { checkSessionUser } from "@/api/assistant/http/access";
import { buildAssistantStatus } from "@/api/assistant/status/status.service";
import { retentionCutoff } from "@/jobs/assistant-retention";
import type {
	AssistantSettingsUpdate,
	ProviderSlotUpdate,
} from "@/types/ai-assistant-admin";
import { encryptSecret, SecretCryptoError } from "@/utils/secret-crypto";

/** P3: aturan akses, validasi admin, status, dan pemetaan slot — tanpa DB. */

const KEY = "d".repeat(64); // test-only
let originalKey: string | undefined;
beforeEach(() => {
	originalKey = process.env.AI_CREDENTIALS_KEY;
	process.env.AI_CREDENTIALS_KEY = KEY;
});
afterEach(() => {
	if (originalKey === undefined) delete process.env.AI_CREDENTIALS_KEY;
	else process.env.AI_CREDENTIALS_KEY = originalKey;
});

const { id: _id, ...DEFAULTS } = DEFAULT_ASSISTANT_SETTINGS;
const settings = (o: Partial<AssistantSettingsUpdate> = {}) => ({
	...DEFAULTS,
	...o,
});

const slotUpdate = (
	o: Partial<ProviderSlotUpdate> = {},
): ProviderSlotUpdate => ({
	enabled: true,
	label: "Claude Proxy",
	baseUrl: "https://proxy.example.test/v1", // test-only
	model: "claude-test",
	temperature: null,
	maxTokens: null,
	timeoutMs: 60_000,
	...o,
});

function filled(
	feature: ProviderSlot,
	o: Partial<ProviderConfigRow> = {},
): ProviderConfigRow {
	return {
		...emptyProviderConfig(feature),
		enabled: true,
		baseUrl: "https://proxy.example.test/v1", // test-only
		apiKeyEnc: "v1:dummy",
		model: "claude-test",
		...o,
	};
}

describe("checkSessionUser", () => {
	const base = { id: "u1", role: "user", emailVerified: true };
	it("tanpa user → 401", () => {
		expect(checkSessionUser(null)?.status).toBe(401);
	});
	it("lewat API key → 403", () => {
		expect(checkSessionUser({ ...base, authMethod: "apiKey" })?.status).toBe(
			403,
		);
	});
	it("authMethod tidak diketahui → 403 (fail-closed)", () => {
		expect(checkSessionUser(base)?.status).toBe(403);
	});
	it("belum terverifikasi (false/null) → 403", () => {
		for (const emailVerified of [false, null]) {
			const denied = checkSessionUser({
				...base,
				emailVerified,
				authMethod: "session",
			});
			expect(denied?.status).toBe(403);
		}
	});
	it("sesi browser terverifikasi → lolos", () => {
		expect(checkSessionUser({ ...base, authMethod: "session" })).toBeNull();
	});
});

describe("validateSettingsUpdate", () => {
	it("default skema valid", () => {
		expect(validateSettingsUpdate(settings())).toEqual({});
	});
	it("historyWindow di bawah minimum (0/1) ditolak", () => {
		expect(
			validateSettingsUpdate(settings({ historyWindow: 0 })),
		).toHaveProperty("historyWindow");
		expect(
			validateSettingsUpdate(settings({ historyWindow: 1 })),
		).toHaveProperty("historyWindow");
	});
	it("angka pecahan, negatif, dan di atas maksimum ditolak", () => {
		const errors = validateSettingsUpdate(
			settings({
				ratePerMinutePerUser: 1.5,
				dailyMessageLimitPerUser: -1,
				maxInputChars: 999_999,
			}),
		);
		expect(Object.keys(errors).sort()).toEqual([
			"dailyMessageLimitPerUser",
			"maxInputChars",
			"ratePerMinutePerUser",
		]);
	});
	it("guideAutoAdvanceSec: awal 8, hanya 3–60 detik yang diterima", () => {
		expect(DEFAULTS.guideAutoAdvanceSec).toBe(8);
		for (const ok of [3, 8, 60]) {
			expect(
				validateSettingsUpdate(settings({ guideAutoAdvanceSec: ok })),
			).toEqual({});
		}
		for (const bad of [0, 2, 61, 4.5]) {
			expect(
				validateSettingsUpdate(settings({ guideAutoAdvanceSec: bad })),
			).toHaveProperty("guideAutoAdvanceSec");
		}
	});
	it("nama kosong setelah trim ditolak; personaNote kosong → null", () => {
		expect(
			validateSettingsUpdate(settings({ assistantName: "   " })),
		).toHaveProperty("assistantName");
		expect(
			normalizeSettings(settings({ personaNote: "  " })).personaNote,
		).toBeNull();
	});
	it("formatFieldErrors menggabungkan pesan per field", () => {
		expect(formatFieldErrors({ a: "x", b: "y" })).toBe("a: x; b: y");
	});
});

describe("validateProviderUpdate", () => {
	it("slot lengkap valid", () => {
		expect(validateProviderUpdate(slotUpdate(), false)).toEqual({});
	});
	it("http localhost hanya boleh di luar produksi", () => {
		const url = "http://localhost:4000/v1"; // test-only
		expect(validateProviderBaseUrl(url, false)).toBeNull();
		expect(validateProviderBaseUrl(url, true)).toContain("produksi");
	});
	it("http non-localhost dan URL tanpa /v1 ditolak", () => {
		expect(
			validateProviderUpdate(
				slotUpdate({ baseUrl: "http://evil.test/v1" }),
				false,
			),
		).toHaveProperty("baseUrl");
		expect(
			validateProviderUpdate(
				slotUpdate({ baseUrl: "https://proxy.test" }),
				false,
			),
		).toHaveProperty("baseUrl");
	});
	it("rentang temperature, maxTokens, timeoutMs", () => {
		const errors = validateProviderUpdate(
			slotUpdate({ temperature: 3, maxTokens: 0, timeoutMs: 100 }),
			false,
		);
		expect(Object.keys(errors).sort()).toEqual([
			"maxTokens",
			"temperature",
			"timeoutMs",
		]);
	});
	it("API key berisi spasi ditolak; kosong (hapus) diterima", () => {
		expect(
			validateProviderUpdate(slotUpdate({ apiKey: "sk a" }), false),
		).toHaveProperty("apiKey");
		expect(validateProviderUpdate(slotUpdate({ apiKey: "" }), false)).toEqual(
			{},
		);
	});
	it("apiKeyActionOf: tidak dikirim / kosong / diisi", () => {
		expect(apiKeyActionOf(undefined)).toBe("unchanged");
		expect(apiKeyActionOf("  ")).toBe("removed");
		expect(apiKeyActionOf("sk-new")).toBe("replaced");
	});
});

describe("maskApiKey", () => {
	it("menampilkan 4 karakter awal & akhir", () => {
		expect(maskApiKey("sk-c1234567890dc07")).toBe("sk-c****dc07");
	});
	it("kunci pendek disembunyikan seluruhnya", () => {
		expect(maskApiKey("short-key")).toBe("****");
	});
});

describe("apiKeyStatusOf & toSlotDto", () => {
	it("tanpa kunci → missing; kunci terbaca → set", async () => {
		expect(await apiKeyStatusOf(null)).toBe("missing");
		expect(await apiKeyStatusOf(await encryptSecret("sk-real"))).toBe("set");
	});
	it("kunci terenkripsi dengan AI_CREDENTIALS_KEY lain → needs-reentry", async () => {
		const sealed = await encryptSecret("sk-real");
		process.env.AI_CREDENTIALS_KEY = "e".repeat(64); // test-only
		expect(await apiKeyStatusOf(sealed)).toBe("needs-reentry");
	});
	it("format rusak → needs-reentry; kunci server kosong → tetap set", async () => {
		expect(await apiKeyStatusOf("garbage")).toBe("needs-reentry");
		const missing = async () => {
			throw new SecretCryptoError("KEY_MISSING", "x");
		};
		expect(await apiKeyStatusOf("v1:abc", missing)).toBe("set");
	});
	it("DTO tidak memuat apiKeyEnc", async () => {
		const dto = await toSlotDto(
			filled("chat", { apiKeyEnc: await encryptSecret("sk-secret-value") }),
		);
		expect(dto).not.toHaveProperty("apiKeyEnc");
		expect(JSON.stringify(dto)).not.toContain("sk-secret-value");
		expect(dto.apiKeyStatus).toBe("set");
	});
});

describe("buildAssistantStatus", () => {
	const s = { enabled: true, assistantName: "Jenna", maxInputChars: 2000 };
	const all = (chat: ProviderConfigRow) => ({
		chat,
		pointer: emptyProviderConfig("pointer"),
		voice: emptyProviderConfig("voice"),
	});
	it("slot pointer/voice kosong ikut siap bila chat siap (fallback)", () => {
		expect(buildAssistantStatus(s, all(filled("chat")), true)).toEqual({
			enabled: true,
			assistantName: "Jenna",
			maxInputChars: 2000,
			slots: { chat: true, pointer: true, voice: true },
		});
	});
	it("chat belum lengkap → semua slot false", () => {
		const status = buildAssistantStatus(
			s,
			all(emptyProviderConfig("chat")),
			true,
		);
		expect(status.slots).toEqual({ chat: false, pointer: false, voice: false });
	});
	it("tanpa kunci enkripsi server → semua slot false", () => {
		const status = buildAssistantStatus(s, all(filled("chat")), false);
		expect(status.slots.chat).toBe(false);
	});
});

describe("retentionCutoff", () => {
	const now = new Date("2026-10-01T00:00:00Z");
	it("0 = simpan selamanya", () => {
		expect(retentionCutoff(0, now)).toBeNull();
	});
	it("90 hari sebelum sekarang", () => {
		expect(retentionCutoff(90, now)?.toISOString()).toBe(
			"2026-07-03T00:00:00.000Z",
		);
	});
});
