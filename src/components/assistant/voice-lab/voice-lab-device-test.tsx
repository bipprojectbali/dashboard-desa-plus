import { Alert, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";
import type { VoiceLabText } from "@/locales/voice-lab";
import {
	appliedSettings,
	checkWebRtc,
	createLevelMeter,
	openMic,
	stopStream,
	type WebRtcCheck,
} from "../voice/voice-devices";
import { createLevelBus } from "./voice-lab.level-bus";
import type { VoiceLabSettings } from "./voice-lab.types";
import { LevelBar } from "./voice-lab-controls";

interface Props {
	t: VoiceLabText;
	settings: VoiceLabSettings;
	/** Tes tidak boleh jalan bersamaan dengan sesi (mikrofon dipakai sesi). */
	sessionRunning: boolean;
}

interface Applied {
	label: string;
	echoCancellation?: boolean;
	noiseSuppression?: boolean;
}

const yesNo = (v: boolean | undefined) =>
	v === undefined ? "?" : v ? "ya" : "tidak";

export function VoiceLabDeviceTest({ t, settings, sessionRunning }: Props) {
	const bus = useMemo(createLevelBus, []);
	const [testing, setTesting] = useState(false);
	const [applied, setApplied] = useState<Applied | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [rtc, setRtc] = useState<WebRtcCheck | null>(null);
	const stopRef = useRef<(() => void) | null>(null);

	const stopTest = () => {
		stopRef.current?.();
		stopRef.current = null;
		setTesting(false);
	};
	useEffect(() => () => stopRef.current?.(), []);
	useEffect(() => {
		checkWebRtc()
			.then(setRtc)
			.catch((err: Error) =>
				setRtc({ supported: false, candidates: 0, detail: err.message }),
			);
	}, []);

	const startTest = async () => {
		setError(null);
		try {
			const mic = await openMic(settings);
			setApplied(appliedSettings(mic));
			const meter = createLevelMeter(mic, (rms) => bus.emit(rms));
			stopRef.current = () => {
				meter.stop();
				stopStream(mic);
			};
			setTesting(true);
		} catch (err) {
			setError(`Mikrofon: ${(err as Error).message}`);
		}
	};

	return (
		<Paper withBorder p="md" radius="md">
			<Stack gap="sm">
				<Title order={5}>{t.deviceTest}</Title>
				<Text size="xs" c="dimmed">
					{t.deviceTestIntro}
				</Text>
				<Group>
					<Button
						variant="light"
						onClick={testing ? stopTest : startTest}
						disabled={sessionRunning}
					>
						{testing ? t.stopTest : t.testMic}
					</Button>
					{rtc && (
						<Text
							size="sm"
							c={rtc.supported && rtc.candidates > 0 ? "teal" : "red"}
						>
							{t.webrtc}: {rtc.supported ? t.webrtcOk : t.webrtcFail} —{" "}
							{rtc.detail}
						</Text>
					)}
				</Group>
				<div>
					<Text size="xs" c="dimmed">
						{t.level}
					</Text>
					<LevelBar bus={bus} active={testing} />
				</div>
				{applied && (
					<Text size="xs" c="dimmed">
						{t.applied}: {applied.label || "—"} · {t.echoCancellation}{" "}
						{yesNo(applied.echoCancellation)} · {t.noiseSuppression}{" "}
						{yesNo(applied.noiseSuppression)}
					</Text>
				)}
				{error && <Alert color="red">{error}</Alert>}
			</Stack>
		</Paper>
	);
}
