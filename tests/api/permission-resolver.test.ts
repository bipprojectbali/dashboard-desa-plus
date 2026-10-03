import { describe, expect, it } from "bun:test";
import {
	DEFAULT_PERMISSIONS,
	FEATURES,
	resolveAllowedFeatures,
} from "@/utils/permission";

/**
 * resolveAllowedFeatures: satu sumber kebenaran izin (dipakai
 * /api/my-permissions dan nanti registry tool AI). Baris DB menang per
 * fitur; fitur tanpa baris jatuh ke DEFAULT_PERMISSIONS.
 */
const ALL = FEATURES.map((f) => f.key);

describe("resolveAllowedFeatures", () => {
	it("use-ai-assistant ada di FEATURES dan default admin & user", () => {
		expect(ALL).toContain("use-ai-assistant");
		expect(DEFAULT_PERMISSIONS.admin).toContain("use-ai-assistant");
		expect(DEFAULT_PERMISSIONS.user).toContain("use-ai-assistant");
	});

	it("use-ai-voice ada di FEATURES, default admin & user, bisa dimatikan per role", () => {
		expect(ALL).toContain("use-ai-voice");
		expect(DEFAULT_PERMISSIONS.admin).toContain("use-ai-voice");
		expect(DEFAULT_PERMISSIONS.user).toContain("use-ai-voice");
		expect(
			resolveAllowedFeatures("user", [
				{ feature: "use-ai-voice", allowed: false },
			]),
		).not.toContain("use-ai-voice");
	});

	it("tanpa baris DB → default role", () => {
		expect(resolveAllowedFeatures("user", [])).toEqual(
			ALL.filter((k) => DEFAULT_PERMISSIONS.user.includes(k)),
		);
	});

	it("fitur baru tanpa baris tetap aktif walau fitur lama punya baris", () => {
		const records = [
			{ feature: "view-dashboard", allowed: true },
			{ feature: "view-keuangan", allowed: false },
		];
		const allowed = resolveAllowedFeatures("user", records);
		expect(allowed).toContain("use-ai-assistant");
		expect(allowed).toContain("view-dashboard");
		expect(allowed).not.toContain("view-keuangan");
	});

	it("baris DB menang atas default (dua arah)", () => {
		const allowed = resolveAllowedFeatures("user", [
			{ feature: "use-ai-assistant", allowed: false },
			{ feature: "sync-noc", allowed: true },
		]);
		expect(allowed).not.toContain("use-ai-assistant");
		expect(allowed).toContain("sync-noc");
	});

	it("admin selalu semua fitur, baris DB diabaikan", () => {
		expect(
			resolveAllowedFeatures("admin", [
				{ feature: "use-ai-assistant", allowed: false },
			]),
		).toEqual(ALL);
	});

	it("role di luar ROLES (moderator) & role kosong → default user", () => {
		const userDefault = resolveAllowedFeatures("user", []);
		expect(resolveAllowedFeatures("moderator", [])).toEqual(userDefault);
		expect(resolveAllowedFeatures(null, [])).toEqual(userDefault);
		expect(resolveAllowedFeatures(undefined, [])).toEqual(userDefault);
	});

	it("baris untuk fitur yang tidak dikenal diabaikan", () => {
		const allowed = resolveAllowedFeatures("user", [
			{ feature: "fitur-lama-dihapus", allowed: true },
		]);
		expect(allowed).not.toContain("fitur-lama-dihapus");
	});
});
