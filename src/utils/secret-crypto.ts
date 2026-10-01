/**
 * Enkripsi rahasia yang disimpan di DB (mis. API key provider AI) dengan
 * AES-256-GCM via Web Crypto. Format berversi: `v1:<base64(iv + ciphertext + tag)>`.
 *
 * Fail-closed: bila `AI_CREDENTIALS_KEY` kosong/salah, enkripsi & dekripsi
 * melempar SecretCryptoError — tidak pernah jatuh ke plaintext. Server-only:
 * kunci tidak boleh memakai prefix VITE_.
 */

const KEY_ENV = "AI_CREDENTIALS_KEY";
const VERSION_PREFIX = "v1:";
const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_HEX_PATTERN = /^[0-9a-fA-F]{64}$/;

export type SecretCryptoErrorCode =
	| "KEY_MISSING"
	| "KEY_INVALID"
	| "BAD_FORMAT"
	| "DECRYPT_FAILED";

/** Error enkripsi/dekripsi dengan kode yang bisa dipetakan ke pesan UI. */
export class SecretCryptoError extends Error {
	constructor(
		readonly code: SecretCryptoErrorCode,
		message: string,
	) {
		super(message);
		this.name = "SecretCryptoError";
	}
}

/** True bila `AI_CREDENTIALS_KEY` terisi 64 karakter hex. */
export function isSecretCryptoConfigured(): boolean {
	return KEY_HEX_PATTERN.test(process.env[KEY_ENV]?.trim() ?? "");
}

async function loadKey(): Promise<CryptoKey> {
	const hex = process.env[KEY_ENV]?.trim();
	if (!hex) {
		throw new SecretCryptoError(
			"KEY_MISSING",
			`${KEY_ENV} belum diset — rahasia tidak bisa dienkripsi/didekripsi.`,
		);
	}
	if (!KEY_HEX_PATTERN.test(hex)) {
		throw new SecretCryptoError(
			"KEY_INVALID",
			`${KEY_ENV} harus 64 karakter hex (32 byte).`,
		);
	}
	return crypto.subtle.importKey(
		"raw",
		Buffer.from(hex, "hex"),
		{ name: "AES-GCM" },
		false,
		["encrypt", "decrypt"],
	);
}

/** Enkripsi plaintext menjadi string `v1:<base64>` dengan IV acak per panggilan. */
export async function encryptSecret(plaintext: string): Promise<string> {
	const key = await loadKey();
	const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
	const sealed = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		new TextEncoder().encode(plaintext),
	);
	const payload = Buffer.concat([Buffer.from(iv), Buffer.from(sealed)]);
	return `${VERSION_PREFIX}${payload.toString("base64")}`;
}

/** Dekripsi string `v1:<base64>`; gagal (format, kunci, atau data diubah) → SecretCryptoError. */
export async function decryptSecret(payload: string): Promise<string> {
	if (!payload.startsWith(VERSION_PREFIX)) {
		throw new SecretCryptoError(
			"BAD_FORMAT",
			"Format rahasia terenkripsi tidak dikenal.",
		);
	}
	const raw = Buffer.from(payload.slice(VERSION_PREFIX.length), "base64");
	if (raw.length < IV_BYTES + TAG_BYTES) {
		throw new SecretCryptoError(
			"BAD_FORMAT",
			"Rahasia terenkripsi terpotong atau rusak.",
		);
	}

	const key = await loadKey();
	try {
		const plain = await crypto.subtle.decrypt(
			{ name: "AES-GCM", iv: raw.subarray(0, IV_BYTES) },
			key,
			raw.subarray(IV_BYTES),
		);
		return new TextDecoder().decode(plain);
	} catch (err) {
		throw new SecretCryptoError(
			"DECRYPT_FAILED",
			`Dekripsi gagal — kunci ${KEY_ENV} berbeda atau data diubah (${(err as Error).name}).`,
		);
	}
}
