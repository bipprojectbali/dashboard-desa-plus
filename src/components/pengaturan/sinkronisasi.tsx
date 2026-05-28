import {
	Alert,
	Badge,
	Box,
	Button,
	Divider,
	Group,
	Paper,
	Stack,
	Text,
	ThemeIcon,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import {
	IconAlertCircle,
	IconArrowRight,
	IconCheck,
	IconCircleCheck,
	IconClock,
	IconCloudUpload,
	IconDatabase,
	IconRefresh,
	IconUsers,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { useTranslate } from "@/hooks/useTranslate";
import { authStore } from "@/store/auth";
import { apiClient } from "@/utils/api-client";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("id");

const SinkronisasiSettings = () => {
	const t = useTranslate();
	const snap = useSnapshot(authStore);
	const isAdmin = snap.user?.role === "admin";
	const [loading, setLoading] = useState(false);
	const [demografiLoading, setDemografiLoading] = useState(false);
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

	const fetchLastSync = async () => {
		const { data } = await apiClient.GET("/api/noc/last-sync", {
			params: { query: { idDesa: "desa1" } },
		});
		if (data?.lastSyncedAt) {
			setLastSync(data.lastSyncedAt);
		}
	};

	const fetchDemografiLastSync = async () => {
		try {
			const { data } = await apiClient.GET("/api/demografi/last-sync", {});
			if (data?.lastSyncedAt) {
				setDemografiLastSync(data.lastSyncedAt);
			}
		} catch (error) {
			console.error("Failed to fetch demografi last sync:", error);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: fetch once on mount
	useEffect(() => {
		fetchLastSync();
		fetchDemografiLastSync();
	}, []);

	const handleSync = async () => {
		setLoading(true);
		setStatus({ type: null, message: "" });

		try {
			const { data, error, response } = await apiClient.POST(
				"/api/noc/sync",
				{},
			);

			if (response?.status === 401) {
				setStatus({ type: "error", message: t.sinkronisasi.tidakAdaAkses });
				return;
			}

			if (error) {
				const errObj = error as Record<string, string>;
				setStatus({
					type: "error",
					message:
						errObj?.error ||
						errObj?.message ||
						t.sinkronisasi.gagalSinkronisasi,
				});
				return;
			}

			if (data?.success) {
				setStatus({
					type: "success",
					message: data.message || t.sinkronisasi.sinkronisasiBerhasil,
				});
				if (data.lastSyncedAt) setLastSync(data.lastSyncedAt);
			} else if (data?.error) {
				setStatus({ type: "error", message: data.error });
			} else {
				setStatus({ type: "error", message: t.sinkronisasi.responseGagal });
			}
		} catch {
			setStatus({ type: "error", message: t.sinkronisasi.kesalahanSistem });
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
						errObj?.error || errObj?.message || t.sinkronisasi.gagalDemografi,
				});
				return;
			}

			if (data?.success) {
				setDemografiStatus({
					type: "success",
					message: data.message || t.sinkronisasi.berhasilDemografi,
				});
				if (data.lastSyncedAt) setDemografiLastSync(data.lastSyncedAt);
				window.dispatchEvent(new CustomEvent("demografi-sync-complete"));
			} else if (data?.error) {
				setDemografiStatus({ type: "error", message: data.error });
			} else {
				setDemografiStatus({
					type: "error",
					message: t.sinkronisasi.responseGagal,
				});
			}
		} catch {
			setDemografiStatus({
				type: "error",
				message: t.sinkronisasi.kesalahanDemografi,
			});
		} finally {
			setDemografiLoading(false);
		}
	};

	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const SyncCard = ({
		title,
		description,
		icon,
		iconColor,
		gradientFrom,
		gradientTo,
		lastSyncTime,
		syncStatus,
		onSync,
		isSyncing,
		buttonLabel,
		buttonColor,
		backgroundColor,
		onClearStatus,
		dataModels,
		sourceUrl,
		sourceName,
	}: {
		title: string;
		description: string;
		backgroundColor: string;
		icon: React.ReactNode;
		iconColor: string;
		gradientFrom: string;
		gradientTo: string;
		lastSyncTime: string | null;
		syncStatus: { type: "success" | "error" | null; message: string };
		onSync: () => void;
		isSyncing: boolean;
		buttonLabel: string;
		buttonColor: string;
		onClearStatus: () => void;
		dataModels: { label: string; color: string }[];
		sourceUrl: string;
		sourceName: string;
	}) => (
		<Paper
			withBorder
			radius="lg"
			p="xl"
			mb="lg"
			style={{
				borderColor: dark ? "#334155" : "#e2e8f0",
				backgroundColor: backgroundColor,
			}}
		>
			{/* Header */}
			<Group gap="sm" mb="lg">
				<ThemeIcon
					size={38}
					radius="md"
					variant="gradient"
					gradient={{ from: gradientFrom, to: gradientTo }}
				>
					{icon}
				</ThemeIcon>
				<Box style={{ flex: 1 }}>
					<Group justify="space-between" align="flex-start">
						<Box>
							<Title order={4} fw={700}>
								{title}
							</Title>
							<Text fz="xs" c="dimmed">
								{description}
							</Text>
						</Box>
						<Badge
							color={lastSyncTime ? iconColor : "gray"}
							variant="light"
							size="sm"
							leftSection={
								lastSyncTime ? (
									<IconCircleCheck size={12} />
								) : (
									<IconClock size={12} />
								)
							}
						>
							{lastSyncTime
								? t.sinkronisasi.terkoneksi
								: t.sinkronisasi.belumPernah}
						</Badge>
					</Group>
				</Box>
			</Group>

			{/* Last sync info */}
			<Paper
				radius="md"
				p="md"
				mb="md"
				style={{
					background: dark ? "#0f172a" : "#f8fafc",
					border: `1px solid ${dark ? "#1e293b" : "#e2e8f0"}`,
				}}
			>
				<Group gap="xs" mb={4}>
					<IconClock size={14} color="gray" />
					<Text
						fz="xs"
						fw={600}
						c="dimmed"
						tt="uppercase"
						style={{ letterSpacing: "0.05em" }}
					>
						{t.sinkronisasi.waktuSinkronisasi}
					</Text>
				</Group>
				<Text fw={700} fz="sm">
					{lastSyncTime
						? dayjs(lastSyncTime).format("DD MMMM YYYY, HH:mm:ss")
						: t.sinkronisasi.belumPernahDilakukan}
				</Text>
				{lastSyncTime && (
					<Text fz="xs" c="dimmed" mt={2}>
						{dayjs(lastSyncTime).fromNow()}
					</Text>
				)}
			</Paper>

			{/* Data models */}
			<Group gap="xs" mb="md">
				<Text fz="xs" fw={600} c="dimmed">
					{t.sinkronisasi.model}:
				</Text>
				{dataModels.map((m) => (
					<Badge key={m.label} size="xs" color={m.color} variant="light">
						{m.label}
					</Badge>
				))}
			</Group>

			{/* Source URL */}
			<Group gap="xs" mb="md">
				<Text fz="xs" fw={600} c="dimmed">
					{t.sinkronisasi.url}:
				</Text>
				<Text fz="xs" c="dimmed" style={{ fontFamily: "monospace" }}>
					{sourceUrl}
				</Text>
			</Group>

			{/* Status alert */}
			{syncStatus.type && (
				<Alert
					icon={
						syncStatus.type === "success" ? (
							<IconCheck size={14} />
						) : (
							<IconAlertCircle size={14} />
						)
					}
					color={syncStatus.type === "success" ? iconColor : "red"}
					onClose={onClearStatus}
					withCloseButton
					radius="md"
					mb="md"
					py="xs"
				>
					<Text fz="sm">{syncStatus.message}</Text>
				</Alert>
			)}

			<Divider mb="md" color={dark ? "#1e293b" : "#f1f5f9"} />

			{/* Sync button */}
			<Button
				variant="gradient"
				gradient={{ from: gradientFrom, to: gradientTo }}
				leftSection={
					<IconRefresh
						size={16}
						style={{
							animation: isSyncing ? "spin 1s linear infinite" : undefined,
						}}
					/>
				}
				rightSection={<IconArrowRight size={14} />}
				onClick={onSync}
				loading={isSyncing}
				fullWidth
				radius="md"
			>
				{buttonLabel}
			</Button>

			<Text fz="xs" c="dimmed" ta="center" mt="xs">
				Sumber: {sourceName}
			</Text>
		</Paper>
	);

	if (!isAdmin) {
		return (
			<Box maw={720}>
				<Alert color="orange" radius="md" icon={<IconAlertCircle size={16} />}>
					Halaman ini hanya dapat diakses oleh administrator.
				</Alert>
			</Box>
		);
	}

	return (
		<Box maw={720}>
			{/* Page header */}
			<Paper
				withBorder
				radius="lg"
				p="xl"
				mb="lg"
				style={{
					background: dark
						? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
						: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)",
					borderColor: dark ? "#334155" : "#bfdbfe",
				}}
			>
				<Group gap="sm">
					<ThemeIcon
						size={44}
						radius="md"
						variant="gradient"
						gradient={{ from: "blue", to: "teal" }}
					>
						<IconCloudUpload size={22} />
					</ThemeIcon>
					<Box>
						<Title order={3} fw={700}>
							{t.sinkronisasi.judul}
						</Title>
						<Text fz="sm" c="dimmed">
							{t.sinkronisasi.deskripsi}
						</Text>
					</Box>
				</Group>
			</Paper>

			{/* NOC Sync */}
			<SyncCard
				title={t.sinkronisasi.dataNoc}
				description="Data kinerja divisi, kegiatan, dan diskusi dari sistem NOC"
				icon={<IconDatabase size={20} />}
				backgroundColor={dark ? "#1E293B" : "white"}
				iconColor="green"
				gradientFrom="teal"
				gradientTo="green"
				lastSyncTime={lastSync}
				syncStatus={status}
				onSync={handleSync}
				isSyncing={loading}
				buttonLabel={t.sinkronisasi.sinkronkanNoc}
				buttonColor="teal"
				onClearStatus={() => setStatus({ type: null, message: "" })}
				dataModels={[
					{ label: "Divisi", color: "teal" },
					{ label: "Kegiatan", color: "teal" },
					{ label: "Diskusi", color: "teal" },
				]}
				sourceUrl="darmasaba.muku.id/api/noc"
				sourceName={t.sinkronisasi.nocNama}
			/>

			{/* Demografi Sync */}
			<SyncCard
				backgroundColor={dark ? "#1E293B" : "white"}
				title={t.sinkronisasi.websiteDesa}
				description="Data demografi penduduk, APBDes, dan sektor ekonomi dari website desa"
				icon={<IconUsers size={20} />}
				iconColor="blue"
				gradientFrom="blue"
				gradientTo="cyan"
				lastSyncTime={demografiLastSync}
				syncStatus={demografiStatus}
				onSync={handleDemografiSync}
				isSyncing={demografiLoading}
				buttonLabel={t.sinkronisasi.sinkronkanDesa}
				buttonColor="blue"
				onClearStatus={() => setDemografiStatus({ type: null, message: "" })}
				dataModels={[
					{ label: "Demografi", color: "blue" },
					{ label: "APBDes", color: "blue" },
					{ label: "Sektor", color: "blue" },
				]}
				sourceUrl="desa-darmasaba-stg.wibudev.com"
				sourceName={t.sinkronisasi.desaNama}
			/>
		</Box>
	);
};

export default SinkronisasiSettings;
