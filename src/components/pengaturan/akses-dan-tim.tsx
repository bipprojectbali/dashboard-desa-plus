import {
	Alert,
	Badge,
	Box,
	Button,
	Divider,
	Group,
	Paper,
	RingProgress,
	Skeleton,
	Stack,
	Switch,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import {
	IconCheck,
	IconFileExport,
	IconGitPullRequest,
	IconKey,
	IconMailPlus,
	IconShieldHalf,
	IconUsers,
	IconUsersGroup,
	IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { useApprovalGuard } from "@/hooks/useApprovalGuard";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { setAksesPrefs } from "@/store/akses";
import { authStore } from "@/store/auth";
import { KelolaRoleModal } from "./akses/KelolaRoleModal";
import { UndanganModal } from "./akses/UndanganModal";

type Prefs = {
	izinExportData: boolean;
	requireApprovalPerubahan: boolean;
};

const DEFAULT_PREFS: Prefs = {
	izinExportData: true,
	requireApprovalPerubahan: true,
};

interface RoleEntry {
	role: string;
	label: string;
	count: number;
	color: string;
	pct?: number;
}

const AksesDanTimSettings = () => {
	const t = useTranslate();
	const { withApproval } = useApprovalGuard();
	const snap = useSnapshot(authStore);
	const isAdmin = snap.user?.role === "admin";
	const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
	const [savedPrefs, setSavedPrefs] = useState<Prefs>(DEFAULT_PREFS);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [kelolaRoleOpened, setKelolaRoleOpened] = useState(false);
	const [undanganOpened, setUndanganOpened] = useState(false);
	const [totalAnggota, setTotalAnggota] = useState(0);
	const [roleData, setRoleData] = useState<RoleEntry[]>([]);
	const [statsLoading, setStatsLoading] = useState(true);
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const fetchUserStats = async () => {
		setStatsLoading(true);
		try {
			const res = await fetch("/api/admin/user-stats");
			if (!res.ok) return;
			const json = await res.json();
			const d = json.data as { total: number; roles: RoleEntry[] };
			setTotalAnggota(d.total);
			setRoleData(
				d.roles.map((r) => ({
					...r,
					pct: d.total > 0 ? Math.round((r.count / d.total) * 100) : 0,
				})),
			);
		} catch {
			// non-critical
		} finally {
			setStatsLoading(false);
		}
	};

	useEffect(() => {
		const fetchPrefs = async () => {
			try {
				const res = await fetch("/api/akses-preferences");
				if (!res.ok) throw new Error("error");
				const json = await res.json();
				const data = json.data as Prefs;
				setPrefs(data);
				setSavedPrefs(data);
				setAksesPrefs(data);
			} catch {
				// keep defaults
			} finally {
				setLoading(false);
			}
		};
		fetchPrefs();
		fetchUserStats();
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
			const res = await fetch("/api/akses-preferences", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(prefs),
			});
			if (!res.ok) throw new Error("error");
			const json = await res.json();
			const data = json.data as Prefs;
			setPrefs(data);
			setSavedPrefs(data);
			setAksesPrefs(data);
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

	const dark = useIsDark();

	const SwitchRow = ({
		label,
		description,
		icon,
		field,
	}: {
		label: string;
		description: string;
		icon: React.ReactNode;
		field: keyof Prefs;
	}) => (
		<Group justify="space-between" wrap="nowrap" py="sm">
			<Group gap="sm" wrap="nowrap">
				<ThemeIcon size={36} radius="md" variant="light" color="violet">
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
			<Switch
				checked={prefs[field]}
				onChange={() => toggle(field)}
				disabled={loading}
				size="md"
				color="violet"
			/>
		</Group>
	);

	if (!isAdmin) {
		return (
			<Box maw={680}>
				<Alert color="orange" radius="md" icon={<IconShieldHalf size={16} />}>
					Halaman ini hanya dapat diakses oleh administrator.
				</Alert>
			</Box>
		);
	}

	return (
		<Box maw={680}>
			<KelolaRoleModal
				opened={kelolaRoleOpened}
				onClose={() => setKelolaRoleOpened(false)}
				onRoleChanged={fetchUserStats}
			/>
			<UndanganModal
				opened={undanganOpened}
				onClose={() => setUndanganOpened(false)}
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

			{/* Manajemen Tim */}
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
						gradient={{ from: "violet", to: "grape" }}
					>
						<IconUsersGroup size={20} />
					</ThemeIcon>
					<Box>
						<Title order={4} fw={700}>
							{t.akses.manajemenTim}
						</Title>
						<Text fz="xs" c="dimmed">
							Kelola anggota tim dan undang pengguna baru
						</Text>
					</Box>
				</Group>

				{loading ? (
					<Stack gap="sm">
						<Skeleton height={52} radius="md" />
						<Skeleton height={52} radius="md" />
						<Skeleton height={44} radius="md" />
					</Stack>
				) : (
					<>
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
									color="violet"
									style={{ flexShrink: 0 }}
								>
									<IconMailPlus size={18} />
								</ThemeIcon>
								<Box style={{ minWidth: 0 }}>
									<Text fw={600} fz="sm">
										{t.akses.undanganAnggota}
									</Text>
									<Text fz="xs" c="dimmed" style={{ wordBreak: "break-word" }}>
										Kirim undangan via email ke anggota tim baru
									</Text>
								</Box>
							</Group>
							<Button
								size="xs"
								variant="light"
								color="violet"
								radius="md"
								onClick={() => setUndanganOpened(true)}
								style={{ flexShrink: 0 }}
							>
								Buka
							</Button>
						</Group>

						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />

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
									color="violet"
									style={{ flexShrink: 0 }}
								>
									<IconKey size={18} />
								</ThemeIcon>
								<Box style={{ minWidth: 0 }}>
									<Text fw={600} fz="sm">
										{t.akses.kelolaRole}
									</Text>
									<Text fz="xs" c="dimmed" style={{ wordBreak: "break-word" }}>
										Atur hak akses dan permission setiap role
									</Text>
								</Box>
							</Group>
							<Button
								size="xs"
								variant="light"
								color="violet"
								radius="md"
								onClick={() => setKelolaRoleOpened(true)}
								style={{ flexShrink: 0 }}
							>
								Buka
							</Button>
						</Group>

						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />

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
									color="violet"
									style={{ flexShrink: 0 }}
								>
									<IconUsers size={18} />
								</ThemeIcon>
								<Box style={{ minWidth: 0 }}>
									<Text fw={600} fz="sm">
										{t.akses.daftarAnggotaAktif}
									</Text>
									<Text fz="xs" c="dimmed" style={{ wordBreak: "break-word" }}>
										Total pengguna aktif saat ini
									</Text>
								</Box>
							</Group>
							{statsLoading ? (
								<Skeleton
									height={28}
									width={80}
									radius="md"
									style={{ flexShrink: 0 }}
								/>
							) : (
								<Badge
									size="lg"
									color="violet"
									variant="light"
									radius="md"
									style={{ flexShrink: 0 }}
								>
									{totalAnggota} {t.akses.anggota}
								</Badge>
							)}
						</Group>
					</>
				)}
			</Paper>

			{/* Hak Akses */}
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
						<IconShieldHalf size={20} />
					</ThemeIcon>
					<Box>
						<Title order={4} fw={700}>
							{t.akses.hakAkses}
						</Title>
						<Text fz="xs" c="dimmed">
							Distribusi role dan hak akses anggota tim
						</Text>
					</Box>
				</Group>

				{statsLoading ? (
					<Stack gap="sm">
						<Skeleton height={52} radius="md" />
						<Skeleton height={52} radius="md" />
					</Stack>
				) : (
					<Group gap="xl" align="center">
						<RingProgress
							size={120}
							thickness={12}
							roundCaps
							sections={
								roleData.length > 0
									? roleData.map((r) => ({ value: r.pct || 1, color: r.color }))
									: [{ value: 100, color: "gray" }]
							}
						/>
						<Stack gap="xs" style={{ flex: 1 }}>
							{roleData.map((role) => (
								<Group key={role.label} justify="space-between">
									<Group gap="xs">
										<Box
											style={{
												width: 10,
												height: 10,
												borderRadius: "50%",
												background: `var(--mantine-color-${role.color}-5)`,
												flexShrink: 0,
											}}
										/>
										<Text fz="sm" fw={500}>
											{role.label}
										</Text>
									</Group>
									<Group gap="xs">
										<Badge size="sm" color={role.color} variant="light">
											{role.count} {t.akses.orang}
										</Badge>
										<Text fz="xs" c="dimmed">
											{role.pct}%
										</Text>
									</Group>
								</Group>
							))}
						</Stack>
					</Group>
				)}
			</Paper>

			{/* Kolaborasi */}
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
						<IconGitPullRequest size={20} />
					</ThemeIcon>
					<Box>
						<Title order={4} fw={700}>
							{t.akses.kolaborasi}
						</Title>
						<Text fz="xs" c="dimmed">
							Atur kebijakan ekspor data dan persetujuan perubahan
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
							label={t.akses.izinExport}
							description="Izinkan anggota tim mengekspor data ke format CSV atau Excel"
							icon={<IconFileExport size={18} />}
							field="izinExportData"
						/>
						<Divider my="xs" color={dark ? "#1e293b" : "#f1f5f9"} />
						<SwitchRow
							label={t.akses.requireApproval}
							description="Setiap perubahan data penting memerlukan persetujuan administrator"
							icon={<IconGitPullRequest size={18} />}
							field="requireApprovalPerubahan"
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
					onClick={() => withApproval(handleSave, "pengaturan akses & tim")}
					loading={saving}
					disabled={loading}
					radius="md"
					variant="gradient"
					gradient={{ from: "violet", to: "grape" }}
					leftSection={<IconCheck size={16} />}
				>
					{t.common.simpan}
				</Button>
			</Group>
		</Box>
	);
};

export default AksesDanTimSettings;
