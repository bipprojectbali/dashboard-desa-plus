import { beforeEach, describe, expect, it } from "bun:test";
import {
	addUserBubble,
	appendStreamDelta,
	assistantStore,
	beginTurn,
	cancelActiveTurn,
	closeAssistant,
	failQuestion,
	historyToBubbles,
	openAssistant,
	prependOlderMessages,
	receiveAnswer,
	setStreamStatus,
	showConversation,
	startNewConversation,
	toggleMaximized,
} from "@/store/assistant";
import type { AssistantHistoryMessageDto } from "@/types/ai-assistant-chat";

/** Store panel: percakapan bertahan saat panel ditutup; hanya "Percakapan baru" yang mengosongkan. */

const msg = (
	id: string,
	role: "user" | "assistant",
	status = "ok",
): AssistantHistoryMessageDto => ({
	id,
	role,
	content: id,
	toolsUsed: role === "assistant" ? ["ringkasan_beranda"] : [],
	pageRoute: "/",
	status,
	createdAt: "2026-10-02T00:00:00.000Z",
});

beforeEach(() => {
	startNewConversation();
	assistantStore.open = false;
	assistantStore.maximized = false;
	assistantStore.pending = false;
});

describe("assistantStore", () => {
	it("riwayat server (terbaru dulu) → urut lama ke baru, status error ditandai", () => {
		const bubbles = historyToBubbles([
			msg("a2", "assistant"),
			msg("q2", "user", "error"),
			msg("q1", "user"),
		]);
		expect(bubbles.map((b) => [b.id, b.failed ?? false])).toEqual([
			["q1", false],
			["q2", true],
			["a2", false],
		]);
	});

	it("menutup panel (termasuk dalam mode perbesar) tidak menghapus percakapan", () => {
		openAssistant();
		toggleMaximized();
		addUserBubble("local-1", "Halo");
		receiveAnswer("local-1", "c1", {
			id: "m1",
			role: "assistant",
			content: "Hai",
			toolsUsed: [],
			createdAt: "2026-10-02T00:00:00.000Z",
		});
		closeAssistant();
		expect(assistantStore.open).toBe(false);
		expect(assistantStore.conversationId).toBe("c1");
		expect(assistantStore.messages.map((m) => m.content)).toEqual([
			"Halo",
			"Hai",
		]);
		openAssistant();
		expect(assistantStore.maximized).toBe(true);
		expect(assistantStore.messages).toHaveLength(2);
	});

	it("gagal: bubble ditandai, teks disimpan untuk kirim ulang, percakapan 503 dipakai", () => {
		addUserBubble("local-1", "Ringkas desa");
		expect(assistantStore.pending).toBe(true);
		failQuestion("local-1", "Layanan AI…", "Ringkas desa", "c7");
		expect(assistantStore.messages[0]?.failed).toBe(true);
		expect(assistantStore.pending).toBe(false);
		expect(assistantStore.retryText).toBe("Ringkas desa");
		expect(assistantStore.conversationId).toBe("c7");
		addUserBubble("local-2", "Ringkas desa");
		expect([assistantStore.error, assistantStore.retryText]).toEqual([
			null,
			null,
		]);
	});

	it("buka percakapan lama, muat halaman sebelumnya, lalu percakapan baru mengosongkan", () => {
		showConversation("c2", {
			items: [msg("a2", "assistant"), msg("q2", "user")],
			nextCursor: "q2",
		});
		expect(assistantStore.olderCursor).toBe("q2");
		prependOlderMessages({
			items: [msg("a1", "assistant"), msg("q1", "user")],
			nextCursor: null,
		});
		expect(assistantStore.messages.map((m) => m.id)).toEqual([
			"q1",
			"a1",
			"q2",
			"a2",
		]);
		expect(assistantStore.olderCursor).toBeNull();
		startNewConversation();
		expect([
			assistantStore.conversationId,
			assistantStore.messages.length,
		]).toEqual([null, 0]);
	});
});

describe("assistantStore — stream & giliran", () => {
	const answer = (id: string) => ({
		id,
		role: "assistant" as const,
		content: "Jawaban final",
		toolsUsed: ["ringkasan_keuangan"],
		createdAt: "2026-10-02T00:00:00.000Z",
	});

	it("delta mengalir, status tool membuang teks pengantar, jawaban akhir menggantikannya", () => {
		addUserBubble("q1", "Anggaran?");
		appendStreamDelta("q1", "Saya cek ");
		setStreamStatus("q1", "ringkasan_keuangan");
		expect([assistantStore.streamStatus, assistantStore.streamingText]).toEqual(
			["ringkasan_keuangan", ""],
		);
		appendStreamDelta("q1", "Jawaban ");
		appendStreamDelta("q1", "final");
		expect(assistantStore.streamingText).toBe("Jawaban final");
		receiveAnswer("q1", "c1", answer("a1"));
		expect(assistantStore.streamingText).toBe("");
		expect(assistantStore.messages.at(-1)?.content).toBe("Jawaban final");
	});

	it("percakapan baru saat menunggu: giliran dibatalkan, jawaban telat diabaikan", () => {
		const controller = beginTurn();
		addUserBubble("q1", "Anggaran?");
		startNewConversation();
		expect(controller.signal.aborted).toBe(true);
		appendStreamDelta("q1", "telat");
		receiveAnswer("q1", "c1", answer("a1"));
		failQuestion("q1", "x", "Anggaran?");
		expect(assistantStore.messages).toEqual([]);
		expect([
			assistantStore.pending,
			assistantStore.conversationId,
			assistantStore.error,
		]).toEqual([false, null, null]);
	});

	it("beginTurn membatalkan giliran sebelumnya; cancelActiveTurn membatalkan yang aktif", () => {
		const first = beginTurn();
		const second = beginTurn();
		expect(first.signal.aborted).toBe(true);
		cancelActiveTurn();
		expect(second.signal.aborted).toBe(true);
	});
});
