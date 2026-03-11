import {
	IconArrowDown,
	IconArrowUp,
	IconBabyCarriage,
	IconSkull,
	IconUsers,
	IconHome,
	IconExclamationCircle,
} from "@tabler/icons-react";
import { useMantineColorScheme } from "@mantine/core";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const DemografiPekerjaan = () => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	// KPI Data
	const kpiData = [
		{
			id: 1,
			title: "Total Penduduk",
			value: "5.634",
			subtitle: "Aktif terdaftar",
			icon: IconUsers,
		},
		{
			id: 2,
			title: "Kepala Keluarga",
			value: "1.354",
			subtitle: "Total KK",
			icon: IconHome,
		},
		{
			id: 3,
			title: "Kelahiran",
			value: "23",
			subtitle: "Tahun ini",
			icon: IconBabyCarriage,
		},
		{
			id: 4,
			title: "Kemiskinan",
			value: "324",
			subtitle: "-10% dari tahun lalu",
			icon: IconExclamationCircle,
		},
	];

	// Age distribution data
	const ageDistributionData = [
		{ ageRange: "17-25", total: 850 },
		{ ageRange: "26-35", total: 1200 },
		{ ageRange: "36-45", total: 1100 },
		{ ageRange: "46-55", total: 950 },
		{ ageRange: "56-65", total: 750 },
		{ ageRange: "65+", total: 484 },
	];

	// Job distribution data
	const jobDistributionData = [
		{ job: "Sipil", total: 1200 },
		{ job: "Guru", total: 850 },
		{ job: "Petani", total: 950 },
		{ job: "Pedagang", total: 750 },
		{ job: "Wiraswasta", total: 984 },
	];

	// Religion data
	const religionData = [
		{ religion: "Hindu", total: 4234, color: "#EF4444" },
		{ religion: "Islam", total: 856, color: "#3B82F6" },
		{ religion: "Kristen", total: 412, color: "#10B981" },
		{ religion: "Buddha", total: 202, color: "#F59E0B" },
	];

	// Banjar data
	const banjarData = [
		{ banjar: "Banjar Darmasaba", population: 1200, kk: 300, poor: 45 },
		{ banjar: "Banjar Manesa", population: 950, kk: 240, poor: 32 },
		{ banjar: "Banjar Cabe", population: 800, kk: 200, poor: 28 },
		{ banjar: "Banjar Penenjoan", population: 1100, kk: 280, poor: 38 },
		{ banjar: "Banjar Baler Pasar", population: 984, kk: 250, poor: 42 },
		{ banjar: "Banjar Bucu", population: 600, kk: 184, poor: 25 },
	];

	// Dynamic stats
	const dynamicStats = [
		{
			title: "Kelahiran",
			value: "23",
			icon: IconBabyCarriage,
			color: "#10B981",
		},
		{
			title: "Kematian",
			value: "12",
			icon: IconSkull,
			color: "#EF4444",
		},
		{
			title: "Pindah Masuk",
			value: "45",
			icon: IconArrowDown,
			color: "#3B82F6",
		},
		{
			title: "Pindah Keluar",
			value: "32",
			icon: IconArrowUp,
			color: "#F59E0B",
		},
	];

	const COLORS = ["#1E3A5F", "#3B82F6", "#60A5FA", "#93C5FD", "#DBEAFE"];

	const cardStyle = {
		backgroundColor: dark ? "#141D34" : "white",
		border: `1px solid ${dark ? "#141D34" : "white"}`,
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
			style={{ backgroundColor: dark ? "#10192D" : "#F3F4F6" }}
		>
			<div className="max-w-7xl mx-auto">
				{/* Row 1: 4 Statistic Cards */}
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
								</div>
								<div className="flex-shrink-0 ml-4">
									<div
										className="w-12 h-12 rounded-full flex items-center justify-center text-white"
										style={{ backgroundColor: "#1E3A5F" }}
									>
										<kpi.icon size={24} />
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Row 2: 2 Chart Cards */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
					{/* Age Distribution Bar Chart */}
					<div
						className="rounded-xl shadow-sm p-6"
						style={cardStyle}
					>
						<h3
							className="text-lg font-semibold mb-4"
							style={textStyle}
						>
							Grafik Pengelompokan Umur
						</h3>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={ageDistributionData}>
								<CartesianGrid
									strokeDasharray="3 3"
									vertical={false}
									stroke={dark ? "#2d3748" : "#E5E7EB"}
								/>
								<XAxis
									dataKey="ageRange"
									axisLine={false}
									tickLine={false}
									tick={{ fill: dark ? "#9CA3AF" : "#6B7280" }}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									tick={{ fill: dark ? "#9CA3AF" : "#6B7280" }}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: dark ? "#1F2937" : "white",
										border: `1px solid ${dark ? "#374151" : "#E5E7EB"}`,
										borderRadius: "8px",
										color: dark ? "white" : "#1F2937",
									}}
								/>
								<Bar dataKey="total" radius={[4, 4, 0, 0]}>
									{ageDistributionData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={COLORS[index % COLORS.length]}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>

					{/* Job Distribution Bar Chart */}
					<div
						className="rounded-xl shadow-sm p-6"
						style={cardStyle}
					>
						<h3
							className="text-lg font-semibold mb-4"
							style={textStyle}
						>
							Demografi Pekerjaan
						</h3>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={jobDistributionData}>
								<CartesianGrid
									strokeDasharray="3 3"
									vertical={false}
									stroke={dark ? "#2d3748" : "#E5E7EB"}
								/>
								<XAxis
									dataKey="job"
									axisLine={false}
									tickLine={false}
									tick={{ fill: dark ? "#9CA3AF" : "#6B7280" }}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									tick={{ fill: dark ? "#9CA3AF" : "#6B7280" }}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: dark ? "#1F2937" : "white",
										border: `1px solid ${dark ? "#374151" : "#E5E7EB"}`,
										borderRadius: "8px",
										color: dark ? "white" : "#1F2937",
									}}
								/>
								<Bar dataKey="total" radius={[4, 4, 0, 0]}>
									{jobDistributionData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={COLORS[index % COLORS.length]}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Row 3: 3 Insight Cards */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
					{/* Religion Distribution Pie Chart */}
					<div
						className="rounded-xl shadow-sm p-6"
						style={cardStyle}
					>
						<h3
							className="text-lg font-semibold mb-4"
							style={textStyle}
						>
							Distribusi Agama
						</h3>
						<ResponsiveContainer width="100%" height={250}>
							<PieChart>
								<Pie
									data={religionData}
									cx="50%"
									cy="50%"
									outerRadius={80}
									dataKey="total"
									nameKey="religion"
									label={({ name, percent }) =>
										`${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
									}
								>
									{religionData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip
									contentStyle={{
										backgroundColor: dark ? "#1F2937" : "white",
										border: `1px solid ${dark ? "#374151" : "#E5E7EB"}`,
										borderRadius: "8px",
										color: dark ? "white" : "#1F2937",
									}}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>

					{/* Population per Banjar Table */}
					<div
						className="rounded-xl shadow-sm p-6 lg:col-span-2"
						style={cardStyle}
					>
						<h3
							className="text-lg font-semibold mb-4"
							style={textStyle}
						>
							Data per Banjar
						</h3>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr
										style={{
											borderBottom: `1px solid ${dark ? "#2d3748" : "#E5E7EB"}`,
										}}
									>
										<th
											className="text-left py-3 px-4 text-sm font-medium"
											style={subtitleStyle}
										>
											Banjar
										</th>
										<th
											className="text-left py-3 px-4 text-sm font-medium"
											style={subtitleStyle}
										>
											Penduduk
										</th>
										<th
											className="text-left py-3 px-4 text-sm font-medium"
											style={subtitleStyle}
										>
											KK
										</th>
										<th
											className="text-left py-3 px-4 text-sm font-medium"
											style={subtitleStyle}
										>
											Miskin
										</th>
									</tr>
								</thead>
								<tbody>
									{banjarData.map((item, index) => (
										<tr
											key={index}
											style={{
												borderBottom: `1px solid ${dark ? "#2d3748" : "#F3F4F6"}`,
											}}
										>
											<td
												className="py-3 px-4 text-sm"
												style={textStyle}
											>
												{item.banjar}
											</td>
											<td
												className="py-3 px-4 text-sm"
												style={textStyle}
											>
												{item.population.toLocaleString()}
											</td>
											<td
												className="py-3 px-4 text-sm"
												style={textStyle}
											>
												{item.kk.toLocaleString()}
											</td>
											<td
												className="py-3 px-4 text-sm"
												style={{ color: "#EF4444" }}
											>
												{item.poor.toLocaleString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				{/* Population Dynamics Stats */}
				<div
					className="rounded-xl shadow-sm p-6"
					style={cardStyle}
				>
					<h3
						className="text-lg font-semibold mb-4"
						style={textStyle}
					>
						Statistik Dinamika Penduduk
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						{dynamicStats.map((stat, index) => (
							<div
								key={index}
								className="p-4 rounded-lg"
								style={{
									backgroundColor: dark ? "#1F2937" : "#F9FAFB",
								}}
							>
								<div className="flex items-center justify-between">
									<div>
										<p
											className="text-sm font-medium mb-1"
											style={subtitleStyle}
										>
											{stat.title}
										</p>
										<p
											className="text-2xl font-bold"
											style={{ color: stat.color }}
										>
											{stat.value}
										</p>
									</div>
									<div
										className="w-10 h-10 rounded-full flex items-center justify-center"
										style={{
											backgroundColor: `${stat.color}20`,
											color: stat.color,
										}}
									>
										<stat.icon size={20} />
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default DemografiPekerjaan;
