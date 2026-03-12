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
import { useMantineColorScheme } from "@mantine/core";
import { IconMessage } from "@tabler/icons-react";

const KinerjaDivisi = () => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	// Top row - 4 activity cards
	const activities = [
		{
			title: "Rakor 2025",
			progress: 100,
			date: "15 Jan 2025",
		},
		{
			title: "Pemutakhiran Indeks Desa",
			progress: 100,
			date: "20 Feb 2025",
		},
		{
			title: "Mengurus akta cerai warga",
			progress: 100,
			date: "5 Mar 2025",
		},
		{
			title: "Pasek 7 desa adat",
			progress: 100,
			date: "10 Mar 2025",
		},
	];

	// Document statistics
	const documentStats = [
		{ name: "Gambar", value: 300, color: "#FAC858" },
		{ name: "Dokumen", value: 310, color: "#92CC76" },
	];

	// Activity progress statistics
	const activityProgressStats = [
		{ name: "Selesai", value: 83.33, fill: "#92CC76" },
		{ name: "Dikerjakan", value: 16.67, fill: "#FAC858" },
		{ name: "Segera Dikerjakan", value: 0, fill: "#5470C6" },
		{ name: "Dibatalkan", value: 0, fill: "#EE6767" },
	];

	// Discussion data
	const discussions = [
		{
			title: "Pembahasan APBDes 2026",
			sender: "Kepala Desa",
			date: "10 Mar 2025",
		},
		{
			title: "Kegiatan Posyandu",
			sender: "Divisi Sosial",
			date: "9 Mar 2025",
		},
		{
			title: "Festival Budaya",
			sender: "Divisi Humas",
			date: "8 Mar 2025",
		},
	];

	return (
		<div
			className="min-h-screen"
			style={{
				backgroundColor: dark ? "#10192D" : "#F3F4F6",
				minHeight: "100vh",
				padding: "1.5rem",
			}}
		>
			{/* Top Row - 4 Activity Cards */}
			<div
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(4, 1fr)",
					gap: "1.5rem",
					marginBottom: "1.5rem",
				}}
			>
				{activities.map((activity, index) => (
					<div
						key={index}
						className="rounded-xl shadow-sm p-5"
						style={{
							backgroundColor: dark ? "#141D34" : "white",
							border: `1px solid ${dark ? "#141D34" : "white"}`,
							borderRadius: "12px",
							boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
							padding: "1.25rem",
						}}
					>
						{/* Dark blue title bar */}
						<div
							className="text-white px-3 py-2 rounded-t-lg -mx-5 -mt-5 mb-4"
							style={{ backgroundColor: "#1E3A5F" }}
						>
							<h3 className="text-sm font-semibold">{activity.title}</h3>
						</div>

						{/* Orange progress bar */}
						<div
							className="w-full rounded-full h-2 mb-3"
							style={{ backgroundColor: dark ? "#2d3748" : "#E5E7EB" }}
						>
							<div
								className="bg-orange-500 h-2 rounded-full"
								style={{ width: `${activity.progress}%` }}
							/>
						</div>

						{/* Date and badge */}
						<div className="flex justify-between items-center">
							<span
								className="text-xs"
								style={{ color: dark ? "#9CA3AF" : "#6B7280" }}
							>
								{activity.date}
							</span>
							<span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
								Selesai
							</span>
						</div>
					</div>
				))}
			</div>

			{/* Second Row - Charts */}
			<div
				className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
					gap: "1.5rem",
					marginBottom: "1.5rem",
				}}
			>
				{/* Left Card - Jumlah Dokumen (Bar Chart) */}
				<div
					className="rounded-xl shadow-sm p-5"
					style={{
						backgroundColor: dark ? "#141D34" : "white",
						border: `1px solid ${dark ? "#141D34" : "white"}`,
						borderRadius: "12px",
						boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
						padding: "1.25rem",
					}}
				>
					<h3
						className="text-lg font-semibold mb-4"
						style={{ color: dark ? "white" : "#1F2937" }}
					>
						Jumlah Dokumen
					</h3>
					<ResponsiveContainer width="100%" height={250}>
						<BarChart data={documentStats}>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke={dark ? "#2d3748" : "#E5E7EB"}
							/>
							<XAxis
								dataKey="name"
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
							<Bar dataKey="value" radius={[4, 4, 0, 0]}>
								{documentStats.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>

				{/* Right Card - Progres Kegiatan (Pie Chart) */}
				<div
					className="rounded-xl shadow-sm p-5"
					style={{
						backgroundColor: dark ? "#141D34" : "white",
						border: `1px solid ${dark ? "#141D34" : "white"}`,
						borderRadius: "12px",
						boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
						padding: "1.25rem",
					}}
				>
					<h3
						className="text-lg font-semibold mb-4"
						style={{ color: dark ? "white" : "#1F2937" }}
					>
						Progres Kegiatan
					</h3>
					<ResponsiveContainer width="100%" height={250}>
						<PieChart>
							<Pie
								data={activityProgressStats.filter(item => item.value > 0)}
								cx="50%"
								cy="50%"
								outerRadius={80}
								dataKey="value"
								label={({ name, percent }) =>
									`${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
								}
							>
								{activityProgressStats
									.filter(item => item.value > 0)
									.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.fill} />
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

					{/* Legend */}
					<div className="mt-4 space-y-2">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-blue-500"></div>
							<span
								className="text-sm"
								style={{ color: dark ? "#9CA3AF" : "#4B5563" }}
							>
								Segera Dikerjakan
							</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-yellow-500"></div>
							<span
								className="text-sm"
								style={{ color: dark ? "#9CA3AF" : "#4B5563" }}
							>
								Dikerjakan
							</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-green-500"></div>
							<span
								className="text-sm"
								style={{ color: dark ? "#9CA3AF" : "#4B5563" }}
							>
								Selesai
							</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-red-500"></div>
							<span
								className="text-sm"
								style={{ color: dark ? "#9CA3AF" : "#4B5563" }}
							>
								Dibatalkan
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Row */}
			<div
				className="grid grid-cols-1 lg:grid-cols-2 gap-6"
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
					gap: "1.5rem",
				}}
			>
				{/* Left Card - Diskusi */}
				<div
					className="rounded-xl shadow-sm p-5"
					style={{
						backgroundColor: dark ? "#141D34" : "white",
						border: `1px solid ${dark ? "#141D34" : "white"}`,
						borderRadius: "12px",
						boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
						padding: "1.25rem",
					}}
				>
					<h3
						className="text-lg font-semibold mb-4"
						style={{ color: dark ? "white" : "#1F2937" }}
					>
						Diskusi
					</h3>
					<div className="space-y-3">
						{discussions.map((discussion, index) => (
							<div
								key={index}
								className="flex items-start gap-3 p-3 rounded-lg transition-colors"
								style={{
									backgroundColor: dark ? "#1F2937" : "#F9FAFB",
								}}
							>
								<div className="flex-shrink-0">
									<div
										className="w-8 h-8 rounded-full flex items-center justify-center"
										style={{ backgroundColor: "#DBEAFE" }}
									>
										<IconMessage
											className="w-4 h-4"
											style={{ color: "#1E3A5F" }}
											stroke={2}
										/>
									</div>
								</div>
								<div className="flex-1">
									<h4
										className="text-sm font-medium"
										style={{ color: dark ? "white" : "#1F2937" }}
									>
										{discussion.title}
									</h4>
									<p
										className="text-xs mt-1"
										style={{ color: dark ? "#9CA3AF" : "#6B7280" }}
									>
										{discussion.sender} • {discussion.date}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Right Card - Acara Hari Ini */}
				<div
					className="rounded-xl shadow-sm p-5"
					style={{
						backgroundColor: dark ? "#141D34" : "white",
						border: `1px solid ${dark ? "#141D34" : "white"}`,
						borderRadius: "12px",
						boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
						padding: "1.25rem",
					}}
				>
					<h3
						className="text-lg font-semibold mb-4"
						style={{ color: dark ? "white" : "#1F2937" }}
					>
						Acara Hari Ini
					</h3>
					<div className="flex items-center justify-center h-32">
						<p
							className="text-sm"
							style={{ color: dark ? "#9CA3AF" : "#6B7280" }}
						>
							Tidak ada acara hari ini
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default KinerjaDivisi;
