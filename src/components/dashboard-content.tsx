import {
	Calendar,
	CheckCircle,
	FileText,
	MessageCircle,
	Users,
} from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { ulid } from "ulid"; // Import ulid
import { DashboardCard } from "./dashboard-card";
import { Card } from "./ui/card";

const barChartData = [
	{ id: ulid(), month: "Jan", value: 145 },
	{ id: ulid(), month: "Feb", value: 165 },
	{ id: ulid(), month: "Mar", value: 195 },
	{ id: ulid(), month: "Apr", value: 155 },
	{ id: ulid(), month: "Mei", value: 205 },
	{ id: ulid(), month: "Jun", value: 185 },
];

const pieChartData = [
	{ id: ulid(), name: "Puas", value: 25 },
	{ id: ulid(), name: "Cukup", value: 25 },
	{ id: ulid(), name: "Kurang", value: 25 },
	{ id: ulid(), name: "Sangat puas", value: 25 },
];

const COLORS = ["#4E5BA6", "#F4C542", "#8CC63F", "#E57373"];

const divisiData = [
	{ id: ulid(), name: "Kesejahteraan", value: 37 },
	{ id: ulid(), name: "Pemerintahan", value: 26 },
	{ id: ulid(), name: "Keuangan", value: 17 },
	{ id: ulid(), name: "Sekretaris Desa", value: 15 },
];

const eventData = [
	{ id: ulid(), date: "1 Oktober 2025", title: "Hari Kesaktian Pancasila" },
	{ id: ulid(), date: "15 Oktober 2025", title: "Davest" },
	{ id: ulid(), date: "19 Oktober 2025", title: "Rapat Koordinasi" },
];

export function DashboardContent() {
	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<DashboardCard
					title="Surat Minggu Ini"
					value="99"
					subtitle="14 baru, 14 diproses"
					change="12% dari minggu lalu ↗ +12%"
					icon={<FileText className="w-6 h-6" />}
				/>
				<DashboardCard
					title="Pengaduan Aktif"
					value="28"
					subtitle="14 baru, 14 diproses"
					icon={<MessageCircle className="w-6 h-6" />}
				/>
				<DashboardCard
					title="Layanan Selesai"
					value="156"
					subtitle="bulan ini"
					change="+8%"
					icon={<CheckCircle className="w-6 h-6" />}
				/>
				<DashboardCard
					title="Kepuasan Warga"
					value="87.2%"
					subtitle="dari 482 responden"
					icon={<Users className="w-6 h-6" />}
					badge="87%"
				/>
			</div>

			{/* Charts Section */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Bar Chart */}
				<Card className="p-6 border-none bg-gray-50">
					<div className="flex items-center justify-between mb-4">
						<div>
							<h3 className="text-lg font-semibold mb-1">
								Statistik Pengajuan Surat
							</h3>
							<p className="text-sm text-gray-600">
								Trend pengajuan surat 6 bulan terakhir
							</p>
						</div>
						<button type="button" className="p-2 hover:bg-gray-200 rounded-lg">
							<svg
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								role="img"
								aria-labelledby="barChartToggle"
							>
								<title id="barChartToggle">Toggle Bar Chart</title>
								<path
									d="M8 5L13 10L8 15"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
					</div>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={barChartData}>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke="#E5E7EB"
							/>
							<XAxis dataKey="month" axisLine={false} tickLine={false} />
							<YAxis
								axisLine={false}
								tickLine={false}
								ticks={[0, 55, 110, 165, 220]}
							/>
							<Bar dataKey="value" fill="#334155" radius={[4, 4, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</Card>

				{/* Pie Chart */}
				<Card className="p-6 border-none bg-gray-50">
					<h3 className="text-lg font-semibold mb-1">Tingkat Kepuasan</h3>
					<p className="text-sm text-gray-600 mb-4">Tingkat kepuasan layanan</p>
					<ResponsiveContainer width="100%" height={300}>
						<PieChart>
							<Pie
								data={pieChartData}
								cx="50%"
								cy="50%"
								innerRadius={80}
								outerRadius={120}
								paddingAngle={2}
								dataKey="value"
							>
								{pieChartData.map((_entry, index) => (
									<Cell key={_entry.id} fill={COLORS[index]} />
								))}
							</Pie>
						</PieChart>
					</ResponsiveContainer>
					<div className="flex flex-wrap justify-center gap-4 mt-4">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-[#8CC63F]"></div>
							<span className="text-sm">Sangat puas (0%)</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-[#4E5BA6]"></div>
							<span className="text-sm">Puas (0%)</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-[#F4C542]"></div>
							<span className="text-sm">Cukup (0%)</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-[#E57373]"></div>
							<span className="text-sm">Kurang (0%)</span>
						</div>
					</div>
				</Card>
			</div>

			{/* Bottom Section */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Divisi Teraktif */}
				<Card className="p-6 border-none bg-gray-50">
					<div className="flex items-center gap-2 mb-6">
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							role="img"
							aria-labelledby="divisiTeraktifIcon"
						>
							<title id="divisiTeraktifIcon">Divisi Teraktif Icon</title>
							<rect
								x="3"
								y="3"
								width="7"
								height="7"
								rx="1"
								fill="currentColor"
							/>
							<rect
								x="3"
								y="14"
								width="7"
								height="7"
								rx="1"
								fill="currentColor"
							/>
							<rect
								x="14"
								y="3"
								width="7"
								height="7"
								rx="1"
								fill="currentColor"
							/>
							<rect
								x="14"
								y="14"
								width="7"
								height="7"
								rx="1"
								fill="currentColor"
							/>
						</svg>
						<h3 className="text-lg font-semibold">Divisi Teraktif</h3>
					</div>
					<div className="space-y-4">
						{divisiData.map((divisi) => (
							<div key={divisi.id}>
								<div className="flex justify-between mb-2">
									<span className="text-sm font-medium">{divisi.name}</span>
									<span className="text-sm font-semibold">
										{divisi.value} Kegiatan
									</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
									<div
										className="bg-slate-800 h-full rounded-full transition-all"
										style={{ width: `${(divisi.value / 37) * 100}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				</Card>

				{/* Kalender */}
				<Card className="p-6 border-none bg-gray-50">
					<div className="flex items-center gap-2 mb-6">
						<Calendar className="w-5 h-5" />
						<h3 className="text-lg font-semibold">
							Kalender & Kegiatan Mendatang
						</h3>
					</div>
					<div className="space-y-4">
						{eventData.map((event) => (
							<div
								key={event.id}
								className="border-l-4 border-slate-800 pl-4 py-2"
							>
								<p className="text-sm text-gray-600">{event.date}</p>
								<p className="font-medium">{event.title}</p>
							</div>
						))}
					</div>
				</Card>
			</div>

			{/* APBDes Chart */}
			<Card className="p-6 border-none bg-gray-50">
				<h3 className="text-lg font-semibold mb-6">Grafik APBDes</h3>
				<div className="space-y-2">
					<div className="flex items-center gap-4">
						<span className="text-sm font-medium w-20">Belanja</span>
						<div className="flex-1 bg-slate-800 h-8 rounded-full"></div>
					</div>
				</div>
			</Card>
		</div>
	);
}
