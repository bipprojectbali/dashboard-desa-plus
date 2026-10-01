import type { AiProviderConfig, AssistantSettings } from "generated/prisma";
import { cache, withCache } from "@/utils/cache";
import { prisma } from "@/utils/db";

/**
 * Baca pengaturan & slot kredensial AI assistant. Hanya membaca — tidak ada
 * baris → nilai default (sama dengan default skema), tanpa menulis ke DB.
 * Penulisan hanya lewat endpoint admin (P3), yang wajib memanggil
 * invalidateAssistantConfigCache().
 */

export const ASSISTANT_CONFIG_TTL_MS = 30 * 1000;
const CACHE_PREFIX = "assistant:config:";
const SETTINGS_ID = "singleton";

export const PROVIDER_SLOTS = ["chat", "pointer", "voice"] as const;
export type ProviderSlot = (typeof PROVIDER_SLOTS)[number];

export type AssistantSettingsValues = Omit<
	AssistantSettings,
	"updatedAt" | "updatedBy"
>;

/** Nilai awal bila baris singleton belum ada — harus sama dengan default di schema.prisma. */
export const DEFAULT_ASSISTANT_SETTINGS: Readonly<AssistantSettingsValues> = {
	id: SETTINGS_ID,
	enabled: false,
	assistantName: "Jenna",
	personaNote: null,
	dailyMessageLimitPerUser: 50,
	dailyTokenLimitGlobal: 1_000_000,
	ratePerMinutePerUser: 6,
	maxInputChars: 2000,
	historyWindow: 20,
	retentionDays: 90,
	kioskUserId: null,
	dailyMessageLimitKiosk: 100,
};

export type ProviderConfigRow = Omit<
	AiProviderConfig,
	"updatedAt" | "updatedBy"
>;

/** Slot kosong sesuai default skema (dipakai bila belum ada baris). */
export function emptyProviderConfig(feature: ProviderSlot): ProviderConfigRow {
	return {
		feature,
		enabled: false,
		label: null,
		providerType: "openai-compatible",
		baseUrl: null,
		apiKeyEnc: null,
		apiKeyHint: null,
		model: null,
		temperature: null,
		maxTokens: null,
		timeoutMs: 60000,
		lastTestAt: null,
		lastTestOk: null,
	};
}

/** Pengaturan global (cache 30 detik). */
export function getAssistantSettings(): Promise<AssistantSettingsValues> {
	return withCache(
		`${CACHE_PREFIX}settings`,
		ASSISTANT_CONFIG_TTL_MS,
		async () => {
			const row = await prisma.assistantSettings.findUnique({
				where: { id: SETTINGS_ID },
			});
			if (!row) return { ...DEFAULT_ASSISTANT_SETTINGS };
			const { updatedAt: _u, updatedBy: _b, ...values } = row;
			return values;
		},
	);
}

/** Ketiga slot kredensial, selalu lengkap (slot tanpa baris → kosong). Cache 30 detik. */
export function getProviderConfigs(): Promise<
	Record<ProviderSlot, ProviderConfigRow>
> {
	return withCache(
		`${CACHE_PREFIX}providers`,
		ASSISTANT_CONFIG_TTL_MS,
		async () => {
			const rows = await prisma.aiProviderConfig.findMany({
				where: { feature: { in: [...PROVIDER_SLOTS] } },
			});
			const bySlot = new Map(rows.map((r) => [r.feature, r]));
			const result = {} as Record<ProviderSlot, ProviderConfigRow>;
			for (const slot of PROVIDER_SLOTS) {
				const row = bySlot.get(slot);
				if (row) {
					const { updatedAt: _u, updatedBy: _b, ...values } = row;
					result[slot] = values;
				} else {
					result[slot] = emptyProviderConfig(slot);
				}
			}
			return result;
		},
	);
}

/** Buang cache pengaturan & slot — panggil setelah admin menyimpan perubahan. */
export function invalidateAssistantConfigCache(): void {
	cache.deleteByPrefix(CACHE_PREFIX);
}
