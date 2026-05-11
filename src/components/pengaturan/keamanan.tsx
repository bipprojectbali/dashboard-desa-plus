import {
	Box,
	Button,
	Group,
	Notification,
	Stack,
	Switch,
	Text,
	Title,
} from "@mantine/core";
import { useEffect, useState } from "react";

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
				if (!res.ok) throw new Error("Gagal memuat preferensi");
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
		const t = setTimeout(() => setToast(null), 3000);
		return () => clearTimeout(t);
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
			if (!res.ok) throw new Error("Gagal menyimpan");
			const json = await res.json();
			const data = json.data as Prefs;
			setPrefs(data);
			setSavedPrefs(data);
			setToast({ type: "success", message: "Preferensi berhasil disimpan" });
		} catch {
			setToast({ type: "error", message: "Gagal menyimpan preferensi" });
		} finally {
			setSaving(false);
		}
	};

	const handleBatal = () => {
		setPrefs(savedPrefs);
	};

	const SwitchRow = ({
		label,
		field,
	}: {
		label: string;
		field: keyof Prefs;
	}) => (
		<Group mb="md" justify="space-between">
			<Text fw="bold" fz="sm">
				{label}
			</Text>
			<Switch
				checked={prefs[field]}
				onChange={() => toggle(field)}
				disabled={loading}
			/>
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
					<Title order={2}>Autentikasi</Title>
					<SwitchRow label="Two-Factor Authentication" field="twoFactorAuth" />
					<SwitchRow label="Biometrik Login" field="biometrikLogin" />
					<SwitchRow label="IP Whitelist" field="ipWhitelist" />
				</Stack>
			</Box>
			<Box>
				<Stack gap="xs">
					<Title order={2}>Password</Title>
					<Button bg="#1E3A5F" radius="md" c="white" fullWidth>
						Ubah Password
					</Button>
					<Button bg="#1E3A5F" radius="md" c="white" fullWidth>
						Riwayat Login
					</Button>
					<Button bg="#1E3A5F" radius="md" c="white" fullWidth>
						Perangkat Terdaftar
					</Button>
				</Stack>
			</Box>
			<Box>
				<Stack gap="xs">
					<Title order={2}>Audit & Log</Title>
					<SwitchRow label="Log Aktivitas" field="logAktivitas" />
					<Button bg="#1E3A5F" radius="md" c="white" fullWidth>
						Download Log
					</Button>
				</Stack>
			</Box>
			<Group justify="flex-start" mt="xl">
				<Button
					variant="outline"
					onClick={handleBatal}
					disabled={saving || loading}
				>
					Batal
				</Button>
				<Button onClick={handleSave} loading={saving} disabled={loading}>
					Simpan Perubahan
				</Button>
			</Group>
		</Stack>
	);
};

export default KeamananSettings;
