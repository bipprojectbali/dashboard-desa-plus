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
	Text,
	Title,
} from "@mantine/core";
import {
	IconAlertCircle,
	IconCheck,
	IconClock,
	IconDatabase,
	IconRefresh,
	IconUsers,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { apiClient } from "@/utils/api-client";
import { useTranslate } from "@/hooks/useTranslate";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("id");

const SinkronisasiSettings = () => {
	const t = useTranslate();
	const [loading, setLoading] = useState(false);
	const [demografiLoading, setDemografiLoading] = useState(false);
	const [lastSync, setLastSync] = useState<string | null>(null);
	const [demografiLastSync, setDemografiLastSync] = useState<string | null>(null);
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
			const { data, error, response } = await apiClient.POST("/api/noc/sync", {});

			if (response?.status === 401) {
				setStatus({ type: "error", message: t.sinkronisasi.tidakAdaAkses });
				return;
			}

			if (error) {
				setStatus({
					type: "error",
					message:
						(error as any)?.error ||
						(error as any)?.message ||
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
				setDemografiStatus({
					type: "error",
					message:
						(error as any)?.error ||
						(error as any)?.message ||
						t.sinkronisasi.gagalDemografi,
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
				setDemografiStatus({ type: "error", message: t.sinkronisasi.responseGagal });
			}
		} catch {
			setDemografiStatus({ type: "error", message: t.sinkronisasi.kesalahanDemografi });
		} finally {
			setDemografiLoading(false);
		}
	};

	return (
		<Box pr="20%">
			<Title order={2} mb="lg">
				{t.sinkronisasi.judul}
			</Title>

			<Text c="dimmed" mb="xl">
				{t.sinkronisasi.deskripsi}
			</Text>

			<Grid gutter="xl">
				<Grid.Col span={{ base: 12, md: 6 }}>
					<Title order={3} mb="md">
						{t.sinkronisasi.dataNoc}
					</Title>
					<Card withBorder padding="lg" radius="md" mb="xl">
						<Stack gap="md">
							<Group justify="space-between">
								<Group>
									<IconDatabase size={20} color="gray" />
									<Text fw={500}>{t.sinkronisasi.statusTerakhir}</Text>
								</Group>
								<Badge color={lastSync ? "green" : "gray"} variant="light">
									{lastSync ? t.sinkronisasi.terkoneksi : t.sinkronisasi.belumPernah}
								</Badge>
							</Group>

							<Divider />

							<Box>
								<Text size="sm" c="dimmed">
									{t.sinkronisasi.waktuSinkronisasi}
								</Text>
								<Text fw={700} size="lg">
									{lastSync
										? dayjs(lastSync).format("DD MMMM YYYY, HH:mm:ss")
										: t.sinkronisasi.belumPernahDilakukan}
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
									title={status.type === "success" ? t.common.berhasil : t.common.kesalahan}
									color={status.type === "success" ? "green" : "red"}
									onClose={() => setStatus({ type: null, message: "" })}
									withCloseButton
								>
									{status.message}
								</Alert>
							)}

							<Button
								leftSection={
									loading ? <Loader size={16} color="white" /> : <IconRefresh size={16} />
								}
								onClick={handleSync}
								loading={loading}
								fullWidth
								mt="md"
							>
								{t.sinkronisasi.sinkronkanNoc}
							</Button>
						</Stack>
					</Card>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 6 }}>
					<Title order={3} mb="md">
						{t.sinkronisasi.websiteDesa}
					</Title>
					<Card withBorder padding="lg" radius="md" mb="xl">
						<Stack gap="md">
							<Group justify="space-between">
								<Group>
									<IconUsers size={20} color="gray" />
									<Text fw={500}>{t.sinkronisasi.statusTerakhir}</Text>
								</Group>
								<Badge color={demografiLastSync ? "blue" : "gray"} variant="light">
									{demografiLastSync ? t.sinkronisasi.terkoneksi : t.sinkronisasi.belumPernah}
								</Badge>
							</Group>

							<Divider />

							<Box>
								<Text size="sm" c="dimmed">
									{t.sinkronisasi.waktuSinkronisasi}
								</Text>
								<Text fw={700} size="lg">
									{demografiLastSync
										? dayjs(demografiLastSync).format("DD MMMM YYYY, HH:mm:ss")
										: t.sinkronisasi.belumPernahDilakukan}
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
										demografiStatus.type === "success"
											? t.common.berhasil
											: t.common.kesalahan
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
								{t.sinkronisasi.sinkronkanDesa}
							</Button>
						</Stack>
					</Card>
				</Grid.Col>
			</Grid>

			<Title order={2} mb="lg">
				{t.sinkronisasi.informasiSumber}
			</Title>

			<Grid>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<Card withBorder padding="md" radius="md" bg="gray.0">
						<Stack gap="xs">
							<Text fw={700} size="sm">
								{t.sinkronisasi.nocNama}
							</Text>
							<Group>
								<Text fw={600} size="xs" w={80}>
									{t.sinkronisasi.url}
								</Text>
								<Text size="xs">https://darmasaba.muku.id/api/noc/</Text>
							</Group>
							<Group>
								<Text fw={600} size="xs" w={80}>
									{t.sinkronisasi.model}
								</Text>
								<Badge size="xs" variant="outline">Divisi</Badge>
								<Badge size="xs" variant="outline">Kegiatan</Badge>
								<Badge size="xs" variant="outline">Diskusi</Badge>
							</Group>
						</Stack>
					</Card>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<Card withBorder padding="md" radius="md" bg="gray.0">
						<Stack gap="xs">
							<Text fw={700} size="sm">
								{t.sinkronisasi.desaNama}
							</Text>
							<Group>
								<Text fw={600} size="xs" w={80}>
									{t.sinkronisasi.url}
								</Text>
								<Text size="xs">https://desa-darmasaba-stg.wibudev.com</Text>
							</Group>
							<Group>
								<Text fw={600} size="xs" w={80}>
									{t.sinkronisasi.model}
								</Text>
								<Badge size="xs" variant="outline" color="blue">Demografi</Badge>
								<Badge size="xs" variant="outline" color="blue">APBDes</Badge>
								<Badge size="xs" variant="outline" color="blue">Sektor</Badge>
							</Group>
						</Stack>
					</Card>
				</Grid.Col>
			</Grid>
		</Box>
	);
};

export default SinkronisasiSettings;
