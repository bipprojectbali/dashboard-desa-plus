import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { executeUiAction } from "@/components/assistant/pointer/pointer-executor";
import { hidePointer } from "@/components/assistant/pointer/pointer-store";
import BumdesPage from "@/components/bumdes-page";
import JennaAnalytic from "@/components/jenna-analytic";
import KeamananPage from "@/components/keamanan-page";
import SosialPage from "@/components/sosial-page";
import {
	BUMDES_TARGETS,
	JENNA_TARGETS,
	KEAMANAN_TARGETS,
	POINTER_ROUTES,
	POINTER_TARGETS,
	type PointerTarget,
	SOSIAL_TARGETS,
} from "@/config/assistant-pointer";

/** F2-f: render nyata BUMDes, Sosial, Keamanan, dan Jenna Analytic → executor menemukan anchor di DOM. */

const BUMDES_DATA = {
	kpi: {
		umkmAktif: 3,
		totalUmkm: 5,
		omzetBulanan: 1000,
		kategoriTerbanyak: "Kuliner",
		jumlahKategoriTerbanyak: 2,
	},
	ringkasan: {
		totalPenjualan: 1000,
		kategoriAktif: 2,
		totalTransaksi: 10,
		persentasePerubahan: 5,
	},
	topProduk: [],
	kategoriOptions: [],
	umkmOptions: [],
};

const SOSIAL_DATA = {
	kesehatanStats: {
		ibuHamilAktif: 4,
		balitaTerdaftar: 20,
		alertStunting: 1,
		imunisasiLengkapPct: 90,
		pemeriksaanRutinPct: 80,
		giziBaikPct: 85,
		targetStuntingPct: 10,
	},
	posyandus: [{ isActive: true }],
	events: [],
};

const JENNA_DATA = {
	stats: {
		interaksiHariIni: 12,
		changeFromYesterday: 2,
		jawabanOtomatis: 80,
		jawabanOtomatisCount: 9,
		waktuRespon: "2s",
		belumDitindak: 1,
	},
	chartMingguan: [{ day: "Sen", count: 3 }],
	topTopics: [{ topic: "Surat", count: 4 }],
	jamTersibuk: [{ slot: "08-10", pct: 40 }],
};

function renderPage(page: () => ReturnType<typeof createElement>): string {
	const client = new QueryClient();
	client.setQueryData(["bumdes", "static", "minggu"], BUMDES_DATA);
	client.setQueryData(["bumdes", "static", "bulan"], BUMDES_DATA);
	client.setQueryData(["bumdes", "detail", "minggu", null, null], []);
	client.setQueryData(["bumdes", "detail", "bulan", null, null], []);
	client.setQueryData(["sosial", "page"], SOSIAL_DATA);
	client.setQueryData(["keamanan", "all"], {
		cctvStats: { cctvOnline: 2, laporanMingguIni: 1 },
		cctvList: [],
		laporanList: [],
	});
	client.setQueryData(["jenna", "analytics"], JENNA_DATA);
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

/** Target yang hanya muncul pada kondisi tertentu (mis. error) dan tidak ada di render awal. */
const CONDITIONAL = new Set(["sosial.coba-lagi", "keamanan.coba-lagi"]);

const PAGES: Array<{
	name: string;
	page: () => ReturnType<typeof createElement>;
	targets: readonly PointerTarget[];
}> = [
	{
		name: "BUMDes",
		page: () => createElement(BumdesPage),
		targets: BUMDES_TARGETS,
	},
	{
		name: "Sosial",
		page: () => createElement(SosialPage),
		targets: SOSIAL_TARGETS,
	},
	{
		name: "Keamanan",
		page: () => createElement(KeamananPage),
		targets: KEAMANAN_TARGETS,
	},
	{
		name: "Jenna Analytic",
		page: () => createElement(JennaAnalytic),
		targets: JENNA_TARGETS,
	},
];

beforeEach(() => {
	document.body.innerHTML = "";
});
afterEach(() => hidePointer());

describe("anchor di komponen sungguhan (F2-f)", () => {
	for (const { name, page, targets } of PAGES) {
		it(`${name}: setiap target terdaftar ditemukan executor; target kondisional hanya saat error`, async () => {
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
	}

	it("tombol rentang BUMDes & tab Sosial bisa diklik executor", async () => {
		document.body.innerHTML = renderPage(() => createElement(BumdesPage));
		for (const id of ["bumdes.rentang-minggu", "bumdes.rentang-bulan"])
			expect(
				await executeUiAction({ type: "click", target: id }, env()),
			).toEqual({ ok: true });
		document.body.innerHTML = renderPage(() => createElement(SosialPage));
		for (const id of [
			"sosial.tab-ibu-hamil",
			"sosial.tab-balita",
			"sosial.tab-penyakit",
		])
			expect(
				await executeUiAction({ type: "click", target: id }, env()),
			).toEqual({ ok: true });
	});

	it("klik pada kartu/filter/Coba lagi ditolak (bukan clickable di registry)", async () => {
		document.body.innerHTML = renderPage(() => createElement(BumdesPage));
		for (const id of ["bumdes.filter", "bumdes.kpi-omzet", "sosial.coba-lagi"])
			expect(
				await executeUiAction({ type: "click", target: id }, env()),
			).toEqual({ ok: false, reason: "not-clickable" });
	});

	it("elemen clickable di DOM persis tab/tombol rentang yang terdaftar", () => {
		const ids = (html: string) =>
			[
				...html.matchAll(
					/data-ai-target="([^"]+)"[^>]*data-ai-clickable="true"/g,
				),
			]
				.map((m) => m[1])
				.sort();
		expect(ids(renderPage(() => createElement(BumdesPage)))).toEqual([
			"bumdes.rentang-bulan",
			"bumdes.rentang-minggu",
		]);
		expect(ids(renderPage(() => createElement(SosialPage)))).toEqual([
			"sosial.tab-balita",
			"sosial.tab-ibu-hamil",
			"sosial.tab-penyakit",
		]);
		expect(ids(renderPage(() => createElement(KeamananPage)))).toEqual([]);
		expect(ids(renderPage(() => createElement(JennaAnalytic)))).toEqual([]);
	});
});
