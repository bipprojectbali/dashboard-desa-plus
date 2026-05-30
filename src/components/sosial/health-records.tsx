import {
	Alert,
	Badge,
	Card,
	Center,
	Group,
	Pagination,
	Select,
	Skeleton,
	Stack,
	Table,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { IconAlertCircle, IconHeartbeat } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface HealthRecord {
	id: string;
	type: string;
	notes: string | null;
	createdAt: string;
	resident: {
		name: string;
		banjar: { name: string };
	};
}

interface BanjarOption {
	id: string;
	name: string;
}

const TYPE_COLORS: Record<string, string> = {
	Pemeriksaan: "blue",
	Imunisasi: "green",
	"Ibu Hamil": "pink",
};

function generateYearOptions() {
	const current = new Date().getFullYear();
	return Array.from({ length: 5 }, (_, i) => {
		const y = current - i;
		return { value: String(y), label: String(y) };
	});
}

export const HealthRecords = () => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const [records, setRecords] = useState<HealthRecord[]>([]);
	const [total, setTotal] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [banjars, setBanjars] = useState<BanjarOption[]>([]);
	const [banjarId, setBanjarId] = useState<string | null>(null);
	const [tahun, setTahun] = useState<string | null>(null);
	const [page, setPage] = useState(1);

	useEffect(() => {
		fetch("/api/sosial/banjars")
			.then((r) => r.json())
			.then((res) => {
				if (res.success && Array.isArray(res.data)) {
					setBanjars(res.data as BanjarOption[]);
				}
			})
			.catch(() => {});
	}, []);

	useEffect(() => {
		setLoading(true);
		setError(null);

		const params = new URLSearchParams({ page: String(page), limit: "10" });
		if (banjarId) params.set("banjarId", banjarId);
		if (tahun) params.set("tahun", tahun);

		fetch(`/api/sosial/health-records?${params}`)
			.then((r) => r.json())
			.then((res) => {
				if (res.success) {
					setRecords(res.data);
					setTotal(res.pagination.total);
					setTotalPages(res.pagination.totalPages);
				} else {
					setError(res.error ?? "Gagal memuat data");
				}
			})
			.catch(() => setError("Gagal memuat data rekam medis"))
			.finally(() => setLoading(false));
	}, [banjarId, tahun, page]);

	const handleBanjarChange = (val: string | null) => {
		setBanjarId(val);
		setPage(1);
	};

	const handleTahunChange = (val: string | null) => {
		setTahun(val);
		setPage(1);
	};

	const banjarOptions = banjars.map((b) => ({ value: b.id, label: b.name }));

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			shadow="sm"
			bg={dark ? "#1E293B" : "white"}
			style={{
				borderColor: dark ? "#334155" : "white",
				boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
			}}
		>
			<Group justify="space-between" mb="md" wrap="wrap" gap="sm">
				<Title order={3} c={dark ? "dark.0" : "#1e3a5f"}>
					Rekam Medis Warga
				</Title>
				<Group gap="sm">
					<Select
						size="xs"
						placeholder="Semua Banjar"
						data={banjarOptions}
						value={banjarId}
						onChange={handleBanjarChange}
						clearable
						w={160}
					/>
					<Select
						size="xs"
						placeholder="Semua Tahun"
						data={generateYearOptions()}
						value={tahun}
						onChange={handleTahunChange}
						clearable
						w={120}
					/>
				</Group>
			</Group>

			{error ? (
				<Alert
					icon={<IconAlertCircle size={16} />}
					color="red"
					radius="md"
					title="Gagal memuat data"
				>
					{error}
				</Alert>
			) : loading ? (
				<Stack gap="xs">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton
							// biome-ignore lint/suspicious/noArrayIndexKey: static list
							key={i}
							height={40}
							radius="md"
						/>
					))}
				</Stack>
			) : records.length === 0 ? (
				<Center py="xl">
					<Stack align="center" gap="xs">
						<IconHeartbeat size={40} color={dark ? "#475569" : "#CBD5E1"} />
						<Text c="dimmed" size="sm">
							Tidak ada data rekam medis
						</Text>
					</Stack>
				</Center>
			) : (
				<Stack gap="md">
					<Table.ScrollContainer minWidth={500}>
						<Table
							highlightOnHover
							withTableBorder={false}
							withColumnBorders={false}
							styles={{
								th: {
									color: dark ? "#94A3B8" : "#64748B",
									fontSize: 12,
									fontWeight: 600,
									textTransform: "uppercase",
									letterSpacing: "0.05em",
									borderBottom: `1px solid ${dark ? "#334155" : "#E2E8F0"}`,
									paddingBottom: 8,
								},
								td: {
									borderBottom: `1px solid ${dark ? "#1E293B" : "#F1F5F9"}`,
									color: dark ? "#E2E8F0" : "#334155",
								},
							}}
						>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Nama Warga</Table.Th>
									<Table.Th>Banjar</Table.Th>
									<Table.Th>Tipe</Table.Th>
									<Table.Th>Catatan</Table.Th>
									<Table.Th>Tanggal</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{records.map((r) => (
									<Table.Tr key={r.id}>
										<Table.Td fw={500}>{r.resident.name}</Table.Td>
										<Table.Td>{r.resident.banjar.name}</Table.Td>
										<Table.Td>
											<Badge
												variant="light"
												color={TYPE_COLORS[r.type] ?? "gray"}
												size="sm"
											>
												{r.type}
											</Badge>
										</Table.Td>
										<Table.Td c="dimmed">{r.notes ?? "—"}</Table.Td>
										<Table.Td style={{ whiteSpace: "nowrap" }}>
											{new Date(r.createdAt).toLocaleDateString("id-ID", {
												day: "2-digit",
												month: "short",
												year: "numeric",
											})}
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</Table.ScrollContainer>

					<Group justify="space-between" align="center">
						<Text size="xs" c="dimmed">
							{total} data ditemukan
						</Text>
						{totalPages > 1 && (
							<Pagination
								value={page}
								onChange={setPage}
								total={totalPages}
								size="sm"
								radius="md"
							/>
						)}
					</Group>
				</Stack>
			)}
		</Card>
	);
};
