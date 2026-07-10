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
	Tabs,
	Text,
	Title,
} from "@mantine/core";
import {
	IconAlertCircle,
	IconBabyCarriage,
	IconHeartbeat,
	IconVirus,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useIsDark } from "@/hooks/useIsDark";

const DESA_API =
	typeof import.meta.env !== "undefined" && import.meta.env?.VITE_DESA_API_URL
		? import.meta.env.VITE_DESA_API_URL
		: "https://desa-darmasaba-stg.wibudev.com";

interface BanjarOption {
	id: string;
	name: string;
}

interface IbuHamil {
	id: string;
	nama: string;
	nik: string;
	usiaKehamilan: number;
	hpht: string | null;
	taksiranLahir: string | null;
	status: string;
	catatan: string | null;
	posyandu: {
		id: string;
		name: string;
		banjar: { id: string; name: string };
	} | null;
}

interface Balita {
	id: string;
	nama: string;
	tanggalLahir: string;
	jenisKelamin: string;
	beratBadanKg: number;
	tinggiBadanCm: number;
	namaOrtu: string;
	statusStunting: string;
	imunisasiLengkap: boolean;
	giziBaik: boolean;
	catatan: string | null;
	posyandu: {
		id: string;
		name: string;
		banjar: { id: string; name: string };
	} | null;
}

interface PenderitaPenyakit {
	id: string;
	nama: string;
	tanggal: string;
	jenisKelamin: string;
	alamat: string;
	penyakit: string;
	banjar: { id: string; name: string };
}

/**
 * Response gabungan dari endpoint tunggal `/api/kesehatan/riwayatwarga/find-many`.
 * Satu request mengembalikan daftar banjar + ketiga dataset kesehatan sekaligus.
 */
interface RiwayatWargaResponse {
	banjarList: BanjarOption[];
	ibuHamil: IbuHamil[];
	balita: Balita[];
	penyakit: PenderitaPenyakit[];
}

const IBU_HAMIL_STATUS: Record<string, { label: string; color: string }> = {
	AKTIF: { label: "Aktif", color: "green" },
	NONAKTIF: { label: "Nonaktif", color: "gray" },
	MELAHIRKAN: { label: "Melahirkan", color: "blue" },
	KEGUGURAN: { label: "Keguguran", color: "red" },
};

const STUNTING_STATUS: Record<string, { label: string; color: string }> = {
	NORMAL: { label: "Normal", color: "green" },
	ALERT: { label: "Alert", color: "orange" },
	STUNTING: { label: "Stunting", color: "red" },
};

/**
 * Ambil seluruh data riwayat kesehatan warga dalam satu request. Tiap dataset
 * di response terbungkus `{ data, total, ... }`; kita ambil `.data`-nya saja
 * karena filter per-banjar dan paginasi dilakukan di sisi klien.
 */
async function fetchRiwayatWarga(): Promise<RiwayatWargaResponse> {
	const r = await fetch(
		`${DESA_API}/api/kesehatan/riwayatwarga/find-many?limit=200`,
	);
	const json = await r.json();
	if (!json.success) {
		throw new Error(
			json.message ?? "Gagal memuat data riwayat kesehatan warga",
		);
	}
	return {
		banjarList: Array.isArray(json.banjarList) ? json.banjarList : [],
		ibuHamil: json.ibuHamil?.data ?? [],
		balita: json.balita?.data ?? [],
		penyakit: json.penyakit?.data ?? [],
	};
}

function fmtDate(iso: string | null): string {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

function TableSkeleton() {
	return (
		<Stack gap="xs">
			{Array.from({ length: 6 }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static list
				<Skeleton key={i} height={40} radius="md" />
			))}
		</Stack>
	);
}

function EmptyState({
	icon,
	message,
}: {
	icon: React.ReactNode;
	message: string;
}) {
	return (
		<Center py="xl">
			<Stack align="center" gap="xs">
				{icon}
				<Text c="dimmed" size="sm">
					{message}
				</Text>
			</Stack>
		</Center>
	);
}

