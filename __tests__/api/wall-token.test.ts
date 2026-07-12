import { describe, expect, it } from "bun:test";
import { isWallAuthorized } from "@/api/wall-snapshot";

describe("isWallAuthorized (truth table)", () => {
	it("token unset ⇒ selalu terbuka apapun key", () => {
		expect(isWallAuthorized(undefined, undefined)).toBe(true);
		expect(isWallAuthorized(undefined, "apapun")).toBe(true);
		expect(isWallAuthorized("", "apapun")).toBe(true); // "" falsy = unset
	});

	it("token diisi ⇒ hanya key sama persis yang lolos", () => {
		expect(isWallAuthorized("secret", "secret")).toBe(true);
		expect(isWallAuthorized("secret", "salah")).toBe(false);
		expect(isWallAuthorized("secret", undefined)).toBe(false);
		expect(isWallAuthorized("secret", "")).toBe(false);
	});
});
