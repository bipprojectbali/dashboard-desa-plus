import {
	IconAlertTriangle,
	IconClock,
	IconMessageChatbot,
	IconSparkles,
} from "@tabler/icons-react";
import { useMantineColorScheme } from "@mantine/core";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const JennaAnalytic = () => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	// KPI Data
	const kpiData = [
		{
			id: 1,
			title: "Interaksi Hari Ini",
			value: "61",
			subtitle: "+15% dari kemarin",
			icon: IconMessageChatbot,
		},
		{
			id: 2,
			title: "Jawaban Otomatis",
			value: "87%",
			subtitle: "53 dari 61 interaksi",
			icon: IconSparkles,
		},
		{
			id: 3,
			title: "Belum Ditindak",
			value: "8",
			subtitle: "Perlu respon manual",
			icon: IconAlertTriangle,
		},
		{
			id: 4,
			title: "Waktu Respon",
			value: "2.3s",
			subtitle: "Rata-rata",
			icon: IconClock,
		},
	];

	// Weekly chatbot interaction data
	const weeklyData = [
		{ day: "Sen", interactions: 100 },
		{ day: "Sel", interactions: 120 },
		{ day: "Rab", interactions: 90 },
		{ day: "Kam", interactions: 150 },
		{ day: "Jum", interactions: 110 },
		{ day: "Sab", interactions: 80 },
		{ day: "Min", interactions: 130 },
	];

	// Top topics data
	const topTopics = [
		{ topic: "Cara mengurus KTP", count: 89 },
		{ topic: "Syarat Kartu Keluarga", count: 76 },
		{ topic: "Jadwal Posyandu", count: 64 },
		{ topic: "Pengaduan jalan rusak", count: 52 },
		{ topic: "Info program bansos", count: 48 },
	];

	// Busy hour distribution
	const busyHours = [
		{ period: "Pagi (08–12)", percentage: 30 },
		{ period: "Siang (12–16)", percentage: 40 },
		{ period: "Sore (16–20)", percentage: 20 },
		{ period: "Malam (20–08)", percentage: 10 },
	];

	const COLORS = ["#1E3A5F", "#3B82F6", "#60A5FA", "#93C5FD"];

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
					{kpiData.map((kpi) => (
						<div
							key={kpi.id}
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

				{/* Row 2: Full Width Weekly Bar Chart */}
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
						Interaksi Chatbot Mingguan
					</h3>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={weeklyData}>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke={dark ? "#2d3748" : "#E5E7EB"}
							/>
							<XAxis
								dataKey="day"
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
							<Bar dataKey="interactions" radius={[4, 4, 0, 0]}>
								{weeklyData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>

				{/* Row 3: Two Insight Cards */}
				<div
					className="grid grid-cols-1 lg:grid-cols-2 gap-6"
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
						gap: "1.5rem",
					}}
				>
					{/* Left: Frequently Asked Topics */}
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
							Topik Pertanyaan Terbanyak
						</h3>
						<div className="space-y-3">
							{topTopics.map((item, index) => (
								<div
									key={index}
									className="flex items-center justify-between py-3"
									style={{
										borderBottom: `1px solid ${dark ? "#2d3748" : "#E5E7EB"}`,
									}}
								>
									<span
										className="text-sm font-medium"
										style={textStyle}
									>
										{item.topic}
									</span>
									<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-darmasaba-blue-100 text-darmasaba-blue-800">
										{item.count}x
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Right: Busy Hour Distribution */}
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
							Distribusi Jam Tersibuk
						</h3>
						<div className="space-y-4">
							{busyHours.map((item, index) => (
								<div key={index}>
									<div className="flex items-center justify-between mb-1">
										<span
											className="text-sm font-medium"
											style={textStyle}
										>
											{item.period}
										</span>
										<span
											className="text-sm font-semibold"
											style={textStyle}
										>
											{item.percentage}%
										</span>
									</div>
									<div
										className="w-full rounded-full h-2"
										style={{ backgroundColor: dark ? "#2d3748" : "#E5E7EB" }}
									>
										<div
											className="h-2 rounded-full transition-all"
											style={{
												width: `${item.percentage}%`,
												backgroundColor: COLORS[index % COLORS.length],
											}}
										/>
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

export default JennaAnalytic;
