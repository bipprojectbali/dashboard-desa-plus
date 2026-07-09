import {
	Alert,
	Badge,
	Box,
	Button,
	Divider,
	Group,
	LoadingOverlay,
	Paper,
	Select,
	Skeleton,
	Stack,
	Switch,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import {
	IconCheck,
	IconClock,
	IconGlobe,
	IconLanguage,
	IconLayoutGrid,
	IconRefresh,
	IconSparkles,
	IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useApprovalGuard } from "@/hooks/useApprovalGuard";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import {
	type FormatTanggal,
	setDashboardPrefs,
	setFormatTanggal,
	setLang,
	setZonaWaktu,
} from "@/store/i18n";

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
	const t = useTranslate();
	const { withApproval } = useApprovalGuard();
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
				// Sync bahasa & zona waktu ke store saat load
				setLang(data.bahasa === "en" ? "en" : "id");
				setZonaWaktu(data.zonaWaktu);
				setFormatTanggal(data.formatTanggal as FormatTanggal);
				setDashboardPrefs({
					refreshOtomatis: data.refreshOtomatis,
					intervalRefresh: data.intervalRefresh,
					tampilkanGrid: data.tampilkanGrid,
					animasiTransisi: data.animasiTransisi,
				});
			} catch (err) {
				console.error("Gagal memuat preferensi umum:", err);
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

	const updatePref = (key: keyof Prefs, value: Prefs[keyof Prefs]) => {
		setPrefs((p) => ({ ...p, [key]: value }));
	};

	const handleBahasaChange = (v: string | null) => {
		const lang = v === "en" ? "en" : "id";
		updatePref("bahasa", lang);
		// Langsung apply perubahan bahasa ke UI
		setLang(lang);
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
			setFormatTanggal(data.formatTanggal as FormatTanggal);
			setDashboardPrefs({
				refreshOtomatis: data.refreshOtomatis,
				intervalRefresh: data.intervalRefresh,
				tampilkanGrid: data.tampilkanGrid,
				animasiTransisi: data.animasiTransisi,
			});
			setToast({ type: "success", message: t.common.berhasilDisimpan });
		} catch {
			setToast({ type: "error", message: t.common.gagalSimpan });
		} finally {
			setSaving(false);
		}
	};

	const handleBatal = () => {
		setPrefs(savedPrefs);
		setLang(savedPrefs.bahasa === "en" ? "en" : "id");
		setZonaWaktu(savedPrefs.zonaWaktu);
		setFormatTanggal(savedPrefs.formatTanggal as FormatTanggal);
		setDashboardPrefs({
			refreshOtomatis: savedPrefs.refreshOtomatis,
			intervalRefresh: savedPrefs.intervalRefresh,
			tampilkanGrid: savedPrefs.tampilkanGrid,
			animasiTransisi: savedPrefs.animasiTransisi,
		});
	};

	const dark = useIsDark();

	const isDirty =
		prefs.bahasa !== savedPrefs.bahasa ||
		prefs.zonaWaktu !== savedPrefs.zonaWaktu ||
		prefs.formatTanggal !== savedPrefs.formatTanggal ||
		prefs.refreshOtomatis !== savedPrefs.refreshOtomatis ||
		prefs.intervalRefresh !== savedPrefs.intervalRefresh ||
		prefs.tampilkanGrid !== savedPrefs.tampilkanGrid ||
		prefs.animasiTransisi !== savedPrefs.animasiTransisi;

	const SwitchRow = ({
		label,
		description,
		icon,
		field,
	}: {
		label: string;
		description: string;
		icon: React.ReactNode;
		field: "refreshOtomatis" | "tampilkanGrid" | "animasiTransisi";
	}) => (
		<Group
			justify="space-between"
			wrap="nowrap"
			align="center"
			py="sm"
			gap="sm"
		>
			<Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
				<ThemeIcon
					size={36}
					radius="md"
					variant="light"
					color="blue"
					style={{ flexShrink: 0 }}
				>
					{icon}
				</ThemeIcon>
				<Box style={{ minWidth: 0 }}>
					<Text fw={600} fz="sm">
						{label}
					</Text>
					<Text fz="xs" c="dimmed" style={{ wordBreak: "break-word" }}>
						{description}
					</Text>
				</Box>
			</Group>
			<Switch
				checked={prefs[field]}
				onChange={() => updatePref(field, !prefs[field])}
				disabled={loading}
				size="md"
				style={{ flexShrink: 0 }}
			/>
		</Group>
	);

	return (
		<Box maw={680} pos="relative">
			<LoadingOverlay visible={loading} />
			{toast && (
				<Alert
					color={toast.type === "success" ? "green" : "red"}
					icon={
						toast.type === "success" ? (
							<IconCheck size={16} />
						) : (
							<IconX size={16} />
						)
					}
					withCloseButton
					onClose={() => setToast(null)}
					mb="md"
					radius="md"
				>
					{toast.message}
				</Alert>
			)}

			{/* Tampilan & Bahasa */}
			<Paper
				withBorder
				radius="lg"
				p="xl"
				mb="lg"
				bg={dark ? "#1E293B" : "white"}
				style={{ borderColor: dark ? "#334155" : "#e2e8f0" }}
			>
				<Group gap="sm" mb="lg">
					<ThemeIcon
						size={38}
						radius="md"
						variant="gradient"
						gradient={{ from: "blue", to: "violet" }}
					>
						<IconGlobe size={20} />
					</ThemeIcon>
					<Box>
						<Title order={4} fw={700}>
							{t.umum.judulTampilan}
						</Title>
						<Text fz="xs" c="dimmed">
							Atur bahasa, zona waktu, dan format tampilan
						</Text>
					</Box>
				</Group>

				<Stack gap="md">
					{loading ? (
						<>
							<Skeleton height={56} radius="md" />
							<Skeleton height={56} radius="md" />
							<Skeleton height={56} radius="md" />
						</>
					) : (
						<>
							<Select
								label={
									<Group gap={6} mb={4}>
										<IconLanguage size={14} />
										<Text fz="sm" fw={600}>
											{t.umum.bahasaAplikasi}
										</Text>
									</Group>
								}
								description="Bahasa yang digunakan di seluruh antarmuka aplikasi"
								data={[
									{ value: "id", label: "🇮🇩  Bahasa Indonesia" },
									{ value: "en", label: "🇬🇧  English" },
								]}
								value={prefs.bahasa}
								onChange={handleBahasaChange}
								disabled={loading}
								radius="md"
								rightSection={
									<Badge size="xs" color="blue" variant="light">
										{prefs.bahasa === "en" ? "EN" : "ID"}
									</Badge>
								}
								styles={{
									input: {
										backgroundColor: dark ? "#213654" : "#EBF2FD",
										borderColor: dark ? "#213654" : "#EBF2FD",
										minHeight: "44px",
									},
								}}
							/>

							<Select
								label={
									<Group gap={6} mb={4}>
										<IconClock size={14} />
										<Text fz="sm" fw={600}>
											{t.umum.zonaWaktu}
										</Text>
									</Group>
								}
								description="Zona waktu untuk menampilkan tanggal dan jam di dashboard"
								data={[
									{
										value: "Asia/Jakarta",
										label: "Asia/Jakarta — WIB (GMT+7)",
									},
									{
										value: "Asia/Makassar",
										label: "Asia/Makassar — WITA (GMT+8)",
									},
									{
										value: "Asia/Jayapura",
										label: "Asia/Jayapura — WIT (GMT+9)",
									},
								]}
								value={prefs.zonaWaktu}
								onChange={(v) => {
									const zona = v ?? "Asia/Jakarta";
									updatePref("zonaWaktu", zona);
									setZonaWaktu(zona);
								}}
								disabled={loading}
								radius="md"
								styles={{
									input: {
										backgroundColor: dark ? "#213654" : "#EBF2FD",
										borderColor: dark ? "#213654" : "#EBF2FD",
										minHeight: "44px",
									},
								}}
							/>

							<Select
								label={
									<Group gap={6} mb={4}>
										<IconClock size={14} />
										<Text fz="sm" fw={600}>
											{t.umum.formatTanggal}
										</Text>
									</Group>
								}
								description="Format penulisan tanggal di seluruh halaman dashboard"
								data={[
									{
										value: "DD/MM/YYYY",
										label: "DD/MM/YYYY  (contoh: 11/05/2026)",
									},
									{
										value: "MM/DD/YYYY",
										label: "MM/DD/YYYY  (contoh: 05/11/2026)",
									},
									{
										value: "YYYY-MM-DD",
										label: "YYYY-MM-DD  (contoh: 2026-05-11)",
									},
								]}
								value={prefs.formatTanggal}
								onChange={(v) => {
									const fmt = (v ?? "DD/MM/YYYY") as FormatTanggal;
									updatePref("formatTanggal", fmt);
									setFormatTanggal(fmt);
								}}
								disabled={loading}
								radius="md"
								styles={{
									input: {
										backgroundColor: dark ? "#213654" : "#EBF2FD",
										borderColor: dark ? "#213654" : "#EBF2FD",
										minHeight: "44px",
									},
								}}
							/>
						</>
					)}
				</Stack>
			</Paper>

			{/* Dashboard */}
			<Paper
				withBorder
				radius="lg"
				p="xl"
				mb="lg"
				bg={dark ? "#1E293B" : "white"}
				style={{ borderColor: dark ? "#334155" : "#e2e8f0" }}
			>
				<Group gap="sm" mb="lg">
					<ThemeIcon
						size={38}
						radius="md"
						variant="gradient"
						gradient={{ from: "teal", to: "cyan" }}
					>
						<IconLayoutGrid size={20} />
					</ThemeIcon>
					<Box>
						<Title order={4} fw={700}>
							{t.umum.judulDashboard}
						</Title>
						<Text fz="xs" c="dimmed">
							Konfigurasi perilaku dan tampilan dashboard
						</Text>
					</Box>
				</Group>

				{loading ? (
					<Stack gap="sm">
						<Skeleton height={52} radius="md" />
						<Skeleton height={52} radius="md" />
						<Skeleton height={52} radius="md" />
					</Stack>
				) : (
					<>
						<SwitchRow
							label={t.umum.refreshOtomatis}
							description="Data dashboard diperbarui otomatis secara berkala"
							icon={<IconRefresh size={18} />}
							field="refreshOtomatis"
						/>

						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />

						<Group justify="space-between" wrap="wrap" py="sm" gap="sm">
							<Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
								<ThemeIcon size={36} radius="md" variant="light" color="blue">
									<IconClock size={18} />
								</ThemeIcon>
								<Box style={{ minWidth: 0 }}>
									<Text fw={600} fz="sm">
										{t.umum.intervalRefresh}
									</Text>
									<Text fz="xs" c="dimmed" style={{ wordBreak: "break-word" }}>
										Seberapa sering data diperbarui secara otomatis
									</Text>
								</Box>
							</Group>
							<Select
								data={[
									{ value: "1", label: "30 detik" },
									{ value: "2", label: "1 menit" },
									{ value: "3", label: "5 menit" },
									{ value: "4", label: "15 menit" },
								]}
								value={prefs.intervalRefresh}
								onChange={(v) => updatePref("intervalRefresh", v ?? "1")}
								disabled={loading || !prefs.refreshOtomatis}
								w={130}
								radius="md"
								size={"sm"}
								styles={{
									input: {
										backgroundColor: dark ? "#213654" : "#EBF2FD",
										borderColor: dark ? "#213654" : "#EBF2FD",
										minHeight: "44px",
									},
								}}
							/>
						</Group>

						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />

						<SwitchRow
							label={t.umum.tampilkanGrid}
							description="Tampilkan garis grid di latar belakang tabel dan grafik"
							icon={<IconLayoutGrid size={18} />}
							field="tampilkanGrid"
						/>

						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />

						<SwitchRow
							label={t.umum.animasiTransisi}
							description="Aktifkan animasi saat berpindah halaman atau memuat data"
							icon={<IconSparkles size={18} />}
							field="animasiTransisi"
						/>
					</>
				)}
			</Paper>

			<Group justify="flex-end" gap="sm">
				<Button
					variant="default"
					onClick={handleBatal}
					disabled={saving || loading || !isDirty}
					radius="md"
				>
					{t.common.batal}
				</Button>
				<Button
					onClick={() => withApproval(handleSave, "preferensi umum")}
					loading={saving}
					disabled={loading || !isDirty}
					radius="md"
					gradient={{ from: "blue", to: "violet" }}
					variant="gradient"
					leftSection={<IconCheck size={16} />}
				>
					{t.common.simpan}
				</Button>
			</Group>
		</Box>
	);
};

export default UmumSettings;
