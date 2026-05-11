import { Box, Button, Group, Notification, Stack, Switch, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { useTranslate } from "@/hooks/useTranslate";

type Prefs = {
	twoFactorAuth: boolean;
	biometrikLogin: boolean;
	ipWhitelist: boolean;
	logAktivitas: boolean;
};

const DEFAULT_PREFS: Prefs = {
	twoFactorAuth: false,
	biometrikLogin: false,
	ipWhitelist: false,
	logAktivitas: true,
};

const KeamananSettings = () => {
	const t = useTranslate();
	const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
	const [savedPrefs, setSavedPrefs] = useState<Prefs>(DEFAULT_PREFS);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	useEffect(() => {
		const fetchPrefs = async () => {
			try {
				const res = await fetch("/api/keamanan-preferences");
				if (!res.ok) throw new Error("error");
				const json = await res.json();
				const data = json.data as Prefs;
				setPrefs(data);
				setSavedPrefs(data);
			} catch {
				// keep defaults
			} finally {
				setLoading(false);
			}
		};
		fetchPrefs();
	}, []);

	useEffect(() => {
		if (!toast) return;
		const timer = setTimeout(() => setToast(null), 3000);
		return () => clearTimeout(timer);
	}, [toast]);

	const toggle = (key: keyof Prefs) => {
		setPrefs((p) => ({ ...p, [key]: !p[key] }));
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			const res = await fetch("/api/keamanan-preferences", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(prefs),
			});
			if (!res.ok) throw new Error("error");
			const json = await res.json();
			const data = json.data as Prefs;
			setPrefs(data);
			setSavedPrefs(data);
			setToast({ type: "success", message: t.common.berhasilDisimpan });
		} catch {
			setToast({ type: "error", message: t.common.gagalSimpan });
		} finally {
			setSaving(false);
		}
	};

	const handleBatal = () => {
		setPrefs(savedPrefs);
	};

	const SwitchRow = ({ label, field }: { label: string; field: keyof Prefs }) => (
		<Group mb="md" justify="space-between">
			<Text fw="bold" fz="sm">
				{label}
			</Text>
			<Switch checked={prefs[field]} onChange={() => toggle(field)} disabled={loading} />
		</Group>
	);

	return (
		<Stack pr="50%" gap="xl">
			{toast && (
				<Notification
					color={toast.type === "success" ? "green" : "red"}
					onClose={() => setToast(null)}
				>
					{toast.message}
				</Notification>
			)}
			<Box>
				<Stack gap="xs">
					<Title order={2}>{t.keamanan.autentikasi}</Title>
					<SwitchRow label={t.keamanan.twoFactor} field="twoFactorAuth" />
					<SwitchRow label={t.keamanan.biometrikLogin} field="biometrikLogin" />
					<SwitchRow label={t.keamanan.ipWhitelist} field="ipWhitelist" />
				</Stack>
			</Box>
			<Box>
				<Stack gap="xs">
					<Title order={2}>{t.keamanan.password}</Title>
					<Button bg="#1E3A5F" radius="md" c="white" fullWidth>
						{t.keamanan.ubahPassword}
					</Button>
					<Button bg="#1E3A5F" radius="md" c="white" fullWidth>
						{t.keamanan.riwayatLogin}
					</Button>
					<Button bg="#1E3A5F" radius="md" c="white" fullWidth>
						{t.keamanan.perangkatTerdaftar}
					</Button>
				</Stack>
			</Box>
			<Box>
				<Stack gap="xs">
					<Title order={2}>{t.keamanan.auditLog}</Title>
					<SwitchRow label={t.keamanan.logAktivitas} field="logAktivitas" />
					<Button bg="#1E3A5F" radius="md" c="white" fullWidth>
						{t.keamanan.downloadLog}
					</Button>
				</Stack>
			</Box>
			<Group justify="flex-start" mt="xl">
				<Button variant="outline" onClick={handleBatal} disabled={saving || loading}>
					{t.common.batal}
				</Button>
				<Button onClick={handleSave} loading={saving} disabled={loading}>
					{t.common.simpan}
				</Button>
			</Group>
		</Stack>
	);
};

export default KeamananSettings;
