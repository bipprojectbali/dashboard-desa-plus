import { describe, expect, it } from "bun:test";
import {
	emptyProviderConfig,
	type ProviderConfigRow,
	type ProviderSlot,
} from "@/api/assistant/config/settings.repo";
import { buildAssistantStatus } from "@/api/assistant/status/status.service";

/** Status slot: `voice` tidak boleh jatuh ke `chat` (model chat tidak bisa suara). */

const settings = { enabled: true, assistantName: "Jenna", maxInputChars: 2000 };

const filled = (
	feature: ProviderSlot,
	o: Partial<ProviderConfigRow> = {},
): ProviderConfigRow => ({
	...emptyProviderConfig(feature),
	enabled: true,
	baseUrl: "https://proxy.example.test/v1", // test-only
	apiKeyEnc: "v1:dummy", // test-only
	model: "model-test", // test-only
	...o,
});

const slotsFor = (
	configs: Partial<Record<ProviderSlot, ProviderConfigRow>>,
	crypto = true,
) =>
	buildAssistantStatus(
		settings,
		{
			chat: emptyProviderConfig("chat"),
			pointer: emptyProviderConfig("pointer"),
			voice: emptyProviderConfig("voice"),
			...configs,
		},
		crypto,
	).slots;

describe("status slot voice", () => {
	it("hanya chat terisi → voice false (tanpa fallback), chat & pointer true", () => {
		expect(slotsFor({ chat: filled("chat") })).toEqual({
			chat: true,
			pointer: true,
			voice: false,
		});
	});

	it("voice terisi sendiri → voice true walau chat kosong", () => {
		expect(slotsFor({ voice: filled("voice") })).toEqual({
			chat: false,
			pointer: false,
			voice: true,
		});
	});

	it("semua slot terisi → semua true", () => {
		expect(
			slotsFor({
				chat: filled("chat"),
				pointer: filled("pointer"),
				voice: filled("voice"),
			}),
		).toEqual({ chat: true, pointer: true, voice: true });
	});

	it("voice terisi tetapi nonaktif atau tidak lengkap → false", () => {
		const chat = filled("chat");
		expect(
			slotsFor({ chat, voice: filled("voice", { enabled: false }) }).voice,
		).toBe(false);
		expect(
			slotsFor({ chat, voice: filled("voice", { model: null }) }).voice,
		).toBe(false);
		expect(
			slotsFor({ chat, voice: filled("voice", { apiKeyEnc: null }) }).voice,
		).toBe(false);
		expect(
			slotsFor({ chat, voice: filled("voice", { baseUrl: null }) }).voice,
		).toBe(false);
	});

	it("tipe provider tidak didukung → voice false", () => {
		expect(
			slotsFor({ voice: filled("voice", { providerType: "lain" }) }).voice,
		).toBe(false);
	});

	it("tanpa kunci enkripsi server → semua slot false termasuk voice", () => {
		expect(
			slotsFor(
				{
					chat: filled("chat"),
					pointer: filled("pointer"),
					voice: filled("voice"),
				},
				false,
			),
		).toEqual({ chat: false, pointer: false, voice: false });
	});

	it("pointer kosong tetap ikut chat (perilaku lama tidak berubah)", () => {
		expect(slotsFor({ chat: filled("chat") }).pointer).toBe(true);
		expect(slotsFor({ pointer: filled("pointer") }).chat).toBe(false);
	});
});
