import { describe, expect, it } from "bun:test";
import api from "@/api";
import {
	mapDiscussions,
	type NocDiscussionRaw,
} from "@/api/transforms/noc-discussions";
import {
	DIVISION_COLOR_FALLBACK,
	DIVISION_COLOR_MAP,
	mapActiveDivisions,
	type NocDivisionRaw,
} from "@/api/transforms/noc-divisions";

// ---------------------------------------------------------------------------
// Unit: mapActiveDivisions (import fungsi asli, bukan duplikat lokal)
// ---------------------------------------------------------------------------

describe("mapActiveDivisions", () => {
	it("memetakan name=division, activityCount=totalKegiatan, id terisi", () => {
		const input: NocDivisionRaw[] = [
			{ id: "1", division: "Pemerintahan", totalKegiatan: 10 },
		];
		const result = mapActiveDivisions(input);
		expect(result[0].name).toBe("Pemerintahan");
		expect(result[0].activityCount).toBe(10);
		expect(result[0].id).toBe("1");
	});

	it("warna dari DIVISION_COLOR_MAP untuk divisi dikenal", () => {
		const input: NocDivisionRaw[] = [
			{ id: "2", division: "Pemerintahan", totalKegiatan: 5 },
		];
		expect(mapActiveDivisions(input)[0].color).toBe(
			DIVISION_COLOR_MAP.Pemerintahan,
		);
	});

	it("fallback color untuk divisi tidak dikenal", () => {
		const input: NocDivisionRaw[] = [
			{ id: "x", division: "Divisi Baru", totalKegiatan: 1 },
		];
		expect(mapActiveDivisions(input)[0].color).toBe(DIVISION_COLOR_FALLBACK);
	});

	it("array kosong → array kosong", () => {
		expect(mapActiveDivisions([])).toEqual([]);
	});
});

// ---------------------------------------------------------------------------
// Unit: mapDiscussions (shape terprobe dari NOC live)
// ---------------------------------------------------------------------------

const SAMPLE_RAW: NocDiscussionRaw = {
	id: "cmqq11k",
	title: "Pelaksana Kewilayahan (KBD)",
	desc: "Forum komunikasi KBD",
	date: "23 Jun 2026",
	user: "I. B. Surya Prabhawa Manuaba",
	group: "Dinas",
};

describe("mapDiscussions", () => {
	it("memetakan semua field dari shape terprobe", () => {
		const result = mapDiscussions([SAMPLE_RAW]);
		expect(result[0].id).toBe("cmqq11k");
		expect(result[0].message).toBe("Forum komunikasi KBD");
		expect(result[0].senderName).toBe("I. B. Surya Prabhawa Manuaba");
		expect(result[0].senderImage).toBeNull();
		expect(result[0].divisionName).toBe("Dinas");
		expect(result[0].createdAt).toBe("23 Jun 2026");
	});

	it("fallback message=title jika desc kosong", () => {
		const input: NocDiscussionRaw = {
			...SAMPLE_RAW,
			desc: "",
			title: "Judul Fallback",
		};
		expect(mapDiscussions([input])[0].message).toBe("Judul Fallback");
	});

	it("fallback senderName=Anonymous jika user kosong", () => {
		const input: NocDiscussionRaw = { ...SAMPLE_RAW, user: "" };
		expect(mapDiscussions([input])[0].senderName).toBe("Anonymous");
	});

	it("fallback divisionName=General jika group kosong", () => {
		const input: NocDiscussionRaw = { ...SAMPLE_RAW, group: "" };
		expect(mapDiscussions([input])[0].divisionName).toBe("General");
	});

	it("array kosong → array kosong", () => {
		expect(mapDiscussions([])).toEqual([]);
	});
});

// ---------------------------------------------------------------------------
// Integration: Auth guard /latest-discussion
// ---------------------------------------------------------------------------

describe("NOC latest-discussion auth guard", () => {
	it("tanpa auth → 401", async () => {
		const res = await api.handle(
			new Request(
				"http://localhost/api/noc/latest-discussion?idDesa=desa1&limit=6",
			),
		);
		expect(res.status).toBe(401);
	});

	it("tanpa idDesa → bukan 400 atau 422 (auth guard mendahului validasi query)", async () => {
		const res = await api.handle(
			new Request("http://localhost/api/noc/latest-discussion"),
		);
		expect([400, 422]).not.toContain(res.status);
	});
});
