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
	izinExportData: boolean;
	requireApprovalPerubahan: boolean;
};

const DEFAULT_PREFS: Prefs = {
	izinExportData: true,
	requireApprovalPerubahan: true,
};

const AksesDanTimSettings = () => {
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
				const res = await fetch("/api/akses-preferences");
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
			const res = await fetch("/api/akses-preferences", {
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
					<Title order={2}>Manajemen Tim</Title>
					<Button bg="#1E3A5F" radius="md" c="white" fullWidth>
						Undangan Anggota Baru
					</Button>
					<Button bg="#1E3A5F" radius="md" c="white" fullWidth>
						Kelola Role & Permission
					</Button>
					<Group justify="space-between">
						<Text fw="bold" fz="sm">
							Daftar Anggota Teraktif
						</Text>
						<Text fw="bold" fz="sm">
							12 Anggota
						</Text>
					</Group>
				</Stack>
			</Box>
			<Box>
				<Stack gap="xs">
					<Title order={2}>Hak Akses</Title>
					<Group justify="space-between">
						<Text fw="bold" fz="sm">
							Administrator
						</Text>
						<Text fw="bold" fz="sm">
							2 Orang
						</Text>
					</Group>
					<Group justify="space-between">
						<Text fw="bold" fz="sm">
							Editor
						</Text>
						<Text fw="bold" fz="sm">
							5 Orang
						</Text>
					</Group>
					<Group justify="space-between">
						<Text fw="bold" fz="sm">
							Viewer
						</Text>
						<Text fw="bold" fz="sm">
							5 Orang
						</Text>
					</Group>
				</Stack>
			</Box>
			<Box>
				<Stack gap="xs">
					<Title order={2}>Kolaborasi</Title>
					<SwitchRow label="Izin Export Data" field="izinExportData" />
					<SwitchRow
						label="Require Approval Untuk Perubahan"
						field="requireApprovalPerubahan"
					/>
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

export default AksesDanTimSettings;
