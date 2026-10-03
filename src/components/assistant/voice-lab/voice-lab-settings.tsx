import {
	Button,
	Checkbox,
	Group,
	NativeSelect,
	Paper,
	SegmentedControl,
	Slider,
	Stack,
	Text,
	Textarea,
	TextInput,
	Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import type { VoiceLabText } from "@/locales/voice-lab";
import { listInputDevices } from "../voice/voice-devices";
import {
	LIVE_INSTRUCTIONS_MAX,
	READ_EXACT_INSTRUCTION,
	VAD_LIMITS,
} from "./voice-lab.constants";
import { validateLiveInstructions } from "./voice-lab.instructions";
import type { VoiceLabConfig, VoiceLabSettings } from "./voice-lab.types";

interface Props {
	t: VoiceLabText;
	config: VoiceLabConfig | null;
	settings: VoiceLabSettings;
	disabled: boolean;
	onChange: <K extends keyof VoiceLabSettings>(
		key: K,
		value: VoiceLabSettings[K],
	) => void;
}

/** Pilihan dropdown + nilai saat ini (bila bukan dari daftar saran). */
function options(
	list: readonly string[] | undefined,
	current: string,
): string[] {
	const base = list ? [...list] : [];
	return current && !base.includes(current) ? [current, ...base] : base;
}

export function VoiceLabSettingsPanel({
	t,
	config,
	settings: s,
	disabled,
	onChange,
}: Props) {
	const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
	useEffect(() => {
		listInputDevices()
			.then(setDevices)
			.catch(() => setDevices([]));
	}, []);
	const sg = config?.suggestions;
	const defaultInstructions =
		config?.liveInstructions ?? READ_EXACT_INSTRUCTION;
	return (
		<Paper withBorder p="md" radius="md">
			<Stack gap="sm">
				<Title order={5}>{t.settings}</Title>
				<Group grow align="flex-start">
					<TextInput
						label={t.transcribeModel}
						list="vl-transcribe-models"
						value={s.transcribeModel}
						disabled={disabled}
						onChange={(e) => onChange("transcribeModel", e.currentTarget.value)}
					/>
					<datalist id="vl-transcribe-models">
						{options(sg?.transcribeModels, s.transcribeModel).map((m) => (
							<option key={m} value={m} />
						))}
					</datalist>
					<TextInput
						label={t.language}
						value={s.transcribeLanguage}
						disabled={disabled}
						onChange={(e) =>
							onChange("transcribeLanguage", e.currentTarget.value)
						}
					/>
					<NativeSelect
						label={t.delay}
						data={options(sg?.transcribeDelays, s.transcribeDelay)}
						value={s.transcribeDelay}
						disabled={disabled}
						onChange={(e) => onChange("transcribeDelay", e.currentTarget.value)}
					/>
				</Group>
				<div>
					<Text size="sm" fw={500} mb={4}>
						{t.transcribeMode}
					</Text>
					<SegmentedControl
						size="xs"
						value={s.transcribeMode}
						disabled={disabled}
						onChange={(v) =>
							onChange(
								"transcribeMode",
								v as VoiceLabSettings["transcribeMode"],
							)
						}
						data={[
							{ value: "token", label: t.modeToken },
							{ value: "relay", label: t.modeRelay },
						]}
					/>
				</div>
				<Group grow align="flex-start">
					<TextInput
						label={t.ttsModel}
						value={s.ttsModel}
						disabled={disabled}
						onChange={(e) => onChange("ttsModel", e.currentTarget.value)}
					/>
					<NativeSelect
						label={t.ttsVoice}
						data={options(sg?.ttsVoices, s.ttsVoice)}
						value={s.ttsVoice}
						disabled={disabled}
						onChange={(e) => onChange("ttsVoice", e.currentTarget.value)}
					/>
					<TextInput
						label={t.liveModel}
						value={s.liveModel}
						disabled={disabled}
						onChange={(e) => onChange("liveModel", e.currentTarget.value)}
					/>
				</Group>
				<div>
					<Text size="sm" fw={500} mb={4}>
						{t.sendMode}
					</Text>
					<SegmentedControl
						size="xs"
						value={s.sendMode}
						onChange={(v) =>
							onChange("sendMode", v as VoiceLabSettings["sendMode"])
						}
						data={[
							{ value: "sentence", label: t.sendSentence },
							{ value: "whole", label: t.sendWhole },
						]}
					/>
				</div>
				<Checkbox
					label={t.spokenNumbers}
					description={t.spokenNumbersHint}
					checked={s.spokenNumbers}
					onChange={(e) => onChange("spokenNumbers", e.currentTarget.checked)}
				/>
				<Textarea
					label={t.liveInstructions}
					description={`${t.instructionsHint} (${s.liveInstructions.trim().length}/${LIVE_INSTRUCTIONS_MAX})`}
					error={
						validateLiveInstructions(s.liveInstructions)
							? t.instructionsTooLong
							: undefined
					}
					value={s.liveInstructions}
					disabled={disabled}
					autosize
					minRows={3}
					onChange={(e) => onChange("liveInstructions", e.currentTarget.value)}
				/>
				<Group>
					<Button
						size="xs"
						variant="subtle"
						disabled={disabled || s.liveInstructions === defaultInstructions}
						onClick={() => onChange("liveInstructions", defaultInstructions)}
					>
						{t.instructionsReset}
					</Button>
				</Group>
				<div>
					<Text size="sm" fw={500} mb={4}>
						{t.endMethod}
					</Text>
					<SegmentedControl
						size="xs"
						value={s.endMethod}
						onChange={(v) =>
							onChange("endMethod", v as VoiceLabSettings["endMethod"])
						}
						data={[
							{ value: "vad", label: t.endVad },
							{ value: "manual", label: t.endManual },
						]}
					/>
				</div>
				<div>
					<Text size="sm">
						{t.threshold}: {s.threshold.toFixed(3)}
					</Text>
					<Slider
						min={VAD_LIMITS.threshold.min}
						max={VAD_LIMITS.threshold.max}
						step={VAD_LIMITS.threshold.step}
						value={s.threshold}
						onChange={(v) => onChange("threshold", v)}
					/>
				</div>
				<div>
					<Text size="sm">
						{t.silence}: {s.silenceMs}
					</Text>
					<Slider
						min={VAD_LIMITS.silenceMs.min}
						max={VAD_LIMITS.silenceMs.max}
						step={VAD_LIMITS.silenceMs.step}
						value={s.silenceMs}
						onChange={(v) => onChange("silenceMs", v)}
					/>
				</div>
				<NativeSelect
					label={t.microphone}
					disabled={disabled}
					value={s.deviceId}
					onChange={(e) => onChange("deviceId", e.currentTarget.value)}
					data={[
						{ value: "", label: t.defaultMic },
						...devices
							.filter((d) => d.deviceId)
							.map((d, i) => ({
								value: d.deviceId,
								label: d.label || `${t.microphone} ${i + 1}`,
							})),
					]}
				/>
				<Group>
					<Checkbox
						label={t.echoCancellation}
						checked={s.echoCancellation}
						disabled={disabled}
						onChange={(e) =>
							onChange("echoCancellation", e.currentTarget.checked)
						}
					/>
					<Checkbox
						label={t.noiseSuppression}
						checked={s.noiseSuppression}
						disabled={disabled}
						onChange={(e) =>
							onChange("noiseSuppression", e.currentTarget.checked)
						}
					/>
				</Group>
			</Stack>
		</Paper>
	);
}
