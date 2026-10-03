import { Badge, Stack, Table } from "@mantine/core";
import { IconVirus } from "@tabler/icons-react";
import { fmtDate } from "./health-records.format";
import { paginateByBanjar } from "./health-records.paging";
import type { PenderitaPenyakit } from "./health-records.types";
import {
	EmptyState,
	HealthTable,
	PagerFooter,
} from "./health-records-table-parts";
import { usePagedByBanjar } from "./use-paged-by-banjar";

/** Tab daftar warga penderita penyakit per banjar. */
export function PenderitaTab({
	rows,
	banjarId,
	dark,
}: {
	rows: PenderitaPenyakit[];
	banjarId: string | null;
	dark: boolean;
}) {
	const { page, setPage } = usePagedByBanjar(banjarId);
	const { total, totalPages, data } = paginateByBanjar(
		rows,
		banjarId,
		(d) => d.banjar?.id,
		page,
	);

	if (data.length === 0)
		return (
			<EmptyState
				icon={<IconVirus size={40} color={dark ? "#475569" : "#CBD5E1"} />}
				message="Tidak ada data penderita penyakit"
			/>
		);

	return (
		<Stack gap="md">
			<HealthTable minWidth={560} dark={dark}>
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
