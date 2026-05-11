import {
	Button,
	Grid,
	GridCol,
	Group,
	Notification,
	Stack,
	Switch,
	Text,
	Title,
} from "@mantine/core";
import { useEffect, useState } from "react";

type Prefs = {
	laporanHarian: boolean;
	alertSistem: boolean;
	updateKeamanan: boolean;
	newsletterBulan: boolean;
	alertKritis: boolean;
	aktivitasTim: boolean;
	komentarMention: boolean;
	bunyiNotifikasi: boolean;
	tresholdMemori: boolean;
	tresholdCpu: boolean;
	tresholdDisk: boolean;
};

const DEFAULT_PREFS: Prefs = {
	laporanHarian: true,
	alertSistem: true,
	updateKeamanan: true,
	newsletterBulan: true,
	alertKritis: true,
	aktivitasTim: true,
	komentarMention: true,
	bunyiNotifikasi: true,
	tresholdMemori: true,
	tresholdCpu: true,
	tresholdDisk: true,
};

const NotifikasiSettings = () => {
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
				const res = await fetch("/api/notification-preferences");
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
			const res = await fetch("/api/notification-preferences", {
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
		<Stack pr="20%" gap="xs">
			{toast && (
				<Notification
					color={toast.type === "success" ? "green" : "red"}
					onClose={() => setToast(null)}
					mb="sm"
				>
					{toast.message}
				</Notification>
			)}
			<Grid gutter={{ base: 5, xs: "md", md: "xl", xl: 50 }}>
				<GridCol span={6}>
					<Stack gap="xs">
						<Title order={3} mb="sm">
							Metode Notifikasi
						</Title>
						<SwitchRow label="Laporan Harian" field="laporanHarian" />
						<SwitchRow label="Alert Sistem" field="alertSistem" />
						<SwitchRow label="Update Keamanan" field="updateKeamanan" />
						<SwitchRow label="Newsletter Bulanan" field="newsletterBulan" />
					</Stack>
				</GridCol>
				<GridCol span={6}>
					<Stack gap="xs">
						<Title order={3} mb="sm">
							Preferensi Alert
						</Title>
						<SwitchRow label="Treshold Memori" field="tresholdMemori" />
						<SwitchRow label="Treshold CPU" field="tresholdCpu" />
						<SwitchRow label="Treshold Disk" field="tresholdDisk" />
					</Stack>
				</GridCol>
				<GridCol span={6}>
					<Stack gap="xs">
						<Title order={3} mb="sm">
							Notifikasi Push
						</Title>
						<SwitchRow label="Alert Kritis" field="alertKritis" />
						<SwitchRow label="Aktivitas Tim" field="aktivitasTim" />
						<SwitchRow label="Komentar & Mention" field="komentarMention" />
						<SwitchRow label="Bunyi Notifikasi" field="bunyiNotifikasi" />
					</Stack>
				</GridCol>
			</Grid>
			<Group justify="flex-start" mt="xl">
				<Button
					variant="outline"
					onClick={handleBatal}
					disabled={saving || loading}
				>
					Batal
				</Button>
				<Button onClick={handleSave} loading={saving} disabled={loading}>
					Simpan Preferensi
				</Button>
			</Group>
		</Stack>
	);
};

export default NotifikasiSettings;
