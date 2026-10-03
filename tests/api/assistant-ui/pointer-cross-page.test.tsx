import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	mock,
} from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	cancelPointer,
	isPointerRunActive,
} from "@/components/assistant/pointer/pointer-cancel";
import { hidePointer } from "@/components/assistant/pointer/pointer-store";
import { runPointerActions } from "@/components/assistant/pointer-run";
import KeuanganAnggaran from "@/components/keuangan-anggaran";
import { POINTER_TARGETS } from "@/config/assistant-pointer";
import { assistantStore, closeAssistant } from "@/store/assistant";
import { clearReturn, returnStore } from "@/store/assistant-return";

// Regresi uji manual 2.1 & 4.1: Keuangan memuat data dingin setelah navigasi, jadi dropdown tahun baru
// muncul lama setelah rute pindah. Rangkaian navigate → pilih harus menunggu, atau gagal dengan alasan jelas.

(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = false;

const realApiClient = await import("@/utils/api-client");
const sleepMs = (ms: number) => new Promise((r) => setTimeout(r, ms));

const year = (tahun: number) => ({
	id: `y${tahun}`,
	tahun,
	name: `APBDes ${tahun}`,
	totalBudget: 1,
	totalIncomeReal: 1,
	totalExpenseReal: 1,
	realisasiPercent: 1,
	monthly: Array.from({ length: 12 }, () => ({ income: 0, expense: 0 })),
	allocation: [],
	report: { income: [], expenses: [], totalIncome: 0, totalExpense: 0 },
	aid: [],
});

let apiDelay = 0;
mock.module("@/utils/api-client", () => ({
	apiClient: {
		GET: async () => {
			await sleepMs(apiDelay);
			return { data: { years: [year(2026), year(2025)] } };
		},
	},
}));
afterAll(() => {
	mock.module("@/utils/api-client", () => realApiClient);
});

let root: Root;
let setPage: (p: string) => void = () => {};
function Pages() {
	const [page, set] = useState("/");
	setPage = set;
	return page === "/keuangan-anggaran" ? <KeuanganAnggaran /> : <div>home</div>;
}

async function mountApp(delayMs: number) {
	apiDelay = delayMs;
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	const host = document.createElement("div");
	document.body.append(host);
	root = createRoot(host);
	root.render(
		<QueryClientProvider client={qc}>
			<MantineProvider>
				<Pages />
			</MantineProvider>
		</QueryClientProvider>,
	);
	await sleepMs(30);
}

const actions = [
	{ type: "navigate", route: "/keuangan-anggaran" },
	{ type: "pilih", target: "keuangan.tahun", value: "2025" },
];
const yearInput = () =>
	document.querySelector(
		"[data-ai-target='keuangan.tahun'] input",
	) as HTMLInputElement | null;
const env = (over: Record<string, unknown> = {}) => ({
	navigate: (route: string) => setPage(route),
	settleMs: 0,
	pointAt: async () => {},
	...over,
});

beforeEach(() => {
	document.body.innerHTML = "";
});
afterEach(() => {
	cancelPointer();
	hidePointer();
	root.unmount();
	closeAssistant();
	clearReturn();
	assistantStore.maximized = false;
});

describe("navigasi lintas halaman lalu pilih tahun", () => {
	it("data halaman tujuan lebih lambat dari batas anchor biasa tetap berhasil (dropdown berpindah ke 2025)", async () => {
		await mountApp(400);
		const out = await runPointerActions(
			actions,
			env({ anchorTimeoutMs: 100, navigationTimeoutMs: 3000 }),
		);
		expect(out).toEqual({ ok: true });
		await sleepMs(50);
		expect(yearInput()?.value).toContain("2025");
	});

	it("data tak kunjung tiba dalam batas navigasi → gagal dengan anchor-timeout, bukan senyap", async () => {
		await mountApp(2000);
		const out = await runPointerActions(
			actions,
			env({ anchorTimeoutMs: 50, navigationTimeoutMs: 200 }),
		);
		expect(out).toEqual({ ok: false, reason: "anchor-timeout" });
	});

	it("tanpa navigasi di rangkaian, batas navigasi tidak dipakai (halaman yang sudah terbuka tetap cepat gagal)", async () => {
		await mountApp(2000);
		setPage("/keuangan-anggaran");
		const started = Date.now();
		const out = await runPointerActions(
			[actions[1]],
			env({ anchorTimeoutMs: 100, navigationTimeoutMs: 5000 }),
		);
		expect(out).toEqual({ ok: false, reason: "anchor-timeout" });
		expect(Date.now() - started).toBeLessThan(1500);
	});

	it("hanya aksi pertama setelah navigate yang mendapat batas panjang", async () => {
		await mountApp(300);
		const started = Date.now();
		const out = await runPointerActions(
			[...actions, { type: "pointTo", target: "keuangan.hantu" }],
			env({
				anchorTimeoutMs: 100,
				navigationTimeoutMs: 5000,
				targets: [
					{
						id: "keuangan.hantu",
						route: "/keuangan-anggaran",
						label: "Hantu",
						deskripsi: "Hantu",
						requiredFeature: "view-keuangan",
						kind: "view",
					},
					...POINTER_TARGETS,
				],
			}),
		);
		expect(out).toEqual({ ok: false, reason: "anchor-timeout" });
		expect(Date.now() - started).toBeLessThan(1500);
	});
});

describe("P6 menutup panel diperbesar", () => {
	it("tidak dianggap user menutup panel: run penunjuk tetap berjalan dan tombol kembali muncul", async () => {
		assistantStore.open = true;
		assistantStore.maximized = true;
		await mountApp(200);
		const run = runPointerActions(
			actions,
			env({ anchorTimeoutMs: 100, navigationTimeoutMs: 3000 }),
		);
		await sleepMs(20);
		expect(assistantStore.open).toBe(false);
		expect(returnStore.awaitingReturn).toBe(true);
		expect(isPointerRunActive()).toBe(true);
		expect(await run).toEqual({ ok: true });
		await sleepMs(50);
		expect(yearInput()?.value).toContain("2025");
	});
});

describe("pelaporan kegagalan penunjuk", () => {
	const runner = readFileSync(
		join(process.cwd(), "src/components/assistant/use-pointer-runner.ts"),
		"utf8",
	);

	it("panel yang ditutup P6 dibuka lagi saat gagal agar galat terlihat, dan timeout punya pesan sendiri", () => {
		expect(runner).toMatch(/awaitingReturn\) returnToChat\(\)/);
		expect(runner).toContain('"anchor-timeout"');
		expect(runner).toContain("text.pointerTimeout");
	});
});
