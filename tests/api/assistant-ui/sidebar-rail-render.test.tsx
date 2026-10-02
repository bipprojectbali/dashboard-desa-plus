import { afterEach, describe, expect, it } from "bun:test";
import { MantineProvider } from "@mantine/core";
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Sidebar } from "@/components/sidebar";
import id from "@/locales/id";

/** Render nyata Sidebar (router memori) — rel ikon: ikon + label aksesibel, menu aktif ditandai, klik navigasi. */

(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const ACTIVE_PATH = "/keuangan-anggaran";
let root: Root | null = null;
let host: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	host?.remove();
	root = null;
	host = null;
});

interface Props {
	rail: boolean;
	onWiden?: () => void;
	onSearch?: () => void;
}

async function mount(props: Props, path = ACTIVE_PATH) {
	const rootRoute = createRootRoute({
		component: () => <Sidebar {...props} />,
	});
	const paths = ["/", ACTIVE_PATH, "/bumdes"];
	const routeTree = rootRoute.addChildren(
		paths.map((p) =>
			createRoute({
				getParentRoute: () => rootRoute,
				path: p,
				component: () => null,
			}),
		),
	);
	const router = createRouter({
		routeTree,
		history: createMemoryHistory({ initialEntries: [path] }),
	});
	await router.load();
	host = document.createElement("div");
	document.body.appendChild(host);
	root = createRoot(host);
	await act(async () => {
		root?.render(
			<MantineProvider>
				<RouterProvider router={router} />
			</MantineProvider>,
		);
	});
	return { host, router };
}

const labels = (el: HTMLElement) =>
	Array.from(el.querySelectorAll("[aria-label]")).map((n) =>
		n.getAttribute("aria-label"),
	);

describe("Sidebar rel (render)", () => {
	it("setiap menu tampil sebagai ikon dengan aria-label nama menu, tanpa teks label", async () => {
		const { host } = await mount({ rail: true });
		const nav = host.querySelector('[data-sidebar-rail="true"]');
		expect(nav).not.toBeNull();
		const links = Array.from(
			(nav as HTMLElement).querySelectorAll("a, button"),
		).filter(
			(n) =>
				n.querySelector("svg") &&
				n.getAttribute("aria-label") === id.sidebar.keuangan,
		);
		expect(links.length).toBe(1);
		for (const name of [
			id.sidebar.beranda,
			id.sidebar.kinerjaDevisi,
			id.sidebar.bumdes,
			id.sidebar.keamanan,
		])
			expect(labels(host)).toContain(name);
		expect(host.querySelectorAll("svg").length).toBeGreaterThanOrEqual(9);
		expect(host.textContent).not.toContain(id.sidebar.beranda);
	});

	it("menu aktif ditandai aria-current dan hanya satu", async () => {
		const { host } = await mount({ rail: true });
		const current = host.querySelectorAll('[aria-current="page"]');
		expect(current.length).toBe(1);
		expect(current[0]?.getAttribute("aria-label")).toBe(id.sidebar.keuangan);
	});

	it("menu aktif mengikuti rute", async () => {
		const { host } = await mount({ rail: true }, "/bumdes");
		const current = host.querySelectorAll('[aria-current="page"]');
		expect(current[0]?.getAttribute("aria-label")).toBe(id.sidebar.bumdes);
	});

	it("klik ikon menu tetap menavigasi", async () => {
		const { host, router } = await mount({ rail: true });
		const target = host.querySelector(
			`[aria-label="${id.sidebar.bumdes}"]`,
		) as HTMLElement;
		await act(async () => {
			target.click();
		});
		expect(router.state.location.pathname).toBe("/bumdes");
	});

	it("logo kecil, ikon cari, dan tombol perlebar tampil serta memanggil handler", async () => {
		let searched = 0;
		let widened = 0;
		const { host } = await mount({
			rail: true,
			onSearch: () => searched++,
			onWiden: () => widened++,
		});
		expect(host.querySelector('img[alt="Logo"]')).not.toBeNull();
		await act(async () => {
			(
				host.querySelector(
					`[aria-label="${id.sidebar.cariApaSaja}"]`,
				) as HTMLElement
			).click();
			(
				host.querySelector(
					`[aria-label="${id.sidebar.perlebarMenu}"]`,
				) as HTMLElement
			).click();
		});
		expect([searched, widened]).toEqual([1, 1]);
	});

	it("mode penuh: label teks tampil, kotak cari ada, tanpa rel", async () => {
		const { host } = await mount({ rail: false });
		expect(host.querySelector('[data-sidebar-rail="true"]')).toBeNull();
		expect(host.textContent).toContain(id.sidebar.beranda);
		expect(
			host.querySelector(`input[placeholder="${id.sidebar.cariApaSaja}"]`),
		).not.toBeNull();
	});
});
