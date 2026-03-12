import {
	IconAward,
	IconBabyCarriage,
	IconCalendarEvent,
	IconHeartbeat,
	IconMedicalCross,
	IconSchool,
	IconStethoscope,
	IconUsers,
} from "@tabler/icons-react";
import { useMantineColorScheme, Title } from "@mantine/core";

const SosialPage = () => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	// Health statistics data
	const healthStats = [
		{
			title: "Ibu Hamil Aktif",
			value: "87",
			subtitle: "Aktif",
			icon: IconHeartbeat,
		},
		{
			title: "Balita Terdaftar",
			value: "342",
			subtitle: "Terdaftar",
			icon: IconBabyCarriage,
		},
		{
			title: "Alert Stunting",
			value: "12",
			subtitle: "Perlu perhatian",
			icon: IconStethoscope,
			alert: true,
		},
		{
			title: "Posyandu Aktif",
			value: "8",
			subtitle: "Beroperasi",
			icon: IconMedicalCross,
		},
	];

	// Health progress data
	const healthProgress = [
		{ label: "Imunisasi Lengkap", value: 92 },
		{ label: "Pemeriksaan Rutin", value: 88 },
		{ label: "Gizi Baik", value: 86 },
		{ label: "Target Stunting", value: 14, isAlert: true },
	];

	// Posyandu schedule data
	const posyanduSchedule = [
		{
			nama: "Posyandu Barat",
			tanggal: "5 Oktober 2025",
			jam: "08:00 - 11:00",
		},
		{
			nama: "Posyandu Timur",
			tanggal: "6 Oktober 2025",
			jam: "08:00 - 11:00",
		},
		{
			nama: "Posyandu Utara",
			tanggal: "7 Oktober 2025",
			jam: "08:00 - 11:00",
		},
		{
			nama: "Posyandu Selatan",
			tanggal: "8 Oktober 2025",
			jam: "08:00 - 11:00",
		},
	];

	// Education stats data
	const educationStats = [
		{ level: "TK / PAUD", value: "500" },
		{ level: "Siswa SD", value: "458" },
		{ level: "Siswa SMP", value: "234" },
		{ level: "Siswa SMA", value: "189" },
	];

	// School info data
	const schoolInfo = [
		{ label: "Lembaga Pendidikan", value: "10" },
		{ label: "Tenaga Pengajar", value: "3" },
	];

	// Scholarship data
	const scholarshipData = {
		penerima: "250+",
		dana: "1.5M",
		tahunAjaran: "2025/2026",
	};

	// Cultural events data
	const culturalEvents = [
		{
			nama: "Lomba Baris Berbaris",
			tanggal: "1 Desember 2025",
			lokasi: "Lapangan Desa",
		},
		{
			nama: "Lomba Tari Tradisional",
			tanggal: "10 Desember 2025",
			lokasi: "Banjar Desa",
		},
		{
			nama: "Davoz",
			tanggal: "20 Desember 2025",
			lokasi: "Kantor Desa",
		},
	];

	return (
		<div
			className={`min-h-screen py-6 px-4 sm:px-6 lg:px-8 ${
				dark ? "bg-slate-900" : "bg-gray-100"
			}`}
		>
			<div className="max-w-7xl mx-auto w-full">
				{/* Row 1: Top 4 Metrics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
					{healthStats.map((stat, index) => (
						<div
							key={index}
							className={`rounded-xl shadow-sm p-6 ${
								dark ? "bg-slate-800 border border-slate-800" : "bg-white border border-white"
							}`}
						>
							<div className="flex items-center justify-between">
								<div className="flex-1">
									<h3
										className={`text-sm font-medium mb-1 ${
											dark ? "text-gray-400" : "text-gray-500"
										}`}
									>
										{stat.title}
									</h3>
									<p
										className={`text-3xl font-bold mb-1 ${
											stat.alert
												? "text-red-500"
												: dark
												? "text-white"
												: "text-gray-800"
										}`}
									>
										{stat.value}
									</p>
									<p
										className={`text-xs ${
											dark ? "text-gray-400" : "text-gray-500"
										}`}
									>
										{stat.subtitle}
									</p>
								</div>
								<div className="flex-shrink-0 ml-4">
									<div
										className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
											stat.alert ? "bg-red-500" : "bg-blue-900"
										}`}
									>
										<stat.icon size={24} />
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Row 2: Statistik Kesehatan */}
				<div
					className={`rounded-xl shadow-sm p-6 mb-6 ${
						dark ? "bg-slate-800 border border-slate-800" : "bg-white border border-white"
					}`}
				>
					<h3
						className={`text-lg font-semibold mb-6 ${
							dark ? "text-white" : "text-gray-800"
						}`}
					>
						Statistik Kesehatan
					</h3>
					<div className="space-y-4">
						{healthProgress.map((item, index) => (
							<div key={index}>
								<div className="flex items-center justify-between mb-2">
									<span
										className={`text-sm font-medium ${
											dark ? "text-white" : "text-gray-800"
										}`}
									>
										{item.label}
									</span>
									<span
										className={`text-sm font-semibold ${
											item.isAlert
												? "text-red-500"
												: dark
												? "text-white"
												: "text-gray-800"
										}`}
									>
										{item.value}%
									</span>
								</div>
								<div
									className={`w-full rounded-full h-2 ${
										dark ? "bg-slate-700" : "bg-gray-200"
									}`}
								>
									<div
										className={`h-2 rounded-full transition-all ${
											item.isAlert ? "bg-red-500" : "bg-blue-900"
										}`}
										style={{ width: `${item.value}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Row 3: Jadwal Posyandu & Pendidikan */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					{/* Jadwal Posyandu */}
					<div
						className={`rounded-xl shadow-sm p-6 ${
							dark ? "bg-slate-800 border border-slate-800" : "bg-white border border-white"
						}`}
					>
						<h3
							className={`text-lg font-semibold mb-4 ${
								dark ? "text-white" : "text-gray-800"
							}`}
						>
							Jadwal Posyandu
						</h3>
						<div className="space-y-3">
							{posyanduSchedule.map((item, index) => (
								<div
									key={index}
									className={`p-4 rounded-lg ${
										dark ? "bg-slate-700" : "bg-gray-50"
									}`}
								>
									<div className="flex items-center justify-between">
										<div>
											<p
												className={`text-sm font-medium ${
													dark ? "text-white" : "text-gray-800"
												}`}
											>
												{item.nama}
											</p>
											<p
												className={`text-xs mt-1 ${
													dark ? "text-gray-400" : "text-gray-500"
												}`}
											>
												{item.tanggal}
											</p>
										</div>
										<span
											className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-900"
										>
											{item.jam}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Pendidikan Section */}
					<div
						className={`rounded-xl shadow-sm p-6 ${
							dark ? "bg-slate-800 border border-slate-800" : "bg-white border border-white"
						}`}
					>
						<h3
							className={`text-lg font-semibold mb-4 ${
								dark ? "text-white" : "text-gray-800"
							}`}
						>
							Pendidikan
						</h3>
						<div className="space-y-3 mb-6">
							{educationStats.map((item, index) => (
								<div
									key={index}
									className={`flex items-center justify-between py-2 ${
										dark ? "border-b border-slate-700" : "border-b border-gray-100"
									}`}
								>
									<span className="text-sm" style={{ color: dark ? "#9CA3AF" : "#6B7280" }}>
										{item.level}
									</span>
									<span
										className={`text-sm font-semibold ${
											dark ? "text-white" : "text-gray-800"
										}`}
									>
										{item.value}
									</span>
								</div>
							))}
						</div>

						{/* Info Sekolah */}
						<h4
							className={`text-base font-semibold mb-4 ${
								dark ? "text-white" : "text-gray-800"
							}`}
						>
							Info Sekolah
						</h4>
						<div className="space-y-3">
							{schoolInfo.map((item, index) => (
								<div
									key={index}
									className={`flex items-center justify-between py-3 px-4 rounded-lg ${
										dark ? "bg-slate-700" : "bg-gray-50"
									}`}
								>
									<span className="text-sm" style={{ color: dark ? "#9CA3AF" : "#6B7280" }}>
										{item.label}
									</span>
									<span
										className={`text-lg font-bold ${
											dark ? "text-white" : "text-gray-800"
										}`}
									>
										{item.value}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Row 4: Beasiswa Desa & Kalender Event Budaya */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Beasiswa Desa */}
					<div
						className={`rounded-xl shadow-sm p-6 ${
							dark ? "bg-slate-800 border border-slate-800" : "bg-white border border-white"
						}`}
					>
						<div className="flex items-center justify-between mb-6">
							<h3
								className={`text-lg font-semibold ${
									dark ? "text-white" : "text-gray-800"
								}`}
							>
								Beasiswa Desa
							</h3>
							<div
								className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-green-500"
							>
								<IconAward size={24} />
							</div>
						</div>

						{/* Two centered metrics */}
						<div className="grid grid-cols-2 gap-4 mb-6">
							<div
								className={`p-4 rounded-lg text-center ${
									dark ? "bg-slate-700" : "bg-gray-50"
								}`}
							>
								<p
									className={`text-3xl font-bold mb-1 ${
										dark ? "text-white" : "text-gray-800"
									}`}
								>
									{scholarshipData.penerima}
								</p>
								<p
									className={`text-xs ${
										dark ? "text-gray-400" : "text-gray-500"
									}`}
								>
									Penerima Beasiswa
								</p>
							</div>
							<div
								className={`p-4 rounded-lg text-center ${
									dark ? "bg-slate-700" : "bg-gray-50"
								}`}
							>
								<p
									className={`text-3xl font-bold mb-1 text-green-500`}
								>
									{scholarshipData.dana}
								</p>
								<p
									className={`text-xs ${
										dark ? "text-gray-400" : "text-gray-500"
									}`}
								>
									Dana Tersalurkan
								</p>
							</div>
						</div>

						{/* Footer text */}
						<p
							className={`text-center text-sm ${
								dark ? "text-gray-400" : "text-gray-500"
							}`}
						>
							Tahun Ajaran {scholarshipData.tahunAjaran}
						</p>
					</div>

		{/* Kalender Event Budaya */}
<div
	className={`rounded-xl shadow-sm p-6 ${
		dark ? "bg-slate-800 border border-slate-800" : "bg-white border border-white"
	}`}
>
	<Title order={3} mb="md" c={dark ? "dark.0" : "black"}>
		Kalender Event Budaya
	</Title>

	<div className="space-y-4">
		{culturalEvents.map((event, index) => (
								<div
									key={index}
									className={`flex items-start gap-3 p-4 rounded-lg ${
										dark ? "bg-slate-700" : "bg-gray-50"
									}`}
								>
									<div
										className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-900"
									>
										<IconCalendarEvent size={20} />
									</div>
									<div className="flex-1">
										<p
											className={`text-sm font-medium ${
												dark ? "text-white" : "text-gray-800"
											}`}
										>
											{event.nama}
										</p>
										<p
											className={`text-xs mt-1 ${
												dark ? "text-gray-400" : "text-gray-500"
											}`}
										>
											{event.tanggal}
										</p>
										<p
											className={`text-xs mt-1 ${
												dark ? "text-gray-400" : "text-gray-500"
											}`}
										>
											Location: {event.lokasi}
										</p>
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

export default SosialPage;
