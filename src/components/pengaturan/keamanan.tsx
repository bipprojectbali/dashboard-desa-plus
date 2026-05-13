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
	Tooltip,
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
import { useSnapshot } from "valtio";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { useApprovalGuard } from "@/hooks/useApprovalGuard";
import { useTranslate } from "@/hooks/useTranslate";
import { authStore } from "@/store/auth";
import { SesiAktifModal } from "./keamanan/SesiAktifModal";
import { UbahPasswordModal } from "./keamanan/UbahPasswordModal";

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
	const { withApproval } = useApprovalGuard();
	const { log } = useActivityLogger();
	const snap = useSnapshot(authStore);
	const isAdmin = snap.user?.role === "admin";
	const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
	const [savedPrefs, setSavedPrefs] = useState<Prefs>(DEFAULT_PREFS);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const [ubahPasswordOpened, setUbahPasswordOpened] = useState(false);
	const [sesiAktifOpened, setSesiAktifOpened] = useState(false);

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
			log("ubah-pengaturan-keamanan", "Preferensi keamanan diperbarui");
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
		disabled: forceDisabled,
		disabledTooltip,
	}: {
		label: string;
		description: string;
		icon: React.ReactNode;
		field: keyof Prefs;
		badge?: { label: string; color: string };
		disabled?: boolean;
		disabledTooltip?: string;
	}) => (
		<Group justify="space-between" wrap="nowrap" py="sm">
			<Group gap="sm" wrap="nowrap">
				<ThemeIcon
					size={36}
					radius="md"
					variant="light"
					color={forceDisabled ? "gray" : "red"}
				>
					{icon}
				</ThemeIcon>
				<Box>
					<Group gap={6}>
						<Text fw={600} fz="sm" c={forceDisabled ? "dimmed" : undefined}>
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
			<Tooltip
				label={disabledTooltip}
				disabled={!disabledTooltip || !forceDisabled}
				position="left"
				multiline
				maw={220}
			>
				<Switch
					checked={prefs[field]}
					onChange={() => toggle(field)}
					disabled={loading || !!forceDisabled}
					size="md"
					color="red"
				/>
			</Tooltip>
		</Group>
	);

	const ActionRow = ({
		label,
		description,
		icon,
		onClick,
		color = "blue",
		buttonLabel = "Buka",
	}: {
		label: string;
		description: string;
		icon: React.ReactNode;
		onClick?: () => void;
		color?: string;
		buttonLabel?: string;
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
				{buttonLabel}
			</Button>
		</Group>
	);

	if (!isAdmin) {
		return (
			<Box maw={680}>
				<Alert color="orange" radius="md" icon={<IconShieldLock size={16} />}>
					Halaman ini hanya dapat diakses oleh administrator.
				</Alert>
			</Box>
		);
	}

	return (
		<Box maw={680}>
			<UbahPasswordModal
				opened={ubahPasswordOpened}
				onClose={() => setUbahPasswordOpened(false)}
			/>
			<SesiAktifModal
				opened={sesiAktifOpened}
				onClose={() => setSesiAktifOpened(false)}
			/>

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
							badge={{ label: "Segera Hadir", color: "gray" }}
							disabled
							disabledTooltip="Membutuhkan konfigurasi plugin 2FA di server"
						/>
						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />
						<SwitchRow
							label={t.keamanan.biometrikLogin}
							description="Gunakan sidik jari atau Face ID untuk login lebih cepat dan aman"
							icon={<IconFingerprint size={18} />}
							field="biometrikLogin"
							badge={{ label: "Segera Hadir", color: "gray" }}
							disabled
							disabledTooltip="Fitur WebAuthn/Passkey belum tersedia"
						/>
						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />
						<SwitchRow
							label={t.keamanan.ipWhitelist}
							description="Batasi akses hanya dari alamat IP yang telah didaftarkan"
							icon={<IconNetwork size={18} />}
							field="ipWhitelist"
							badge={{ label: "Segera Hadir", color: "gray" }}
							disabled
							disabledTooltip="Fitur whitelist IP belum tersedia"
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
							onClick={() => setUbahPasswordOpened(true)}
						/>
						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />
						<ActionRow
							label={t.keamanan.riwayatLogin}
							description="Lihat daftar login terbaru beserta lokasi dan perangkat yang digunakan"
							icon={<IconHistory size={18} />}
							color="blue"
							onClick={() => setSesiAktifOpened(true)}
						/>
						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />
						<ActionRow
							label={t.keamanan.perangkatTerdaftar}
							description="Kelola perangkat yang pernah digunakan untuk masuk ke akun ini"
							icon={<IconDevices size={18} />}
							color="blue"
							onClick={() => setSesiAktifOpened(true)}
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
							buttonLabel="Download"
							onClick={() => {
								const a = document.createElement("a");
								a.href = "/api/activity-log/export";
								a.download = "activity-log.csv";
								a.click();
							}}
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
					onClick={() => withApproval(handleSave, "pengaturan keamanan")}
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
