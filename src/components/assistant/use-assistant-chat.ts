import { useQueryClient } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useCallback } from "react";
import { useSnapshot } from "valtio";
import {
	addUserBubble,
	appendStreamDelta,
	assistantStore,
	beginTurn,
	cancelActiveTurn,
	failQuestion,
	prependOlderMessages,
	receiveAnswer,
	setAssistantError,
	setStreamStatus,
	showConversation,
} from "@/store/assistant";
import { i18nStore } from "@/store/i18n";
import { AssistantApiError, fetchMessages } from "./assistant.api";
import {
	chatErrorMessage,
	pageTitleFrom,
	toAssistantLang,
} from "./assistant.logic";
import { askAssistant } from "./assistant-stream.api";
import { useAssistantText } from "./use-assistant-access";

export const CONVERSATIONS_KEY = ["assistant", "conversations"] as const;

function asFailure(err: unknown): AssistantApiError {
	return err instanceof AssistantApiError
		? err
		: new AssistantApiError(null, `Unexpected error: ${String(err)}`);
}

/** Aksi panel: kirim pertanyaan, buka percakapan, muat pesan lama. */
export function useAssistantChat(maxInputChars: number) {
	const queryClient = useQueryClient();
	const text = useAssistantText();
	const { lang } = useSnapshot(i18nStore);
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	const send = useCallback(
		async (raw: string) => {
			const message = raw.trim();
			const bubbleId = `local-${Date.now()}`;
			const controller = beginTurn();
			addUserBubble(bubbleId, message);
			try {
				const res = await askAssistant(
					{
						conversationId: assistantStore.conversationId ?? undefined,
						message,
						pageContext: {
							route: pathname,
							title: pageTitleFrom(document.title) || undefined,
							lang: toAssistantLang(lang),
						},
					},
					{
						onStatus: (tool) => setStreamStatus(bubbleId, tool),
						onDelta: (text) => appendStreamDelta(bubbleId, text),
					},
					controller.signal,
				);
				// res.actions selalu [] di fitur 1 — dipakai Fitur 2 (penunjuk).
				receiveAnswer(bubbleId, res.conversationId, res.message);
			} catch (err) {
				// Dibatalkan user: server tidak menyimpan apa pun; teks bisa dikirim ulang.
				if (controller.signal.aborted) {
					failQuestion(bubbleId, text.errors.cancelled, message);
					return;
				}
				const failure = asFailure(err);
				failQuestion(
					bubbleId,
					chatErrorMessage(failure, text, maxInputChars),
					message,
					failure.conversationId,
				);
			} finally {
				await queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
			}
		},
		[pathname, lang, text, maxInputChars, queryClient],
	);

	const openConversation = useCallback(
		async (conversationId: string) => {
			try {
				showConversation(conversationId, await fetchMessages(conversationId));
			} catch (err) {
				setAssistantError(
					asFailure(err).status === 404
						? text.errors.notFound
						: text.errors.loadFailed,
				);
			}
		},
		[text],
	);

	const loadOlder = useCallback(async () => {
		const { conversationId, olderCursor } = assistantStore;
		if (!conversationId || !olderCursor) return;
		try {
			prependOlderMessages(await fetchMessages(conversationId, olderCursor));
		} catch {
			// Gagal memuat halaman lama tidak memutus percakapan; cukup beri tahu.
			setAssistantError(text.errors.loadFailed);
		}
	}, [text]);

	return { send, cancel: cancelActiveTurn, openConversation, loadOlder };
}
