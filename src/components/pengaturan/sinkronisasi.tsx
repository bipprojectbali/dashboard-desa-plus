import {
	Box,
	Button,
	Card,
	Group,
	Stack,
	Text,
	Title,
	Alert,
	Loader,
	Badge,
	Divider,
} from "@mantine/core";
import { IconRefresh, IconCheck, IconAlertCircle, IconClock } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { apiClient } from "@/utils/api-client";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("id");

const SinkronisasiSettings = () => {
	const [loading, setLoading] = useState(false);
	const [lastSync, setLastSync] = useState<string | null>(null);
	const [status, setStatus] = useState<{
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

	useEffect(() => {
		fetchLastSync();
	}, []);

	const handleSync = async () => {
		setLoading(true);
		setStatus({ type: null, message: "" });

		try {
			const { data, error } = await apiClient.POST("/api/noc/sync");

			if (error) {
				setStatus({
					type: "error",
					message: (error as any).error || "Gagal melakukan sinkronisasi",
				});
			} else if (data?.success) {
				setStatus({
					type: "success",
					message: data.message || "Sinkronisasi berhasil dilakukan",
				});
				if (data.lastSyncedAt) {
					setLastSync(data.lastSyncedAt);
				}
			}
		} catch (err) {
			setStatus({
				type: "error",
				message: "Terjadi kesalahan sistem saat sinkronisasi",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box pr={"50%"}>
			<Title order={2} mb="lg">
				Sinkronisasi Data NOC
			</Title>

			<Text c="dimmed" mb="xl">
				Gunakan fitur ini untuk memperbarui data dashboard dengan data terbaru dari
				server Network Operation Center (NOC) darmasaba.muku.id.
			</Text>

			<Card withBorder padding="lg" radius="md" mb="xl">
				<Stack gap="md">
					<Group justify="space-between">
						<Group>
							<IconClock size={20} color="gray" />
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
							loading ? <Loader size={16} color="white" /> : <IconRefresh size={16} />
						}
						onClick={handleSync}
						loading={loading}
						fullWidth
						mt="md"
					>
						Sinkronkan Sekarang
					</Button>
				</Stack>
			</Card>

			<Title order={2} mb="lg">
				Informasi API
			</Title>
			
			<Card withBorder padding="md" radius="md" bg="gray.0">
				<Stack gap="xs">
					<Group>
						<Text fw={600} size="sm" w={100}>URL Sumber:</Text>
						<Text size="sm" style={{ wordBreak: 'break-all' }}>https://darmasaba.muku.id/api/noc/</Text>
					</Group>
					<Group>
						<Text fw={600} size="sm" w={100}>ID Desa:</Text>
						<Text size="sm">desa1</Text>
					</Group>
					<Group>
						<Text fw={600} size="sm" w={100}>Model Data:</Text>
						<Badge size="xs" variant="outline">Divisi</Badge>
						<Badge size="xs" variant="outline">Kegiatan</Badge>
						<Badge size="xs" variant="outline">Event</Badge>
						<Badge size="xs" variant="outline">Diskusi</Badge>
					</Group>
				</Stack>
			</Card>
		</Box>
	);
};

export default SinkronisasiSettings;