function tableStyles(dark: boolean) {
	return {
		th: {
			color: dark ? "#94A3B8" : "#64748B",
			fontSize: 12,
			fontWeight: 600,
			textTransform: "uppercase" as const,
			letterSpacing: "0.05em",
			borderBottom: `1px solid ${dark ? "#334155" : "#E2E8F0"}`,
			paddingBottom: 8,
		},
		td: {
			borderBottom: `1px solid ${dark ? "#1E293B" : "#F1F5F9"}`,
			color: dark ? "#E2E8F0" : "#334155",
		},
	};
}

const PAGE_SIZE = 10;

/** Reset ke halaman 1 setiap kali filter banjar berubah. */
function usePagedByBanjar(banjarId: string | null) {
	const [page, setPage] = useState(1);
	// biome-ignore lint/correctness/useExhaustiveDependencies: banjarId change should reset page to 1
	useEffect(() => {
		setPage(1);
	}, [banjarId]);
	return { page, setPage };
}

function PagerFooter({
	total,
	totalPages,
	page,
	onChange,
}: {
	total: number;
	totalPages: number;
	page: number;
	onChange: (p: number) => void;
}) {
	return (
		<Group justify="space-between" align="center">
			<Text size="xs" c="dimmed">
				{total} data ditemukan
			</Text>
			{totalPages > 1 && (
				<Pagination
					value={page}
					onChange={onChange}
					total={totalPages}
					size="sm"
					radius="md"
				/>
			)}
		</Group>
	);
}

// ── Ibu Hamil Tab ────────────────────────────────────────────
function IbuHamilTab({
	rows,
	banjarId,
	dark,
}: {
	rows: IbuHamil[];
	banjarId: string | null;
	dark: boolean;
}) {
	const { page, setPage } = usePagedByBanjar(banjarId);

	const filtered = banjarId
		? rows.filter((d) => d.posyandu?.banjar.id === banjarId)
		: rows;
	const total = filtered.length;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const data = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	if (data.length === 0)
		return (
			<EmptyState
				icon={<IconHeartbeat size={40} color={dark ? "#475569" : "#CBD5E1"} />}
				message="Tidak ada data ibu hamil"
			/>
		);

	return (
		<Stack gap="md">
			<Table.ScrollContainer minWidth={600}>
				<Table
					highlightOnHover
					withTableBorder={false}
					withColumnBorders={false}
					styles={tableStyles(dark)}
				>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Nama</Table.Th>
							<Table.Th>Posyandu / Banjar</Table.Th>
							<Table.Th>Usia Kehamilan</Table.Th>
							<Table.Th>HPHT</Table.Th>
							<Table.Th>Taksiran Lahir</Table.Th>
							<Table.Th>Status</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{data.map((row) => {
							const st = IBU_HAMIL_STATUS[row.status] ?? {
								label: row.status,
								color: "gray",
							};
							return (
								<Table.Tr key={row.id}>
									<Table.Td fw={500}>{row.nama}</Table.Td>
									<Table.Td>
										<Stack gap={0}>
											<Text size="sm">{row.posyandu?.name ?? "—"}</Text>
											<Text size="xs" c="dimmed">
												{row.posyandu?.banjar.name ?? "—"}
											</Text>
										</Stack>
									</Table.Td>
									<Table.Td>
										{row.usiaKehamilan > 0
											? `${row.usiaKehamilan} minggu`
											: "—"}
									</Table.Td>
									<Table.Td>{fmtDate(row.hpht)}</Table.Td>
									<Table.Td>{fmtDate(row.taksiranLahir)}</Table.Td>
									<Table.Td>
										<Badge variant="light" color={st.color} size="sm">
											{st.label}
										</Badge>
									</Table.Td>
								</Table.Tr>
							);
						})}
					</Table.Tbody>
				</Table>
			</Table.ScrollContainer>
			<PagerFooter
				total={total}
				totalPages={totalPages}
				page={page}
				onChange={setPage}
			/>
		</Stack>
	);
}

