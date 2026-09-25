import { describe, expect, it } from "bun:test";
import { CHART } from "@/theme";

// Hex Tailwind-500 saturated lama yang sengaja DIHAPUS karena "ngejreng" di
// TV Vivid mode. Test ini jaga agar tak ada yang tanpa sengaja kembali.
const LOUD_HEX = new Set([
	"#EF4444", // red-500
	"#F87171", // red-400
	"#3B82F6", // blue-500
	"#60A5FA", // blue-400
	"#22C55E", // green-500
	"#34D399", // emerald-400
	"#10B981", // emerald-500
	"#F59E0B", // amber-500
	"#FACC15", // yellow-400
	"#FBBF3B", // amber
	"#F97316", // orange-500
	"#A78BFA", // violet-400
	"#38BDF8", // sky-400
	"#A855F7", // purple-500
	"#8B5CF6", // violet-500
	"#EC4899", // pink-500
]);

describe("CHART palette (soft, TV-robust)", () => {
	it("semua token berupa hex 6-digit valid", () => {
		for (const [key, val] of Object.entries(CHART)) {
			expect(val, `${key} harus hex #RRGGBB`).toMatch(/^#[0-9A-Fa-f]{6}$/);
		}
	});

	it("tidak memakai hex loud Tailwind-500 saturated", () => {
		for (const [key, val] of Object.entries(CHART)) {
			expect(LOUD_HEX.has(val.toUpperCase()), `${key}=${val} masih loud`).toBe(
				false,
			);
		}
	});

	it("chroma diredam: tidak ada channel yang penuh (255) atau nol pada aksen", () => {
		// Warna ngejreng ciri khasnya punya channel ekstrem (mis. #EF4444 → R=239
		// tinggi, G/B=68 rendah). Token soft menaikkan channel rendah agar
		// saturasi turun. Kecualikan `gray` (memang netral).
		for (const [key, val] of Object.entries(CHART)) {
			if (key === "gray") continue;
			const r = Number.parseInt(val.slice(1, 3), 16);
			const g = Number.parseInt(val.slice(3, 5), 16);
			const b = Number.parseInt(val.slice(5, 7), 16);
			const min = Math.min(r, g, b);
			const max = Math.max(r, g, b);
			// Saturasi longgar: channel terendah tak boleh terlalu gelap (≥60)
			// supaya warna tidak "meledak" kontrasnya di layar besar.
			expect(
				min,
				`${key}=${val} channel terendah terlalu ekstrem`,
			).toBeGreaterThanOrEqual(60);
			// Spread antar channel dibatasi agar tak over-saturated.
			expect(
				max - min,
				`${key}=${val} spread channel terlalu lebar`,
			).toBeLessThanOrEqual(150);
		}
	});

	it("token semantik saling berbeda (status distinguishable)", () => {
		const semantic = [CHART.red, CHART.green, CHART.blue, CHART.amber];
		expect(new Set(semantic).size).toBe(semantic.length);
	});
});
