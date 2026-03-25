import { Grid, GridCol, Stack } from "@mantine/core";
import { SummaryCards } from "./sosial/summary-cards";
import { HealthStats } from "./sosial/health-stats";
import { PosyanduSchedule } from "./sosial/posyandu-schedule";
import { Pendidikan } from "./sosial/pendidikan";
import { Beasiswa } from "./sosial/beasiswa";
import { EventCalendar } from "./sosial/event-calendar";

const SosialPage = () => {
	return (
		<Stack gap="lg">
			{/* Top Summary Cards - 4 Grid */}
			<SummaryCards />

			{/* Second Row - 2 Column Grid */}
			<Grid gutter="md">
				{/* Left - Statistik Kesehatan */}
				<GridCol span={{ base: 12, lg: 6 }}>
					<HealthStats />
				</GridCol>

				{/* Right - Jadwal Posyandu */}
				<GridCol span={{ base: 12, lg: 6 }}>
					<PosyanduSchedule />
				</GridCol>
			</Grid>

			{/* Third Row - 2 Column Grid */}
			<Grid gutter="md">
				{/* Left - Pendidikan */}
				<GridCol span={{ base: 12, lg: 6 }}>
					<Pendidikan />
				</GridCol>

				{/* Right - Beasiswa Desa */}
				<GridCol span={{ base: 12, lg: 6 }}>
					<Beasiswa />
				</GridCol>
			</Grid>

			{/* Bottom Section - Event Budaya */}
			<EventCalendar />
		</Stack>
	);
};

export default SosialPage;
