import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import {
	emptyProviderConfig,
	type ProviderConfigRow,
	type ProviderSlot,
} from "@/api/assistant/config/settings.repo";
import {
	getProvider,
	isSlotUsable,
	pickSlot,
} from "@/api/assistant/provider/resolve";
import { encryptSecret } from "@/utils/secret-crypto";

/** Pemilihan slot kredensial (fallback ke chat) & dekripsi — tanpa DB. */
const KEY = "c".repeat(64); // test-only
let originalKey: string | undefined;

beforeEach(() => {
	originalKey = process.env.AI_CREDENTIALS_KEY;
	process.env.AI_CREDENTIALS_KEY = KEY;
});

afterEach(() => {
	if (originalKey === undefined) delete process.env.AI_CREDENTIALS_KEY;
	else process.env.AI_CREDENTIALS_KEY = originalKey;
});

function filled(
	feature: ProviderSlot,
	overrides: Partial<ProviderConfigRow> = {},
): ProviderConfigRow {
	return {
		...emptyProviderConfig(feature),
		enabled: true,
		baseUrl: `https://${feature}.example.test/v1`, // test-only
		apiKeyEnc: "v1:placeholder",
		model: `model-${feature}`,
		...overrides,
	};
}

function configs(
	partial: Partial<Record<ProviderSlot, ProviderConfigRow>>,
): Record<ProviderSlot, ProviderConfigRow> {
	return {
		chat: emptyProviderConfig("chat"),
		pointer: emptyProviderConfig("pointer"),
		voice: emptyProviderConfig("voice"),
		...partial,
	};
}

describe("isSlotUsable / pickSlot", () => {
	it("slot kosong atau nonaktif tidak siap", () => {
		expect(isSlotUsable(emptyProviderConfig("chat"))).toBe(false);
		expect(isSlotUsable(filled("chat", { enabled: false }))).toBe(false);
		expect(isSlotUsable(filled("chat", { model: null }))).toBe(false);
		expect(isSlotUsable(filled("chat", { providerType: "lain" }))).toBe(false);
		expect(isSlotUsable(filled("chat"))).toBe(true);
	});

	it("pointer/voice kosong → fallback chat", () => {
		const c = configs({ chat: filled("chat") });
		expect(pickSlot(c, "pointer")?.feature).toBe("chat");
		expect(pickSlot(c, "voice")?.feature).toBe("chat");
	});

	it("slot sendiri dipakai bila siap", () => {
		const c = configs({ chat: filled("chat"), voice: filled("voice") });
		expect(pickSlot(c, "voice")?.feature).toBe("voice");
	});

	it("chat tidak siap → null untuk semua fitur", () => {
		const c = configs({});
		expect(pickSlot(c, "chat")).toBeNull();
		expect(pickSlot(c, "pointer")).toBeNull();
	});
});

describe("getProvider", () => {
	it("slot belum dikonfigurasi → not_configured", async () => {
		const res = await getProvider("chat", {
			loadConfigs: async () => configs({}),
		});
		expect(res).toEqual({ ok: false, reason: "not_configured" });
	});

	it("kunci terdekripsi dan dipakai sebagai Bearer", async () => {
		const apiKeyEnc = await encryptSecret("sk-real-test"); // test-only
		const sent: string[] = [];
		const res = await getProvider("pointer", {
			loadConfigs: async () => configs({ chat: filled("chat", { apiKeyEnc }) }),
			fetchImpl: async (_url, init) => {
				sent.push((init.headers as Record<string, string>).authorization ?? "");
				return new Response(
					JSON.stringify({ choices: [{ message: { content: "ok" } }] }),
				);
			},
		});
		expect(res.ok).toBe(true);
		if (!res.ok) return;
		expect(res.slot).toBe("chat");
		expect(res.model).toBe("model-chat");
		await res.provider.chat([{ role: "user", content: "hai" }]);
		expect(sent).toEqual(["Bearer sk-real-test"]);
	});

	it("kunci env diganti (dekripsi gagal) → key_unreadable", async () => {
		const apiKeyEnc = await encryptSecret("sk-real-test");
		process.env.AI_CREDENTIALS_KEY = "d".repeat(64);
		const res = await getProvider("chat", {
			loadConfigs: async () => configs({ chat: filled("chat", { apiKeyEnc }) }),
		});
		expect(res).toEqual({ ok: false, reason: "key_unreadable" });
	});

	it("AI_CREDENTIALS_KEY kosong → crypto_unconfigured", async () => {
		const apiKeyEnc = await encryptSecret("sk-real-test");
		delete process.env.AI_CREDENTIALS_KEY;
		const res = await getProvider("chat", {
			loadConfigs: async () => configs({ chat: filled("chat", { apiKeyEnc }) }),
		});
		expect(res).toEqual({ ok: false, reason: "crypto_unconfigured" });
	});
});
