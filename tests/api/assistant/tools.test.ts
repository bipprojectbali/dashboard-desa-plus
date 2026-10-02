import { describe, expect, it } from "bun:test";
import { createRingkasanBerandaTool } from "@/api/assistant/tools/beranda.tool";
import { createStatistikDemografiTool } from "@/api/assistant/tools/demografi.tool";
import { createKinerjaDivisiTool } from "@/api/assistant/tools/divisi.tool";
import { buildFaqTsQuery } from "@/api/assistant/tools/faq.repo";
import {
	createLookupFaqTool,
	FAQ_ANSWER_MAX_CHARS,
} from "@/api/assistant/tools/faq.tool";
import {
	createRingkasanKeuanganTool,
	parseTahun,
} from "@/api/assistant/tools/keuangan.tool";
import { createStatistikPengaduanTool } from "@/api/assistant/tools/pengaduan.tool";
import {
	ASSISTANT_TOOLS,
	getAvailableTools,
} from "@/api/assistant/tools/registry";
import type { ToolContext } from "@/api/assistant/tools/types";
import type { FeatureKey } from "@/utils/permission";
import {
	APBDES_ENTRIES,
	BERANDA,
	DEMOGRAFI,
	DIVISI,
	KPI,
	PENGADUAN,
	SENSITIVE_MARKER,
} from "./__fixtures__/wall-data";

/** Enam tool fitur 1 dengan builder palsu — tanpa jaringan/DB. */

const ctx: ToolContext = {
	user: { id: "u1", role: "user" },
	allowedFeatures: new Set(),
	now: new Date("2026-10-01T02:00:00Z"),
};

async function run(
	tool: ReturnType<typeof createRingkasanBerandaTool>,
	args: Record<string, unknown> = {},
) {
	return tool.handler(args, ctx);
}

describe("registry — izin per tool", () => {
	const expected: Record<string, FeatureKey> = {
		ringkasan_beranda: "view-dashboard",
		ringkasan_keuangan: "view-keuangan",
		statistik_pengaduan: "view-pengaduan",
		statistik_demografi: "view-demografi",
		kinerja_divisi: "view-kinerja-divisi",
		lookup_faq: "use-ai-assistant",
		buka_halaman: "use-ai-assistant",
		tunjukkan_elemen: "use-ai-assistant",
		klik_elemen: "use-ai-assistant",
		pilih: "use-ai-assistant",
		pandu_langkah: "use-ai-assistant",
	};

	it("enam tool MVP + lima tool penunjuk terdaftar dengan requiredFeature sesuai rancangan", () => {
		expect(
			Object.fromEntries(
				ASSISTANT_TOOLS.map((t) => [t.name, t.requiredFeature]),
			),
		).toEqual(expected);
	});

	for (const [name, feature] of Object.entries(expected)) {
		it(`${name} hanya tersedia dengan izin ${feature}`, () => {
			const others = Object.values(expected).filter((f) => f !== feature);
			const without = getAvailableTools({ allowedFeatures: new Set(others) });
			const withIt = getAvailableTools({ allowedFeatures: new Set([feature]) });
			expect(without.map((t) => t.name)).not.toContain(name);
			expect(withIt.map((t) => t.name)).toContain(name);
		});
	}

	it("nama snake_case, deskripsi bahasa Indonesia terisi, parameter objek", () => {
		for (const t of ASSISTANT_TOOLS) {
			expect(t.name).toMatch(/^[a-z]+(_[a-z]+)*$/);
			expect(t.description.length).toBeGreaterThan(40);
			expect(t.parameters.type).toBe("object");
		}
	});
});

describe("penyaringan field sensitif", () => {
	it("statistik_pengaduan: tanpa nama pengusul, judul usulan warga, atau id internal", async () => {
		const tool = createStatistikPengaduanTool({
			buildPengaduan: async () => PENGADUAN,
		});
		const res = await run(tool);
		const json = JSON.stringify(res);
		expect(res.ok).toBe(true);
		expect(json).not.toContain(SENSITIVE_MARKER);
		expect(json).not.toContain("namaPengusul");
		expect(json).toContain('"jumlahUsulanMusrenbangTerbaru":1');
		expect(json).toContain("Surat Keterangan Usaha");
		expect(json).toContain('"selesai":28');
	});

	it("kinerja_divisi: isi pesan diskusi dibuang, judul kegiatan tetap", async () => {
		const tool = createKinerjaDivisiTool({ buildDivisi: async () => DIVISI });
		const json = JSON.stringify(await run(tool));
		expect(json).not.toContain(SENSITIVE_MARKER);
		expect(json).not.toContain("Pak Budi");
		expect(json).toContain("Perbaikan saluran irigasi");
		expect(json).toContain('"divisi":"Pembangunan","tanggal":"2026-09-28"');
	});

	it("statistik_demografi: agregat saja", async () => {
		const tool = createStatistikDemografiTool({
			buildDemografi: async () => DEMOGRAFI,
		});
		const res = await run(tool);
		expect(res).toEqual({
			ok: true,
			data: expect.objectContaining({
				ringkasan: {
					jumlahPenduduk: 5120,
					jumlahKepalaKeluarga: 1500,
					pendudukMiskin: 210,
				},
				perBanjar: [
					{
						banjar: "Banjar Tengah",
						penduduk: 900,
						kepalaKeluarga: 250,
						miskin: 30,
					},
				],
			}),
		});
	});
});

