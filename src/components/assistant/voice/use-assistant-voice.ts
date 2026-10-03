import { useQueryClient } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import { useSnapshot } from "valtio";
import {
	addUserBubble,
	appendStreamDelta,
	assistantStore,
	beginTurn,
	failQuestion,
	isCurrentTurn,
	receiveAnswer,
	setStreamStatus,
} from "@/store/assistant";
import { voiceStore } from "@/store/assistant-voice";
import { i18nStore } from "@/store/i18n";
import {
	chatErrorMessage,
	pageTitleFrom,
	toAssistantLang,
} from "../assistant.logic";
import { askAssistant, type StreamHandlers } from "../assistant-stream.api";
import {
	useAssistantText,
	useAssistantVoiceText,
} from "../use-assistant-access";
import { asFailure, CONVERSATIONS_KEY } from "../use-assistant-chat";
import { usePointerRunner } from "../use-pointer-runner";
import { acceptVoiceConsent } from "./voice.api";
import { voiceErrorMessage } from "./voice.logic";
import { bindVoiceContext, startVoice } from "./voice-session";

const STATUS_KEY = ["assistant", "status"] as const;

const abortError = () => new DOMException("Voice turn aborted", "AbortError");

/**
 * Mode suara panel: satu giliran suara = pertanyaan lewat jalur chat yang
 * sama (`modality: "voice"`, dihitung 1 pesan kuota teks) dengan bubble 🎙.
 * Sesi sendiri hidup di voice-session (level modul).
 */
export function useAssistantVoice(maxInputChars: number) {
	const queryClient = useQueryClient();
	const text = useAssistantText();
	const t = useAssistantVoiceText();
	const { lang } = useSnapshot(i18nStore);
	const pointer = usePointerRunner();
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	const ask = useCallback(
		async (
			question: string,
			handlers: StreamHandlers,
			signal: AbortSignal,
		): Promise<string> => {
			const bubbleId = `voice-${Date.now()}`;
			const controller = beginTurn();
			// Barge-in membatalkan giliran ini lewat sinyal dari kontroler suara.
			signal.addEventListener("abort", () => controller.abort(), {
				once: true,
			});
			addUserBubble(bubbleId, question, "voice");
			try {
				const res = await askAssistant(
					{
						conversationId: assistantStore.conversationId ?? undefined,
						message: question,
						modality: "voice",
						voiceSessionId: voiceStore.sessionId ?? undefined,
						pageContext: {
							route: pathname,
							title: pageTitleFrom(document.title) || undefined,
							lang: toAssistantLang(lang),
						},
					},
					{
						onStatus: (tool) => {
							setStreamStatus(bubbleId, tool);
							handlers.onStatus(tool);
						},
						onDelta: (delta) => {
							appendStreamDelta(bubbleId, delta);
							handlers.onDelta(delta);
						},
					},
					controller.signal,
				);
				const current = isCurrentTurn(bubbleId);
				receiveAnswer(bubbleId, res.conversationId, res.message);
				if (!current) throw abortError();
				void pointer.run(res.actions);
				return res.message.content;
			} catch (err) {
				if (controller.signal.aborted) {
					failQuestion(bubbleId, text.errors.cancelled, question);
					throw abortError();
				}
				if (err instanceof DOMException && err.name === "AbortError") throw err;
				const failure = asFailure(err);
				failQuestion(
					bubbleId,
					chatErrorMessage(failure, text, maxInputChars),
					question,
					failure.conversationId,
				);
				throw failure;
			} finally {
				await queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
			}
		},
		[pathname, lang, text, maxInputChars, queryClient, pointer],
	);

	useEffect(() => {
		bindVoiceContext({ t, text, ask });
	}, [t, text, ask]);

	/** Tombol On: minta persetujuan mikrofon dulu bila belum pernah. */
	const requestStart = useCallback((consented: boolean) => {
		if (consented) void startVoice();
		else voiceStore.consentOpen = true;
	}, []);

	const acceptConsent = useCallback(async () => {
		try {
			await acceptVoiceConsent();
			voiceStore.consentOpen = false;
			await queryClient.invalidateQueries({ queryKey: STATUS_KEY });
			await startVoice();
		} catch (err) {
			voiceStore.consentOpen = false;
			voiceStore.notice = voiceErrorMessage(err, t, text);
		}
	}, [queryClient, t, text]);

	const declineConsent = useCallback(() => {
		voiceStore.consentOpen = false;
	}, []);

	return { requestStart, acceptConsent, declineConsent };
}
