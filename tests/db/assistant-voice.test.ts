import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import Elysia from "elysia";
import { invalidateAssistantConfigCache } from "@/api/assistant/config/settings.repo";
import { assistantStatusApi } from "@/api/assistant/routes/status.route";
import { createVoiceApi } from "@/api/assistant/routes/voice.route";
import { prisma } from "@/utils/db";
import { encryptSecret } from "@/utils/secret-crypto";
import {
	newRunId,
	signUp,
	snapshotAssistantConfig,
	type TestUser,
} from "./assistant-admin.helpers";
import { setAssistantSettings } from "./assistant-chat.helpers";
import { assertTestDatabase } from "./test-database";

/**
 * `/api/assistant/voice/*` + status dengan sesi Better Auth nyata: izin
 * use-ai-voice dari DB, persetujuan mikrofon tersimpan, sesi suara di tabel
 * asli (OpenAI dipalsukan lewat fetchImpl). Data & config dipulihkan.
 */
assertTestDatabase();

const RUN_ID = newRunId();
const EMAIL_DOMAIN = "s1-assistant-voice.test.local"; // test-only
const email = (label: string) => `${label}-${RUN_ID}@${EMAIL_DOMAIN}`;
const NO_VOICE_ROLE = `s1-no-voice-${RUN_ID}`; // test-only
const FAKE_KEY = "sk-test-voice-db"; // test-only
const ANSWER_SDP = "v=0\r\ns=answer\r\n"; // test-only
/** Dua sign-up Better Auth + enkripsi kunci; longgar agar tidak flaky saat mesin sibuk. */
const SETUP_TIMEOUT_MS = 20_000;

let member: TestUser;
let noVoice: TestUser;
let restoreConfig: () => Promise<void>;
let upstreamCalls = 0;

const app = new Elysia({ prefix: "/api" }).use(assistantStatusApi).use(
	createVoiceApi({
		fetchImpl: async () => {
			upstreamCalls += 1;
			return Response.json({
				session: { id: "live-db" },
				transport: { sdp: ANSWER_SDP },
			});
		},
	}),
);

function request(user: TestUser, method: string, path: string, body?: unknown) {
	return app.handle(
		new Request(`http://localhost/api/assistant${path}`, {
			method,
			headers: { "content-type": "application/json", cookie: user.cookie },
			body: body === undefined ? undefined : JSON.stringify(body),
		}),
	);
}

beforeAll(async () => {
	restoreConfig = await snapshotAssistantConfig();
	[member, noVoice] = await Promise.all([
		signUp(email("member"), "member"),
		signUp(email("novoice"), "novoice"),
	]);
	await prisma.user.updateMany({
		where: { id: { in: [member.id, noVoice.id] } },
		data: { emailVerified: true },
	});
	await prisma.user.update({
		where: { id: noVoice.id },
		data: { role: NO_VOICE_ROLE },
	});
	await prisma.rolePermission.createMany({
		data: [
			{ role: NO_VOICE_ROLE, feature: "use-ai-assistant", allowed: true },
			{ role: NO_VOICE_ROLE, feature: "use-ai-voice", allowed: false },
		],
	});
	await prisma.aiProviderConfig.create({
		data: {
			feature: "voice",
			enabled: true,
			baseUrl: "https://voice.example.test/v1", // test-only
			model: "gpt-live-1",
			apiKeyEnc: await encryptSecret(FAKE_KEY),
			apiKeyHint: "****",
		},
	});
	await setAssistantSettings();
	invalidateAssistantConfigCache();
}, SETUP_TIMEOUT_MS);

afterAll(async () => {
	await prisma.rolePermission.deleteMany({ where: { role: NO_VOICE_ROLE } });
	await restoreConfig();
	invalidateAssistantConfigCache();
	await prisma.user.deleteMany({
		where: { email: { endsWith: `-${RUN_ID}@${EMAIL_DOMAIN}` } },
	});
	await prisma.$disconnect();
});

describe("izin use-ai-voice dari DB", () => {
	it("role tanpa use-ai-voice → 403 voice_forbidden di semua endpoint", async () => {
		for (const [path, body] of [
			["/voice/consent", { accepted: true }],
			["/voice/sessions", { sdp: "v=0" }],
		] as const) {
			const res = await request(noVoice, "POST", path, body);
			expect(res.status).toBe(403);
			expect((await res.json()).code).toBe("voice_forbidden");
		}
		expect(upstreamCalls).toBe(0);
	});

	it("status: chat boleh, suara tidak", async () => {
		const res = await request(noVoice, "GET", "/status");
		expect(await res.json()).toMatchObject({
			voiceAllowed: false,
			voiceConsented: false,
		});
	});
});

describe("persetujuan & sesi nyata", () => {
	it("persetujuan mikrofon tersimpan sekali per user", async () => {
		const before = await (await request(member, "GET", "/status")).json();
		expect(before).toMatchObject({ voiceAllowed: true, voiceConsented: false });
		const start = await request(member, "POST", "/voice/sessions", {
			sdp: "v=0",
		});
		expect(start.status).toBe(403);
		expect((await start.json()).code).toBe("voice_consent_required");

		for (let i = 0; i < 2; i++) {
			const res = await request(member, "POST", "/voice/consent", {
				accepted: true,
			});
			expect(res.status).toBe(200);
		}
		expect(
			await prisma.assistantVoiceConsent.count({
				where: { userId: member.id },
			}),
		).toBe(1);
		const after = await (await request(member, "GET", "/status")).json();
		expect(after.voiceConsented).toBe(true);
	});

	it("start → tab kedua 409 → heartbeat → close menagih dan melepas kunci", async () => {
		const start = await request(member, "POST", "/voice/sessions", {
			sdp: "v=0",
		});
		expect(start.status).toBe(200);
		const { sessionId, sdp } = await start.json();
		expect(sdp).toBe(ANSWER_SDP);

		const second = await request(member, "POST", "/voice/sessions", {
			sdp: "v=0",
		});
		expect(second.status).toBe(409);
		expect((await second.json()).code).toBe("voice_session_active");

		const beat = await request(
			member,
			"POST",
			`/voice/sessions/${sessionId}/heartbeat`,
		);
		expect((await beat.json()).stop).toBeNull();

		const close = await request(
			member,
			"POST",
			`/voice/sessions/${sessionId}/close`,
			{ reason: "user" },
		);
		expect(close.status).toBe(200);
		const row = await prisma.assistantVoiceSession.findUniqueOrThrow({
			where: { id: sessionId },
		});
		expect(row).toMatchObject({ status: "ended", endReason: "user" });
		expect(row.endedAt).not.toBeNull();

		const again = await request(member, "POST", "/voice/sessions", {
			sdp: "v=0",
		});
		expect(again.status).toBe(200);
		const { sessionId: nextId } = await again.json();
		await request(member, "POST", `/voice/sessions/${nextId}/close`, {
			reason: "user",
		});
		expect(upstreamCalls).toBe(2);
	});

	it("sesi milik user lain → 404", async () => {
		const own = await prisma.assistantVoiceSession.findFirstOrThrow({
			where: { userId: member.id },
		});
		const res = await request(
			noVoice,
			"POST",
			`/voice/sessions/${own.id}/heartbeat`,
		);
		expect(res.status).toBe(403);
		await prisma.rolePermission.updateMany({
			where: { role: NO_VOICE_ROLE, feature: "use-ai-voice" },
			data: { allowed: true },
		});
		const allowed = await request(
			noVoice,
			"POST",
			`/voice/sessions/${own.id}/heartbeat`,
		);
		expect(allowed.status).toBe(404);
	});
});
