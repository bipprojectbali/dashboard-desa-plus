import { describe, expect, it } from "bun:test";
import {
	mapUpcomingEvents,
	type NocEventRaw,
} from "@/api/transforms/noc-events";

const BASE: NocEventRaw = {
	id: "evt-1",
	title: "Rapat Bulanan",
	dateStart: "2026-07-22",
	timeStart: "08:30",
	divisi: { id: "div-1", name: "Pemerintahan" },
};

describe("mapUpcomingEvents", () => {
	it("merges dateStart + timeStart into valid ISO startDate", () => {
		const [ev] = mapUpcomingEvents([BASE]);
		expect(ev.startDate).toBe("2026-07-22T08:30:00");
		expect(Number.isNaN(new Date(ev.startDate).getTime())).toBe(false);
	});

	it("falls back to dateStart when timeStart is absent", () => {
		const raw: NocEventRaw = { ...BASE, timeStart: undefined };
		const [ev] = mapUpcomingEvents([raw]);
		expect(ev.startDate).toBe("2026-07-22");
		expect(Number.isNaN(new Date(ev.startDate).getTime())).toBe(false);
	});

	it("sets time = timeStart string directly", () => {
		const [ev] = mapUpcomingEvents([BASE]);
		expect(ev.time).toBe("08:30");
	});

	it("sets time = empty string when timeStart absent", () => {
		const raw: NocEventRaw = { ...BASE, timeStart: undefined };
		const [ev] = mapUpcomingEvents([raw]);
		expect(ev.time).toBe("");
	});

	it("extracts divisi.name", () => {
		const [ev] = mapUpcomingEvents([BASE]);
		expect(ev.divisi).toBe("Pemerintahan");
	});

	it("sets divisi = null when divisi is absent", () => {
		const raw: NocEventRaw = { ...BASE, divisi: null };
		const [ev] = mapUpcomingEvents([raw]);
		expect(ev.divisi).toBeNull();
	});

	it("does not include location or eventType keys", () => {
		const [ev] = mapUpcomingEvents([BASE]);
		expect(Object.keys(ev)).not.toContain("location");
		expect(Object.keys(ev)).not.toContain("eventType");
	});

	it("handles empty array", () => {
		expect(mapUpcomingEvents([])).toEqual([]);
	});
});
