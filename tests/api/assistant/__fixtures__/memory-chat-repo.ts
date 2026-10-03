import type { ChatRepo } from "@/api/assistant/chat/chat.service";
import {
	type AssistantSettingsValues,
	DEFAULT_ASSISTANT_SETTINGS,
} from "@/api/assistant/config/settings.repo";
import type {
	NewMessage,
	SavedMessage,
} from "@/api/assistant/conversation/conversation.repo";

/** Repo percakapan di memori untuk test service chat (test-only, tanpa DB). */

export interface StoredMessage extends SavedMessage {
	userId: string;
	conversationId: string;
	status: string;
	pageRoute: string | null;
	inputTokens: number | null;
	outputTokens: number | null;
}

export function createMemoryRepo() {
	const conversations = new Map<string, { userId: string; title: string }>();
	const messages: StoredMessage[] = [];
	let seq = 0;

	const save = (userId: string, conversationId: string, list: NewMessage[]) =>
		list.map((m) => {
			const row: StoredMessage = {
				id: `msg-${++seq}`,
				userId,
				conversationId,
				role: m.role,
				content: m.content,
				toolsUsed: m.toolsUsed ?? [],
				modality: m.modality ?? "text",
				status: m.status ?? "ok",
				pageRoute: m.pageRoute ?? null,
				inputTokens: m.inputTokens ?? null,
				outputTokens: m.outputTokens ?? null,
				createdAt: new Date(Date.UTC(2026, 9, 1, 0, 0, seq)),
			};
			messages.push(row);
			return row;
		});

	const repo: ChatRepo = {
		async getConversation(userId, id) {
			const c = conversations.get(id);
			if (!c || c.userId !== userId) return null;
			const now = new Date();
			return { id, title: c.title, createdAt: now, updatedAt: now };
		},
		async getRecentMessages(userId, conversationId, take) {
			const rows = messages
				.filter(
					(m) =>
						m.userId === userId &&
						m.conversationId === conversationId &&
						m.status === "ok",
				)
				.map((m) => ({
					role: m.role as "user" | "assistant",
					content: m.content,
				}));
			return take === undefined ? rows : rows.slice(-take);
		},
		async appendMessages(userId, conversationId, list) {
			const c = conversations.get(conversationId);
			if (!c || c.userId !== userId) return null;
			return save(userId, conversationId, list);
		},
		async startConversation(userId, firstMessage, list) {
			const id = `conv-${++seq}`;
			conversations.set(id, { userId, title: firstMessage.slice(0, 60) });
			return { conversationId: id, messages: save(userId, id, list) };
		},
	};
	return { repo, conversations, messages };
}

/** Pengaturan aktif dengan batas longgar; override per test. */
export function enabledSettings(
	o: Partial<AssistantSettingsValues> = {},
): AssistantSettingsValues {
	return { ...DEFAULT_ASSISTANT_SETTINGS, enabled: true, ...o };
}
