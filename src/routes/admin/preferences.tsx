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
	SimpleGrid,
	Skeleton,
	Stack,
	Switch,
	Text,
	ThemeIcon,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import {
	IconAdjustments,
	IconCheck,
	IconClock,
	IconGlobe,
	IconLanguage,
	IconLayoutGrid,
	IconRefresh,
	IconSparkles,
	IconUsers,
	IconX,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApprovalGuard } from "@/hooks/useApprovalGuard";
import { useTranslate } from "@/hooks/useTranslate";
import { protectedRouteMiddleware } from "@/middleware/authMiddleware";
import {
	type FormatTanggal,
	setDashboardPrefs,
	setFormatTanggal,
	setLang,
	setZonaWaktu,
} from "@/store/i18n";

export const Route = createFileRoute("/admin/preferences")({
	component: AdminPreferencesPage,
	beforeLoad: protectedRouteMiddleware,
});

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

function AdminPreferencesPage() {
	const t = useTranslate();
	const { withApproval } = useApprovalGuard();
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

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
				if (!res.ok) throw new Error();
				const json = await res.json();
				const data = json.data as Prefs;
				setPrefs(data);
				setSavedPrefs(data);
				setLang(data.bahasa === "en" ? "en" : "id");
				setZonaWaktu(data.zonaWaktu);
				setFormatTanggal(data.formatTanggal as FormatTanggal);
				setDashboardPrefs({
					refreshOtomatis: data.refreshOtomatis,
					intervalRefresh: data.intervalRefresh,
					tampilkanGrid: data.tampilkanGrid,
					animasiTransisi: data.animasiTransisi,
				});
			} catch {
				setToast({ type: "error", message: "Gagal memuat preferensi" });
			} finally {
				setLoading(false);
			}
		};
		fetchPrefs();
	}, []);

	useEffect(() => {
		if (!toast) return;
		const timer = setTimeout(() => setToast(null), 3500);
		return () => clearTimeout(timer);
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
			if (!res.ok) throw new Error();
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
			setToast({
				type: "success",
				message: "Preferensi disimpan & diterapkan ke semua pengguna",
			});
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

	const isDirty =
		prefs.bahasa !== savedPrefs.bahasa ||
		prefs.zonaWaktu !== savedPrefs.zonaWaktu ||
		prefs.formatTanggal !== savedPrefs.formatTanggal ||
		prefs.refreshOtomatis !== savedPrefs.refreshOtomatis ||
		prefs.intervalRefresh !== savedPrefs.intervalRefresh ||
		prefs.tampilkanGrid !== savedPrefs.tampilkanGrid ||
		prefs.animasiTransisi !== savedPrefs.animasiTransisi;

	const inputStyles = {
		input: { minHeight: "44px" },
	};

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
			px="md"
			gap="sm"
			style={{
				borderRadius: 10,
				background: dark
					? prefs[field]
						? "rgba(249,115,22,0.15)"
						: "transparent"
					: prefs[field]
						? "#FFF7ED"
						: "transparent",
				transition: "background 0.2s ease",
			}}
		>
			<Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
				<ThemeIcon
					size={38}
					radius="md"
					variant={prefs[field] ? "filled" : "light"}
					color="orange"
					style={{ flexShrink: 0, transition: "all 0.2s ease" }}
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
				color="orange"
				style={{ flexShrink: 0 }}
			/>
		</Group>
	);

	return (
		<Stack gap="xl">
			{/* Page Header */}
			<Group gap="md" align="flex-start" mb="xs">
				<ThemeIcon
					size={44}
					radius="md"
					variant="gradient"
					gradient={{ from: "orange.7", to: "red.6" }}
					style={{ flexShrink: 0 }}
				>
					<IconAdjustments size={24} stroke={1.5} />
				</ThemeIcon>
				<Box>
					<Group gap="xs" align="center">
						<Title order={2} c="orange">
							Preferensi Global Dashboard
						</Title>
						<Badge color="orange" variant="light" size="sm">
							Admin Only
						</Badge>
					</Group>
					<Text size="sm" c="dimmed">
						Kelola tampilan, bahasa, dan perilaku dashboard secara global
					</Text>
				</Box>
			</Group>

			{/* Toast */}
			{toast && (
				<Alert
					color={toast.type === "success" ? "teal" : "red"}
					icon={
						toast.type === "success" ? (
							<IconCheck size={16} />
						) : (
							<IconX size={16} />
						)
					}
					withCloseButton
					onClose={() => setToast(null)}
					radius="md"
					variant="light"
				>
					{toast.message}
				</Alert>
			)}

			{/* Global Impact Notice */}
			<Alert
				color="orange"
				variant="light"
				radius="md"
				icon={<IconUsers size={18} />}
				title="Pengaturan Global — Berlaku untuk Semua Pengguna"
				styles={{ title: { fontWeight: 700 } }}
			>
				<Text fz="sm">
					Preferensi yang Anda simpan di halaman ini akan menjadi standar
					tampilan bagi seluruh pengguna dengan role{" "}
					<Text span fw={600} c="orange.7">
						user
					</Text>
					. Admin dapat mengubah pengaturan ini kapan saja dan perubahan
					langsung berlaku tanpa perlu restart.
				</Text>
			</Alert>

			{/* Settings Panels */}
			<SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
				{/* Lokalisasi */}
				<Paper withBorder radius="lg" p="xl" style={{ position: "relative" }}>
					<LoadingOverlay visible={loading} />

					<Group gap="md" mb="xl">
						<ThemeIcon
							size={44}
							radius="md"
							variant="gradient"
							gradient={{ from: "orange.7", to: "red.6" }}
						>
							<IconGlobe size={22} stroke={1.5} />
						</ThemeIcon>
						<Box>
							<Title order={4} fw={700}>
								Lokalisasi
							</Title>
							<Text fz="xs" c="dimmed">
								Bahasa, zona waktu & format tanggal
							</Text>
						</Box>
					</Group>

					<Stack gap="md">
						{loading ? (
							<>
								<Skeleton height={68} radius="md" />
								<Skeleton height={68} radius="md" />
								<Skeleton height={68} radius="md" />
							</>
						) : (
							<>
								<Select
									label={
										<Group gap={6} mb={4} align="center">
											<IconLanguage size={14} stroke={1.5} />
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
									onChange={(v) => {
										const lang = v === "en" ? "en" : "id";
										updatePref("bahasa", lang);
										setLang(lang);
									}}
									radius="md"
									rightSection={
										<Badge size="xs" color="orange" variant="light">
											{prefs.bahasa === "en" ? "EN" : "ID"}
										</Badge>
									}
									styles={inputStyles}
								/>

								<Select
									label={
										<Group gap={6} mb={4} align="center">
											<IconClock size={14} stroke={1.5} />
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
									radius="md"
									styles={inputStyles}
								/>

								<Select
									label={
										<Group gap={6} mb={4} align="center">
											<IconClock size={14} stroke={1.5} />
											<Text fz="sm" fw={600}>
												{t.umum.formatTanggal}
											</Text>
										</Group>
									}
									description="Format penulisan tanggal di seluruh halaman dashboard"
									data={[
										{
											value: "DD/MM/YYYY",
											label: "DD/MM/YYYY  (contoh: 03/06/2026)",
										},
										{
											value: "MM/DD/YYYY",
											label: "MM/DD/YYYY  (contoh: 06/03/2026)",
										},
										{
											value: "YYYY-MM-DD",
											label: "YYYY-MM-DD  (contoh: 2026-06-03)",
										},
									]}
									value={prefs.formatTanggal}
									onChange={(v) => {
										const fmt = (v ?? "DD/MM/YYYY") as FormatTanggal;
										updatePref("formatTanggal", fmt);
										setFormatTanggal(fmt);
									}}
									radius="md"
									styles={inputStyles}
								/>
							</>
						)}
					</Stack>

					{!loading && (
						<>
							<Divider
								my="lg"
								color={dark ? "#334155" : "#e2e8f0"}
								label={
									<Text fz="xs" c="dimmed">
										Pratinjau format aktif
									</Text>
								}
								labelPosition="center"
							/>
							<Group gap="xs" justify="center">
								<Badge variant="outline" color="orange" size="sm" radius="sm">
									{prefs.bahasa === "en" ? "English" : "Bahasa Indonesia"}
								</Badge>
								<Badge variant="outline" color="orange" size="sm" radius="sm">
									{prefs.zonaWaktu.replace("Asia/", "")}
								</Badge>
								<Badge variant="outline" color="orange" size="sm" radius="sm">
									{new Date().toLocaleDateString(
										prefs.bahasa === "en" ? "en-US" : "id-ID",
										{ day: "2-digit", month: "2-digit", year: "numeric" },
									)}
								</Badge>
							</Group>
						</>
					)}
				</Paper>

				{/* Dashboard Behavior */}
				<Paper withBorder radius="lg" p="xl" style={{ position: "relative" }}>
					<LoadingOverlay visible={loading} />

					<Group gap="md" mb="xl">
						<ThemeIcon
							size={44}
							radius="md"
							variant="gradient"
							gradient={{ from: "orange.5", to: "yellow.5" }}
						>
							<IconLayoutGrid size={22} stroke={1.5} />
						</ThemeIcon>
						<Box>
							<Title order={4} fw={700}>
								Perilaku Dashboard
							</Title>
							<Text fz="xs" c="dimmed">
								Refresh, tampilan grid & animasi halaman
							</Text>
						</Box>
					</Group>

					{loading ? (
						<Stack gap="sm">
							<Skeleton height={62} radius="md" />
							<Skeleton height={62} radius="md" />
							<Skeleton height={62} radius="md" />
							<Skeleton height={62} radius="md" />
						</Stack>
					) : (
						<Stack gap={4}>
							<SwitchRow
								label={t.umum.refreshOtomatis}
								description="Data dashboard diperbarui otomatis secara berkala"
								icon={<IconRefresh size={18} />}
								field="refreshOtomatis"
							/>

							{prefs.refreshOtomatis && (
								<Group
									px="md"
									py="sm"
									gap="sm"
									justify="space-between"
									wrap="nowrap"
									style={{
										background: dark
											? "rgba(249,115,22,0.12)"
											: "#FFF7ED",
										borderRadius: 10,
										borderLeft: "3px solid var(--mantine-color-orange-5)",
									}}
								>
									<Group
										gap="sm"
										wrap="nowrap"
										style={{ flex: 1, minWidth: 0 }}
									>
										<ThemeIcon
											size={38}
											radius="md"
											variant="light"
											color="orange"
											style={{ flexShrink: 0 }}
										>
											<IconClock size={18} />
										</ThemeIcon>
										<Box style={{ minWidth: 0 }}>
											<Text fw={600} fz="sm">
												{t.umum.intervalRefresh}
											</Text>
											<Text fz="xs" c="dimmed">
												Seberapa sering data diperbarui otomatis
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
										w={130}
										radius="md"
										size="sm"
										styles={inputStyles}
									/>
								</Group>
							)}

							<Divider color={dark ? "#334155" : "#f1f5f9"} my={4} />

							<SwitchRow
								label={t.umum.tampilkanGrid}
								description="Tampilkan garis grid di latar belakang tabel dan grafik"
								icon={<IconLayoutGrid size={18} />}
								field="tampilkanGrid"
							/>

							<Divider color={dark ? "#334155" : "#f1f5f9"} my={4} />

							<SwitchRow
								label={t.umum.animasiTransisi}
								description="Aktifkan animasi saat berpindah halaman atau memuat data"
								icon={<IconSparkles size={18} />}
								field="animasiTransisi"
							/>
						</Stack>
					)}
				</Paper>
			</SimpleGrid>

			{/* Action Bar */}
			<Paper withBorder radius="lg" p="md">
				<Group justify="space-between" align="center" wrap="wrap" gap="sm">
					<Box>
						<Text fz="sm" fw={600}>
							{isDirty ? (
								<Text span c="orange.6">
									Ada perubahan yang belum disimpan
								</Text>
							) : (
								<Text span c="dimmed">
									Semua pengaturan tersimpan
								</Text>
							)}
						</Text>
						<Text fz="xs" c="dimmed">
							Perubahan akan diterapkan ke semua pengguna dashboard
						</Text>
					</Box>

					<Group gap="sm">
						<Button
							variant="default"
							onClick={handleBatal}
							disabled={saving || loading || !isDirty}
							radius="md"
						>
							{t.common.batal}
						</Button>
						<Button
							onClick={() =>
								withApproval(handleSave, "preferensi global dashboard")
							}
							loading={saving}
							disabled={loading || !isDirty}
							radius="md"
							variant="gradient"
							gradient={{ from: "orange.7", to: "red.6" }}
							leftSection={<IconCheck size={16} />}
						>
							Simpan & Terapkan ke Semua Pengguna
						</Button>
					</Group>
				</Group>
			</Paper>
		</Stack>
	);
}