// ── Balita Tab ───────────────────────────────────────────────
function BalitaTab({
	rows,
	banjarId,
	dark,
}: {
	rows: Balita[];
	banjarId: string | null;
	dark: boolean;
}) {
	const { page, setPage } = usePagedByBanjar(banjarId);

	const filtered = banjarId
		? rows.filter((d) => d.posyandu?.banjar.id === banjarId)
		: rows;
	const total = filtered.length;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const data = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	if (data.length === 0)
		return (
			<EmptyState
				icon={
					<IconBabyCarriage size={40} color={dark ? "#475569" : "#CBD5E1"} />
				}
				message="Tidak ada data balita"
			/>
		);

	return (
		<Stack gap="md">
			<Table.ScrollContainer minWidth={640}>
				<Table
					highlightOnHover
					withTableBorder={false}
					withColumnBorders={false}
					styles={tableStyles(dark)}
				>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Nama</Table.Th>
							<Table.Th>Posyandu / Banjar</Table.Th>
							<Table.Th>Tgl Lahir</Table.Th>
							<Table.Th>JK</Table.Th>
							<Table.Th>BB / TB</Table.Th>
							<Table.Th>Stunting</Table.Th>
							<Table.Th>Imunisasi</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{data.map((row) => {
							const st = STUNTING_STATUS[row.statusStunting] ?? {
								label: row.statusStunting,
								color: "gray",
							};
							return (
								<Table.Tr key={row.id}>
									<Table.Td fw={500}>
										<Stack gap={0}>
											<Text size="sm" fw={500}>
												{row.nama}
											</Text>
											<Text size="xs" c="dimmed">
												Ortu: {row.namaOrtu}
											</Text>
										</Stack>
									</Table.Td>
									<Table.Td>
										<Stack gap={0}>
											<Text size="sm">{row.posyandu?.name ?? "—"}</Text>
											<Text size="xs" c="dimmed">
												{row.posyandu?.banjar.name ?? "—"}
											</Text>
										</Stack>
									</Table.Td>
									<Table.Td style={{ whiteSpace: "nowrap" }}>
										{fmtDate(row.tanggalLahir)}
									</Table.Td>
									<Table.Td>
										<Badge
											variant="light"
											color={row.jenisKelamin === "L" ? "blue" : "pink"}
											size="sm"
										>
											{row.jenisKelamin === "L" ? "L" : "P"}
										</Badge>
									</Table.Td>
									<Table.Td>
										<Text size="sm">
											{row.beratBadanKg} kg / {row.tinggiBadanCm} cm
										</Text>
									</Table.Td>
									<Table.Td>
										<Badge variant="light" color={st.color} size="sm">
											{st.label}
										</Badge>
									</Table.Td>
									<Table.Td>
										<Badge
											variant="light"
											color={row.imunisasiLengkap ? "green" : "orange"}
											size="sm"
										>
											{row.imunisasiLengkap ? "Lengkap" : "Belum"}
										</Badge>
									</Table.Td>
								</Table.Tr>
							);
						})}
					</Table.Tbody>
				</Table>
			</Table.ScrollContainer>
			<PagerFooter
				total={total}
				totalPages={totalPages}
				page={page}
				onChange={setPage}
			/>
		</Stack>
	);
}

