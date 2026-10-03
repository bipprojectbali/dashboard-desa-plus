import { Badge, Stack, Table, Text } from "@mantine/core";
import { IconHeartbeat } from "@tabler/icons-react";
import {
	fmtDate,
	IBU_HAMIL_STATUS,
	resolveHealthStatus,
} from "./health-records.format";
import { paginateByBanjar } from "./health-records.paging";
import type { IbuHamil } from "./health-records.types";
import {
	EmptyState,
	HealthTable,
	PagerFooter,
} from "./health-records-table-parts";
import { usePagedByBanjar } from "./use-paged-by-banjar";

/** Tab daftar ibu hamil per posyandu/banjar. */
export function IbuHamilTab({
	rows,
	banjarId,
	dark,
}: {
	rows: IbuHamil[];
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
				icon={<IconHeartbeat size={40} color={dark ? "#475569" : "#CBD5E1"} />}
				message="Tidak ada data ibu hamil"
			/>
		);

	return (
		<Stack gap="md">
			<HealthTable minWidth={600} dark={dark}>
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
						const st = resolveHealthStatus(IBU_HAMIL_STATUS, row.status);
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
									{row.usiaKehamilan > 0 ? `${row.usiaKehamilan} minggu` : "—"}
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
