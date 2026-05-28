import {
	ActionIcon,
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
	TextInput,
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
	IconPlus,
	IconShieldCheck,
	IconShieldLock,
	IconTrash,
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

	type IpEntry = {
		id: string;
		ip: string;
		label?: string | null;
		createdAt: string;
	};
	const [ipEntries, setIpEntries] = useState<IpEntry[]>([]);
	const [ipInput, setIpInput] = useState("");
	const [ipLabel, setIpLabel] = useState("");
	const [ipLoading, setIpLoading] = useState(false);
	const [ipError, setIpError] = useState<string | null>(null);

	useEffect(() => {
		const fetchAll = async () => {
			try {
				const [prefRes, ipRes] = await Promise.all([
					fetch("/api/keamanan-preferences"),
					fetch("/api/ip-whitelist"),
				]);
				if (prefRes.ok) {
					const json = await prefRes.json();
					const data = json.data as Prefs;
					setPrefs(data);
					setSavedPrefs(data);
				}
				if (ipRes.ok) {
					const json = await ipRes.json();
					setIpEntries(json.data as IpEntry[]);
				}
			} catch {
				// keep defaults
			} finally {
				setLoading(false);
			}
		};
		fetchAll();
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

	const handleAddIp = async () => {
		setIpError(null);
		const trimmed = ipInput.trim();
		if (!trimmed) return;
		setIpLoading(true);
		try {
			const res = await fetch("/api/ip-whitelist", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					ip: trimmed,
					label: ipLabel.trim() || undefined,
				}),
			});
			const json = await res.json();
			if (!res.ok) {
				setIpError(json.error ?? "Gagal menambahkan IP");
			} else {
				setIpEntries((prev) => [...prev, json.data as IpEntry]);
				setIpInput("");
				setIpLabel("");
			}
		} catch {
			setIpError("Terjadi kesalahan, coba lagi");
		} finally {
			setIpLoading(false);
		}
	};

	const handleDeleteIp = async (id: string) => {
		try {
			const res = await fetch(`/api/ip-whitelist/${id}`, { method: "DELETE" });
			if (res.ok) {
				setIpEntries((prev) => prev.filter((e) => e.id !== id));
			}
		} catch {
			// silent
		}
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
					color={color}
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
			<Button
				size="xs"
				variant="light"
				color={color}
				radius="md"
				onClick={onClick}
				disabled={loading}
				style={{ flexShrink: 0 }}
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
				bg={dark ? "#1E293B" : "white"}
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
						/>
						{prefs.ipWhitelist && (
							<Box
								ml={52}
								p="md"
								style={{
									borderRadius: 8,
									background: dark ? "#0f172a" : "#f8fafc",
									border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
								}}
							>
								<Text fz="xs" fw={600} mb="sm" c="dimmed">
									Daftar IP yang diizinkan
								</Text>
								{ipEntries.length === 0 ? (
									<Text fz="xs" c="dimmed" mb="sm">
										Belum ada IP. Tambahkan IP di bawah. Jika daftar kosong,
										enforcement tidak aktif meski toggle menyala.
									</Text>
								) : (
									<Stack gap={6} mb="sm">
										{ipEntries.map((entry) => (
											<Group
												key={entry.id}
												justify="space-between"
												wrap="nowrap"
											>
												<Group gap={6} wrap="nowrap">
													<Text fz="xs" ff="monospace">
														{entry.ip}
													</Text>
													{entry.label && (
														<Text fz="xs" c="dimmed">
															— {entry.label}
														</Text>
													)}
												</Group>
												<ActionIcon
													size="xs"
													color="red"
													variant="subtle"
													onClick={() => handleDeleteIp(entry.id)}
												>
													<IconTrash size={12} />
												</ActionIcon>
											</Group>
										))}
									</Stack>
								)}
								{ipError && (
									<Text fz="xs" c="red" mb="xs">
										{ipError}
									</Text>
								)}
								<Group gap="xs" wrap="nowrap">
									<TextInput
										placeholder="Contoh: 192.168.1.10"
										value={ipInput}
										onChange={(e) => setIpInput(e.currentTarget.value)}
										size="sm"
										radius="md"
										style={{ flex: 1 }}
										styles={{ input: { minHeight: "44px" } }}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleAddIp();
										}}
									/>
									<TextInput
										placeholder="Label (opsional)"
										value={ipLabel}
										onChange={(e) => setIpLabel(e.currentTarget.value)}
										size="sm"
										radius="md"
										style={{ flex: 1 }}
										styles={{ input: { minHeight: "44px" } }}
									/>
									<ActionIcon
										size="lg"
										radius="md"
										variant="filled"
										color="blue"
										onClick={handleAddIp}
										loading={ipLoading}
									>
										<IconPlus size={14} />
									</ActionIcon>
								</Group>
							</Box>
						)}
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
				bg={dark ? "#1E293B" : "white"}
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
				bg={dark ? "#1E293B" : "white"}
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