// ── Penderita Penyakit Tab ───────────────────────────────────
function PenderitaTab({
	rows,
	banjarId,
	dark,
}: {
	rows: PenderitaPenyakit[];
	banjarId: string | null;
	dark: boolean;
}) {
	const { page, setPage } = usePagedByBanjar(banjarId);

	const filtered = banjarId
		? rows.filter((d) => d.banjar?.id === banjarId)
		: rows;
	const total = filtered.length;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const data = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	if (data.length === 0)
		return (
			<EmptyState
				icon={<IconVirus size={40} color={dark ? "#475569" : "#CBD5E1"} />}
				message="Tidak ada data penderita penyakit"
			/>
		);

	return (
		<Stack gap="md">
			<Table.ScrollContainer minWidth={560}>
				<Table
					highlightOnHover
					withTableBorder={false}
					withColumnBorders={false}
					styles={tableStyles(dark)}
				>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Nama</Table.Th>
							<Table.Th>Banjar</Table.Th>
							<Table.Th>Jenis Kelamin</Table.Th>
							<Table.Th>Penyakit</Table.Th>
							<Table.Th>Tanggal</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{data.map((row) => (
							<Table.Tr key={row.id}>
								<Table.Td fw={500}>{row.nama}</Table.Td>
								<Table.Td>{row.banjar?.name ?? "—"}</Table.Td>
								<Table.Td>
									<Badge
										variant="light"
										color={row.jenisKelamin === "Laki-laki" ? "blue" : "pink"}
										size="sm"
									>
										{row.jenisKelamin === "Laki-laki" ? "L" : "P"}
									</Badge>
								</Table.Td>
								<Table.Td>
									<Badge variant="light" color="red" size="sm">
										{row.penyakit}
									</Badge>
								</Table.Td>
								<Table.Td style={{ whiteSpace: "nowrap" }}>
									{fmtDate(row.tanggal)}
								</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			</Table.ScrollContainer>
			<PagerFooter
				total={total}
				totalPages={totalPages}
				page={page}
				onChange={setPage}
			/>
		</Stack>
	);
}

// ── Main HealthRecords Component ─────────────────────────────
export const HealthRecords = () => {
	const dark = useIsDark();

	const [banjarId, setBanjarId] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<string | null>("ibu-hamil");

	const { data, isLoading, isError } = useApiQuery(
		["sosial-ext", "health-records", "riwayat-warga"],
		fetchRiwayatWarga,
	);

	const banjarOptions = (data?.banjarList ?? []).map((b) => ({
		value: b.id,
		label: b.name,
	}));

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
					Riwayat Kesehatan Warga
				</Title>
				<Select
					size="xs"
					placeholder="Semua Banjar"
					data={banjarOptions}
					value={banjarId}
					onChange={setBanjarId}
					clearable
					w={180}
				/>
			</Group>

			{isError ? (
				<Alert icon={<IconAlertCircle size={16} />} color="red" radius="md">
					Gagal memuat data riwayat kesehatan warga
				</Alert>
			) : (
				<Tabs
					value={activeTab}
					onChange={setActiveTab}
					variant="pills"
					radius="md"
				>
					<Tabs.List mb="md">
						<Tabs.Tab
							value="ibu-hamil"
							leftSection={<IconHeartbeat size={14} />}
						>
							Ibu Hamil
						</Tabs.Tab>
						<Tabs.Tab
							value="balita"
							leftSection={<IconBabyCarriage size={14} />}
						>
							Balita
						</Tabs.Tab>
						<Tabs.Tab value="penyakit" leftSection={<IconVirus size={14} />}>
							Penderita Penyakit
						</Tabs.Tab>
					</Tabs.List>

					{isLoading ? (
						<TableSkeleton />
					) : (
						<>
							<Tabs.Panel value="ibu-hamil">
								<IbuHamilTab
									rows={data?.ibuHamil ?? []}
									banjarId={banjarId}
									dark={dark}
								/>
							</Tabs.Panel>
							<Tabs.Panel value="balita">
								<BalitaTab
									rows={data?.balita ?? []}
									banjarId={banjarId}
									dark={dark}
								/>
							</Tabs.Panel>
							<Tabs.Panel value="penyakit">
								<PenderitaTab
									rows={data?.penyakit ?? []}
									banjarId={banjarId}
									dark={dark}
								/>
							</Tabs.Panel>
						</>
					)}
				</Tabs>
			)}
		</Card>
	);
};
