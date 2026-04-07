import { Grid, GridCol, Stack } from "@mantine/core";
import { HeaderToggle } from "./umkm/header-toggle";
import { ProdukUnggulan } from "./umkm/produk-unggulan";
import type { SalesData } from "./umkm/sales-table";
import { SalesTable } from "./umkm/sales-table";
import { SummaryCards } from "./umkm/summary-cards";
import { TopProducts } from "./umkm/top-products";

const BumdesPage = () => {
	const handleDetailClick = (product: SalesData) => {
		console.log("Detail clicked for:", product);
		// TODO: Open modal or navigate to detail page
	};

	return (
		<Stack gap={{ base: "md", md: "lg" }}>
			{/* KPI Summary Cards */}
			<SummaryCards />

			{/* Header with Time Range Toggle */}
			<HeaderToggle />

			{/* Main Content - 2 Column Layout */}
			<Grid gutter={{ base: "xs", md: "md" }}>
				{/* Left Panel - Produk Unggulan */}
				<GridCol span={{ base: 12, lg: 4 }}>
					<Stack gap="md">
						<ProdukUnggulan />
						<TopProducts />
					</Stack>
				</GridCol>

				{/* Right Panel - Detail Penjualan Produk */}
				<GridCol span={{ base: 12, lg: 8 }}>
					<SalesTable onDetailClick={handleDetailClick} />
				</GridCol>
			</Grid>
		</Stack>
	);
};

export default BumdesPage;
