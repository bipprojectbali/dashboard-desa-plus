import {
	Alert,
	Button,
	Card,
	Group,
	NumberInput,
	Select,
	SimpleGrid,
	Stack,
	Switch,
	Text,
	Textarea,
	TextInput,
	Title,
} from "@mantine/core";
import { IconAlertCircle, IconDeviceFloppy } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import type {
	AssistantSettingsDto,
	KioskCandidateDto,
} from "@/types/ai-assistant-admin";
import { saveSettings } from "./ai-assistant.api";
import {
	ASSISTANT_NAME_MAX,
	LIMIT_RULES,
	PERSONA_NOTE_MAX,
	validateSettings,
} from "./ai-assistant.logic";

type LimitKey = keyof typeof LIMIT_RULES;

const LIMIT_ORDER: LimitKey[] = [
	"ratePerMinutePerUser",
	"dailyMessageLimitPerUser",
	"dailyTokenLimitGlobal",
	"maxInputChars",
	"historyWindow",
	"retentionDays",
];

interface Props {
	settings: AssistantSettingsDto;
	kioskCandidates: KioskCandidateDto[];
	disabled: boolean;
	onSaved: (settings: AssistantSettingsDto) => void;
}

/** Kartu "Umum" dan "Batas pemakaian" — satu form, disimpan lewat PUT settings. */
export function SettingsSection({
	settings,
	kioskCandidates,
	disabled,
	onSaved,
}: Props) {
	const [form, setForm] = useState(settings);
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);

	useEffect(() => setForm(settings), [settings]);

	const errors = useMemo(() => validateSettings(form), [form]);
	const dirty = JSON.stringify(form) !== JSON.stringify(settings);
	const set = <K extends keyof AssistantSettingsDto>(
		key: K,
		value: AssistantSettingsDto[K],
	) => {
		setSaved(false);
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const handleSave = async () => {
		setSaving(true);
		setSaveError(null);
		try {
			const next = await saveSettings({
				...form,
				assistantName: form.assistantName.trim(),
				personaNote: form.personaNote?.trim() || null,
			});
			onSaved(next);
			setSaved(true);
		} catch (err) {
			setSaveError(err instanceof Error ? err.message : "Gagal menyimpan");
		} finally {
			setSaving(false);
		}
	};

	const limitInput = (key: LimitKey) => {
		const rule = LIMIT_RULES[key];
		return (
			<NumberInput
				key={key}
				label={rule.label}
				description={rule.zeroUnlimited ? "0 = tanpa batas" : undefined}
				min={rule.min}
				max={rule.max}
				allowDecimal={false}
				thousandSeparator="."
				decimalSeparator=","
				value={form[key]}
				onChange={(v) => set(key, typeof v === "number" ? v : Number.NaN)}
				error={errors[key]}
				disabled={disabled}
			/>
		);
	};

	return (
		<Stack gap="md">
			<Card withBorder radius="md" p="lg">
				<Title order={4} mb="sm">
					Umum
				</Title>
				<Stack gap="sm">
					<Switch
						label="Aktifkan AI Assistant"
						description="Tombol asisten baru muncul untuk pengguna setelah ini aktif dan slot Chat sudah diisi."
						checked={form.enabled}
						onChange={(e) => set("enabled", e.currentTarget.checked)}
						disabled={disabled}
					/>
					<TextInput
						label="Nama asisten"
						maxLength={ASSISTANT_NAME_MAX}
						value={form.assistantName}
						onChange={(e) => set("assistantName", e.currentTarget.value)}
						error={errors.assistantName}
						disabled={disabled}
					/>
					<Textarea
						label="Catatan kepribadian (opsional)"
						description={`Instruksi tambahan untuk asisten, selalu di bawah aturan keamanan sistem. ${(form.personaNote ?? "").length}/${PERSONA_NOTE_MAX}`}
						autosize
						minRows={2}
						maxRows={6}
						value={form.personaNote ?? ""}
						onChange={(e) => set("personaNote", e.currentTarget.value)}
						error={errors.personaNote}
						disabled={disabled}
					/>
				</Stack>
			</Card>

			<Card withBorder radius="md" p="lg">
				<Title order={4} mb={4}>
					Batas pemakaian
				</Title>
				<Text size="sm" c="dimmed" mb="sm">
					Kuota harian direset pukul 00:00 WITA.
				</Text>
				<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
					{LIMIT_ORDER.map(limitInput)}
				</SimpleGrid>
				<SimpleGrid cols={{ base: 1, sm: 2 }} mt="md">
					<Select
						label="Akun kiosk /wall"
						description="Akun bersama di TV NOC; memakai kuota kiosk di sebelah."
						placeholder="Belum dipilih"
						clearable
						searchable
						data={kioskCandidates.map((c) => ({ value: c.id, label: c.name }))}
						value={form.kioskUserId}
						onChange={(v) => set("kioskUserId", v)}
						disabled={disabled}
					/>
					{limitInput("dailyMessageLimitKiosk")}
					{limitInput("guideAutoAdvanceSec")}
				</SimpleGrid>
			</Card>

			{saveError && (
				<Alert color="red" icon={<IconAlertCircle size={16} />}>
					{saveError}
				</Alert>
			)}
			<Group justify="flex-end">
				{saved && !dirty && (
					<Text size="sm" c="green">
						Tersimpan
					</Text>
				)}
				<Button
					leftSection={<IconDeviceFloppy size={16} />}
					onClick={handleSave}
					loading={saving}
					disabled={disabled || !dirty || Object.keys(errors).length > 0}
				>
					Simpan pengaturan
				</Button>
			</Group>
		</Stack>
	);
}
