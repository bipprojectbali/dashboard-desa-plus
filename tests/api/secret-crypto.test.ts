import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import {
	decryptSecret,
	encryptSecret,
	isSecretCryptoConfigured,
	SecretCryptoError,
} from "@/utils/secret-crypto";

/**
 * secret-crypto (AES-256-GCM, format `v1:`) — fail-closed: tanpa kunci yang
 * valid tidak pernah menghasilkan/membaca plaintext.
 */
const KEY_A = "a".repeat(64); // test-only
const KEY_B = "b".repeat(64); // test-only
const SECRET = "sk-test-1234567890"; // test-only

let originalKey: string | undefined;

beforeEach(() => {
	originalKey = process.env.AI_CREDENTIALS_KEY;
	process.env.AI_CREDENTIALS_KEY = KEY_A;
});

afterEach(() => {
	if (originalKey === undefined) delete process.env.AI_CREDENTIALS_KEY;
	else process.env.AI_CREDENTIALS_KEY = originalKey;
});

async function expectCryptoError(
	promise: Promise<unknown>,
	code: SecretCryptoError["code"],
) {
	const err = await promise.then(
		() => null,
		(e: unknown) => e,
	);
	expect(err).toBeInstanceOf(SecretCryptoError);
	expect((err as SecretCryptoError).code).toBe(code);
}

describe("encryptSecret / decryptSecret", () => {
	it("round-trip menghasilkan plaintext yang sama", async () => {
		const enc = await encryptSecret(SECRET);
		expect(enc.startsWith("v1:")).toBe(true);
		expect(enc).not.toContain(SECRET);
		expect(await decryptSecret(enc)).toBe(SECRET);
	});

	it("IV acak: dua enkripsi plaintext sama berbeda hasilnya", async () => {
		const a = await encryptSecret(SECRET);
		const b = await encryptSecret(SECRET);
		expect(a).not.toBe(b);
	});

	it("ciphertext diubah satu byte → DECRYPT_FAILED", async () => {
		const enc = await encryptSecret(SECRET);
		const raw = Buffer.from(enc.slice(3), "base64");
		raw[raw.length - 1] = (raw[raw.length - 1] ?? 0) ^ 0x01;
		await expectCryptoError(
			decryptSecret(`v1:${raw.toString("base64")}`),
			"DECRYPT_FAILED",
		);
	});

	it("kunci berbeda (rotasi) → DECRYPT_FAILED, bukan crash", async () => {
		const enc = await encryptSecret(SECRET);
		process.env.AI_CREDENTIALS_KEY = KEY_B;
		await expectCryptoError(decryptSecret(enc), "DECRYPT_FAILED");
	});

	it("format tanpa prefix v1: atau terpotong → BAD_FORMAT", async () => {
		await expectCryptoError(decryptSecret(SECRET), "BAD_FORMAT");
		await expectCryptoError(decryptSecret("v1:AAAA"), "BAD_FORMAT");
	});
});

describe("fail-closed tanpa kunci valid", () => {
	it("env kosong → KEY_MISSING saat enkripsi & dekripsi", async () => {
		const enc = await encryptSecret(SECRET);
		delete process.env.AI_CREDENTIALS_KEY;
		expect(isSecretCryptoConfigured()).toBe(false);
		await expectCryptoError(encryptSecret(SECRET), "KEY_MISSING");
		await expectCryptoError(decryptSecret(enc), "KEY_MISSING");
	});

	it("env bukan 64 hex → KEY_INVALID", async () => {
		process.env.AI_CREDENTIALS_KEY = "not-a-hex-key";
		expect(isSecretCryptoConfigured()).toBe(false);
		await expectCryptoError(encryptSecret(SECRET), "KEY_INVALID");
	});

	it("kunci 64 hex dianggap terkonfigurasi", () => {
		expect(isSecretCryptoConfigured()).toBe(true);
	});
});
