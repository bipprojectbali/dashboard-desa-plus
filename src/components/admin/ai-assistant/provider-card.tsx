import {
	Alert,
	Badge,
	Button,
	Card,
	Group,
	NumberInput,
	PasswordInput,
	SimpleGrid,
	Stack,
	Switch,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import {
	IconAlertCircle,
	IconDeviceFloppy,
	IconPlayerPlay,
	IconTrash,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import type {
	ProviderSlotDto,
	ProviderTestResultDto,
} from "@/types/ai-assistant-admin";
import { saveProvider, testProvider } from "./ai-assistant.api";
import {
	buildProviderUpdate,
	FEATURE_LABELS,
	providerToForm,
	slotBadge,
	slotUnusedLabel,
	validateBaseUrl,
} from "./ai-assistant.logic";

interface Props {
	slot: ProviderSlotDto;
	disabled: boolean;
	cryptoConfigured: boolean;
	onSaved: (slot: ProviderSlotDto) => void;
}

const FALLBACK_NOTE: Record<string, string> = {
	pointer:
		"Belum dipakai: penunjuk memakai otak Chat, jadi isian di kartu ini belum berpengaruh.",
	voice:
		"Kosong → memakai kredensial Chat. Proxy Claude tidak menyediakan suara; slot ini dipakai bila fitur suara memakai provider lain.",
};

/** Kartu kredensial satu slot (Chat / Penunjuk / Suara) + tombol test koneksi. */
export function ProviderCard({
	slot,
	disabled,
	cryptoConfigured,
	onSaved,
}: Props) {
	const [form, setForm] = useState(() => providerToForm(slot));
	const [saving, setSaving] = useState(false);
	const [testing, setTesting] = useState(false);
	const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
		null,
	);

	useEffect(() => setForm(providerToForm(slot)), [slot]);

	const badge = slotBadge(slot);
	const unusedLabel = slotUnusedLabel(slot.feature);
	const baseUrlError = validateBaseUrl(form.baseUrl);
	const changesKey = form.apiKeyInput.trim() !== "" || form.clearApiKey;
	const blockedByCrypto = changesKey && !cryptoConfigured;
	const set = <K extends keyof typeof form>(
		key: K,
		value: (typeof form)[K],
	) => {
		setMessage(null);
		setForm((prev) => ({ ...prev, [key]: value }));
	};
	const numberOrNull = (v: string | number) =>
		typeof v === "number" ? v : null;

	const handleSave = async () => {
		setSaving(true);
		setMessage(null);
		try {
			onSaved(await saveProvider(slot.feature, buildProviderUpdate(form)));
			setMessage({ ok: true, text: "Tersimpan" });
		} catch (err) {
			setMessage({
				ok: false,
				text: err instanceof Error ? err.message : "Gagal menyimpan",
			});
		} finally {
			setSaving(false);
		}
	};

	const handleTest = async () => {
		setTesting(true);
		setMessage(null);
		try {
			const r: ProviderTestResultDto = await testProvider(slot.feature);
			setMessage(
				r.ok
					? { ok: true, text: `Koneksi berhasil (${r.latencyMs ?? "-"} ms)` }
					: {
							ok: false,
							text: `Koneksi gagal: ${r.error ?? "tanpa keterangan"}`,
						},
			);
		} catch (err) {
			setMessage({
				ok: false,
				text: err instanceof Error ? err.message : "Test gagal",
			});
		} finally {
			setTesting(false);
		}
	};

	return (
		<Card withBorder radius="md" p="lg">
			<Group justify="space-between" mb="xs">
				<Group gap="xs">
					<Title order={5}>{FEATURE_LABELS[slot.feature]}</Title>
					<Badge color={badge.color} variant="light" size="sm">
						{badge.label}
					</Badge>
					{unusedLabel && (
						<Badge color="gray" variant="outline" size="sm">
							{unusedLabel}
						</Badge>
					)}
				</Group>
				<Switch
					label="Aktif"
					checked={form.enabled}
					onChange={(e) => set("enabled", e.currentTarget.checked)}
					disabled={disabled}
				/>
			</Group>
			{FALLBACK_NOTE[slot.feature] && (
				<Text size="xs" c="dimmed" mb="sm">
					{FALLBACK_NOTE[slot.feature]}
				</Text>
			)}
			<Stack gap="sm">
				<TextInput
					label="Nama (opsional)"
					placeholder="Claude Proxy"
					value={form.label}
					onChange={(e) => set("label", e.currentTarget.value)}
					disabled={disabled}
				/>
				<TextInput
					label="Base URL (wajib diakhiri /v1)"
					placeholder="https://claude-proxy.example.com/v1"
					value={form.baseUrl}
					onChange={(e) => set("baseUrl", e.currentTarget.value)}
					error={baseUrlError}
					disabled={disabled}
				/>
				<Group align="flex-end" gap="xs" wrap="nowrap">
					<PasswordInput
						style={{ flex: 1 }}
						label="API Key"
						autoComplete="off"
						placeholder={
							form.clearApiKey
								? "Akan dihapus saat disimpan"
								: (slot.apiKeyHint ?? "sk-… (API key)")
						}
						description={
							slot.apiKeyStatus === "set"
								? "Kosongkan untuk mempertahankan key tersimpan."
								: undefined
						}
						value={form.apiKeyInput}
						onChange={(e) => set("apiKeyInput", e.currentTarget.value)}
						disabled={disabled || form.clearApiKey}
					/>
					{slot.apiKeyStatus !== "missing" && (
						<Button
							variant="light"
							color="red"
							leftSection={<IconTrash size={14} />}
							onClick={() => set("clearApiKey", !form.clearApiKey)}
							disabled={disabled}
						>
							{form.clearApiKey ? "Batal hapus" : "Hapus key"}
						</Button>
					)}
				</Group>
				<SimpleGrid cols={{ base: 1, sm: 2 }}>
					<TextInput
						label="Model"
						placeholder="nama model di proxy"
						value={form.model}
						onChange={(e) => set("model", e.currentTarget.value)}
						disabled={disabled}
					/>
					<NumberInput
						label="Timeout (ms)"
						min={5_000}
						max={300_000}
						step={5_000}
						allowDecimal={false}
						value={form.timeoutMs}
						onChange={(v) =>
							set("timeoutMs", typeof v === "number" ? v : 60_000)
						}
						disabled={disabled}
					/>
					<NumberInput
						label="Temperature (opsional)"
						description="Kosong = tidak dikirim"
						min={0}
						max={2}
						step={0.1}
						decimalScale={2}
						value={form.temperature ?? ""}
						onChange={(v) => set("temperature", numberOrNull(v))}
						disabled={disabled}
					/>
					<NumberInput
						label="Max tokens (opsional)"
						description="Kosong = default proxy"
						min={1}
						max={200_000}
						allowDecimal={false}
						value={form.maxTokens ?? ""}
						onChange={(v) => set("maxTokens", numberOrNull(v))}
						disabled={disabled}
					/>
				</SimpleGrid>
				{blockedByCrypto && (
					<Alert color="yellow" icon={<IconAlertCircle size={16} />}>
						AI_CREDENTIALS_KEY belum diset di server — API key tidak bisa
						disimpan.
					</Alert>
				)}
				{message && (
					<Text size="sm" c={message.ok ? "green" : "red"}>
						{message.text}
					</Text>
				)}
				{slot.lastTestAt && (
					<Text size="xs" c="dimmed">
						Test terakhir: {new Date(slot.lastTestAt).toLocaleString("id-ID")} —{" "}
						{slot.lastTestOk ? "berhasil" : "gagal"}
					</Text>
				)}
				<Group justify="flex-end">
					<Button
						variant="default"
						leftSection={<IconPlayerPlay size={14} />}
						onClick={handleTest}
						loading={testing}
						disabled={disabled || slot.apiKeyStatus !== "set"}
					>
						Test koneksi
					</Button>
					<Button
						leftSection={<IconDeviceFloppy size={14} />}
						onClick={handleSave}
						loading={saving}
						disabled={disabled || Boolean(baseUrlError) || blockedByCrypto}
					>
						Simpan
					</Button>
				</Group>
			</Stack>
		</Card>
	);
}
