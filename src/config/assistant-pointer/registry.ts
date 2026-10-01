import { KEUANGAN_TARGETS } from "./keuangan";
import { POINTER_ROUTES } from "./routes";
import { AI_TARGET_ATTR, type PointerRoute, type PointerTarget } from "./types";

/** Semua target terdaftar. Tambah halaman baru = tambah file `<modul>.ts` lalu sebarkan di sini. */
export const POINTER_TARGETS: readonly PointerTarget[] = [...KEUANGAN_TARGETS];

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
