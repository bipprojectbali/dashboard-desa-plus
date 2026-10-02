import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { executeUiAction } from "@/components/assistant/pointer/pointer-executor";
import { hidePointer } from "@/components/assistant/pointer/pointer-store";
import { DashboardContent } from "@/components/dashboard-content";
import KinerjaDivisi from "@/components/kinerja-divisi";
import {
	BERANDA_TARGETS,
	DIVISI_TARGETS,
	POINTER_ROUTES,
	POINTER_TARGETS,
} from "@/config/assistant-pointer";

/** F2-d: render nyata halaman Beranda & Kinerja Divisi → executor menemukan anchor di DOM. */

function renderPage(page: () => ReturnType<typeof createElement>): string {
	const client = new QueryClient();
	client.setQueryData(
		["dashboard", "sdgs"],
		[{ title: "Desa Sehat", score: 80, image: null }],
	);
	client.setQueryData(["kinerja", "overview"], { activities: [] });
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

beforeEach(() => {
	document.body.innerHTML = "";
});
afterEach(() => hidePointer());

describe("anchor di komponen sungguhan", () => {
	it("Beranda: setiap target terdaftar ditemukan executor (pointTo ok)", async () => {
		document.body.innerHTML = renderPage(() => createElement(DashboardContent));
		for (const t of BERANDA_TARGETS)
			expect(
				await executeUiAction({ type: "pointTo", target: t.id }, env()),
			).toEqual({ ok: true });
	});

	it("Kinerja Divisi: semua target yang selalu tampil ditemukan; 'coba-lagi' hanya saat error", async () => {
		document.body.innerHTML = renderPage(() => createElement(KinerjaDivisi));
		for (const t of DIVISI_TARGETS) {
			const out = await executeUiAction(
				{ type: "pointTo", target: t.id },
				env(),
			);
			expect(out).toEqual(
				t.id === "divisi.coba-lagi"
					? { ok: false, reason: "anchor-timeout" }
					: { ok: true },
			);
		}
	});

	it("target divisi.teraktif adalah kartu 'Divisi Teraktif'", () => {
		document.body.innerHTML = renderPage(() => createElement(KinerjaDivisi));
		const card = document.querySelector('[data-ai-target="divisi.teraktif"]');
		expect(card?.textContent).toContain("Divisi Teraktif");
	});
});
