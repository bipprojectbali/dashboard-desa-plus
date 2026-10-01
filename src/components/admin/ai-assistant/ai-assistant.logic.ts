import {
	type AiAssistantAdminOverviewDto,
	type AssistantSettingsDto,
	PROVIDER_FEATURES,
	type ProviderFeature,
	type ProviderSlotDto,
	type ProviderSlotUpdate,
} from "@/types/ai-assistant-admin";

/** Nilai awal sesuai default kolom Prisma (`AssistantSettings`) — dipakai saat data server belum ada. */
export const DEFAULT_SETTINGS: AssistantSettingsDto = {
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

export const DEFAULT_TIMEOUT_MS = 60_000;
export const ASSISTANT_NAME_MAX = 40;
export const PERSONA_NOTE_MAX = 1000;

export const FEATURE_LABELS: Record<ProviderFeature, string> = {
	chat: "Chat",
	pointer: "Penunjuk",
	voice: "Suara",
};

type LimitKey = Exclude<
	keyof AssistantSettingsDto,
	"enabled" | "assistantName" | "personaNote" | "kioskUserId"
>;

/** Rentang yang diterima untuk tiap batas. `zeroUnlimited` = 0 berarti tanpa batas. */
export const LIMIT_RULES: Record<
	LimitKey,
	{ label: string; min: number; max: number; zeroUnlimited: boolean }
> = {
	ratePerMinutePerUser: {
		label: "Pesan per menit per user",
		min: 1,
		max: 60,
		zeroUnlimited: false,
	},
	dailyMessageLimitPerUser: {
		label: "Pesan per hari per user",
		min: 0,
		max: 10_000,
		zeroUnlimited: true,
	},
	dailyMessageLimitKiosk: {
		label: "Pesan per hari akun kiosk",
		min: 0,
		max: 100_000,
		zeroUnlimited: true,
	},
	dailyTokenLimitGlobal: {
		label: "Token per hari (semua user)",
		min: 0,
		max: 1_000_000_000,
		zeroUnlimited: true,
	},
	maxInputChars: {
		label: "Panjang pertanyaan (karakter)",
		min: 100,
		max: 20_000,
		zeroUnlimited: false,
	},
	historyWindow: {
		label: "Riwayat yang dikirim ke AI (pesan)",
		min: 2,
		max: 100,
		zeroUnlimited: false,
	},
	retentionDays: {
		label: "Simpan riwayat (hari)",
		min: 0,
		max: 3650,
		zeroUnlimited: true,
	},
};

/** Slot kosong untuk fitur yang belum punya baris di DB. */
export function emptyProviderSlot(feature: ProviderFeature): ProviderSlotDto {
	return {
		feature,
		enabled: false,
		label: null,
		providerType: "openai-compatible",
		baseUrl: null,
		model: null,
		temperature: null,
		maxTokens: null,
		timeoutMs: DEFAULT_TIMEOUT_MS,
		apiKeyStatus: "missing",
		apiKeyHint: null,
		lastTestAt: null,
		lastTestOk: null,
	};
}

/** Overview awal (default + 3 slot kosong) saat endpoint admin belum tersedia. */
export function defaultOverview(): AiAssistantAdminOverviewDto {
	return {
		settings: { ...DEFAULT_SETTINGS },
		providers: PROVIDER_FEATURES.map(emptyProviderSlot),
		today: { messages: 0, tokens: 0, activeUsers: 0, lastErrorAt: null },
		kioskCandidates: [],
		cryptoConfigured: false,
	};
}

/** Urutkan slot chat → pointer → voice dan isi slot yang hilang. */
export function normalizeProviders(
	slots: ProviderSlotDto[],
): ProviderSlotDto[] {
	return PROVIDER_FEATURES.map(
		(f) => slots.find((s) => s.feature === f) ?? emptyProviderSlot(f),
	);
}

/** Pesan error per field pengaturan; objek kosong = valid. */
export function validateSettings(
	s: AssistantSettingsDto,
): Partial<Record<keyof AssistantSettingsDto, string>> {
	const errors: Partial<Record<keyof AssistantSettingsDto, string>> = {};
	const name = s.assistantName.trim();
	if (!name) errors.assistantName = "Nama asisten wajib diisi";
	else if (name.length > ASSISTANT_NAME_MAX)
		errors.assistantName = `Maksimal ${ASSISTANT_NAME_MAX} karakter`;
	if ((s.personaNote ?? "").length > PERSONA_NOTE_MAX)
		errors.personaNote = `Maksimal ${PERSONA_NOTE_MAX} karakter`;
	for (const key of Object.keys(LIMIT_RULES) as LimitKey[]) {
		const { min, max } = LIMIT_RULES[key];
		const v = s[key];
		if (!Number.isInteger(v) || v < min || v > max)
			errors[key] =
				`Harus bilangan bulat ${min}–${max.toLocaleString("id-ID")}`;
	}
	return errors;
}

/**
 * Base URL proxy: wajib https (http hanya untuk localhost saat development)
 * dan diakhiri `/v1`. Mengembalikan pesan error atau null.
 */
export function validateBaseUrl(raw: string): string | null {
	const value = raw.trim();
	if (!value) return null;
	let url: URL;
	try {
		url = new URL(value);
	} catch {
		return "URL tidak valid";
	}
	const isLocal = ["localhost", "127.0.0.1"].includes(url.hostname);
	if (url.protocol !== "https:" && !(url.protocol === "http:" && isLocal))
		return "Wajib https:// (http hanya untuk localhost)";
	if (!url.pathname.replace(/\/+$/, "").endsWith("/v1"))
		return "Wajib diakhiri /v1";
	return null;
}

/** Form satu slot di UI. `apiKeyInput` kosong + `clearApiKey` false = kunci tidak diubah. */
export interface ProviderForm {
	enabled: boolean;
	label: string;
	baseUrl: string;
	model: string;
	temperature: number | null;
	maxTokens: number | null;
	timeoutMs: number;
	apiKeyInput: string;
	clearApiKey: boolean;
}

export function providerToForm(slot: ProviderSlotDto): ProviderForm {
	return {
		enabled: slot.enabled,
		label: slot.label ?? "",
		baseUrl: slot.baseUrl ?? "",
		model: slot.model ?? "",
		temperature: slot.temperature,
		maxTokens: slot.maxTokens,
		timeoutMs: slot.timeoutMs,
		apiKeyInput: "",
		clearApiKey: false,
	};
}

const emptyToNull = (v: string) => (v.trim() === "" ? null : v.trim());

/** Susun body PUT slot sesuai kontrak: apiKey hanya dikirim bila diganti atau dihapus. */
export function buildProviderUpdate(form: ProviderForm): ProviderSlotUpdate {
	const update: ProviderSlotUpdate = {
		enabled: form.enabled,
		label: emptyToNull(form.label),
		baseUrl: emptyToNull(form.baseUrl)?.replace(/\/+$/, "") ?? null,
		model: emptyToNull(form.model),
		temperature: form.temperature,
		maxTokens: form.maxTokens,
		timeoutMs: form.timeoutMs,
	};
	if (form.clearApiKey) update.apiKey = "";
	else if (form.apiKeyInput.trim() !== "")
		update.apiKey = form.apiKeyInput.trim();
	return update;
}

/** True bila slot punya kredensial lengkap sendiri (bukan fallback ke Chat). */
export function hasOwnCredentials(slot: ProviderSlotDto): boolean {
	return Boolean(slot.baseUrl && slot.model && slot.apiKeyStatus === "set");
}

export type SlotBadge = { label: string; color: string };

/** Badge status slot untuk kartu Kredensial. */
export function slotBadge(slot: ProviderSlotDto): SlotBadge {
	if (slot.apiKeyStatus === "needs-reentry")
		return { label: "API key perlu diisi ulang", color: "red" };
	if (hasOwnCredentials(slot))
		return slot.enabled
			? { label: "Aktif", color: "green" }
			: { label: "Tersimpan, nonaktif", color: "gray" };
	if (slot.feature !== "chat") return { label: "Memakai Chat", color: "blue" };
	return { label: "Belum diisi", color: "yellow" };
}
