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
	Table,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import {
	IconAlertCircle,
	IconCheck,
	IconCloudCheck,
	IconCloudX,
	IconRefresh,
	IconRotateClockwise,
	IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useCallback, useEffect, useState } from "react";
import { useIsDark } from "@/hooks/useIsDark";

dayjs.extend(relativeTime);

type SyncLog = {
	id: string;
	type: string;
	status: string;
	triggeredBy: string;
	durationMs: number | null;
	recordsAffected: number | null;
	errorMessage: string | null;
	startedAt: string;
};

const SinkronisasiSettings = () => {
	const dark = useIsDark();
	const [logs, setLogs] = useState<SyncLog[]>([]);
	const [loading, setLoading] = useState(true);
	const [syncing, setSyncing] = useState(false);
	const [lastSync, setLastSync] = useState<string | null>(null);
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	useEffect(() => {
		if (!toast) return;
		const t = setTimeout(() => setToast(null), 4000);
		return () => clearTimeout(t);
	}, [toast]);

	const fetchLogs = useCallback(async () => {
		try {
			setLoading(true);
			const res = await fetch("/admin/sync/logs?limit=20", {
				credentials: "include",
			});
			if (!res.ok) throw new Error();
			const json = await res.json();
			const data: SyncLog[] = json.data ?? [];
			setLogs(data);
			if (data.length > 0) setLastSync(data[0].startedAt);
		} catch {
			// keep empty
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchLogs();
	}, [fetchLogs]);

	const handleSync = async () => {
		setSyncing(true);
		try {
			const res = await fetch("/api/noc/sync", {
				method: "POST",
				credentials: "include",
			});
			if (!res.ok) {
				const json = await res.json().catch(() => ({}));
				throw new Error((json as { error?: string }).error ?? "Sync gagal");
			}
			setToast({
				type: "success",
				message: "Sinkronisasi berhasil dijalankan",
			});
			await fetchLogs();
		} catch (err) {
			setToast({
				type: "error",
				message: err instanceof Error ? err.message : "Gagal menjalankan sync",
			});
		} finally {
			setSyncing(false);
		}
	};

	const statusColor = (s: string) => {
		if (s === "success") return "green";
		if (s === "failed" || s === "error") return "red";
		return "orange";
	};

	const paperStyle = {
		borderColor: dark ? "#334155" : "#e2e8f0",
	} as const;

	return (
		<Box maw={800}>
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

			{/* Status terakhir + trigger */}
			<Paper
				withBorder
				radius="lg"
				p="xl"
				mb="lg"
				style={paperStyle}
				bg={dark ? "#1E293B" : "white"}
			>
				<Group justify="space-between" wrap="nowrap" mb="lg">
					<Group gap="sm" wrap="nowrap">
						<ThemeIcon
							size={38}
							radius="md"
							variant="gradient"
							gradient={{ from: "blue", to: "cyan" }}
						>
							<IconRotateClockwise size={20} />
						</ThemeIcon>
						<Box>
							<Title order={4} fw={700}>
								Sinkronisasi NOC
							</Title>
							<Text fz="xs" c="dimmed">
								Tarik data terbaru dari sistem NOC Desa Darmasaba
							</Text>
						</Box>
					</Group>
					<Button
						onClick={handleSync}
						loading={syncing}
						leftSection={<IconRefresh size={16} />}
						variant="gradient"
						gradient={{ from: "blue", to: "cyan" }}
						radius="md"
					>
						Sync Sekarang
					</Button>
				</Group>

				<Divider mb="md" color={dark ? "#334155" : "#f1f5f9"} />

				<Group gap="xl">
					<Box>
						<Text fz="xs" c="dimmed" mb={4}>
							Sync Terakhir
						</Text>
						{loading ? (
							<Skeleton height={20} width={160} />
						) : lastSync ? (
							<Group gap="xs">
								<IconCloudCheck
									size={16}
									color="var(--mantine-color-green-6)"
								/>
								<Text fz="sm" fw={500}>
									{dayjs(lastSync).fromNow()} &mdash;{" "}
									{dayjs(lastSync).format("DD/MM/YYYY HH:mm")}
								</Text>
							</Group>
						) : (
							<Group gap="xs">
								<IconCloudX size={16} color="var(--mantine-color-dimmed)" />
								<Text fz="sm" c="dimmed">
									Belum pernah sync
								</Text>
							</Group>
						)}
					</Box>
					<Box>
						<Text fz="xs" c="dimmed" mb={4}>
							Jumlah Log
						</Text>
						<Text fz="sm" fw={500}>
							{loading ? <Skeleton height={20} width={40} /> : logs.length}{" "}
							entri
						</Text>
					</Box>
				</Group>
			</Paper>

			{/* Log riwayat */}
			<Paper
				withBorder
				radius="lg"
				p="xl"
				style={paperStyle}
				bg={dark ? "#1E293B" : "white"}
			>
				<Group gap="sm" mb="lg">
					<ThemeIcon
						size={38}
						radius="md"
						variant="gradient"
						gradient={{ from: "orange", to: "red" }}
					>
						<IconAlertCircle size={20} />
					</ThemeIcon>
					<Box>
						<Title order={4} fw={700}>
							Riwayat Sinkronisasi
						</Title>
						<Text fz="xs" c="dimmed">
							20 entri terbaru dari sistem sync NOC
						</Text>
					</Box>
				</Group>

				{loading ? (
					<Stack gap="xs">
						{Array.from({ length: 5 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
							<Skeleton key={i} height={44} radius="md" />
						))}
					</Stack>
				) : logs.length === 0 ? (
					<Text c="dimmed" ta="center" py="xl">
						Belum ada riwayat sinkronisasi
					</Text>
				) : (
					<Box style={{ overflowX: "auto" }}>
						<Table
							striped
							highlightOnHover
							withTableBorder
							verticalSpacing="sm"
						>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Waktu</Table.Th>
									<Table.Th>Tipe</Table.Th>
									<Table.Th>Status</Table.Th>
									<Table.Th>Pemicu</Table.Th>
									<Table.Th>Durasi</Table.Th>
									<Table.Th>Record</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{logs.map((log) => (
									<Table.Tr key={log.id}>
										<Table.Td>
											<Text size="sm" c="dimmed">
												{dayjs(log.startedAt).format("DD/MM/YY HH:mm:ss")}
											</Text>
										</Table.Td>
										<Table.Td>
											<Text size="sm" tt="capitalize">
												{log.type}
											</Text>
										</Table.Td>
										<Table.Td>
											<Badge
												color={statusColor(log.status)}
												variant="light"
												size="sm"
											>
												{log.status}
											</Badge>
										</Table.Td>
										<Table.Td>
											<Text size="sm">{log.triggeredBy ?? "-"}</Text>
										</Table.Td>
										<Table.Td>
											<Text size="sm">
												{log.durationMs != null ? `${log.durationMs} ms` : "-"}
											</Text>
										</Table.Td>
										<Table.Td>
											<Text size="sm">{log.recordsAffected ?? "-"}</Text>
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</Box>
				)}
			</Paper>
		</Box>
	);
};

export default SinkronisasiSettings;
