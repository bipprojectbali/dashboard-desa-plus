/**
 * Transform murni untuk data kegiatan mendatang NOC. Dipisah dari noc.ts
 * agar bisa dipakai di wall-snapshot builder tanpa import Elysia/route.
 */

export interface NocEventRaw {
	id: string;
	title: string;
	startDate: string;
	location?: string | null;
	eventType?: string;
}

export interface MappedEvent {
	id: string;
	title: string;
	startDate: string;
	location: string | null;
	eventType: string;
}

/** Map raw NOC upcoming-events response → MappedEvent[]. */
export function mapUpcomingEvents(upcoming: NocEventRaw[]): MappedEvent[] {
	return upcoming.map((e) => ({
		id: e.id,
		title: e.title,
		startDate: e.startDate,
		location: e.location ?? null,
		eventType: e.eventType ?? "EVENT",
	}));
}
