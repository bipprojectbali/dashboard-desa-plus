import {
	Box,
	Button,
	Group,
	Notification,
	Select,
	Stack,
	Switch,
	Text,
	Title,
} from "@mantine/core";
import { useEffect, useState } from "react";

type Prefs = {
	bahasa: string;
	zonaWaktu: string;
	formatTanggal: string;
	refreshOtomatis: boolean;
	intervalRefresh: string;
	tampilkanGrid: boolean;
	animasiTransisi: boolean;
};

const DEFAULT_PREFS: Prefs = {
	bahasa: "id",
	zonaWaktu: "Asia/Jakarta",
	formatTanggal: "DD/MM/YYYY",
	refreshOtomatis: true,
	intervalRefresh: "1",
	tampilkanGrid: true,
	animasiTransisi: true,
};

const UmumSettings = () => {
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
				const res = await fetch("/api/umum-preferences");
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

	const updatePref = (key: keyof Prefs, value: Prefs[keyof Prefs]) => {
		setPrefs((p) => ({ ...p, [key]: value }));
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			const res = await fetch("/api/umum-preferences", {
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
		field: "refreshOtomatis" | "tampilkanGrid" | "animasiTransisi";
	}) => (
		<Group mb="md" justify="space-between">
			<Text fw="bold" fz="sm">
				{label}
			</Text>
			<Switch
				checked={prefs[field]}
				onChange={() => updatePref(field, !prefs[field])}
				disabled={loading}
			/>
		</Group>
	);

	return (
		<Box pr="50%">
			{toast && (
				<Notification
					color={toast.type === "success" ? "green" : "red"}
					onClose={() => setToast(null)}
					mb="sm"
				>
					{toast.message}
				</Notification>
			)}

			<Title order={2} mb="lg">
				Preferensi Tampilan
			</Title>

			<Select
				label="Bahasa Aplikasi"
				data={[
					{ value: "id", label: "Indonesia" },
					{ value: "en", label: "English" },
				]}
				value={prefs.bahasa}
				onChange={(v) => updatePref("bahasa", v ?? "id")}
				disabled={loading}
				mb="md"
			/>

			<Select
				label="Zona Waktu"
				data={[
					{ value: "Asia/Jakarta", label: "Asia/Jakarta (GMT+7)" },
					{ value: "Asia/Makassar", label: "Asia/Makassar (GMT+8)" },
					{ value: "Asia/Jayapura", label: "Asia/Jayapura (GMT+9)" },
				]}
				value={prefs.zonaWaktu}
				onChange={(v) => updatePref("zonaWaktu", v ?? "Asia/Jakarta")}
				disabled={loading}
				mb="md"
			/>

			<Select
				label="Format Tanggal"
				data={[
					{ value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
					{ value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
					{ value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
				]}
				value={prefs.formatTanggal}
				onChange={(v) => updatePref("formatTanggal", v ?? "DD/MM/YYYY")}
				disabled={loading}
				mb="xl"
			/>

			<Title order={2} mb="lg">
				Dashboard
			</Title>

			<SwitchRow label="Refresh Otomatis" field="refreshOtomatis" />

			<Group mb="md" justify="space-between">
				<Text fw="bold" fz="sm">
					Interval Refresh
				</Text>
				<Select
					data={[
						{ value: "1", label: "30d" },
						{ value: "2", label: "60d" },
						{ value: "3", label: "90d" },
					]}
					value={prefs.intervalRefresh}
					onChange={(v) => updatePref("intervalRefresh", v ?? "1")}
					disabled={loading}
					w={90}
				/>
			</Group>

			<SwitchRow label="Tampilkan Grid" field="tampilkanGrid" />
			<SwitchRow label="Animasi Transisi" field="animasiTransisi" />

			<Group justify="flex-end" mt="xl">
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
		</Box>
	);
};

export default UmumSettings;
