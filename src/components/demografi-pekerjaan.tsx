import { Alert, Button, Grid, Stack } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import { useEffect } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { EMPTY_DEMOGRAFI } from "./demografi/demografi.types";
import { DemografiAgeCard } from "./demografi/demografi-age-card";
import { DemografiBanjarCard } from "./demografi/demografi-banjar-card";
import { DemografiDynamicsCard } from "./demografi/demografi-dynamics-card";
import { DemografiJobCard } from "./demografi/demografi-job-card";
import { DemografiReligionCard } from "./demografi/demografi-religion-card";
import { DemografiSectorCard } from "./demografi/demografi-sector-card";
import { DemografiSummaryCards } from "./demografi/demografi-summary-cards";
import { fetchDemografiAll } from "./demografi/fetch-demografi";

const DemografiPekerjaan = () => {
	const {
		data = EMPTY_DEMOGRAFI,
		isLoading: loading,
		isError,
		refetch,
	} = useApiQuery(["demografi", "all"], fetchDemografiAll, {
		autoRefresh: true,
	});
	const {
		stats,
		ageData,
		jobData,
		religionRows,
		banjarData,
		sektorData,
		births,
		deaths,
		moveIn,
		moveOut,
	} = data;
	const error = isError
		? "Gagal memuat data demografi. Periksa koneksi dan coba lagi."
		: null;

	// Listen for sync complete event to refresh data
	useEffect(() => {
		const handleSyncComplete = () => {
			refetch();
		};

		window.addEventListener("demografi-sync-complete", handleSyncComplete);
		return () => {
			window.removeEventListener("demografi-sync-complete", handleSyncComplete);
		};
	}, [refetch]);

	return (
		<Stack gap="lg">
			{error && (
				<Alert
					icon={<IconAlertCircle size={16} />}
					color="red"
					title="Gagal memuat data"
					radius="md"
				>
					{error}
					<Button
						size="xs"
						variant="light"
						color="red"
						leftSection={<IconRefresh size={14} />}
						onClick={() => refetch()}
						mt="xs"
					>
						Coba lagi
					</Button>
				</Alert>
			)}

			<DemografiSummaryCards stats={stats} births={births} loading={loading} />

			<Grid gutter="lg">
				<Grid.Col span={{ base: 12, lg: 4 }}>
					<DemografiAgeCard ageData={ageData} loading={loading} />
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 4 }}>
					<DemografiJobCard jobData={jobData} loading={loading} />
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 4 }}>
					<DemografiDynamicsCard
						births={births}
						deaths={deaths}
						moveIn={moveIn}
						moveOut={moveOut}
						loading={loading}
					/>
				</Grid.Col>
			</Grid>

			<Grid gutter="lg">
				<Grid.Col span={{ base: 12, lg: 4 }}>
					<DemografiReligionCard
						religionRows={religionRows}
						loading={loading}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 4 }}>
					<DemografiBanjarCard banjarData={banjarData} loading={loading} />
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 4 }}>
					<DemografiSectorCard sektorData={sektorData} loading={loading} />
				</Grid.Col>
			</Grid>
		</Stack>
	);
};

export default DemografiPekerjaan;
