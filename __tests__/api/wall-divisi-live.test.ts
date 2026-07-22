import { describe, expect, it } from "bun:test";
import {
	mapWallDiscussions,
	type NocDiscussionRaw,
} from "@/api/transforms/noc-discussions";
import { mapDocuments } from "@/api/transforms/noc-documents";
import { mapProgres } from "@/api/transforms/noc-progres";
import { mapWallProjects } from "@/api/transforms/noc-projects";

describe("mapProgres", () => {
	it("maps label + value + color", () => {
		const raw = [
			{ text: "0%", value: 0, color: "#177AD5", label: "Segera Dikerjakan" },
			{ text: "50%", value: "50", color: "#fac858", label: "Dikerjakan" },
		];
		const result = mapProgres(raw);
		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({
			name: "Segera Dikerjakan",
			value: 0,
			color: "#177AD5",
		});
		expect(result[1]).toEqual({
			name: "Dikerjakan",
			value: 50,
			color: "#fac858",
		});
	});

	it("fallback ke text jika label kosong", () => {
		const raw = [{ text: "100%", value: 100, color: "#92cc76" }];
		const result = mapProgres(raw);
		expect(result[0]?.name).toBe("100%");
	});

	it("value string di-coerce ke number", () => {
		const raw = [{ text: "25%", value: "25.5", color: "#ccc" }];
		expect(mapProgres(raw)[0]?.value).toBe(25.5);
	});
});

describe("mapDocuments", () => {
	it("maps label → name, value → jumlah", () => {
		const raw = [
			{ label: "Gambar", value: 12, color: "#fac858" },
			{ label: "Dokumen", value: 8, color: "#92cc76" },
		];
		const result = mapDocuments(raw);
		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({ name: "Gambar", jumlah: 12, color: "#fac858" });
		expect(result[1]).toEqual({ name: "Dokumen", jumlah: 8, color: "#92cc76" });
	});
});

describe("mapWallProjects", () => {
	it("maps status=2 → SELESAI, lainnya → BERJALAN", () => {
		const raw = [
			{
				id: "1",
				title: "A",
				status: 2,
				progress: 100,
				group: "Pemerintahan",
				createdAt: "2024-01-01",
			},
			{
				id: "2",
				title: "B",
				status: 1,
				progress: 60,
				group: "Pembangunan",
				updatedAt: "2024-02-01",
			},
		];
		const result = mapWallProjects(raw);
		expect(result[0]?.status).toBe("SELESAI");
		expect(result[1]?.status).toBe("BERJALAN");
	});

	it("progress default 100 jika status SELESAI dan progress kosong", () => {
		const raw = [{ id: "3", title: "C", status: 2, group: "Umum" }];
		expect(mapWallProjects(raw)[0]?.progress).toBe(100);
	});

	it("progress default 50 jika status bukan SELESAI dan progress kosong", () => {
		const raw = [{ id: "4", title: "D", status: 1, group: "Umum" }];
		expect(mapWallProjects(raw)[0]?.progress).toBe(50);
	});

	it("divisi fallback 'Umum' jika group kosong", () => {
		const raw = [{ id: "5", title: "E", status: 1 }];
		expect(mapWallProjects(raw)[0]?.divisi).toBe("Umum");
	});
});

describe("mapWallDiscussions", () => {
	const raw: NocDiscussionRaw[] = [
		{
			id: "d1",
			title: "Judul",
			desc: "Pesan diskusi",
			date: "2024-03-01",
			user: "Budi",
			group: "Pemerintahan",
		},
		{
			id: "d2",
			title: "Judul2",
			desc: "",
			date: "2024-03-02",
			user: "Ani",
			group: "",
		},
	];

	it("memetakan field yang benar", () => {
		const result = mapWallDiscussions(raw);
		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({
			id: "d1",
			message: "Pesan diskusi",
			divisi: "Pemerintahan",
			date: "2024-03-01",
		});
	});

	it("fallback message ke title jika desc kosong", () => {
		const result = mapWallDiscussions(raw);
		expect(result[1]?.message).toBe("Judul2");
	});

	it("fallback divisi ke 'General' jika group kosong", () => {
		const result = mapWallDiscussions(raw);
		expect(result[1]?.divisi).toBe("General");
	});

	it("GUARD: tidak ada key senderName atau senderImage di hasil", () => {
		const result = mapWallDiscussions(raw);
		for (const item of result) {
			expect(Object.keys(item)).not.toContain("senderName");
			expect(Object.keys(item)).not.toContain("senderImage");
			expect(Object.keys(item)).not.toContain("user");
		}
	});

	it("GUARD: hanya punya key id, message, divisi, date", () => {
		const ALLOWED = ["id", "message", "divisi", "date"];
		const result = mapWallDiscussions(raw);
		for (const item of result) {
			for (const key of Object.keys(item)) {
				expect(ALLOWED).toContain(key);
			}
		}
	});
});
