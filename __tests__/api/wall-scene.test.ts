import { describe, expect, it } from "bun:test";
import { nextSceneIndex } from "@/components/wall/use-scene-rotation";

describe("nextSceneIndex (pure rotation)", () => {
	it("wrap-around dari index terakhir ke 0 (count 3)", () => {
		expect(nextSceneIndex(0, 3)).toBe(1);
		expect(nextSceneIndex(1, 3)).toBe(2);
		expect(nextSceneIndex(2, 3)).toBe(0);
	});

	it("count 1 selalu 0", () => {
		expect(nextSceneIndex(0, 1)).toBe(0);
	});

	it("count 0/negatif tidak crash dan tak pernah negatif", () => {
		expect(nextSceneIndex(0, 0)).toBe(0);
		expect(nextSceneIndex(5, 0)).toBe(0);
		expect(nextSceneIndex(0, -1)).toBe(0);
	});
});
