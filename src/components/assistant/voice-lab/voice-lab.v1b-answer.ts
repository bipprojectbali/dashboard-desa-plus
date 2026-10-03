import { createAnswerSender } from "../voice/voice-answer-sender";
import { formatSpokenNumbers } from "../voice/voice-spoken-numbers";
import { askClaude, describeError, isAbort } from "./voice-lab.claude";
import type { ControllerEvents } from "./voice-lab.types";
import type { V1bTurn } from "./voice-lab.v1b-turn";

/**
 * Fase jawaban satu delegasi V1-B: tanya Claude lewat chat/stream lalu kirim
 * jawabannya ke GPT-Live sesuai mode kirim giliran (utuh / per kalimat).
 * Bila giliran dibatalkan (Off/barge-in), sisa kalimat tidak dikirim.
 */

export interface AnswerContext {
	events: ControllerEvents;
	/** Kirim satu `session.commentary.append` untuk delegasi ini. */
	commentary(delegationId: string, content: string): void;
	emit(turn: V1bTurn): void;
	getConversationId(): string | undefined;
	setConversationId(id: string): void;
	/** Potongan jawaban pertama baru dikirim pada `now`. */
	answerStarted(now: number): void;
	/** Semua potongan sudah dikirim; tunggu GPT-Live selesai bicara. */
	answerSent(turn: V1bTurn): void;
	/** Giliran selesai karena galat. */
	failed(turn: V1bTurn): void;
}

export async function answerQuestion(
	ctx: AnswerContext,
	turn: V1bTurn,
	delegationId: string,
	question: string,
	endAt: number,
): Promise<void> {
	const { events } = ctx;
	turn.view.sendMode = turn.sendMode;
	const view = turn.view;
	const sender = createAnswerSender({
		mode: turn.sendMode,
		send: (content) => {
			view.sentText = view.sentText ? `${view.sentText} ${content}` : content;
			ctx.commentary(delegationId, content);
		},
		isCancelled: () => turn.abort.signal.aborted,
		transform: turn.spokenNumbers
			? (piece) => {
					const res = formatSpokenNumbers(piece);
					if (res.conversions.length > 0)
						view.conversions = [
							...(view.conversions ?? []),
							...res.conversions,
						];
					return res.text;
				}
			: undefined,
		onFirstSend: () => {
			const now = performance.now();
			turn.firstSentenceSentMs = now - endAt;
			turn.view.fillerChars = turn.view.spokenText.length;
			ctx.answerStarted(now);
			events.log("potongan jawaban pertama dikirim ke GPT-Live");
		},
	});
	try {
		const res = await askClaude(
			question,
			ctx.getConversationId(),
			{
				onStatus: () => sender.toolStarted(),
				onDelta: (text) => {
					if (turn.firstTokenMs === null) {
						turn.firstTokenMs = performance.now() - endAt;
						events.log("token Claude pertama");
					}
					turn.view.state = "answering";
					turn.view.answerText += text;
					sender.delta(text);
					turn.view.sentencesSent = sender.sentCount;
					ctx.emit(turn);
					events.activity();
				},
			},
			turn.abort.signal,
		);
		ctx.setConversationId(res.conversationId);
		turn.view.answerText = res.text;
		turn.view.actionCount = res.actionCount;
		turn.view.sentencesSent = sender.finish(res.text);
		ctx.emit(turn);
		events.log(
			`jawaban Claude terkirim (${turn.view.sentencesSent} potongan, mode ${turn.sendMode})`,
		);
		ctx.answerSent(turn);
	} catch (err) {
		sender.cancel();
		if (isAbort(err) || turn.abort.signal.aborted) return;
		const message = describeError(err);
		ctx.commentary(delegationId, `Maaf, terjadi kendala: ${message}`);
		turn.view.state = "error";
		turn.view.error = message;
		ctx.emit(turn);
		ctx.failed(turn);
	}
}
