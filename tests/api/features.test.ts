import { describe, expect, it } from "bun:test";
import { getEnv } from "@/utils/env";

describe("Feature Utilities", () => {
	describe("getEnv Utility", () => {
		it("should return default value if env is not found", () => {
			const val = getEnv("NON_EXISTENT_KEY", "fallback");
			expect(val).toBe("fallback");
		});

		it("should return value from process.env if available", () => {
			// Mock process.env
			const _originalEnv = { ...process.env };
			process.env.TEST_ENV_KEY = "test-value";

			const val = getEnv("TEST_ENV_KEY");
			expect(val).toBe("test-value");

			// Clean up
			delete process.env.TEST_ENV_KEY;
		});
	});
});
