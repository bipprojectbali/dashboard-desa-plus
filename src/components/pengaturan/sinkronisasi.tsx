import {
	Alert,
	Badge,
	Box,
	Button,
	Card,
	Divider,
	Grid,
	Group,
	Loader,
	Stack,
	Tabs,
	Text,
	Title,
} from "@mantine/core";
import {
	IconAlertCircle,
	IconCheck,
	IconClock,
	IconRefresh,
	IconUsers,
	IconDatabase,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { apiClient } from "@/utils/api-client";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("id");

const SinkronisasiSettings = () => {
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

	useEffect(() => {
		fetchLastSync();
		fetchDemografiLastSync();
	}, []);

	const handleSync = async () => {
		setLoading(true);
		setStatus({ type: null, message: "" });

		try {
			console.log("[Sync] Starting NOC synchronization...");

			const { data, error, response } = await apiClient.POST(
				"/api/noc/sync",
				{},
			);

			console.log("[Sync] Response:", {
				data,
				error,
				status: response?.status,
			});

			// Check HTTP status first
			if (response?.status === 401) {
				setStatus({
					type: "error",
					message:
						"Anda tidak memiliki akses. Pastikan Anda login sebagai admin.",
				});
				return;
			}

			if (error) {
				console.error("[Sync] API Error:", error);
				setStatus({
					type: "error",
					message:
						(error as any)?.error ||
						(error as any)?.message ||
						"Gagal melakukan sinkronisasi. Periksa console untuk detail.",
				});
				return;
			}

			if (data?.success) {
				setStatus({
					type: "success",
					message: data.message || "Sinkronisasi berhasil dilakukan",
				});
				if (data.lastSyncedAt) {
					setLastSync(data.lastSyncedAt);
				}
			} else if (data?.error) {
				setStatus({
					type: "error",
					message: data.error,
				});
			} else {
				setStatus({
					type: "error",
					message: "Response tidak dikenali dari server",
				});
			}
		} catch (err) {
			console.error("[Sync] Exception:", err);
			setStatus({
				type: "error",
				message:
					"Terjadi kesalahan sistem saat sinkronisasi. Periksa console untuk detail.",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleDemografiSync = async () => {
		setDemografiLoading(true);
		setDemografiStatus({ type: null, message: "" });

		try {
			console.log("[Demografi Sync] Starting demografi synchronization...");

			const { data, error, response } = await apiClient.POST(
				"/api/demografi/sync",
				{},
			);

			console.log("[Demografi Sync] Response:", {
				data,
				error,
				status: response?.status,
			});

			if (error) {
				console.error("[Demografi Sync] API Error:", error);
				setDemografiStatus({
					type: "error",
					message:
						(error as any)?.error ||
						(error as any)?.message ||
						"Gagal melakukan sinkronisasi data demografi.",
				});
				return;
			}

			if (data?.success) {
				setDemografiStatus({
					type: "success",
					message: data.message || "Sinkronisasi data demografi berhasil",
				});
				if (data.lastSyncedAt) {
					setDemografiLastSync(data.lastSyncedAt);
				}
				// Trigger refresh in demografi component
				window.dispatchEvent(new CustomEvent("demografi-sync-complete"));
			} else if (data?.error) {
				setDemografiStatus({
					type: "error",
					message: data.error,
				});
			} else {
				setDemografiStatus({
					type: "error",
					message: "Response tidak dikenali dari server",
				});
			}
		} catch (err) {
			console.error("[Demografi Sync] Exception:", err);
			setDemografiStatus({
				type: "error",
				message: "Terjadi kesalahan sistem saat sinkronisasi data demografi.",
			});
		} finally {
			setDemografiLoading(false);
		}
	};

	return (
		<Box pr={"20%"}>
			<Title order={2} mb="lg">
				Sinkronisasi Data
			</Title>

			<Text c="dimmed" mb="xl">
				Gunakan fitur ini untuk memperbarui data dashboard dengan data terbaru
				dari server sumber.
			</Text>

			<Grid gutter="xl">
				<Grid.Col span={{ base: 12, md: 6 }}>
					<Title order={3} mb="md">
						Data NOC (muku.id)
					</Title>
					<Card withBorder padding="lg" radius="md" mb="xl">
						<Stack gap="md">
							<Group justify="space-between">
								<Group>
									<IconDatabase size={20} color="gray" />
									<Text fw={500}>Status Terakhir</Text>
								</Group>
								<Badge color={lastSync ? "green" : "gray"} variant="light">
									{lastSync ? "Terkoneksi" : "Belum Pernah Sinkron"}
								</Badge>
							</Group>

							<Divider />

							<Box>
								<Text size="sm" c="dimmed">
									Waktu Sinkronisasi Terakhir:
								</Text>
								<Text fw={700} size="lg">
									{lastSync
										? dayjs(lastSync).format("DD MMMM YYYY, HH:mm:ss")
										: "Belum pernah dilakukan"}
								</Text>
								{lastSync && (
									<Text size="xs" c="dimmed" mt={4}>
										({dayjs(lastSync).fromNow()})
									</Text>
								)}
							</Box>

							{status.type && (
								<Alert
									icon={
										status.type === "success" ? (
											<IconCheck size={16} />
										) : (
											<IconAlertCircle size={16} />
										)
									}
									title={status.type === "success" ? "Berhasil" : "Kesalahan"}
									color={status.type === "success" ? "green" : "red"}
									onClose={() => setStatus({ type: null, message: "" })}
									withCloseButton
								>
									{status.message}
								</Alert>
							)}

							<Button
								leftSection={
									loading ? (
										<Loader size={16} color="white" />
									) : (
										<IconRefresh size={16} />
									)
								}
								onClick={handleSync}
								loading={loading}
								fullWidth
								mt="md"
							>
								Sinkronkan NOC
							</Button>
						</Stack>
					</Card>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 6 }}>
					<Title order={3} mb="md">
						Website Desa (darmasaba.desa.id)
					</Title>
					<Card withBorder padding="lg" radius="md" mb="xl">
						<Stack gap="md">
							<Group justify="space-between">
								<Group>
									<IconUsers size={20} color="gray" />
									<Text fw={500}>Status Terakhir</Text>
								</Group>
								<Badge
									color={demografiLastSync ? "blue" : "gray"}
									variant="light"
								>
									{demografiLastSync ? "Terkoneksi" : "Belum Pernah Sinkron"}
								</Badge>
							</Group>

							<Divider />

							<Box>
								<Text size="sm" c="dimmed">
									Waktu Sinkronisasi Terakhir:
								</Text>
								<Text fw={700} size="lg">
									{demografiLastSync
										? dayjs(demografiLastSync).format("DD MMMM YYYY, HH:mm:ss")
										: "Belum pernah dilakukan"}
								</Text>
								{demografiLastSync && (
									<Text size="xs" c="dimmed" mt={4}>
										({dayjs(demografiLastSync).fromNow()})
									</Text>
								)}
							</Box>

							{demografiStatus.type && (
								<Alert
									icon={
										demografiStatus.type === "success" ? (
											<IconCheck size={16} />
										) : (
											<IconAlertCircle size={16} />
										)
									}
									title={
										demografiStatus.type === "success" ? "Berhasil" : "Kesalahan"
									}
									color={demografiStatus.type === "success" ? "blue" : "red"}
									onClose={() => setDemografiStatus({ type: null, message: "" })}
									withCloseButton
								>
									{demografiStatus.message}
								</Alert>
							)}

							<Button
								color="blue"
								leftSection={
									demografiLoading ? (
										<Loader size={16} color="white" />
									) : (
										<IconRefresh size={16} />
									)
								}
								onClick={handleDemografiSync}
								loading={demografiLoading}
								fullWidth
								mt="md"
							>
								Sinkronkan Website Desa
							</Button>
						</Stack>
					</Card>
				</Grid.Col>
			</Grid>

			<Title order={2} mb="lg">
				Informasi Sumber Data
			</Title>

			<Grid>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<Card withBorder padding="md" radius="md" bg="gray.0">
						<Stack gap="xs">
							<Text fw={700} size="sm">
								Network Operation Center (NOC)
							</Text>
							<Group>
								<Text fw={600} size="xs" w={80}>
									URL:
								</Text>
								<Text size="xs">https://darmasaba.muku.id/api/noc/</Text>
							</Group>
							<Group>
								<Text fw={600} size="xs" w={80}>
									Model:
								</Text>
								<Badge size="xs" variant="outline">
									Divisi
								</Badge>
								<Badge size="xs" variant="outline">
									Kegiatan
								</Badge>
								<Badge size="xs" variant="outline">
									Diskusi
								</Badge>
							</Group>
						</Stack>
					</Card>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<Card withBorder padding="md" radius="md" bg="gray.0">
						<Stack gap="xs">
							<Text fw={700} size="sm">
								Website Desa Darmasaba
							</Text>
							<Group>
								<Text fw={600} size="xs" w={80}>
									URL:
								</Text>
								<Text size="xs">https://desa-darmasaba-stg.wibudev.com</Text>
							</Group>
							<Group>
								<Text fw={600} size="xs" w={80}>
									Model:
								</Text>
								<Badge size="xs" variant="outline" color="blue">
									Demografi
								</Badge>
								<Badge size="xs" variant="outline" color="blue">
									APBDes
								</Badge>
								<Badge size="xs" variant="outline" color="blue">
									Sektor
								</Badge>
							</Group>
						</Stack>
					</Card>
				</Grid.Col>
			</Grid>
		</Box>
	);
};

export default SinkronisasiSettings;
