import type { AiProviderConfig, AssistantSettings } from "generated/prisma";
import api from "@/api";
import { DEFAULT_ASSISTANT_SETTINGS } from "@/api/assistant/config/settings.repo";
import { prisma } from "@/utils/db";
import { VITE_PUBLIC_URL } from "@/utils/env";

/** Helper bersama test DB endpoint AI assistant (P3). Semua nilai di sini test-only. */

export const ADMIN = "/api/admin/ai-assistant";
const { id: _id, ...settingsValues } = DEFAULT_ASSISTANT_SETTINGS;
/** Body PUT settings bernilai default skema. */
export const SETTINGS_BODY = settingsValues;
const PASSWORD = "Test-password-123"; // test-only

export type TestUser = { id: string; cookie: string };

export function newRunId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Daftar lewat Better Auth (sesi nyata) dan kembalikan id + cookie sesi. */
export async function signUp(email: string, name: string): Promise<TestUser> {
	const res = await api.handle(
		new Request("http://localhost/api/auth/sign-up/email", {
			method: "POST",
			headers: { "content-type": "application/json", origin: VITE_PUBLIC_URL },
			body: JSON.stringify({ email, password: PASSWORD, name }),
		}),
	);
	if (res.status !== 200)
		throw new Error(`sign-up ${name} gagal: ${res.status} ${await res.text()}`);
	const cookie = res.headers
		.getSetCookie()
		.map((c) => c.split(";")[0])
		.join("; ");
	const user = await prisma.user.findUniqueOrThrow({ where: { email } });
	return { id: user.id, cookie };
}

export function call(
	method: string,
	path: string,
	headers: Record<string, string>,
	body?: unknown,
) {
	return api.handle(
		new Request(`http://localhost${path}`, {
			method,
			headers: { "content-type": "application/json", ...headers },
			body: body === undefined ? undefined : JSON.stringify(body),
		}),
	);
}

export const slotBody = (o: Record<string, unknown> = {}) => ({
	enabled: true,
	label: "Proxy test",
	baseUrl: "https://proxy.example.test/v1", // test-only
	model: "claude-test",
	temperature: null,
	maxTokens: null,
	timeoutMs: 60_000,
	...o,
});

/**
 * Simpan pengaturan singleton & slot yang ada di DB test, kosongkan slot,
 * lalu kembalikan fungsi untuk memulihkan keadaan semula.
 */
export async function snapshotAssistantConfig(): Promise<() => Promise<void>> {
	const settings: AssistantSettings | null =
		await prisma.assistantSettings.findUnique({ where: { id: "singleton" } });
	const providers: AiProviderConfig[] =
		await prisma.aiProviderConfig.findMany();
	await prisma.aiProviderConfig.deleteMany({});
	return async () => {
		await prisma.aiProviderConfig.deleteMany({});
		if (providers.length)
			await prisma.aiProviderConfig.createMany({ data: providers });
		await prisma.assistantSettings.deleteMany({ where: { id: "singleton" } });
		if (settings) await prisma.assistantSettings.create({ data: settings });
	};
}
