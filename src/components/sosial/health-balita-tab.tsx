import { Badge, Stack, Table, Text } from "@mantine/core";
import { IconBabyCarriage } from "@tabler/icons-react";
import {
	fmtDate,
	resolveHealthStatus,
	STUNTING_STATUS,
} from "./health-records.format";
import { paginateByBanjar } from "./health-records.paging";
import type { Balita } from "./health-records.types";
import {
	EmptyState,
	HealthTable,
	PagerFooter,
} from "./health-records-table-parts";
import { usePagedByBanjar } from "./use-paged-by-banjar";

/** Tab daftar balita: pertumbuhan, status stunting, imunisasi. */
export function BalitaTab({
	rows,
	banjarId,
	dark,
}: {
	rows: Balita[];
	banjarId: string | null;
	dark: boolean;
}) {
	const { page, setPage } = usePagedByBanjar(banjarId);
	const { total, totalPages, data } = paginateByBanjar(
		rows,
		banjarId,
		(d) => d.posyandu?.banjar.id,
		page,
	);

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
			<HealthTable minWidth={640} dark={dark}>
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
						const st = resolveHealthStatus(STUNTING_STATUS, row.statusStunting);
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
			</HealthTable>
			<PagerFooter
				total={total}
				totalPages={totalPages}
				page={page}
				onChange={setPage}
			/>
		</Stack>
	);
}
