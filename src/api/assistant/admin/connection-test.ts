import type { ProviderTestResultDto } from "@/types/ai-assistant-admin";
import { prisma } from "@/utils/db";
import logger from "@/utils/logger";
import { decryptSecret, SecretCryptoError } from "@/utils/secret-crypto";
import {
	invalidateAssistantConfigCache,
	type ProviderSlot,
} from "../config/settings.repo";
import { OpenAICompatibleProvider } from "../provider/openai-compatible";
import { AiProviderError } from "../provider/types";
import { validateProviderBaseUrl } from "./admin.validation";

/** Batas waktu uji koneksi — lebih pendek dari timeout slot agar halaman admin tidak menggantung. */
export const CONNECTION_TEST_TIMEOUT_MS = 30_000;
const TEST_PROMPT = "Balas hanya dengan kata: OK";

export const CONNECTION_TEST_MESSAGES = {
	incomplete:
		"Slot belum lengkap — isi Base URL, API key, dan model lalu simpan",
	needsReentry: "API key perlu diisi ulang (tidak bisa didekripsi)",
	cryptoMissing: "AI_CREDENTIALS_KEY belum diset di server",
	unexpected: "Uji koneksi gagal karena kesalahan server",
} as const;

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

export interface ConnectionTestDeps {
	fetchImpl?: FetchLike;
	isProduction?: boolean;
	now?: () => number;
}

function fail(error: string, latencyMs: number | null = null) {
	return { ok: false, latencyMs, error } satisfies ProviderTestResultDto;
}

/**
 * Uji kredensial milik slot sendiri (bukan fallback ke Chat) dengan satu
 * permintaan chat kecil. Redirect tidak diikuti; pesan error hanya kategori
 * + kode HTTP, tanpa isi respons vendor. Hasil disimpan ke `lastTestAt/Ok`.
 */
export async function testProviderConnection(
	feature: ProviderSlot,
	deps: ConnectionTestDeps = {},
): Promise<ProviderTestResultDto> {
	const now = deps.now ?? Date.now;
	const row = await prisma.aiProviderConfig.findUnique({ where: { feature } });
	if (!row?.baseUrl || !row.apiKeyEnc || !row.model)
		return fail(CONNECTION_TEST_MESSAGES.incomplete);

	const urlError = validateProviderBaseUrl(
		row.baseUrl,
		deps.isProduction ?? process.env.NODE_ENV === "production",
	);
	if (urlError) return persist(feature, fail(`Base URL: ${urlError}`));

	let apiKey: string;
	try {
		apiKey = await decryptSecret(row.apiKeyEnc);
	} catch (err) {
		if (!(err instanceof SecretCryptoError)) {
			throw new Error(
				`Failed to read API key for slot "${feature}": ${(err as Error).message}`,
				{ cause: err },
			);
		}
		const missing = err.code === "KEY_MISSING" || err.code === "KEY_INVALID";
		return persist(
			feature,
			fail(
				missing
					? CONNECTION_TEST_MESSAGES.cryptoMissing
					: CONNECTION_TEST_MESSAGES.needsReentry,
			),
		);
	}

	const provider = new OpenAICompatibleProvider(
		{
			baseUrl: row.baseUrl,
			apiKey,
			model: row.model,
			temperature: row.temperature,
			maxTokens: row.maxTokens,
			timeoutMs: Math.min(row.timeoutMs, CONNECTION_TEST_TIMEOUT_MS),
		},
		deps.fetchImpl,
	);
	const started = now();
	try {
		await provider.chat([{ role: "user", content: TEST_PROMPT }]);
		return persist(feature, {
			ok: true,
			latencyMs: now() - started,
			error: null,
		});
	} catch (err) {
		const latencyMs = now() - started;
		if (err instanceof AiProviderError) {
			const code = err.status ? ` (HTTP ${err.status})` : "";
			return persist(feature, fail(`${err.message}${code}`, latencyMs));
		}
		logger.error({ err, feature }, "[ASSISTANT_ADMIN] Connection test crashed");
		return persist(
			feature,
			fail(CONNECTION_TEST_MESSAGES.unexpected, latencyMs),
		);
	}
}

async function persist(
	feature: ProviderSlot,
	result: ProviderTestResultDto,
): Promise<ProviderTestResultDto> {
	await prisma.aiProviderConfig.update({
		where: { feature },
		data: { lastTestAt: new Date(), lastTestOk: result.ok },
	});
	invalidateAssistantConfigCache();
	return result;
}
