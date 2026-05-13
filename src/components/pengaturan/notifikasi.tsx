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
	IconBell,
	IconBellRinging,
	IconCheck,
	IconCpu,
	IconDatabase,
	IconDeviceFloppy,
	IconMailForward,
	IconMessageCircle,
	IconShieldCheck,
	IconUsers,
	IconVolume,
	IconX,
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useApprovalGuard } from "@/hooks/useApprovalGuard";
import { useNotification } from "@/hooks/useNotification";
import { useTranslate } from "@/hooks/useTranslate";
import { setNotifPrefs } from "@/store/notif";

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
	const t = useTranslate();
	const { withApproval } = useApprovalGuard();
	const { requestPermission } = useNotification();
	const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
	const [savedPrefs, setSavedPrefs] = useState<Prefs>(DEFAULT_PREFS);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [requesting, setRequesting] = useState(false);
	const [permission, setPermission] = useState<NotificationPermission>(() =>
		"Notification" in window ? Notification.permission : "denied",
	);
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const handleRequestPermission = useCallback(async () => {
		setRequesting(true);
		const result = await requestPermission();
		setPermission(result);
		setRequesting(false);
	}, [requestPermission]);

	useEffect(() => {
		const fetchPrefs = async () => {
			try {
				const res = await fetch("/api/notification-preferences");
				if (!res.ok) throw new Error("error");
				const json = await res.json();
				const data = json.data as Prefs;
				setPrefs(data);
				setSavedPrefs(data);
				setNotifPrefs(data);
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
			const res = await fetch("/api/notification-preferences", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(prefs),
			});
			if (!res.ok) throw new Error("error");
			const json = await res.json();
			const data = json.data as Prefs;
			setPrefs(data);
			setSavedPrefs(data);
			setNotifPrefs(data);
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
		badgeColor = "orange",
		disabled: forceDisabled,
		disabledTooltip,
	}: {
		label: string;
		description: string;
		icon: React.ReactNode;
		field: keyof Prefs;
		badge?: string;
		badgeColor?: string;
		disabled?: boolean;
		disabledTooltip?: string;
	}) => (
		<Group justify="space-between" wrap="nowrap" py="sm">
			<Group gap="sm" wrap="nowrap">
				<ThemeIcon
					size={36}
					radius="md"
					variant="light"
					color={forceDisabled ? "gray" : "blue"}
				>
					{icon}
				</ThemeIcon>
				<Box>
					<Group gap={6}>
						<Text fw={600} fz="sm" c={forceDisabled ? "dimmed" : undefined}>
							{label}
						</Text>
						{badge && (
							<Badge size="xs" color={badgeColor} variant="light">
								{badge}
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
			>
				<Switch
					checked={prefs[field]}
					onChange={() => toggle(field)}
					disabled={loading || !!forceDisabled}
					size="md"
				/>
			</Tooltip>
		</Group>
	);

	const SkeletonRows = ({ count }: { count: number }) => (
		<Stack gap="sm">
			{Array.from({ length: count }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
				<Skeleton key={i} height={52} radius="md" />
			))}
		</Stack>
	);

	const permissionColor =
		permission === "granted"
			? "green"
			: permission === "denied"
				? "red"
				: "orange";
	const permissionLabel =
		permission === "granted"
			? "Diizinkan"
			: permission === "denied"
				? "Ditolak"
				: "Belum diatur";
	const pushDisabled = permission !== "granted";

	return (
		<Box maw={680}>
			{"Notification" in window && permission !== "granted" && (
				<Alert
					color={permission === "denied" ? "red" : "orange"}
					icon={<IconBellRinging size={16} />}
					mb="md"
					radius="md"
					title={
						permission === "denied"
							? "Notifikasi browser ditolak"
							: "Notifikasi browser belum diaktifkan"
					}
				>
					<Text fz="sm" mb="xs">
						{permission === "denied"
							? "Izin notifikasi ditolak. Aktifkan manual di pengaturan browser (ikon gembok di address bar)."
							: "Aktifkan notifikasi browser agar push notification, alert kritis, dan bunyi dapat berfungsi."}
					</Text>
					{permission === "default" && (
						<Button
							size="xs"
							color="orange"
							loading={requesting}
							onClick={handleRequestPermission}
							leftSection={<IconBell size={14} />}
						>
							Aktifkan Notifikasi
						</Button>
					)}
				</Alert>
			)}
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

			{/* Metode Notifikasi */}
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
						<IconBell size={20} />
					</ThemeIcon>
					<Box>
						<Title order={4} fw={700}>
							{t.notifikasi.metodeNotifikasi}
						</Title>
						<Text fz="xs" c="dimmed">
							Pilih jenis notifikasi yang ingin kamu terima
						</Text>
					</Box>
				</Group>

				{loading ? (
					<SkeletonRows count={4} />
				) : (
					<>
						<SwitchRow
							label={t.notifikasi.laporanHarian}
							description="Ringkasan aktivitas desa dikirim setiap hari ke email kamu"
							icon={<IconMailForward size={18} />}
							field="laporanHarian"
							badge="Segera Hadir"
							badgeColor="gray"
							disabled
							disabledTooltip="Fitur email belum tersedia, membutuhkan konfigurasi SMTP"
						/>
						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />
						<SwitchRow
							label={t.notifikasi.alertSistem}
							description="Pemberitahuan saat ada gangguan atau pemeliharaan sistem"
							icon={<IconBellRinging size={18} />}
							field="alertSistem"
							badge="Segera Hadir"
							badgeColor="gray"
							disabled
							disabledTooltip="Fitur email belum tersedia, membutuhkan konfigurasi SMTP"
						/>
						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />
						<SwitchRow
							label={t.notifikasi.updateKeamanan}
							description="Info pembaruan keamanan dan patch penting"
							icon={<IconShieldCheck size={18} />}
							field="updateKeamanan"
							badge="Segera Hadir"
							badgeColor="gray"
							disabled
							disabledTooltip="Fitur email belum tersedia, membutuhkan konfigurasi SMTP"
						/>
						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />
						<SwitchRow
							label={t.notifikasi.newsletterBulanan}
							description="Artikel dan tips penggunaan dashboard setiap bulan"
							icon={<IconMailForward size={18} />}
							field="newsletterBulan"
							badge="Segera Hadir"
							badgeColor="gray"
							disabled
							disabledTooltip="Fitur email belum tersedia, membutuhkan konfigurasi SMTP"
						/>
					</>
				)}
			</Paper>

			{/* Preferensi Alert Sistem */}
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
						gradient={{ from: "orange", to: "red" }}
					>
						<IconCpu size={20} />
					</ThemeIcon>
					<Box>
						<Title order={4} fw={700}>
							{t.notifikasi.preferensiAlert}
						</Title>
						<Text fz="xs" c="dimmed">
							Alert otomatis saat penggunaan sumber daya melewati batas
						</Text>
					</Box>
				</Group>

				{loading ? (
					<SkeletonRows count={3} />
				) : (
					<>
						<SwitchRow
							label={t.notifikasi.tresholdMemori}
							description="Alert saat penggunaan RAM server melebihi 80%"
							icon={<IconDeviceFloppy size={18} />}
							field="tresholdMemori"
							badge="Auto"
						/>
						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />
						<SwitchRow
							label={t.notifikasi.tresholdCpu}
							description="Alert saat beban CPU server melebihi 90% selama 5 menit"
							icon={<IconCpu size={18} />}
							field="tresholdCpu"
							badge="Auto"
						/>
						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />
						<SwitchRow
							label={t.notifikasi.tresholdDisk}
							description="Alert saat kapasitas disk tersisa kurang dari 10%"
							icon={<IconDatabase size={18} />}
							field="tresholdDisk"
							badge="Auto"
						/>
					</>
				)}
			</Paper>

			{/* Notifikasi Push & Aktivitas */}
			<Paper
				withBorder
				radius="lg"
				p="xl"
				mb="lg"
				style={{ borderColor: dark ? "#334155" : "#e2e8f0" }}
			>
				<Group gap="sm" mb="lg" justify="space-between" wrap="nowrap">
					<Group gap="sm" wrap="nowrap">
						<ThemeIcon
							size={38}
							radius="md"
							variant="gradient"
							gradient={{ from: "violet", to: "grape" }}
						>
							<IconMessageCircle size={20} />
						</ThemeIcon>
						<Box>
							<Group gap={6}>
								<Title order={4} fw={700}>
									{t.notifikasi.notifikasiPush}
								</Title>
								<Badge size="sm" color={permissionColor} variant="light">
									{permissionLabel}
								</Badge>
							</Group>
							<Text fz="xs" c="dimmed">
								Notifikasi real-time aktivitas tim dan interaksi
							</Text>
						</Box>
					</Group>
				</Group>

				{loading ? (
					<SkeletonRows count={4} />
				) : (
					<>
						<SwitchRow
							label={t.notifikasi.alertKritis}
							description="Push notification segera untuk kejadian kritis yang perlu tindakan cepat"
							icon={<IconBellRinging size={18} />}
							field="alertKritis"
							badge="Kritis"
							disabled={pushDisabled}
							disabledTooltip="Aktifkan notifikasi browser terlebih dahulu"
						/>
						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />
						<SwitchRow
							label={t.notifikasi.aktivitasTim}
							description="Notifikasi saat anggota tim menambah kegiatan atau dokumen baru"
							icon={<IconUsers size={18} />}
							field="aktivitasTim"
							disabled={pushDisabled}
							disabledTooltip="Aktifkan notifikasi browser terlebih dahulu"
						/>
						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />
						<SwitchRow
							label={t.notifikasi.komentarMention}
							description="Notifikasi saat kamu disebut dalam komentar atau diskusi"
							icon={<IconMessageCircle size={18} />}
							field="komentarMention"
							disabled={pushDisabled}
							disabledTooltip="Aktifkan notifikasi browser terlebih dahulu"
						/>
						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />
						<SwitchRow
							label={t.notifikasi.bunyiNotifikasi}
							description="Putar suara saat notifikasi masuk di browser"
							icon={<IconVolume size={18} />}
							field="bunyiNotifikasi"
							disabled={pushDisabled}
							disabledTooltip="Aktifkan notifikasi browser terlebih dahulu"
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
					onClick={() => withApproval(handleSave, "preferensi notifikasi")}
					loading={saving}
					disabled={loading}
					radius="md"
					variant="gradient"
					gradient={{ from: "blue", to: "violet" }}
					leftSection={<IconCheck size={16} />}
				>
					{t.common.simpanPreferensi}
				</Button>
			</Group>
		</Box>
	);
};

export default NotifikasiSettings;
