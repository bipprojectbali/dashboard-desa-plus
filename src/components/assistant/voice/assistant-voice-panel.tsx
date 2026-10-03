import { useMemo } from "react";
import { useSnapshot } from "valtio";
import { voiceStore } from "@/store/assistant-voice";
import type { AssistantStatusDto } from "@/types/ai-assistant-chat";
import { useAssistantVoiceText } from "../use-assistant-access";
import { useAssistantVoice } from "./use-assistant-voice";
import {
	projectBeat,
	remainingSeconds,
	shouldInviteExtend,
} from "./voice.logic";
import { VoiceConsentBanner } from "./voice-consent-banner";
import { VoiceControlsView } from "./voice-controls";
import { isSupportedBrowser } from "./voice-devices";
import {
	extendVoice,
	setVoiceAnswerMuted,
	setVoiceMicMuted,
	stopVoice,
} from "./voice-session";

/** Mode suara di panel Jenna (Drawer & tertanam). Disembunyikan bila tidak diizinkan. */
export function AssistantVoicePanel({
	status,
}: {
	status: AssistantStatusDto;
}) {
	const snap = useSnapshot(voiceStore);
	const t = useAssistantVoiceText();
	const voice = useAssistantVoice(status.maxInputChars);
	const supported = useMemo(() => isSupportedBrowser(), []);

	if (!status.voiceAllowed && snap.status === "off") return null;

	const live = snap.beat
		? projectBeat(snap.beat, (snap.now - snap.beatAt) / 1000)
		: null;
	const name = status.assistantName;

	return (
		<>
			{snap.consentOpen && snap.status === "off" ? (
				<VoiceConsentBanner
					t={t}
					name={name}
					onAccept={() => void voice.acceptConsent()}
					onDecline={voice.declineConsent}
				/>
			) : (
				<VoiceControlsView
					t={t}
					name={name}
					status={snap.status}
					supported={supported}
					transcript={snap.transcript}
					remaining={live ? remainingSeconds(live) : null}
					inviteExtend={live ? shouldInviteExtend(live) : false}
					answerMuted={snap.answerMuted}
					micMuted={snap.micMuted}
					notice={snap.notice}
					onStart={() => voice.requestStart(status.voiceConsented)}
					onStop={stopVoice}
					onExtend={() => void extendVoice()}
					onToggleAnswer={() => setVoiceAnswerMuted(!snap.answerMuted)}
					onToggleMic={() => setVoiceMicMuted(!snap.micMuted)}
					onDismissNotice={() => {
						voiceStore.notice = null;
					}}
				/>
			)}
		</>
	);
}
