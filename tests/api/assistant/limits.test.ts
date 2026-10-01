import { describe, expect, it } from "bun:test";
import { DEFAULT_ASSISTANT_SETTINGS } from "@/api/assistant/config/settings.repo";
import {
	checkDailyQuota,
	checkInput,
	dailyMessageLimitFor,
	historyTake,
	SlidingWindowRateLimiter,
	secondsUntilResetWita,
	startOfDayWita,
} from "@/api/assistant/limits/usage";

/** Batas pemakaian assistant — fungsi murni, waktu disuntik. */
const SETTINGS = { ...DEFAULT_ASSISTANT_SETTINGS, kioskUserId: "kiosk-1" };

describe("startOfDayWita", () => {
	it("00:00 WITA = 16:00 UTC hari sebelumnya", () => {
		// 2026-10-01 10:00 WITA
		const now = new Date("2026-10-01T02:00:00Z");
		expect(startOfDayWita(now).toISOString()).toBe("2026-09-30T16:00:00.000Z");
	});

	it("tepat setelah tengah malam WITA masuk hari baru", () => {
		const now = new Date("2026-09-30T16:00:01Z"); // 00:00:01 WITA 1 Okt
		expect(startOfDayWita(now).toISOString()).toBe("2026-09-30T16:00:00.000Z");
		const before = new Date("2026-09-30T15:59:59Z"); // 23:59:59 WITA 30 Sep
		expect(startOfDayWita(before).toISOString()).toBe(
			"2026-09-29T16:00:00.000Z",
		);
	});

	it("detik sampai reset berikutnya", () => {
		expect(secondsUntilResetWita(new Date("2026-09-30T15:59:00Z"))).toBe(60);
	});
});

describe("dailyMessageLimitFor (kuota kiosk)", () => {
	it("akun kiosk memakai dailyMessageLimitKiosk (100)", () => {
		expect(dailyMessageLimitFor(SETTINGS, "kiosk-1")).toBe(100);
	});

	it("user lain memakai dailyMessageLimitPerUser (50)", () => {
		expect(dailyMessageLimitFor(SETTINGS, "user-1")).toBe(50);
	});

	it("tanpa akun kiosk dipilih, tidak ada user yang memakai kuota kiosk", () => {
		expect(
			dailyMessageLimitFor({ ...SETTINGS, kioskUserId: null }, "kiosk-1"),
		).toBe(50);
	});
});

describe("checkDailyQuota", () => {
	const now = new Date("2026-10-01T02:00:00Z");
	const base = { settings: SETTINGS, now, tokensToday: 0 };

	it("di bawah batas → lolos", () => {
		expect(
			checkDailyQuota({ ...base, userId: "user-1", messagesToday: 49 }),
		).toBeNull();
	});

	it("user mencapai 50 → 429 Kuota harian habis + Retry-After", () => {
		const v = checkDailyQuota({ ...base, userId: "user-1", messagesToday: 50 });
		expect(v).toMatchObject({
			code: "daily_user",
			status: 429,
			message: "Kuota harian habis.",
		});
		expect(v?.retryAfterSec).toBe(14 * 3600);
	});

	it("kiosk boleh sampai 100", () => {
		expect(
			checkDailyQuota({ ...base, userId: "kiosk-1", messagesToday: 99 }),
		).toBeNull();
		expect(
			checkDailyQuota({ ...base, userId: "kiosk-1", messagesToday: 100 })?.code,
		).toBe("daily_user");
	});

	it("token global habis → daily_global", () => {
		const v = checkDailyQuota({
			...base,
			userId: "user-1",
			messagesToday: 0,
			tokensToday: 1_000_000,
		});
		expect(v).toMatchObject({ code: "daily_global", status: 429 });
	});

	it("0 = tanpa batas", () => {
		const unlimited = {
			...SETTINGS,
			dailyMessageLimitPerUser: 0,
			dailyMessageLimitKiosk: 0,
			dailyTokenLimitGlobal: 0,
		};
		for (const userId of ["user-1", "kiosk-1"]) {
			expect(
				checkDailyQuota({
					settings: unlimited,
					now,
					userId,
					messagesToday: 10_000,
					tokensToday: 10_000_000,
				}),
			).toBeNull();
		}
	});
});

describe("checkInput & historyTake", () => {
	it("kosong → 422; terlalu panjang → 422; 0 = tanpa batas", () => {
		expect(checkInput("   ", 2000)?.code).toBe("input_empty");
		expect(checkInput("a".repeat(2001), 2000)).toMatchObject({
			code: "input_too_long",
			status: 422,
		});
		expect(checkInput("a".repeat(2000), 2000)).toBeNull();
		expect(checkInput("a".repeat(50_000), 0)).toBeNull();
	});

	it("historyWindow 0 = semua riwayat", () => {
		expect(historyTake(20)).toBe(20);
		expect(historyTake(0)).toBeUndefined();
	});
});

describe("SlidingWindowRateLimiter", () => {
	it("maks N per 60 detik per user, jendela bergeser", () => {
		const limiter = new SlidingWindowRateLimiter(60_000);
		for (let i = 0; i < 6; i++)
			expect(limiter.hit("u1", 6, i * 1000)).toBeNull();
		const blocked = limiter.hit("u1", 6, 6000);
		expect(blocked).toMatchObject({ code: "rate_limited", status: 429 });
		expect(blocked?.retryAfterSec).toBe(54);
		expect(limiter.hit("u2", 6, 6000)).toBeNull();
		expect(limiter.hit("u1", 6, 60_000)).toBeNull();
	});

	it("limit 0 = tanpa batas; prune membuang kunci lama", () => {
		const limiter = new SlidingWindowRateLimiter(60_000);
		for (let i = 0; i < 100; i++) expect(limiter.hit("u1", 0, i)).toBeNull();
		limiter.hit("u2", 6, 0);
		limiter.prune(120_000);
		expect(limiter.size).toBe(0);
	});
});
