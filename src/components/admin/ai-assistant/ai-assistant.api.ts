import type {
	AiAssistantAdminOverviewDto,
	AssistantSettingsDto,
	AssistantSettingsUpdate,
	ProviderFeature,
	ProviderSlotDto,
	ProviderSlotUpdate,
	ProviderTestResultDto,
} from "@/types/ai-assistant-admin";
import { normalizeProviders } from "./ai-assistant.logic";

const BASE = "/api/admin/ai-assistant";

/**
 * Endpoint admin belum ada — dibuat di tahap P3; UI tampil dengan nilai default.
 * Dikenali dari 404, atau dari respons non-JSON (path /api yang tak dikenal bisa
 * jatuh ke fallback SPA yang membalas HTML 200).
 */
export class AdminEndpointUnavailableError extends Error {
	constructor() {
		super("Endpoint admin AI Assistant belum tersedia");
		this.name = "AdminEndpointUnavailableError";
	}
}

async function request<T>(
	path: string,
	init: RequestInit,
	action: string,
): Promise<T> {
	const res = await fetch(`${BASE}${path}`, {
		...init,
		headers: { "Content-Type": "application/json", ...init.headers },
	});
	if (res.status === 404) throw new AdminEndpointUnavailableError();
	if (!res.ok) {
		const body = (await res.json().catch(() => ({}))) as {
			error?: string;
			message?: string;
		};
		throw new Error(
			`${action} gagal (${res.status}): ${body.error ?? body.message ?? res.statusText}`,
		);
	}
	if (!res.headers.get("content-type")?.includes("application/json"))
		throw new AdminEndpointUnavailableError();
	return (await res.json()) as T;
}

/** Ambil pengaturan, 3 slot kredensial, statistik hari ini, dan kandidat akun kiosk. */
export async function fetchOverview(
	signal?: AbortSignal,
): Promise<AiAssistantAdminOverviewDto> {
	const data = await request<AiAssistantAdminOverviewDto>(
		"",
		{ signal },
		"Memuat pengaturan AI",
	);
	return { ...data, providers: normalizeProviders(data.providers) };
}

/** Simpan pengaturan umum & batas pemakaian. */
export function saveSettings(
	body: AssistantSettingsUpdate,
): Promise<AssistantSettingsDto> {
	return request<AssistantSettingsDto>(
		"/settings",
		{ method: "PUT", body: JSON.stringify(body) },
		"Menyimpan pengaturan",
	);
}

/** Simpan satu slot kredensial (chat/pointer/voice). */
export function saveProvider(
	feature: ProviderFeature,
	body: ProviderSlotUpdate,
): Promise<ProviderSlotDto> {
	return request<ProviderSlotDto>(
		`/providers/${feature}`,
		{ method: "PUT", body: JSON.stringify(body) },
		"Menyimpan kredensial",
	);
}

/** Uji koneksi slot memakai kredensial yang tersimpan di server. */
export function testProvider(
	feature: ProviderFeature,
): Promise<ProviderTestResultDto> {
	return request<ProviderTestResultDto>(
		`/providers/${feature}/test`,
		{ method: "POST" },
		"Test koneksi",
	);
}
