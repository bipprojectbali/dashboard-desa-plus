import { useEffect, useRef, useState } from "react";
import { fetchVoiceLabConfig } from "./voice-lab.api";
import { VAD_DEFAULTS } from "./voice-lab.constants";
import type { VoiceLabConfig, VoiceLabSettings } from "./voice-lab.types";

/** Muat config halaman uji dari server dan simpan pengaturan yang bisa diubah. */

function initialSettings(config: VoiceLabConfig | null): VoiceLabSettings {
	const d = config?.defaults;
	return {
		transcribeModel: d?.transcribeModel ?? "",
		transcribeLanguage: d?.transcribeLanguage ?? "id",
		transcribeDelay: d?.transcribeDelay ?? "low",
		transcribeMode: "token",
		ttsModel: d?.ttsModel ?? "",
		ttsVoice: d?.ttsVoice ?? "",
		liveModel: d?.liveModel ?? "",
		liveInstructions: "",
		endMethod: "vad",
		threshold: VAD_DEFAULTS.threshold,
		silenceMs: VAD_DEFAULTS.silenceMs,
		echoCancellation: true,
		noiseSuppression: true,
		deviceId: "",
	};
}

export function useVoiceLabConfig() {
	const [config, setConfig] = useState<VoiceLabConfig | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [settings, setSettings] = useState<VoiceLabSettings>(() =>
		initialSettings(null),
	);
	const settingsRef = useRef(settings);
	settingsRef.current = settings;

	useEffect(() => {
		const controller = new AbortController();
		fetchVoiceLabConfig(controller.signal)
			.then((c) => {
				setConfig(c);
				setSettings(initialSettings(c));
			})
			.catch((err: Error) => {
				if (!controller.signal.aborted) setLoadError(err.message);
			});
		return () => controller.abort();
	}, []);

	const update = <K extends keyof VoiceLabSettings>(
		key: K,
		value: VoiceLabSettings[K],
	) => setSettings((prev) => ({ ...prev, [key]: value }));

	return { config, loadError, settings, settingsRef, update };
}
