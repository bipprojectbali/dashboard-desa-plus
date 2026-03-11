import {
	IconCurrency,
	IconTrendingDown,
	IconTrendingUp,
	IconCheck,
	IconClock,
} from "@tabler/icons-react";
import { useMantineColorScheme } from "@mantine/core";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const KeuanganAnggaran = () => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	// KPI Data
	const kpiData = [
		{
			id: 1,
			title: "Total APBDes",
			value: "Rp 5.2M",
			subtitle: "Tahun 2025",
			icon: IconCurrency,
		},
		{
			id: 2,
			title: "Realisasi",
			value: "68%",
			subtitle: "Rp 3.5M dari 5.2M",
			icon: IconCheck,
		},
		{
			id: 3,
			title: "Pemasukan",
			value: "Rp 580jt",
			subtitle: "Bulan ini",
			delta: "+8%",
			icon: IconTrendingUp,
		},
		{
			id: 4,
			title: "Pengeluaran",
			value: "Rp 520jt",
			subtitle: "Bulan ini",
			icon: IconTrendingDown,
		},
	];

	// Income vs Expense data
	const incomeExpenseData = [
		{ month: "Apr", income: 450, expense: 380 },
		{ month: "Mei", income: 520, expense: 420 },
		{ month: "Jun", income: 480, expense: 500 },
		{ month: "Jul", income: 580, expense: 450 },
		{ month: "Agu", income: 550, expense: 520 },
		{ month: "Sep", income: 600, expense: 480 },
		{ month: "Okt", income: 580, expense: 520 },
	];

	// Allocation data
	const allocationData = [
		{ sector: "Pembangunan", amount: 1200 },
		{ sector: "Kesehatan", amount: 800 },
		{ sector: "Pendidikan", amount: 650 },
		{ sector: "Sosial", amount: 550 },
		{ sector: "Kebudayaan", amount: 400 },
		{ sector: "Teknologi", amount: 300 },
	];

	// Assistance fund data
	const assistanceFundData = [
		{ source: "Dana Desa (DD)", amount: 1800, status: "cair" },
		{ source: "Alokasi Dana Desa (ADD)", amount: 950, status: "cair" },
		{ source: "Bagi Hasil Pajak", amount: 450, status: "cair" },
		{ source: "Hibah Provinsi", amount: 300, status: "proses" },
	];

	// APBDes Report data
	const apbdReport = {
		income: [
			{ category: "Dana Desa", amount: 1800 },
			{ category: "Alokasi Dana Desa", amount: 480 },
			{ category: "Bagi Hasil Pajak & Retribusi", amount: 300 },
			{ category: "Pendapatan Asli Desa", amount: 200 },
			{ category: "Hibah Bantuan", amount: 300 },
		],
		expenses: [
			{ category: "Penyelenggaraan Pemerintah", amount: 425 },
			{ category: "Pembangunan Desa", amount: 850 },
			{ category: "Pembinaan Kemasyarakatan", amount: 320 },
			{ category: "Pemberdayaan Masyarakat", amount: 380 },
			{ category: "Penanggulangan Bencana", amount: 180 },
		],
		totalIncome: 3080,
		totalExpenses: 2155,
	};

	const COLORS = ["#1E3A5F", "#3B82F6", "#60A5FA", "#93C5FD", "#DBEAFE"];

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
				{/* Row 1: 4 Summary Metrics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
					{kpiData.map((kpi) => (
						<div
							key={kpi.id}
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
									{kpi.delta && (
										<p className="text-xs text-green-500 mt-1">
											{kpi.delta}
										</p>
									)}
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

				{/* Row 2: Line Chart Section */}
				<div
					className="rounded-xl shadow-sm p-6 mb-6"
					style={cardStyle}
				>
					<h3
						className="text-lg font-semibold mb-4"
						style={textStyle}
					>
						Pemasukan vs Pengeluaran
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={incomeExpenseData}>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke={dark ? "#334155" : "#E5E7EB"}
							/>
							<XAxis
								dataKey="month"
								axisLine={false}
								tickLine={false}
								tick={{ fill: dark ? "#9CA3AF" : "#6B7280" }}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{ fill: dark ? "#9CA3AF" : "#6B7280" }}
								tickFormatter={(value) => `${value}jt`}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: dark ? "#1F2937" : "white",
									border: `1px solid ${dark ? "#374151" : "#E5E7EB"}`,
									borderRadius: "8px",
									color: dark ? "white" : "#1F2937",
								}}
							/>
							<Line
								type="monotone"
								dataKey="income"
								stroke="#22C55E"
								strokeWidth={3}
								dot={{ fill: "#22C55E", strokeWidth: 2, r: 5 }}
								activeDot={{ r: 7 }}
								name="Pemasukan"
							/>
							<Line
								type="monotone"
								dataKey="expense"
								stroke="#EF4444"
								strokeWidth={3}
								dot={{ fill: "#EF4444", strokeWidth: 2, r: 5 }}
								activeDot={{ r: 7 }}
								name="Pengeluaran"
							/>
						</LineChart>
					</ResponsiveContainer>

					{/* Legend */}
					<div className="flex items-center gap-6 mt-4">
						<div className="flex items-center gap-2">
							<div
								className="w-3 h-3 rounded-full"
								style={{ backgroundColor: "#22C55E" }}
							/>
							<span className="text-sm" style={subtitleStyle}>
								Pemasukan
							</span>
						</div>
						<div className="flex items-center gap-2">
							<div
								className="w-3 h-3 rounded-full"
								style={{ backgroundColor: "#EF4444" }}
							/>
							<span className="text-sm" style={subtitleStyle}>
								Pengeluaran
							</span>
						</div>
					</div>
				</div>

				{/* Row 3: Analytics Section */}


				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
					{/* Left: Horizontal Bar Chart */}
					<div
						className="rounded-xl shadow-sm p-6"
						style={cardStyle}
					>
						<h3
							className="text-lg font-semibold mb-4"
							style={textStyle}
						>
							Alokasi Anggaran Per Sektor
						</h3>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={allocationData} layout="vertical">
								<CartesianGrid
									strokeDasharray="3 3"
									horizontal={false}
									stroke={dark ? "#334155" : "#E5E7EB"}
								/>
								<XAxis
									type="number"
									axisLine={false}
									tickLine={false}
									tick={{ fill: dark ? "#9CA3AF" : "#6B7280" }}
									tickFormatter={(value) => `${value}jt`}
								/>
								<YAxis
									dataKey="sector"
									type="category"
									axisLine={false}
									tickLine={false}
									tick={{ fill: dark ? "#9CA3AF" : "#374151" }}
									width={120}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: dark ? "#1F2937" : "white",
										border: `1px solid ${dark ? "#374151" : "#E5E7EB"}`,
										borderRadius: "8px",
										color: dark ? "white" : "#1F2937",
									}}
								/>
								<Bar dataKey="amount" radius={[0, 4, 4, 0]}>
									{allocationData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={COLORS[index % COLORS.length]}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
					{/* Right: Assistance Funds List */}
					<div
						className="rounded-xl shadow-sm p-6"
						style={cardStyle}
					>
						<h3
							className="text-lg font-semibold mb-4"
							style={textStyle}
						>
							Dana Bantuan dan Hibah
						</h3>
						<div className="space-y-3">
							{assistanceFundData.map((fund, index) => (
								<div
									key={index}
									className="flex items-center justify-between p-4 rounded-lg"
									style={{
										backgroundColor: dark ? "#334155" : "#F9FAFB",
									}}
								>
									<div>
										<p
											className="text-sm font-medium"
											style={textStyle}
										>
											{fund.source}
										</p>
										<p
											className="text-xs mt-1"
											style={subtitleStyle}
										>
											Rp {fund.amount.toLocaleString()}jt
										</p>
									</div>
									<span
										className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
										style={{
											backgroundColor: fund.status === "cair" ? "#DCFCE7" : "#FEF3C7",
											color: fund.status === "cair" ? "#166534" : "#92400E",
										}}
									>
										{fund.status === "cair" ? (
											<IconCheck size={14} className="mr-1" />
										) : (
											<IconClock size={14} className="mr-1" />
										)}
										{fund.status}
									</span>
								</div>
							))}
						</div>
					</div>

				</div>
				{/* Row 4: Report Section */}
				<div
					className="rounded-xl shadow-sm p-6"
					style={cardStyle}
				>
					<h3
						className="text-lg font-semibold mb-6"
						style={textStyle}
					>
						Laporan APBDes
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* Left: Pendapatan */}
						<div>
							<h4
								className="text-base font-semibold mb-4"
								style={textStyle}
							>
								Pendapatan
							</h4>
							<div className="space-y-3">
								{apbdReport.income.map((item, index) => (
									<div
										key={index}
										className="flex items-center justify-between py-2"
										style={{
											borderBottom: `1px solid ${dark ? "#334155" : "#F3F4F6"}`,
										}}
									>
										<span className="text-sm" style={subtitleStyle}>
											{item.category}
										</span>
										<span
											className="text-sm font-medium"
											style={{ color: "#22C55E" }}
										>
											Rp {item.amount.toLocaleString()}jt
										</span>
									</div>
								))}
								<div
									className="flex items-center justify-between py-3 mt-4 pt-4"
									style={{
										borderTop: `2px solid ${dark ? "#334155" : "#E5E7EB"}`,
									}}
								>
									<span className="text-base font-bold" style={textStyle}>
										Total Pendapatan
									</span>
									<span
										className="text-base font-bold"
										style={{ color: "#22C55E" }}
									>
										Rp {apbdReport.totalIncome.toLocaleString()}jt
									</span>
								</div>
							</div>
						</div>

						{/* Right: Belanja */}
						<div>
							<h4
								className="text-base font-semibold mb-4"
								style={textStyle}
							>
								Belanja
							</h4>
							<div className="space-y-3">
								{apbdReport.expenses.map((item, index) => (
									<div
										key={index}
										className="flex items-center justify-between py-2"
										style={{
											borderBottom: `1px solid ${dark ? "#334155" : "#F3F4F6"}`,
										}}
									>
										<span className="text-sm" style={subtitleStyle}>
											{item.category}
										</span>
										<span
											className="text-sm font-medium"
											style={{ color: "#EF4444" }}
										>
											Rp {item.amount.toLocaleString()}jt
										</span>
									</div>
								))}
								<div
									className="flex items-center justify-between py-3 mt-4 pt-4"
									style={{
										borderTop: `2px solid ${dark ? "#334155" : "#E5E7EB"}`,
									}}
								>
									<span className="text-base font-bold" style={textStyle}>
										Total Belanja
									</span>
									<span
										className="text-base font-bold"
										style={{ color: "#EF4444" }}
									>
										Rp {apbdReport.totalExpenses.toLocaleString()}jt
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Footer: Balance */}
					<div
						className="flex items-center justify-between py-4 mt-6 pt-6"
						style={{
							borderTop: `2px solid ${dark ? "#334155" : "#E5E7EB"}`,
						}}
					>
						<span className="text-lg font-bold" style={textStyle}>
							Saldo
						</span>
						<span
							className="text-lg font-bold"
							style={{
								color:
									apbdReport.totalIncome > apbdReport.totalExpenses
										? "#22C55E"
										: "#EF4444",
							}}
						>
							Rp{" "}
							{(
								apbdReport.totalIncome - apbdReport.totalExpenses
							).toLocaleString()}
							jt
						</span>
					</div>
				</div>

			</div>
		</div>
	);
};

export default KeuanganAnggaran;
