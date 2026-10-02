import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { executeUiAction } from "@/components/assistant/pointer/pointer-executor";
import { hidePointer } from "@/components/assistant/pointer/pointer-store";
import { WidgetCard } from "@/components/wall/widget-card";
import { WidgetSlot } from "@/components/wall/widget-slot";

/** F2-w: penanda wall.<id> di WidgetCard + executor klien membatasi aksi di /wall. */

const stubEnv = (pathname: string) => ({
	anchorTimeoutMs: 100,
	settleMs: 0,
	pointAt: async () => {},
	pathname: () => pathname,
});

function render(node: ReturnType<typeof createElement>) {
	return renderToStaticMarkup(
		createElement(
			QueryClientProvider,
			{ client: new QueryClient() },
			createElement(MantineProvider, null, node),
		),
	);
}

beforeEach(() => {
	document.body.innerHTML = "";
});
afterEach(() => hidePointer());

describe("WidgetCard", () => {
	it("merender data-ai-target=wall.<id> bila widgetId diberikan", () => {
		const html = render(
			createElement(WidgetCard, { title: "KPI", widgetId: "beranda-kpi" }),
		);
		expect(html).toContain('data-ai-target="wall.beranda-kpi"');
	});

	it("tanpa widgetId tidak ada penanda", () => {
		expect(render(createElement(WidgetCard, { title: "X" }))).not.toContain(
			"data-ai-target",
		);
	});

	it("WidgetSlot memasang penanda sesuai id widget; id tak dikenal tanpa penanda", () => {
		const ok = render(
			createElement(WidgetSlot, { id: "beranda-kpi", snapshot: null }),
		);
		expect(ok).toContain('data-ai-target="wall.beranda-kpi"');
		const unknown = render(
			createElement(WidgetSlot, { id: "tidak-ada", snapshot: null }),
		);
		expect(unknown).not.toContain("data-ai-target");
	});
});

describe("executor klien di /wall", () => {
	it("pointTo wall.* yang ada di DOM berhasil", async () => {
		document.body.innerHTML = render(
			createElement(WidgetCard, { title: "KPI", widgetId: "keuangan-kpi" }),
		);
		expect(
			await executeUiAction(
				{ type: "pointTo", target: "wall.keuangan-kpi" },
				stubEnv("/wall"),
			),
		).toEqual({ ok: true });
	});

	it("widget tidak ada di layout → anchor-timeout (pesan pointerFailed, bukan error)", async () => {
		expect(
			await executeUiAction(
				{ type: "pointTo", target: "wall.keuangan-kpi" },
				stubEnv("/wall"),
			),
		).toEqual({ ok: false, reason: "anchor-timeout" });
	});

	it("navigate, click, dan pilih ditolak", async () => {
		for (const action of [
			{ type: "navigate", route: "/keuangan-anggaran" },
			{ type: "click", target: "wall.keuangan-kpi" },
			{ type: "pilih", target: "wall.keuangan-kpi", value: "2025" },
		]) {
			const navigate = () => {
				throw new Error("tidak boleh navigasi");
			};
			expect(
				await executeUiAction(action, { ...stubEnv("/wall"), navigate }),
			).toEqual({ ok: false, reason: "wall-restricted" });
		}
	});

	it("target non-wall ditolak walau elemennya ada di DOM", async () => {
		document.body.innerHTML = '<div data-ai-target="keuangan.laporan"></div>';
		expect(
			await executeUiAction(
				{ type: "pointTo", target: "keuangan.laporan" },
				stubEnv("/wall"),
			),
		).toEqual({ ok: false, reason: "unknown-target" });
	});
});

describe("executor klien di luar /wall (tidak berubah)", () => {
	it("navigate ke rute terdaftar tetap jalan", async () => {
		let to = "";
		const r = await executeUiAction(
			{ type: "navigate", route: "/keuangan-anggaran" },
			{
				...stubEnv("/"),
				navigate: (route: string) => {
					to = route;
				},
			},
		);
		expect(r).toEqual({ ok: true });
		expect(to).toBe("/keuangan-anggaran");
	});

	it("wall.* ditolak sebagai target tak dikenal", async () => {
		document.body.innerHTML = render(
			createElement(WidgetCard, { title: "KPI", widgetId: "keuangan-kpi" }),
		);
		expect(
			await executeUiAction(
				{ type: "pointTo", target: "wall.keuangan-kpi" },
				stubEnv("/"),
			),
		).toEqual({ ok: false, reason: "unknown-target" });
	});
});
