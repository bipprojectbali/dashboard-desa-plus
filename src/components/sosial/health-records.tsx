import { Alert, Card, Group, Select, Tabs, Title } from "@mantine/core";
import {
	IconAlertCircle,
	IconBabyCarriage,
	IconHeartbeat,
	IconVirus,
} from "@tabler/icons-react";
import { useState } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useIsDark } from "@/hooks/useIsDark";
import { BalitaTab } from "./health-balita-tab";
import { IbuHamilTab } from "./health-ibu-hamil-tab";
import { PenderitaTab } from "./health-penderita-tab";
import { fetchRiwayatWarga } from "./health-records.api";
import { TableSkeleton } from "./health-records-table-parts";

/** Kartu riwayat kesehatan warga: filter banjar + tab ibu hamil, balita, penderita penyakit. */
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
			data-ai-target="sosial.riwayat-kesehatan"
			p="md"
			radius="xl"
			withBorder
			shadow="sm"
			style={{
				backgroundColor: "var(--app-card)",
				borderColor: "var(--app-border)",
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
							data-ai-target="sosial.tab-ibu-hamil"
							data-ai-clickable="true"
							value="ibu-hamil"
							leftSection={<IconHeartbeat size={14} />}
						>
							Ibu Hamil
						</Tabs.Tab>
						<Tabs.Tab
							data-ai-target="sosial.tab-balita"
							data-ai-clickable="true"
							value="balita"
							leftSection={<IconBabyCarriage size={14} />}
						>
							Balita
						</Tabs.Tab>
						<Tabs.Tab
							data-ai-target="sosial.tab-penyakit"
							data-ai-clickable="true"
							value="penyakit"
							leftSection={<IconVirus size={14} />}
						>
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
