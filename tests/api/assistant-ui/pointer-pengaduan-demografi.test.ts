import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { executeUiAction } from "@/components/assistant/pointer/pointer-executor";
import { hidePointer } from "@/components/assistant/pointer/pointer-store";
import DemografiPekerjaan from "@/components/demografi-pekerjaan";
import PengaduanLayananPublik from "@/components/pengaduan-layanan-publik";
import {
	DEMOGRAFI_TARGETS,
	PENGADUAN_TARGETS,
	POINTER_ROUTES,
	POINTER_TARGETS,
	type PointerTarget,
} from "@/config/assistant-pointer";

/** F2-e: render nyata Pengaduan & Layanan Publik dan Demografi & Kependudukan → executor menemukan anchor di DOM. */

const PENGADUAN_DATA = {
	stats: { total: 10, baru: 3, diproses: 2, selesai: 4 },
	trends: [{ bulan: "Jan", count: 4 }],
	surat_terbanyak: [{ jenis: "SKU", count: 5 }],
	pengajuan_terbaru: [
		{
			id: "1",
			kategori: "jalan",
			sub_kategori: "rusak",
			status: "baru",
			created_at: "2026-01-01T00:00:00Z",
		},
	],
	musrenbang: [
		{
			id: "m1",
			judul: "Ide A",
			nama_pengusul: "Warga Uji", // test-only
			created_at: "2026-01-01T00:00:00Z",
		},
	],
};

const DEMOGRAFI_DATA = {
	stats: { total: 1234, heads: 400, poor: 12 },
	ageData: [
		{ ageRange: "0-5", total: 10 },
		{ ageRange: "6-10", total: 20 },
	],
	jobData: [{ job: "Petani", total: 30 }],
	religionRows: [
		{ tahun: 2025, agama: "HINDU", jumlah: 100 },
		{ tahun: 2024, agama: "ISLAM", jumlah: 50 },
	],
	banjarData: [
		{
			id: "b1",
			name: "Banjar Uji", // test-only
			totalPopulation: 100,
			totalKK: 30,
			totalPoor: 2,
		},
	],
	sektorData: [{ sektor: "Pertanian", value: 40 }],
	births: 5,
	deaths: 2,
	moveIn: 3,
	moveOut: 1,
};

function renderPage(page: () => ReturnType<typeof createElement>): string {
	const client = new QueryClient();
	client.setQueryData(["pengaduan", "noc"], PENGADUAN_DATA);
	client.setQueryData(["demografi", "all"], DEMOGRAFI_DATA);
	return renderToStaticMarkup(
		createElement(
			QueryClientProvider,
			{ client },
			createElement(MantineProvider, null, page()),
		),
	);
}

const env = () => ({
	doc: document,
	targets: POINTER_TARGETS,
	routes: POINTER_ROUTES,
	anchorTimeoutMs: 100,
	settleMs: 0,
	reducedMotion: () => false,
	pointAt: async () => {},
});

const point = (id: string) =>
	executeUiAction({ type: "pointTo", target: id }, env());

/** Target yang hanya muncul saat data gagal dimuat (Alert error) dan tidak ada di render normal. */
const CONDITIONAL = new Set(["pengaduan.coba-lagi", "demografi.coba-lagi"]);

const PAGES: Array<{
	name: string;
	page: () => ReturnType<typeof createElement>;
	targets: readonly PointerTarget[];
}> = [
	{
		name: "Pengaduan & Layanan Publik",
		page: () => createElement(PengaduanLayananPublik),
		targets: PENGADUAN_TARGETS,
	},
	{
		name: "Demografi & Kependudukan",
		page: () => createElement(DemografiPekerjaan),
		targets: DEMOGRAFI_TARGETS,
	},
];

beforeEach(() => {
	document.body.innerHTML = "";
});
afterEach(() => hidePointer());

describe("anchor di komponen sungguhan (F2-e)", () => {
	for (const { name, page, targets } of PAGES) {
		it(`${name}: setiap target terdaftar ditemukan executor; Coba lagi hanya saat error`, async () => {
			document.body.innerHTML = renderPage(page);
			for (const t of targets) {
				const out = await point(t.id);
				expect(out).toEqual(
					CONDITIONAL.has(t.id)
						? { ok: false, reason: "anchor-timeout" }
						: { ok: true },
				);
			}
		});

		it(`${name}: tiap target muncul tepat sekali di DOM`, () => {
			const html = renderPage(page);
			for (const t of targets) {
				if (CONDITIONAL.has(t.id)) continue;
				const n = html.split(`data-ai-target="${t.id}"`).length - 1;
				expect(n).toBe(1);
			}
		});

		it(`${name}: tidak ada elemen data-ai-clickable di render`, () => {
			expect(renderPage(page)).not.toContain("data-ai-clickable");
		});
	}

	it("klik pada kartu, dropdown tahun, dan Coba lagi ditolak (bukan clickable)", async () => {
		document.body.innerHTML = renderPage(() =>
			createElement(DemografiPekerjaan),
		);
		for (const id of [
			"demografi.agama",
			"demografi.tahun-agama",
			"demografi.coba-lagi",
			"pengaduan.kpi-total",
		])
			expect(
				await executeUiAction({ type: "click", target: id }, env()),
			).toEqual({ ok: false, reason: "not-clickable" });
	});

	it("pilih pada dropdown tahun agama ditolak (bukan kontrol pilih di registry)", async () => {
		document.body.innerHTML = renderPage(() =>
			createElement(DemografiPekerjaan),
		);
		const out = await executeUiAction(
			{ type: "pilih", target: "demografi.tahun-agama", value: "2024" },
			env(),
		);
		expect(out.ok).toBe(false);
	});
});
