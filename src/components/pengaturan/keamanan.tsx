import {
	Alert,
	Badge,
	Box,
	Button,
	Divider,
	Group,
	Paper,
	Skeleton,
	Stack,
	Switch,
	Text,
	ThemeIcon,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import {
	IconCheck,
	IconClipboardList,
	IconDevices,
	IconDownload,
	IconFingerprint,
	IconHistory,
	IconKey,
	IconLock,
	IconNetwork,
	IconShieldCheck,
	IconShieldLock,
	IconX,
} from "@tabler/icons-react";
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

	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const SwitchRow = ({
		label,
		description,
		icon,
		field,
		badge,
	}: {
		label: string;
		description: string;
		icon: React.ReactNode;
		field: keyof Prefs;
		badge?: { label: string; color: string };
	}) => (
		<Group justify="space-between" wrap="nowrap" py="sm">
			<Group gap="sm" wrap="nowrap">
				<ThemeIcon size={36} radius="md" variant="light" color="red">
					{icon}
				</ThemeIcon>
				<Box>
					<Group gap={6}>
						<Text fw={600} fz="sm">
							{label}
						</Text>
						{badge && (
							<Badge size="xs" color={badge.color} variant="light">
								{badge.label}
							</Badge>
						)}
					</Group>
					<Text fz="xs" c="dimmed">
						{description}
					</Text>
				</Box>
			</Group>
			<Switch
				checked={prefs[field]}
				onChange={() => toggle(field)}
				disabled={loading}
				size="md"
				color="red"
			/>
		</Group>
	);

	const ActionRow = ({
		label,
		description,
		icon,
		onClick,
		color = "blue",
	}: {
		label: string;
		description: string;
		icon: React.ReactNode;
		onClick?: () => void;
		color?: string;
	}) => (
		<Group justify="space-between" wrap="nowrap" py="sm">
			<Group gap="sm" wrap="nowrap">
				<ThemeIcon size={36} radius="md" variant="light" color={color}>
					{icon}
				</ThemeIcon>
				<Box>
					<Text fw={600} fz="sm">
						{label}
					</Text>
					<Text fz="xs" c="dimmed">
						{description}
					</Text>
				</Box>
			</Group>
			<Button
				size="xs"
				variant="light"
				color={color}
				radius="md"
				onClick={onClick}
				disabled={loading}
			>
				Buka
			</Button>
		</Group>
	);

	return (
		<Box maw={680}>
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

			{/* Autentikasi */}
			<Paper
				withBorder
				radius="lg"
				p="xl"
				mb="lg"
				style={{ borderColor: dark ? "#334155" : "#e2e8f0" }}
			>
				<Group gap="sm" mb="lg">
					<ThemeIcon
						size={38}
						radius="md"
						variant="gradient"
						gradient={{ from: "red", to: "pink" }}
					>
						<IconShieldLock size={20} />
					</ThemeIcon>
					<Box>
						<Title order={4} fw={700}>
							{t.keamanan.autentikasi}
						</Title>
						<Text fz="xs" c="dimmed">
							Tingkatkan keamanan akun dengan lapisan verifikasi tambahan
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
							label={t.keamanan.twoFactor}
							description="Verifikasi dua langkah via aplikasi authenticator atau SMS saat login"
							icon={<IconShieldCheck size={18} />}
							field="twoFactorAuth"
							badge={{ label: "Disarankan", color: "green" }}
						/>
						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />
						<SwitchRow
							label={t.keamanan.biometrikLogin}
							description="Gunakan sidik jari atau Face ID untuk login lebih cepat dan aman"
							icon={<IconFingerprint size={18} />}
							field="biometrikLogin"
						/>
						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />
						<SwitchRow
							label={t.keamanan.ipWhitelist}
							description="Batasi akses hanya dari alamat IP yang telah didaftarkan"
							icon={<IconNetwork size={18} />}
							field="ipWhitelist"
							badge={{ label: "Lanjutan", color: "orange" }}
						/>
					</>
				)}
			</Paper>

			{/* Password & Sesi */}
			<Paper
				withBorder
				radius="lg"
				p="xl"
				mb="lg"
				style={{ borderColor: dark ? "#334155" : "#e2e8f0" }}
			>
				<Group gap="sm" mb="lg">
					<ThemeIcon
						size={38}
						radius="md"
						variant="gradient"
						gradient={{ from: "blue", to: "cyan" }}
					>
						<IconLock size={20} />
					</ThemeIcon>
					<Box>
						<Title order={4} fw={700}>
							{t.keamanan.password}
						</Title>
						<Text fz="xs" c="dimmed">
							Kelola password dan sesi aktif di semua perangkat
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
						<ActionRow
							label={t.keamanan.ubahPassword}
							description="Ganti password akun secara berkala untuk menjaga keamanan"
							icon={<IconKey size={18} />}
							color="blue"
						/>
						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />
						<ActionRow
							label={t.keamanan.riwayatLogin}
							description="Lihat daftar login terbaru beserta lokasi dan perangkat yang digunakan"
							icon={<IconHistory size={18} />}
							color="blue"
						/>
						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />
						<ActionRow
							label={t.keamanan.perangkatTerdaftar}
							description="Kelola perangkat yang pernah digunakan untuk masuk ke akun ini"
							icon={<IconDevices size={18} />}
							color="blue"
						/>
					</>
				)}
			</Paper>

			{/* Audit & Log */}
			<Paper
				withBorder
				radius="lg"
				p="xl"
				mb="lg"
				style={{ borderColor: dark ? "#334155" : "#e2e8f0" }}
			>
				<Group gap="sm" mb="lg">
					<ThemeIcon
						size={38}
						radius="md"
						variant="gradient"
						gradient={{ from: "teal", to: "green" }}
					>
						<IconClipboardList size={20} />
					</ThemeIcon>
					<Box>
						<Title order={4} fw={700}>
							{t.keamanan.auditLog}
						</Title>
						<Text fz="xs" c="dimmed">
							Pantau dan rekam semua aktivitas penting di akun kamu
						</Text>
					</Box>
				</Group>

				{loading ? (
					<Stack gap="sm">
						<Skeleton height={52} radius="md" />
						<Skeleton height={52} radius="md" />
					</Stack>
				) : (
					<>
						<SwitchRow
							label={t.keamanan.logAktivitas}
							description="Catat semua aktivitas login, perubahan data, dan aksi penting lainnya"
							icon={<IconClipboardList size={18} />}
							field="logAktivitas"
						/>
						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />
						<ActionRow
							label={t.keamanan.downloadLog}
							description="Unduh riwayat log aktivitas dalam format CSV untuk keperluan audit"
							icon={<IconDownload size={18} />}
							color="teal"
						/>
					</>
				)}
			</Paper>

			<Group justify="flex-end" gap="sm">
				<Button
					variant="default"
					onClick={handleBatal}
					disabled={saving || loading}
					radius="md"
				>
					{t.common.batal}
				</Button>
				<Button
					onClick={handleSave}
					loading={saving}
					disabled={loading}
					radius="md"
					variant="gradient"
					gradient={{ from: "red", to: "pink" }}
					leftSection={<IconCheck size={16} />}
				>
					{t.common.simpan}
				</Button>
			</Group>
		</Box>
	);
};

export default KeamananSettings;
