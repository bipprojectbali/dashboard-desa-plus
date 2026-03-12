import {
	IconMessage,
	IconAlertTriangle,
	IconClock,
	IconCheck,
	IconChevronRight,
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

const PengaduanLayananPublik = () => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	// Statistic cards data
	const statsData = [
		{
			title: "Total Pengaduan",
			value: 156,
			subtitle: "+12% dari bulan lalu",
			icon: IconMessage,
		},
		{
			title: "Pengaduan Baru",
			value: 24,
			subtitle: "Perlu tindakan segera",
			icon: IconAlertTriangle,
		},
		{
			title: "Sedang Diproses",
			value: 48,
			subtitle: "Dalam penanganan",
			icon: IconClock,
		},
		{
			title: "Selesai",
			value: 84,
			subtitle: "92% tingkat kepuasan",
			icon: IconCheck,
		},
	];

	// Line chart data for complaint trends
	const trendData = [
		{ month: "Jan", complaints: 32 },
		{ month: "Feb", complaints: 45 },
		{ month: "Mar", complaints: 38 },
		{ month: "Apr", complaints: 52 },
		{ month: "Mei", complaints: 48 },
		{ month: "Jun", complaints: 61 },
	];

	// Horizontal bar chart data for most requested documents
	const documentData = [
		{ name: "KTP", count: 145 },
		{ name: "Kartu Keluarga", count: 128 },
		{ name: "Surat Domisili", count: 96 },
		{ name: "Surat Usaha", count: 74 },
		{ name: "SKCK", count: 52 },
	];

	// Recent applications data
	const recentApplications = [
		{
			id: 1,
			name: "Budi Santoso",
			type: "KTP Elektronik",
			date: "10 Mar 2025",
			status: "Selesai",
			statusBg: "bg-darmasaba-success-100",
			statusText: "text-darmasaba-success-800",
		},
		{
			id: 2,
			name: "Siti Aminah",
			type: "Surat Domisili",
			date: "10 Mar 2025",
			status: "Diproses",
			statusBg: "bg-darmasaba-warning-100",
			statusText: "text-darmasaba-warning-800",
		},
		{
			id: 3,
			name: "Ahmad Fauzi",
			type: "Kartu Keluarga",
			date: "9 Mar 2025",
			status: "Baru",
			statusBg: "bg-darmasaba-blue-100",
			statusText: "text-darmasaba-blue-800",
		},
		{
			id: 4,
			name: "Dewi Lestari",
			type: "Surat Usaha",
			date: "9 Mar 2025",
			status: "Selesai",
			statusBg: "bg-darmasaba-success-100",
			statusText: "text-darmasaba-success-800",
		},
		{
			id: 5,
			name: "Joko Widodo",
			type: "SKCK",
			date: "8 Mar 2025",
			status: "Diproses",
			statusBg: "bg-darmasaba-warning-100",
			statusText: "text-darmasaba-warning-800",
		},
	];

	// Innovation ideas data
	const innovationIdeas = [
		{
			id: 1,
			title: "Sistem Antrian Online",
			submitter: "Andi Prasetyo",
			category: "Teknologi",
		},
		{
			id: 2,
			title: "Layanan Jemput Dokumen",
			submitter: "Rina Kusuma",
			category: "Pelayanan",
		},
		{
			id: 3,
			title: "Digitalisasi Arsip Desa",
			submitter: "Bambang Suryono",
			category: "Administrasi",
		},
		{
			id: 4,
			title: "Aplikasi Pengaduan Mobile",
			submitter: "Lina Marlina",
			category: "Teknologi",
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
			style={{
				backgroundColor: dark ? "#10192D" : "#F3F4F6",
				minHeight: "100vh",
				padding: "1.5rem",
			}}
		>
			<div
				className="max-w-7xl mx-auto"
				style={{
					maxWidth: "80rem",
					marginLeft: "auto",
					marginRight: "auto",
				}}
			>
				{/* Row 1: 4 Statistic Cards */}
				<div
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(4, 1fr)",
						gap: "1.5rem",
						marginBottom: "1.5rem",
					}}
				>
					{statsData.map((stat, index) => (
						<div
							key={index}
							className="rounded-xl shadow-sm p-6"
							style={{
								...cardStyle,
								borderRadius: "12px",
								boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
								padding: "1.5rem",
							}}
						>
							<div className="flex items-center justify-between">
								<div className="flex-1">
									<h3
										className="text-sm font-medium mb-1"
										style={subtitleStyle}
									>
										{stat.title}
									</h3>
									<p
										className="text-3xl font-bold mb-1"
										style={textStyle}
									>
										{stat.value}
									</p>
									<p
										className="text-xs"
										style={subtitleStyle}
									>
										{stat.subtitle}
									</p>
								</div>
								<div className="flex-shrink-0 ml-4">
									<div
										className="w-12 h-12 rounded-full flex items-center justify-center text-white"
										style={{ backgroundColor: "#1E3A5F" }}
									>
										<stat.icon size={24} />
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Row 2: Full Width Line Chart */}
				<div
					className="rounded-xl shadow-sm p-6 mb-6"
					style={{
						...cardStyle,
						borderRadius: "12px",
						boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
						padding: "1.5rem",
						marginBottom: "1.5rem",
					}}
				>
					<h3
						className="text-lg font-semibold mb-4"
						style={textStyle}
					>
						Tren Pengaduan Warga
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={trendData}>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke={dark ? "#2d3748" : "#E5E7EB"}
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
								dataKey="complaints"
								stroke="#1E3A5F"
								strokeWidth={3}
								dot={{ fill: "#1E3A5F", strokeWidth: 2, r: 5 }}
								activeDot={{ r: 7 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>

				{/* Row 3: 3 Column Grid */}
				<div
					className="grid grid-cols-1 lg:grid-cols-3 gap-6"
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
						gap: "1.5rem",
					}}
				>
					{/* Left: Most Requested Documents (Horizontal Bar Chart) */}
					<div
						className="rounded-xl shadow-sm p-6"
						style={{
							...cardStyle,
							borderRadius: "12px",
							boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
							padding: "1.5rem",
						}}
					>
						<h3
							className="text-lg font-semibold mb-4"
							style={textStyle}
						>
							Dokumen Paling Banyak Diminta
						</h3>
						<ResponsiveContainer width="100%" height={280}>
							<BarChart data={documentData} layout="vertical">
								<CartesianGrid
									strokeDasharray="3 3"
									horizontal={false}
									stroke={dark ? "#2d3748" : "#E5E7EB"}
								/>
								<XAxis
									type="number"
									axisLine={false}
									tickLine={false}
									tick={{ fill: dark ? "#9CA3AF" : "#6B7280" }}
								/>
								<YAxis
									dataKey="name"
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
								<Bar dataKey="count" radius={[0, 4, 4, 0]}>
									{documentData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={COLORS[index % COLORS.length]}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>

					{/* Middle: Recent Applications */}
					<div
						className="rounded-xl shadow-sm p-6"
						style={{
							...cardStyle,
							borderRadius: "12px",
							boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
							padding: "1.5rem",
						}}
					>
						<h3
							className="text-lg font-semibold mb-4"
							style={textStyle}
						>
							Pengajuan Terbaru
						</h3>
						<div className="space-y-4">
							{recentApplications.map((app) => (
								<div
									key={app.id}
									className="flex items-center justify-between py-3"
									style={{
										borderBottom: `1px solid ${dark ? "#2d3748" : "#E5E7EB"}`,
									}}
								>
									<div className="flex-1">
										<p
											className="text-sm font-medium"
											style={textStyle}
										>
											{app.name}
										</p>
										<p
											className="text-xs"
											style={subtitleStyle}
										>
											{app.type}
										</p>
									</div>
									<div className="text-right">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${app.statusBg} ${app.statusText}`}
										>
											{app.status}
										</span>
										<p
											className="text-xs mt-1"
											style={subtitleStyle}
										>
											{app.date}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Right: Innovation Ideas */}
					<div
						className="rounded-xl shadow-sm p-6"
						style={{
							...cardStyle,
							borderRadius: "12px",
							boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
							padding: "1.5rem",
						}}
					>
						<h3
							className="text-lg font-semibold mb-4"
							style={textStyle}
						>
							Ide Inovatif Warga
						</h3>
						<div className="space-y-4">
							{innovationIdeas.map((idea) => (
								<div
									key={idea.id}
									className="py-3"
									style={{
										borderBottom: `1px solid ${dark ? "#2d3748" : "#E5E7EB"}`,
									}}
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<p
												className="text-sm font-medium"
												style={textStyle}
											>
												{idea.title}
											</p>
											<p
												className="text-xs mt-1"
												style={subtitleStyle}
											>
												{idea.submitter}
											</p>
										</div>
										<div className="flex items-center gap-2">
											<span
												className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
												style={{
													backgroundColor: dark ? "#2d3748" : "#F3F4F6",
													color: dark ? "#E5E7EB" : "#1F2937",
												}}
											>
												{idea.category}
											</span>
											<button
												className="p-1"
												style={{
													color: dark ? "#60A5FA" : "#2563EB",
												}}
											>
												<IconChevronRight size={20} />
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PengaduanLayananPublik;
