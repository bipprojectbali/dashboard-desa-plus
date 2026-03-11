import {
	IconBuildingStore,
	IconCategory,
	IconCurrency,
	IconUsers,
	IconTrendingUp,
	IconTrendingDown,
	IconChevronDown,
} from "@tabler/icons-react";
import { useMantineColorScheme } from "@mantine/core";
import { useState } from "react";

const BumdesPage = () => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const [timeFilter, setTimeFilter] = useState<string>("bulan");
	const [categoryFilter, setCategoryFilter] = useState<string>("semua");

	// KPI Data
	const kpiData = [
		{
			title: "UMKM Aktif",
			value: "45",
			subtitle: "Beroperasi",
			icon: IconUsers,
		},
		{
			title: "UMKM Terdaftar",
			value: "68",
			subtitle: "Total terdaftar",
			icon: IconBuildingStore,
		},
		{
			title: "Omzet",
			value: "48 JT",
			subtitle: "Bulan ini",
			icon: IconCurrency,
		},
		{
			title: "Kategori UMKM",
			value: "34",
			subtitle: "Jenis produk",
			icon: IconCategory,
		},
	];

	// Mini stats data
	const miniStats = [
		{
			title: "Total Penjualan",
			value: "Rp 30.900.000",
			subtitle: "+18% vs bulan lalu",
			isPositive: true,
		},
		{
			title: "Produk Aktif",
			value: "7",
			subtitle: "Kategori produk",
		},
		{
			title: "Total Transaksi",
			value: "500",
			subtitle: "Transaksi bulan ini",
		},
	];

	// Top 3 products data
	const topProducts = [
		{
			rank: 1,
			name: "Beras Premium Organik",
			umkmOwner: "Kelompok Tani Subak",
			sales: "Rp 8.500.000",
			volume: "650 Kg Terjual",
			growth: "+15%",
		},
		{
			rank: 2,
			name: "Keripik Singkong",
			umkmOwner: "Ibu Sari Snack",
			sales: "Rp 4.200.000",
			volume: "320 Kg Terjual",
			growth: "+8%",
		},
		{
			rank: 3,
			name: "Madu Alami",
			umkmOwner: "Peternakan Lebah",
			sales: "Rp 3.750.000",
			volume: "150 Liter Terjual",
			growth: "+5%",
		},
	];

	// Product sales data
	const productSales = [
		{
			produk: "Beras Premium Organik",
			umkm: "Kelompok Tani Subak",
			penjualanBulanIni: "Rp 8.500.000",
			bulanLalu: "Rp 7.400.000",
			trend: 15,
			volume: "650 Kg",
			stok: "850 Kg",
		},
		{
			produk: "Keripik Singkong",
			umkm: "Ibu Sari Snack",
			penjualanBulanIni: "Rp 4.200.000",
			bulanLalu: "Rp 3.800.000",
			trend: 10,
			volume: "320 Kg",
			stok: "120 Kg",
		},
		{
			produk: "Madu Alami",
			umkm: "Peternakan Lebah",
			penjualanBulanIni: "Rp 3.750.000",
			bulanLalu: "Rp 4.100.000",
			trend: -8,
			volume: "150 Liter",
			stok: "45 Liter",
		},
		{
			produk: "Kecap Tradisional",
			umkm: "Bu Darmi",
			penjualanBulanIni: "Rp 2.800.000",
			bulanLalu: "Rp 2.500.000",
			trend: 12,
			volume: "280 Botol",
			stok: "95 Botol",
		},
	];

	const cardStyle = {
		backgroundColor: dark ? "#1E293B" : "white",
		border: `1px solid ${dark ? "#1E293B" : "white"}`,
	};

	const textStyle = {
		color: dark ? "white" : "#1F2937",
	};

	const subtitleStyle = {
		color: dark ? "#9CA3AF" : "#6B7280",
	};

	return (
		<div
			className="min-h-screen"
			style={{ backgroundColor: dark ? "#0F172A" : "#F3F4F6" }}
		>
			<div className="max-w-7xl mx-auto">
				{/* Row 1: Top 4 Metrics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
					{kpiData.map((kpi, index) => (
						<div
							key={index}
							className="rounded-xl shadow-sm p-6"
							style={cardStyle}
						>
							<div className="flex items-center justify-between">
								<div className="flex-1">
									<h3
										className="text-sm font-medium mb-1"
										style={subtitleStyle}
									>
										{kpi.title}
									</h3>
									<p
										className="text-3xl font-bold mb-1"
										style={textStyle}
									>
										{kpi.value}
									</p>
									<p
										className="text-xs"
										style={subtitleStyle}
									>
										{kpi.subtitle}
									</p>
								</div>
								<div className="flex-shrink-0 ml-4">
									<div
										className="w-12 h-12 rounded-full flex items-center justify-center text-white"
										style={{ backgroundColor: "#1F3A5F" }}
									>
										<kpi.icon size={24} />
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Row 2: Sales Update Header */}
				<div
					className="rounded-xl shadow-sm mb-6 overflow-hidden"
					style={cardStyle}
				>
					<div
						className="px-6 py-4 flex items-center justify-between"
						style={{ backgroundColor: "#1F3A5F" }}
					>
						<h3 className="text-lg font-semibold text-white">
							Update Penjualan Produk
						</h3>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setTimeFilter("minggu")}
								className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
									timeFilter === "minggu"
										? "bg-white text-[#1F3A5F]"
										: "bg-white/20 text-white hover:bg-white/30"
								}`}
							>
								Minggu ini
							</button>
							<button
								onClick={() => setTimeFilter("bulan")}
								className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
									timeFilter === "bulan"
										? "bg-white text-[#1F3A5F]"
										: "bg-white/20 text-white hover:bg-white/30"
								}`}
							>
								Bulan ini
							</button>
						</div>
					</div>
				</div>

				{/* Row 3: Main Content Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
					{/* Left Column (30%) */}
					<div className="lg:col-span-3 space-y-6">
						{/* Produk Unggulan Section */}
						<div
							className="rounded-xl shadow-sm p-6"
							style={cardStyle}
						>
							<h3
								className="text-lg font-semibold mb-4"
								style={textStyle}
							>
								Produk Unggulan
							</h3>

							{/* Mini Stats Cards */}
							<div className="space-y-4 mb-6">
								{miniStats.map((stat, index) => (
									<div
										key={index}
										className="p-4 rounded-lg"
										style={{
											backgroundColor: dark ? "#334155" : "#F9FAFB",
										}}
									>
										<p
											className="text-sm font-medium mb-1"
											style={subtitleStyle}
										>
											{stat.title}
										</p>
										<p
											className="text-xl font-bold"
											style={textStyle}
										>
											{stat.value}
										</p>
										{stat.subtitle && (
											<p
												className={`text-xs mt-1 ${
													stat.isPositive
														? "text-green-500"
														: subtitleStyle.color
												}`}
												style={
													stat.isPositive
														? { color: "#22C55E" }
														: subtitleStyle
												}
											>
												{stat.subtitle}
											</p>
										)}
									</div>
								))}
							</div>

							{/* Top 3 Products */}
							<h4
								className="text-base font-semibold mb-4"
								style={textStyle}
							>
								Top 3 Produk Terlaris
							</h4>
							<div className="space-y-4">
								{topProducts.map((product) => (
									<div
										key={product.rank}
										className="flex items-start gap-3 p-3 rounded-lg"
										style={{
											backgroundColor: dark ? "#334155" : "#F9FAFB",
										}}
									>
										<div
											className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
											style={{
												backgroundColor:
													product.rank === 1
														? "#FFD700"
														: product.rank === 2
															? "#C0C0C0"
															: "#CD7F32",
											}}
										>
											#{product.rank}
										</div>
										<div className="flex-1">
											<p
												className="text-sm font-medium"
												style={textStyle}
											>
												{product.name}
											</p>
											<p
												className="text-xs mt-1"
												style={subtitleStyle}
											>
												{product.umkmOwner}
											</p>
											<div className="flex items-center justify-between mt-2">
												<p className="text-xs font-medium text-green-500">
													{product.sales}
												</p>
												<p
													className="text-xs"
													style={{ color: "#22C55E" }}
												>
													{product.growth}
												</p>
											</div>
											<p className="text-xs mt-1" style={subtitleStyle}>
												{product.volume}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Right Column (70%) */}
					<div className="lg:col-span-7">
						<div
							className="rounded-xl shadow-sm p-6"
							style={cardStyle}
						>
							<div className="flex items-center justify-between mb-6">
								<h3
									className="text-lg font-semibold"
									style={textStyle}
								>
									Detail Penjualan Produk
								</h3>
								<div className="relative">
									<select
										value={categoryFilter}
										onChange={(e) => setCategoryFilter(e.target.value)}
										className="appearance-none px-4 py-2 pr-8 rounded-lg text-sm font-medium border-0 focus:ring-2 focus:ring-[#1F3A5F] cursor-pointer"
										style={{
											backgroundColor: dark ? "#334155" : "#F9FAFB",
											color: dark ? "white" : "#1F2937",
										}}
									>
										<option value="semua">Semua Kategori</option>
										<option value="makanan">Makanan</option>
										<option value="minuman">Minuman</option>
										<option value="kerajinan">Kerajinan</option>
									</select>
									<IconChevronDown
										size={16}
										className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
										style={{ color: dark ? "#9CA3AF" : "#6B7280" }}
									/>
								</div>
							</div>

							{/* Data Table */}
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr
											style={{
												borderBottom: `2px solid ${dark ? "#334155" : "#E5E7EB"}`,
											}}
										>
											<th
												className="text-left py-3 px-4 text-sm font-medium"
												style={subtitleStyle}
											>
												Produk
											</th>
											<th
												className="text-left py-3 px-4 text-sm font-medium"
												style={subtitleStyle}
											>
												Penjualan Bulan Ini
											</th>
											<th
												className="text-left py-3 px-4 text-sm font-medium"
												style={subtitleStyle}
											>
												Bulan Lalu
											</th>
											<th
												className="text-left py-3 px-4 text-sm font-medium"
												style={subtitleStyle}
											>
												Trend
											</th>
											<th
												className="text-left py-3 px-4 text-sm font-medium"
												style={subtitleStyle}
											>
												Volume
											</th>
											<th
												className="text-left py-3 px-4 text-sm font-medium"
												style={subtitleStyle}
											>
												Stok
											</th>
											<th
												className="text-left py-3 px-4 text-sm font-medium"
												style={subtitleStyle}
											>
												Aksi
											</th>
										</tr>
									</thead>
									<tbody>
										{productSales.map((product, index) => (
											<tr
												key={index}
												style={{
													borderBottom: `1px solid ${dark ? "#334155" : "#F3F4F6"}`,
												}}
											>
												<td className="py-4 px-4">
													<p
														className="text-sm font-medium"
														style={textStyle}
													>
														{product.produk}
													</p>
													<p
														className="text-xs mt-1"
														style={subtitleStyle}
													>
														{product.umkm}
													</p>
												</td>
												<td className="py-4 px-4">
													<p
														className="text-sm font-medium"
														style={textStyle}
													>
														{product.penjualanBulanIni}
													</p>
												</td>
												<td className="py-4 px-4">
													<p
														className="text-sm"
														style={subtitleStyle}
													>
														{product.bulanLalu}
													</p>
												</td>
												<td className="py-4 px-4">
													<div
														className="flex items-center gap-1 text-sm font-medium"
														style={{
															color: product.trend >= 0 ? "#22C55E" : "#EF4444",
														}}
													>
														{product.trend >= 0 ? (
															<IconTrendingUp size={16} />
														) : (
															<IconTrendingDown size={16} />
														)}
														{product.trend >= 0 ? "+" : ""}
														{product.trend}%
													</div>
												</td>
												<td className="py-4 px-4">
													<p
														className="text-sm"
														style={textStyle}
													>
														{product.volume}
													</p>
												</td>
												<td className="py-4 px-4">
													<span
														className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
															parseInt(product.stok) > 200
																? "bg-green-100 text-green-800"
																: "bg-red-100 text-red-800"
														}`}
													>
														{product.stok}
													</span>
												</td>
												<td className="py-4 px-4">
													<button
														className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
														style={{
															backgroundColor: "#1F3A5F",
															color: "white",
														}}
														onMouseEnter={(e) =>
															(e.currentTarget.style.backgroundColor = "#2d4a6f")
														}
														onMouseLeave={(e) =>
															(e.currentTarget.style.backgroundColor = "#1F3A5F")
														}
													>
														Detail
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BumdesPage;