describe("ringkasan_beranda", () => {
	it("menggabungkan KPI & beranda, membuang warna/gambar, agenda dibatasi", async () => {
		const tool = createRingkasanBerandaTool({
			buildKpi: async () => KPI,
			buildBeranda: async () => BERANDA,
		});
		const res = await run(tool);
		const json = JSON.stringify(res);
		expect(json).toContain('"jumlahPenduduk":5120');
		expect(json).not.toContain("color");
		expect(json).not.toContain("/x.png");
		if (!res.ok) throw new Error("harus ok");
		const data = res.data as { agendaMendatang: unknown[] };
		expect(data.agendaMendatang).toHaveLength(10);
	});

	it("satu sumber gagal → sisanya tetap; keduanya gagal → error", async () => {
		const partial = createRingkasanBerandaTool({
			buildKpi: async () => KPI,
			buildBeranda: async () => {
				throw new Error("NOC mati");
			},
		});
		expect(JSON.stringify(await run(partial))).toContain('"umkmAktif":87');

		const broken = createRingkasanBerandaTool({
			buildKpi: async () => {
				throw new Error("x");
			},
			buildBeranda: async () => {
				throw new Error("y");
			},
		});
		await expect(run(broken)).rejects.toThrow("Beranda sources unavailable");
	});
});

describe("ringkasan_keuangan", () => {
	const tool = createRingkasanKeuanganTool({
		fetchEntries: async () => APBDES_ENTRIES,
	});

	it("tanpa tahun → tahun terbaru + daftar tahun tersedia", async () => {
		const res = await run(tool);
		expect(res).toEqual({
			ok: true,
			data: expect.objectContaining({
				tahun: 2025,
				tahunTersedia: [2025, 2024],
			}),
		});
		if (!res.ok) throw new Error("harus ok");
		const data = res.data as { bulanan: Array<{ bulan: string }> };
		expect(data.bulanan[0]?.bulan).toBe("Januari");
	});

	it("tahun tertentu (angka atau teks) dipilih", async () => {
		expect(await run(tool, { tahun: 2024 })).toMatchObject({
			ok: true,
			data: { tahun: 2024 },
		});
		expect(await run(tool, { tahun: "2024" })).toMatchObject({
			ok: true,
			data: { tahun: 2024 },
		});
	});

	it("tahun tak ada → error menyebut tahun yang tersedia", async () => {
		expect(await run(tool, { tahun: 2019 })).toEqual({
			ok: false,
			error:
				"Data APBDes tahun 2019 tidak tersedia. Tahun yang tersedia: 2025, 2024.",
		});
	});

	it("tahun tidak valid & data kosong → error jelas", async () => {
		expect(await run(tool, { tahun: "tahun lalu" })).toMatchObject({
			ok: false,
		});
		const empty = createRingkasanKeuanganTool({ fetchEntries: async () => [] });
		expect(await run(empty)).toEqual({
			ok: false,
			error: "Data APBDes belum tersedia.",
		});
	});

	it("parseTahun", () => {
		expect(parseTahun(undefined)).toBeUndefined();
		expect(parseTahun("")).toBeUndefined();
		expect(parseTahun(2025)).toBe(2025);
		expect(parseTahun(" 2025 ")).toBe(2025);
		expect(parseTahun(2025.5)).toBeNull();
		expect(parseTahun(-1)).toBeNull();
	});
});

describe("lookup_faq", () => {
	it("buildFaqTsQuery: kata ≥3 huruf, unik, awalan, tanpa sintaks tsquery", () => {
		expect(buildFaqTsQuery("Bagaimana cara ekspor data?")).toBe(
			"bagaimana:* | cara:* | ekspor:* | data:*",
		);
		expect(buildFaqTsQuery("a & b | ! ( ) :*")).toBeNull();
		expect(buildFaqTsQuery("data' | !x DATA")).toBe("data:*");
	});

	it("meneruskan pertanyaan, memotong jawaban panjang", async () => {
		const seen: string[] = [];
		const tool = createLookupFaqTool({
			search: async (q) => {
				seen.push(q);
				return [
					{
						question: "Cara ekspor?",
						answer: "x".repeat(2000),
						category: "Umum",
					},
				];
			},
		});
		const res = await run(tool, { pertanyaan: "cara ekspor" });
		expect(seen).toEqual(["cara ekspor"]);
		if (!res.ok) throw new Error("harus ok");
		const data = res.data as {
			jumlah: number;
			hasil: Array<{ jawaban: string }>;
		};
		expect(data.jumlah).toBe(1);
		expect(data.hasil[0]?.jawaban).toHaveLength(FAQ_ANSWER_MAX_CHARS + 1);
	});

	it("pertanyaan kosong → error tanpa query", async () => {
		const tool = createLookupFaqTool({
			search: async () => {
				throw new Error("tidak boleh dipanggil");
			},
		});
		expect(await run(tool, {})).toEqual({
			ok: false,
			error: "Parameter pertanyaan wajib diisi.",
		});
	});
});
