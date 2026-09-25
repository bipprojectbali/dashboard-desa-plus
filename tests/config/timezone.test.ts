import { describe, expect, it } from "bun:test";
import {
	APP_TIMEZONE,
	APP_TIMEZONE_LABEL,
	APP_TIMEZONE_OFFSET_MINUTES,
} from "@/config/timezone";

// Desa Darmasaba berada di Bali → zona waktu tetap WITA (GMT+8).
// Zona ini fixed (bukan preferensi per-user); test menjaga konsistensi
// antara IANA name, label, dan offset agar tidak drift saat diubah.
describe("APP_TIMEZONE config", () => {
	it("menggunakan IANA zone WITA (Asia/Makassar)", () => {
		expect(APP_TIMEZONE).toBe("Asia/Makassar");
	});

	it("berlabel WITA", () => {
		expect(APP_TIMEZONE_LABEL).toBe("WITA");
	});

	it("offset 480 menit (GMT+8)", () => {
		expect(APP_TIMEZONE_OFFSET_MINUTES).toBe(480);
	});

	it("offset konstanta cocok dengan offset aktual IANA zone", () => {
		// Ambil offset aktual Asia/Makassar via Intl untuk memastikan
		// APP_TIMEZONE_OFFSET_MINUTES tidak menyimpang dari zona sebenarnya.
		// Pakai tanggal tetap (tanpa DST di Indonesia) agar deterministik.
		const ref = new Date("2026-07-22T00:00:00Z");
		const parts = new Intl.DateTimeFormat("en-US", {
			timeZone: APP_TIMEZONE,
			timeZoneName: "shortOffset",
		})
			.formatToParts(ref)
			.find((p) => p.type === "timeZoneName")?.value;
		// Format contoh: "GMT+8"
		expect(parts).toBe("GMT+8");
	});

	it("tidak menggunakan zona lama Asia/Jakarta (WIB)", () => {
		expect(APP_TIMEZONE).not.toBe("Asia/Jakarta");
	});
});
