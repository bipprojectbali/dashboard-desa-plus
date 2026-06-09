import {
	Alert,
	Badge,
	Box,
	Button,
	Divider,
	Group,
	Loader,
	LoadingOverlay,
	Paper,
	ScrollArea,
	Select,
	SimpleGrid,
	Skeleton,
	Stack,
	Switch,
	Table,
	Text,
	ThemeIcon,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import {
	IconAdjustments,
	IconAlertCircle,
	IconArrowRight,
	IconCheck,
	IconCircleCheck,
	IconClock,
	IconCloudUpload,
	IconDatabase,
	IconGlobe,
	IconHistory,
	IconLanguage,
	IconLayoutGrid,
	IconRefresh,
	IconSparkles,
	IconUsers,
	IconX,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { useCallback, useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { useApprovalGuard } from "@/hooks/useApprovalGuard";
import { useTranslate } from "@/hooks/useTranslate";
import { protectedRouteMiddleware } from "@/middleware/authMiddleware";
import {
	type FormatTanggal,
	i18nStore,
	setDashboardPrefs,
	setFormatTanggal,
	setLang,
	setZonaWaktu,
} from "@/store/i18n";
import { apiClient } from "@/utils/api-client";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.locale("id");

type SyncLogEntry = {
	id: string;
	type: string;
	status: string;
	triggeredBy: string;
	durationMs: number | null;
	recordsAffected: number | null;
	errorMessage: string | null;
	startedAt: string;
};

const ZONA_OFFSET: Record<string, number> = {
	"Asia/Jakarta": 420,
	"Asia/Makassar": 480,
	"Asia/Jayapura": 540,
};

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

function AdminSyncSection() {
	const [loading, setLoading] = useState(false);
	const [demografiLoading, setDemografiLoading] = useState(false);
	const { zonaWaktu } = useSnapshot(i18nStore);
	const tzOffset = ZONA_OFFSET[zonaWaktu] ?? 420;
	const fmtTs = (ts: string, format: string) =>
		dayjs.utc(ts).utcOffset(tzOffset).format(format);

	const [lastSync, setLastSync] = useState<string | null>(null);
	const [demografiLastSync, setDemografiLastSync] = useState<string | null>(
		null,
	);
	const [status, setStatus] = useState<{
		type: "success" | "error" | null;
		message: string;
	}>({ type: null, message: "" });
	const [demografiStatus, setDemografiStatus] = useState<{
		type: "success" | "error" | null;
		message: string;
	}>({ type: null, message: "" });
	const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);
	const [logsLoading, setLogsLoading] = useState(false);
	const [logsType, setLogsType] = useState<string | null>(null);

	const fetchSyncLogs = useCallback(async (type?: string | null) => {
		setLogsLoading(true);
		try {
			const params: Record<string, string> = { limit: "30" };
			if (type) params.type = type;
			const qs = new URLSearchParams(params).toString();
			const res = await fetch(`/api/admin/sync/logs?${qs}`);
			if (res.ok) {
				const json = await res.json();
				setSyncLogs(json.data ?? []);
			}
		} catch {
			// silent
		} finally {
			setLogsLoading(false);
		}
	}, []);

	const fetchLastSync = async () => {
		const { data } = await apiClient.GET("/api/noc/last-sync", {
			params: { query: { idDesa: "desa1" } },
		});
		if (data?.lastSyncedAt) setLastSync(data.lastSyncedAt);
	};

	const fetchDemografiLastSync = async () => {
		try {
			const { data } = await apiClient.GET("/api/demografi/last-sync", {});
			if (data?.lastSyncedAt) setDemografiLastSync(data.lastSyncedAt);
		} catch {}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: fetch once on mount
	useEffect(() => {
		fetchLastSync();
		fetchDemografiLastSync();
		fetchSyncLogs();
	}, [fetchSyncLogs]);

	useEffect(() => {
		fetchSyncLogs(logsType);
	}, [logsType, fetchSyncLogs]);

	const handleSync = async () => {
		setLoading(true);
		setStatus({ type: null, message: "" });
		try {
			const { data, error, response } = await apiClient.POST(
				"/api/noc/sync",
				{},
			);
			if (response?.status === 401) {
				setStatus({
					type: "error",
					message: "Tidak ada akses untuk sinkronisasi NOC",
				});
				return;
			}
			if (error) {
				const errObj = error as Record<string, string>;
				setStatus({
					type: "error",
					message: errObj?.error || errObj?.message || "Gagal sinkronisasi NOC",
				});
				return;
			}
			if (data?.success) {
				setStatus({
					type: "success",
					message: data.message || "Sinkronisasi NOC berhasil",
				});
				if (data.lastSyncedAt) setLastSync(data.lastSyncedAt);
				fetchSyncLogs(logsType);
			} else {
				setStatus({
					type: "error",
					message:
						(data as unknown as Record<string, string>)?.error ||
						"Respons tidak dikenali",
				});
			}
		} catch {
			setStatus({ type: "error", message: "Kesalahan sistem" });
		} finally {
			setLoading(false);
		}
	};

	const handleDemografiSync = async () => {
		setDemografiLoading(true);
		setDemografiStatus({ type: null, message: "" });
		try {
			const { data, error } = await apiClient.POST("/api/demografi/sync", {});
			if (error) {
				const errObj = error as Record<string, string>;
				setDemografiStatus({
					type: "error",
					message:
						errObj?.error || errObj?.message || "Gagal sinkronisasi demografi",
				});
				return;
			}
			if (data?.success) {
				setDemografiStatus({
					type: "success",
					message: data.message || "Sinkronisasi demografi berhasil",
				});
				if (data.lastSyncedAt) setDemografiLastSync(data.lastSyncedAt);
				window.dispatchEvent(new CustomEvent("demografi-sync-complete"));
				fetchSyncLogs(logsType);
			} else {
				setDemografiStatus({
					type: "error",
					message:
						(data as unknown as Record<string, string>)?.error ||
						"Respons tidak dikenali",
				});
			}
		} catch {
			setDemografiStatus({ type: "error", message: "Kesalahan sistem" });
		} finally {
			setDemografiLoading(false);
		}
	};

	return (
		<Stack gap="lg">
			{/* Section header */}
			<Group gap="md" align="flex-start">
				<ThemeIcon
					size={44}
					radius="md"
					variant="gradient"
					gradient={{ from: "orange.7", to: "red.6" }}
					style={{ flexShrink: 0 }}
				>
					<IconCloudUpload size={24} stroke={1.5} />
				</ThemeIcon>
				<Box>
					<Group gap="xs" align="center">
						<Title order={2} c="orange">
							Sinkronisasi Data
						</Title>
						<Badge color="orange" variant="light" size="sm">
							Admin Only
						</Badge>
					</Group>
					<Text size="sm" c="dimmed">
						Sinkronkan data eksternal ke database lokal dashboard
					</Text>
				</Box>
			</Group>

			{/* Sync Cards */}
			<SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
				{/* NOC Sync */}
				<Paper withBorder radius="lg" p="xl">
					<Group gap="sm" mb="lg">
						<ThemeIcon
							size={38}
							radius="md"
							variant="gradient"
							gradient={{ from: "teal", to: "green" }}
						>
							<IconDatabase size={20} />
						</ThemeIcon>
						<Box style={{ flex: 1 }}>
							<Group justify="space-between" align="flex-start">
								<Box>
									<Title order={4} fw={700}>
										Data NOC
									</Title>
									<Text fz="xs" c="dimmed">
										Kinerja divisi, kegiatan &amp; diskusi
									</Text>
								</Box>
								<Badge
									color={lastSync ? "teal" : "gray"}
									variant="light"
									size="sm"
									leftSection={
										lastSync ? (
											<IconCircleCheck size={12} />
										) : (
											<IconClock size={12} />
										)
									}
								>
									{lastSync ? "Terkoneksi" : "Belum pernah"}
								</Badge>
							</Group>
						</Box>
					</Group>

					<Paper withBorder radius="md" p="sm" mb="md">
						<Group gap="xs" mb={2}>
							<IconClock size={14} />
							<Text fz="xs" fw={600} c="dimmed" tt="uppercase">
								Sinkronisasi Terakhir
							</Text>
						</Group>
						<Text fw={700} fz="sm">
							{lastSync
								? fmtTs(lastSync, "DD MMMM YYYY, HH:mm:ss")
								: "Belum pernah dilakukan"}
						</Text>
						{lastSync && (
							<Text fz="xs" c="dimmed" mt={2}>
								{dayjs(lastSync).fromNow()}
							</Text>
						)}
					</Paper>

					<Group gap="xs" mb="sm">
						<Text fz="xs" fw={600} c="dimmed">
							Model:
						</Text>
						{["Divisi", "Kegiatan", "Diskusi"].map((m) => (
							<Badge key={m} size="xs" color="teal" variant="light">
								{m}
							</Badge>
						))}
					</Group>

					<Group gap="xs" mb="md">
						<Text fz="xs" fw={600} c="dimmed">
							URL:
						</Text>
						<Text fz="xs" c="dimmed" style={{ fontFamily: "monospace" }}>
							darmasaba.muku.id/api/noc
						</Text>
					</Group>

					{status.type && (
						<Alert
							icon={
								status.type === "success" ? (
									<IconCheck size={14} />
								) : (
									<IconAlertCircle size={14} />
								)
							}
							color={status.type === "success" ? "teal" : "red"}
							onClose={() => setStatus({ type: null, message: "" })}
							withCloseButton
							radius="md"
							mb="md"
							py="xs"
						>
							<Text fz="sm">{status.message}</Text>
						</Alert>
					)}

					<Divider mb="md" />

					<Button
						variant="gradient"
						gradient={{ from: "teal", to: "green" }}
						leftSection={
							<IconRefresh
								size={16}
								style={{
									animation: loading ? "spin 1s linear infinite" : undefined,
								}}
							/>
						}
						rightSection={<IconArrowRight size={14} />}
						onClick={handleSync}
						loading={loading}
						fullWidth
						radius="md"
					>
						Sinkronkan NOC
					</Button>
					<Text fz="xs" c="dimmed" ta="center" mt="xs">
						Sumber: NOC System (darmasaba.muku.id)
					</Text>
				</Paper>

				{/* Demografi Sync */}
				<Paper withBorder radius="lg" p="xl">
					<Group gap="sm" mb="lg">
						<ThemeIcon
							size={38}
							radius="md"
							variant="gradient"
							gradient={{ from: "blue", to: "cyan" }}
						>
							<IconUsers size={20} />
						</ThemeIcon>
						<Box style={{ flex: 1 }}>
							<Group justify="space-between" align="flex-start">
								<Box>
									<Title order={4} fw={700}>
										Website Desa
									</Title>
									<Text fz="xs" c="dimmed">
										Demografi, APBDes &amp; sektor ekonomi
									</Text>
								</Box>
								<Badge
									color={demografiLastSync ? "blue" : "gray"}
									variant="light"
									size="sm"
									leftSection={
										demografiLastSync ? (
											<IconCircleCheck size={12} />
										) : (
											<IconClock size={12} />
										)
									}
								>
									{demografiLastSync ? "Terkoneksi" : "Belum pernah"}
								</Badge>
							</Group>
						</Box>
					</Group>

					<Paper withBorder radius="md" p="sm" mb="md">
						<Group gap="xs" mb={2}>
							<IconClock size={14} />
							<Text fz="xs" fw={600} c="dimmed" tt="uppercase">
								Sinkronisasi Terakhir
							</Text>
						</Group>
						<Text fw={700} fz="sm">
							{demografiLastSync
								? fmtTs(demografiLastSync, "DD MMMM YYYY, HH:mm:ss")
								: "Belum pernah dilakukan"}
						</Text>
						{demografiLastSync && (
							<Text fz="xs" c="dimmed" mt={2}>
								{dayjs(demografiLastSync).fromNow()}
							</Text>
						)}
					</Paper>

					<Group gap="xs" mb="sm">
						<Text fz="xs" fw={600} c="dimmed">
							Model:
						</Text>
						{["Demografi", "APBDes", "Sektor"].map((m) => (
							<Badge key={m} size="xs" color="blue" variant="light">
								{m}
							</Badge>
						))}
					</Group>

					<Group gap="xs" mb="md">
						<Text fz="xs" fw={600} c="dimmed">
							URL:
						</Text>
						<Text fz="xs" c="dimmed" style={{ fontFamily: "monospace" }}>
							desa-darmasaba-stg.wibudev.com
						</Text>
					</Group>

					{demografiStatus.type && (
						<Alert
							icon={
								demografiStatus.type === "success" ? (
									<IconCheck size={14} />
								) : (
									<IconAlertCircle size={14} />
								)
							}
							color={demografiStatus.type === "success" ? "blue" : "red"}
							onClose={() => setDemografiStatus({ type: null, message: "" })}
							withCloseButton
							radius="md"
							mb="md"
							py="xs"
						>
							<Text fz="sm">{demografiStatus.message}</Text>
						</Alert>
					)}

					<Divider mb="md" />

					<Button
						variant="gradient"
						gradient={{ from: "blue", to: "cyan" }}
						leftSection={
							<IconRefresh
								size={16}
								style={{
									animation: demografiLoading
										? "spin 1s linear infinite"
										: undefined,
								}}
							/>
						}
						rightSection={<IconArrowRight size={14} />}
						onClick={handleDemografiSync}
						loading={demografiLoading}
						fullWidth
						radius="md"
					>
						Sinkronkan Data Desa
					</Button>
					<Text fz="xs" c="dimmed" ta="center" mt="xs">
						Sumber: Website Desa Darmasaba
					</Text>
				</Paper>
			</SimpleGrid>

			{/* Riwayat Sinkronisasi */}
			<Paper withBorder radius="lg" p="xl">
				<Group justify="space-between" mb="md">
					<Group gap="sm">
						<ThemeIcon size={36} radius="md" variant="light" color="orange">
							<IconHistory size={18} />
						</ThemeIcon>
						<Box>
							<Title order={4} fw={700}>
								Riwayat Sinkronisasi
							</Title>
							<Text fz="xs" c="dimmed">
								30 entri terakhir dari scheduler otomatis &amp; manual
							</Text>
						</Box>
					</Group>
					<Group gap="xs">
						<Select
							size="xs"
							radius="md"
							placeholder="Semua tipe"
							clearable
							data={[
								{ value: "noc", label: "NOC" },
								{ value: "demografi", label: "Demografi" },
							]}
							value={logsType}
							onChange={setLogsType}
							w={130}
						/>
						<Button
							size="xs"
							variant="light"
							color="orange"
							radius="md"
							leftSection={<IconRefresh size={13} />}
							onClick={() => fetchSyncLogs(logsType)}
							loading={logsLoading}
						>
							Refresh
						</Button>
					</Group>
				</Group>

				{logsLoading ? (
					<Group justify="center" py="xl">
						<Loader size="sm" color="orange" />
					</Group>
				) : syncLogs.length === 0 ? (
					<Text fz="sm" c="dimmed" ta="center" py="xl">
						Belum ada riwayat sinkronisasi.
					</Text>
				) : (
					<ScrollArea>
						<Table
							striped
							highlightOnHover
							fz="xs"
							withTableBorder
							withColumnBorders
						>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Tipe</Table.Th>
									<Table.Th>Status</Table.Th>
									<Table.Th>Dipicu</Table.Th>
									<Table.Th>Durasi</Table.Th>
									<Table.Th>Records</Table.Th>
									<Table.Th>Waktu Mulai</Table.Th>
									<Table.Th>Error</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{syncLogs.map((log) => (
									<Table.Tr key={log.id}>
										<Table.Td>
											<Badge
												size="xs"
												color={log.type === "noc" ? "teal" : "blue"}
												variant="light"
											>
												{log.type.toUpperCase()}
											</Badge>
										</Table.Td>
										<Table.Td>
											<Badge
												size="xs"
												color={
													log.status === "success"
														? "green"
														: log.status === "error"
															? "red"
															: "yellow"
												}
												variant="light"
											>
												{log.status}
											</Badge>
										</Table.Td>
										<Table.Td>
											<Badge size="xs" color="gray" variant="outline">
												{log.triggeredBy}
											</Badge>
										</Table.Td>
										<Table.Td>
											{log.durationMs != null
												? log.durationMs < 1000
													? `${log.durationMs}ms`
													: `${(log.durationMs / 1000).toFixed(1)}s`
												: "-"}
										</Table.Td>
										<Table.Td>{log.recordsAffected ?? "-"}</Table.Td>
										<Table.Td style={{ whiteSpace: "nowrap" }}>
											{fmtTs(log.startedAt, "DD/MM/YY HH:mm:ss")}
										</Table.Td>
										<Table.Td>
											{log.errorMessage ? (
												<Text
													fz="xs"
													c="red"
													style={{ maxWidth: 200 }}
													lineClamp={2}
												>
													{log.errorMessage}
												</Text>
											) : (
												"-"
											)}
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</ScrollArea>
				)}
			</Paper>
		</Stack>
	);
}

const CACHE_MODULES = [
	{
		prefix: "keamanan",
		label: "Keamanan",
		description: "CCTV, laporan publik",
	},
	{
		prefix: "sosial",
		label: "Sosial",
		description: "Kesehatan, posyandu, event budaya",
	},
	{ prefix: "bumdes", label: "BUMDes", description: "KPI, penjualan, produk" },
	{ prefix: "umkm", label: "UMKM", description: "Data UMKM" },
	{ prefix: "apbdes", label: "APBDes", description: "Data anggaran" },
	{ prefix: "demografi", label: "Demografi", description: "Data kependudukan" },
] as const;

function AdminCacheSection() {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";
	const [loadingPrefix, setLoadingPrefix] = useState<string | null>(null);
	const [flushingAll, setFlushingAll] = useState(false);
	const [result, setResult] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	useEffect(() => {
		if (!result) return;
		const t = setTimeout(() => setResult(null), 3500);
		return () => clearTimeout(t);
	}, [result]);

	const handleInvalidate = async (prefix: string, label: string) => {
		setLoadingPrefix(prefix);
		try {
			const res = await fetch("/api/admin/cache/invalidate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prefix }),
			});
			if (!res.ok) throw new Error();
			const json = await res.json();
			setResult({
				type: "success",
				message: `Cache ${label} dihapus — ${json.deleted} entri.`,
			});
		} catch {
			setResult({ type: "error", message: `Gagal menghapus cache ${label}.` });
		} finally {
			setLoadingPrefix(null);
		}
	};

	const handleFlushAll = async () => {
		setFlushingAll(true);
		try {
			const res = await fetch("/api/admin/cache/flush", { method: "DELETE" });
			if (!res.ok) throw new Error();
			const json = await res.json();
			setResult({
				type: "success",
				message: `Semua cache dikosongkan — ${json.flushed} entri dihapus.`,
			});
		} catch {
			setResult({ type: "error", message: "Gagal mengosongkan cache." });
		} finally {
			setFlushingAll(false);
		}
	};

	return (
		<Stack gap="md">
			<Paper withBorder radius="lg" p="xl">
				<Stack gap="md">
					<Group justify="space-between" align="center">
						<Group gap="sm">
							<ThemeIcon size="lg" radius="md" variant="light" color="orange">
								<IconDatabase size={18} />
							</ThemeIcon>
							<Box>
								<Text fz="sm" fw={700}>
									Cache Data Proxy
								</Text>
								<Text fz="xs" c="dimmed">
									Hapus cache per modul agar request berikutnya mengambil data
									langsung dari Desa API
								</Text>
							</Box>
						</Group>
						<Button
							variant="light"
							color="red"
							size="xs"
							leftSection={<IconRefresh size={14} />}
							onClick={handleFlushAll}
							loading={flushingAll}
						>
							Kosongkan Semua Cache
						</Button>
					</Group>

					{result && (
						<Alert
							color={result.type === "success" ? "green" : "red"}
							icon={
								result.type === "success" ? (
									<IconCircleCheck size={16} />
								) : (
									<IconAlertCircle size={16} />
								)
							}
							radius="md"
							p="xs"
						>
							{result.message}
						</Alert>
					)}

					<Divider />

					<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
						{CACHE_MODULES.map((mod) => (
							<Paper key={mod.prefix} withBorder radius="md" p="sm">
								<Group justify="space-between" align="center" wrap="nowrap">
									<Box style={{ minWidth: 0 }}>
										<Text fz="sm" fw={600} truncate>
											{mod.label}
										</Text>
										<Text fz="xs" c="dimmed" truncate>
											{mod.description}
										</Text>
									</Box>
									<Button
										variant="subtle"
										color="orange"
										size="xs"
										leftSection={<IconRefresh size={12} />}
										onClick={() => handleInvalidate(mod.prefix, mod.label)}
										loading={loadingPrefix === mod.prefix}
										disabled={flushingAll}
										style={{ flexShrink: 0 }}
									>
										Hapus
									</Button>
								</Group>
							</Paper>
						))}
					</SimpleGrid>
				</Stack>
			</Paper>
		</Stack>
	);
}

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
										background: dark ? "rgba(249,115,22,0.12)" : "#FFF7ED",
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

			{/* Sinkronisasi Data */}
			<AdminSyncSection />

			{/* Cache Invalidasi */}
			<AdminCacheSection />
		</Stack>
	);
}
