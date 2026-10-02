import {
	Alert,
	Badge,
	Button,
	Group,
	Paper,
	Progress,
	SegmentedControl,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import { IconMicrophone, IconPlayerStop } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import type { VoiceLabText } from "@/locales/voice-lab";
import type { AutoOffReason } from "./use-voice-lab";
import type { VoiceLabPath } from "./voice-lab.constants";
import type { LevelBus } from "./voice-lab.level-bus";
import type { VoiceStatus } from "./voice-lab.types";

const STATUS_COLOR: Record<VoiceStatus, string> = {
	off: "gray",
	connecting: "yellow",
	ready: "teal",
	listening: "blue",
	answering: "grape",
};

function statusLabel(t: VoiceLabText, status: VoiceStatus): string {
	const map: Record<VoiceStatus, string> = {
		off: t.statusOff,
		connecting: t.statusConnecting,
		ready: t.statusReady,
		listening: t.statusListening,
		answering: t.statusAnswering,
	};
	return map[status];
}

function formatClock(ms: number): string {
	const total = Math.max(0, Math.ceil(ms / 1000));
	const m = Math.floor(total / 60);
	return `${m}:${String(total % 60).padStart(2, "0")}`;
}

/** Meter level yang berlangganan bus sendiri agar halaman tidak dirender ulang tiap 50 ms. */
export function LevelBar({
	bus,
	active,
	max = 0.2,
}: {
	bus: LevelBus;
	active: boolean;
	max?: number;
}) {
	const [level, setLevel] = useState(0);
	useEffect(() => {
		if (!active) {
			setLevel(0);
			return;
		}
		return bus.subscribe((rms) => setLevel(Math.min(100, (rms / max) * 100)));
	}, [bus, active, max]);
	return (
		<Progress value={level} size="sm" color={level > 85 ? "red" : "teal"} />
	);
}

interface Props {
	t: VoiceLabText;
	path: VoiceLabPath;
	onPath: (p: VoiceLabPath) => void;
	status: VoiceStatus;
	remaining: number;
	autoOff: AutoOffReason;
	slotReady: boolean;
	levelBus: LevelBus;
	onStart: () => void;
	onStop: () => void;
	onCommit: () => void;
}

export function VoiceLabControls(p: Props) {
	const { t, status } = p;
	const running = status !== "off";
	return (
		<Paper withBorder p="md" radius="md">
			<Stack gap="sm">
				<SegmentedControl
					value={p.path}
					disabled={running}
					onChange={(v) => p.onPath(v as VoiceLabPath)}
					data={[
						{ value: "v2", label: t.pathV2 },
						{ value: "v1b", label: t.pathV1b },
					]}
				/>
				<Text size="xs" c="dimmed">
					{p.path === "v2" ? t.pathV2Hint : t.pathV1bHint}
				</Text>
				<Group>
					{running ? (
						<Button
							color="red"
							leftSection={<IconPlayerStop size={16} />}
							onClick={p.onStop}
						>
							{t.turnOff}
						</Button>
					) : (
						<Button
							leftSection={<IconMicrophone size={16} />}
							onClick={p.onStart}
							disabled={!p.slotReady}
						>
							{t.turnOn}
						</Button>
					)}
					<Tooltip label={t.manualEndOnlyV2} disabled={p.path === "v2"}>
						<span>
							<Button
								variant="light"
								onClick={p.onCommit}
								disabled={!running || p.path !== "v2"}
							>
								{t.manualEnd}
							</Button>
						</span>
					</Tooltip>
					<Badge color={STATUS_COLOR[status]} size="lg" variant="filled">
						{statusLabel(t, status)}
					</Badge>
					{running && (
						<Text size="sm" c="dimmed">
							{t.remaining}: {formatClock(p.remaining)}
						</Text>
					)}
				</Group>
				<LevelBar bus={p.levelBus} active={running} />
				{p.autoOff && (
					<Alert color="yellow">
						{p.autoOff === "idle" ? t.autoOffIdle : t.autoOffCap}
					</Alert>
				)}
			</Stack>
		</Paper>
	);
}
