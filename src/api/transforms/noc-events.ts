/**
 * Transform murni untuk data kegiatan mendatang NOC. Dipisah dari noc.ts
 * agar bisa dipakai di wall-snapshot builder tanpa import Elysia/route.
 */

export interface NocEventRaw {
	id: string;
	title: string;
	dateStart: string;
	timeStart?: string;
	desc?: string;
	linkMeet?: string;
	divisi?: { id: string; name: string } | null;
}

export interface MappedEvent {
	id: string;
	title: string;
	/** ISO datetime gabungan dateStart + timeStart, e.g. "2026-07-22T08:30:00" */
	startDate: string;
	time: string;
	divisi: string | null;
}

/**
 * Map raw NOC upcoming-events response → MappedEvent[].
 *
 * Upstream NOC sesekali mengirim item cacat (title/dateStart null). Item
 * seperti itu dibuang di sini supaya output selalu memenuhi response schema
 * strict Elysia — kalau lolos, Elysia melempar 422 di luar try/catch handler.
 */
export function mapUpcomingEvents(upcoming: NocEventRaw[]): MappedEvent[] {
	return upcoming
		.filter(
			(e): e is NocEventRaw =>
				!!e && typeof e.id === "string" && !!e.title && !!e.dateStart,
		)
		.map((e) => {
			const startDate = e.timeStart
				? `${e.dateStart}T${e.timeStart}:00`
				: e.dateStart;
			return {
				id: e.id,
				title: e.title,
				startDate,
				time: e.timeStart ?? "",
				divisi: e.divisi?.name ?? null,
			};
		});
}
