import type {
	AssistantConversationDto,
	AssistantHistoryMessageDto,
} from "@/types/ai-assistant-chat";
import type { getConversation, listMessages } from "./conversation.repo";

/** Baris repo → DTO endpoint percakapan (tanggal ISO, role dipersempit). */

type ConversationRow = NonNullable<Awaited<ReturnType<typeof getConversation>>>;
type MessageRow = NonNullable<
	Awaited<ReturnType<typeof listMessages>>
>["items"][number];

export function toConversationDto(
	c: ConversationRow,
): AssistantConversationDto {
	return {
		id: c.id,
		title: c.title,
		createdAt: c.createdAt.toISOString(),
		updatedAt: c.updatedAt.toISOString(),
	};
}

export function toMessageDto(m: MessageRow): AssistantHistoryMessageDto {
	return {
		id: m.id,
		role: m.role === "assistant" ? "assistant" : "user",
		content: m.content,
		toolsUsed: m.toolsUsed,
		pageRoute: m.pageRoute,
		status: m.status,
		modality: m.modality === "voice" ? "voice" : "text",
		createdAt: m.createdAt.toISOString(),
	};
}
