/**
 * Kontrak data halaman admin AI Assistant (`/admin/ai-assistant`).
 * Dipakai UI sekarang dan endpoint `/api/admin/ai-assistant/*` di tahap P3
 * (lihat docs-local/plans/ai-assistant/03-pondasi.md §9–10). API key tidak
 * pernah ada di respons — hanya `hasApiKey` + `apiKeyHint`.
 */

export const PROVIDER_FEATURES = ["chat", "pointer", "voice"] as const;
export type ProviderFeature = (typeof PROVIDER_FEATURES)[number];

export interface AssistantSettingsDto {
	enabled: boolean;
	assistantName: string;
	personaNote: string | null;
	dailyMessageLimitPerUser: number;
	dailyTokenLimitGlobal: number;
	ratePerMinutePerUser: number;
	maxInputChars: number;
	historyWindow: number;
	retentionDays: number;
	kioskUserId: string | null;
	dailyMessageLimitKiosk: number;
	guideAutoAdvanceSec: number;
}

/** Status kunci tersimpan: `needs-reentry` = gagal didekripsi (AI_CREDENTIALS_KEY berganti). */
export type ApiKeyStatus = "set" | "missing" | "needs-reentry";

export interface ProviderSlotDto {
	feature: ProviderFeature;
	enabled: boolean;
	label: string | null;
	providerType: string;
	baseUrl: string | null;
	model: string | null;
	temperature: number | null;
	maxTokens: number | null;
	timeoutMs: number;
	apiKeyStatus: ApiKeyStatus;
	apiKeyHint: string | null;
	lastTestAt: string | null;
	lastTestOk: boolean | null;
}

export interface AssistantTodayStatsDto {
	messages: number;
	tokens: number;
	activeUsers: number;
	lastErrorAt: string | null;
}

export interface KioskCandidateDto {
	id: string;
	name: string;
}

/** Respons `GET /api/admin/ai-assistant`. */
export interface AiAssistantAdminOverviewDto {
	settings: AssistantSettingsDto;
	providers: ProviderSlotDto[];
	today: AssistantTodayStatsDto;
	kioskCandidates: KioskCandidateDto[];
	/** false bila `AI_CREDENTIALS_KEY` kosong/tidak valid — API key tidak bisa disimpan. */
	cryptoConfigured: boolean;
}

/** Body `PUT /api/admin/ai-assistant/settings`. */
export type AssistantSettingsUpdate = AssistantSettingsDto;

/**
 * Body `PUT /api/admin/ai-assistant/providers/:feature`.
 * `apiKey`: tidak dikirim = pertahankan, `""` = hapus, string = ganti.
 */
export interface ProviderSlotUpdate {
	enabled: boolean;
	label: string | null;
	baseUrl: string | null;
	model: string | null;
	temperature: number | null;
	maxTokens: number | null;
	timeoutMs: number;
	apiKey?: string;
}

/** Respons `POST /api/admin/ai-assistant/providers/:feature/test`. */
export interface ProviderTestResultDto {
	ok: boolean;
	latencyMs: number | null;
	/** Pesan yang sudah disaring server — tanpa header/kunci. */
	error: string | null;
}
