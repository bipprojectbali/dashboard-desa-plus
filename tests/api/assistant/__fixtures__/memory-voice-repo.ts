import type { VoiceSessionRow } from "@/api/assistant/voice/voice.quota";
import type { VoiceSessionRepo } from "@/api/assistant/voice/voice.session.repo";

/** Repo sesi suara di memori (test-only) — perilaku sama dengan repo Prisma. */
export function createMemoryVoiceRepo() {
	const sessions: VoiceSessionRow[] = [];
	const consents = new Set<string>();
	let seq = 0;
	const isOpen = (r: VoiceSessionRow) =>
		(r.status === "starting" || r.status === "active") && r.endedAt === null;

	const repo: VoiceSessionRepo = {
		hasConsent: async (userId) => consents.has(userId),
		acceptConsent: async (userId) => {
			consents.add(userId);
		},
		findSession: async (id) => {
			const row = sessions.find((s) => s.id === id);
			return row ? { ...row } : null;
		},
		findOpenSessions: async (userId) =>
			sessions
				.filter((s) => s.userId === userId && isOpen(s))
				.sort(
					(a, b) =>
						a.startedAt.getTime() - b.startedAt.getTime() ||
						a.id.localeCompare(b.id),
				)
				.map((s) => ({ ...s })),
		createSession: async (userId, now) => {
			seq += 1;
			const row: VoiceSessionRow = {
				id: `vs-${String(seq).padStart(3, "0")}`,
				userId,
				status: "starting",
				startedAt: now,
				lastHeartbeatAt: now,
				endedAt: null,
				billedSeconds: 0,
				extendedSeconds: 0,
				endReason: null,
			};
			sessions.push(row);
			return { ...row };
		},
		activateSession: async (id, now) => {
			const row = sessions.find((s) => s.id === id);
			if (row)
				Object.assign(row, {
					status: "active",
					startedAt: now,
					lastHeartbeatAt: now,
				});
		},
		touchHeartbeat: async (id, now) => {
			const row = sessions.find((s) => s.id === id);
			if (row && isOpen(row)) row.lastHeartbeatAt = now;
		},
		addExtension: async (id, seconds) => {
			const row = sessions.find((s) => s.id === id);
			if (row && isOpen(row)) row.extendedSeconds += seconds;
		},
		closeSession: async (id, close) => {
			const row = sessions.find((s) => s.id === id);
			if (!row || !isOpen(row)) return false;
			Object.assign(row, {
				status: close.status ?? "ended",
				endedAt: close.endedAt,
				billedSeconds: close.billedSeconds,
				endReason: close.endReason,
			});
			return true;
		},
		sumBilledSince: async (userId, since) =>
			sessions
				.filter(
					(s) =>
						s.userId === userId &&
						s.startedAt.getTime() >= since.getTime() &&
						s.endedAt !== null,
				)
				.reduce((sum, s) => sum + s.billedSeconds, 0),
	};
	return { repo, sessions, consents };
}
