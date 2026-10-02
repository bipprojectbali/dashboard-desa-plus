import { BERANDA_TARGETS } from "./beranda";
import { BUMDES_TARGETS } from "./bumdes";
import { DIVISI_TARGETS } from "./divisi";
import { JENNA_TARGETS } from "./jenna-analytic";
import { KEAMANAN_TARGETS } from "./keamanan";
import { KEUANGAN_TARGETS } from "./keuangan";
import { POINTER_ROUTES } from "./routes";
import { SOSIAL_TARGETS } from "./sosial";
import { AI_TARGET_ATTR, type PointerRoute, type PointerTarget } from "./types";

/** Semua target terdaftar. Tambah halaman baru = tambah file `<modul>.ts` lalu sebarkan di sini. */
export const POINTER_TARGETS: readonly PointerTarget[] = [
	...BERANDA_TARGETS,
	...DIVISI_TARGETS,
	...KEUANGAN_TARGETS,
	...BUMDES_TARGETS,
	...SOSIAL_TARGETS,
	...KEAMANAN_TARGETS,
	...JENNA_TARGETS,
];

export function findPointerRoute(
	route: unknown,
	routes: readonly PointerRoute[] = POINTER_ROUTES,
): PointerRoute | undefined {
	return typeof route === "string"
		? routes.find((r) => r.route === route)
		: undefined;
}

export function findPointerTarget(
	id: unknown,
	targets: readonly PointerTarget[] = POINTER_TARGETS,
): PointerTarget | undefined {
	return typeof id === "string" ? targets.find((t) => t.id === id) : undefined;
}

/** Selector CSS elemen target; `id` selalu dari registry, bukan dari input mentah. */
export function anchorSelector(id: string): string {
	return `[${AI_TARGET_ATTR}="${id}"]`;
}
