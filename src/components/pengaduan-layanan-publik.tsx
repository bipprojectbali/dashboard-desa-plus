import type React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const PengaduanLayananPublik = () => {
	const [activeTab, setActiveTab] = useState<"complaints" | "services">(
		"complaints",
	);
	const [newComplaint, setNewComplaint] = useState({
		title: "",
		category: "",
		description: "",
	});

	// Sample data for complaints
	const complaints = [
		{
			id: 1,
			title: "Jalan Rusak di Jalan Raya",
			category: "Infrastruktur",
			status: "Pending",
			priority: "High",
			date: "2024-02-01",
			reporter: "Bapak Ahmad",
		},
		{
			id: 2,
			title: "Pemadaman Listrik Berkelanjutan",
			category: "Utilitas",
			status: "In Progress",
			priority: "Medium",
			date: "2024-02-03",
			reporter: "Ibu Sari",
		},
		{
			id: 3,
			title: "Pelayanan Administrasi Lambat",
			category: "Administrasi",
			status: "Resolved",
			priority: "Low",
			date: "2024-01-28",
			reporter: "Pak Joko",
		},
		{
			id: 4,
			title: "Kebersihan Lingkungan",
			category: "Sanitasi",
			status: "Pending",
			priority: "Medium",
			date: "2024-02-05",
			reporter: "Bu Dewi",
		},
	];

	// Sample data for public services
	const services = [
		{
			id: 1,
			name: "Pembuatan KTP",
			description:
				"Pelayanan pembuatan Kartu Tanda Penduduk baru atau perpanjangan",
			status: "Available",
			category: "Administrasi",
			lastUpdated: "2024-02-01",
		},
		{
			id: 2,
			name: "Pembuatan Surat Keterangan Usaha",
			description: "Surat keterangan untuk keperluan usaha atau perizinan",
			status: "Available",
			category: "Administrasi",
			lastUpdated: "2024-02-02",
		},
		{
			id: 3,
			name: "Pelayanan Kesehatan",
			description: "Pelayanan kesehatan dasar di puskesmas desa",
			status: "Available",
			category: "Kesehatan",
			lastUpdated: "2024-01-30",
		},
		{
			id: 4,
			name: "Program Bantuan Sosial",
			description:
				"Informasi dan pendaftaran program bantuan sosial dari pemerintah",
			status: "Limited",
			category: "Sosial",
			lastUpdated: "2024-02-04",
		},
	];

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setNewComplaint((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSelectChange = (value: string | null) => {
		setNewComplaint((prev) => ({
			...prev,
			category: value || "", // Ensure category is always a string
		}));
	};

	const handleSubmitComplaint = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Submitting complaint:", newComplaint);
		// Here you would typically send the complaint to your backend
		alert("Pengaduan berhasil dikirim!");
		setNewComplaint({ title: "", category: "", description: "" });
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
					Pengaduan & Layanan Publik
				</h1>
				<div className="flex space-x-4">
					<Button
						variant={activeTab === "complaints" ? "default" : "outline"}
						onClick={() => setActiveTab("complaints")}
						className="dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
					>
						Pengaduan
					</Button>
					<Button
						variant={activeTab === "services" ? "default" : "outline"}
						onClick={() => setActiveTab("services")}
						className="dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
					>
						Layanan Publik
					</Button>
				</div>
			</div>

			{activeTab === "complaints" ? (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Complaint Submission Form */}
					<div className="lg:col-span-1">
						<Card className="dark:bg-gray-800 dark:border-gray-700">
							<CardHeader>
								<CardTitle className="dark:text-white">
									Ajukan Pengaduan
								</CardTitle>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmitComplaint} className="space-y-4">
									<div>
										<label
											htmlFor="title"
											className="block text-sm font-medium mb-1 dark:text-gray-300"
										>
											Judul Pengaduan
										</label>
										<Input
											id="title"
											name="title"
											value={newComplaint.title}
											onChange={handleInputChange}
											placeholder="Masukkan judul pengaduan"
											className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
											required
										/>
									</div>

									<div>
										<label
											htmlFor="category"
											className="block text-sm font-medium mb-1 dark:text-gray-300"
										>
											Kategori
										</label>
										<Select
											id="category"
											name="category"
											value={newComplaint.category}
											onChange={handleSelectChange}
											placeholder="Pilih kategori"
											data={[
												{ value: "infrastruktur", label: "Infrastruktur" },
												{ value: "administrasi", label: "Administrasi" },
												{ value: "utilitas", label: "Utilitas" },
												{ value: "sanitasi", label: "Sanitasi" },
												{ value: "kesehatan", label: "Kesehatan" },
												{ value: "pendidikan", label: "Pendidikan" },
											]}
											className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
											clearable
										/>
									</div>

									<div>
										<label
											htmlFor="description"
											className="block text-sm font-medium mb-1 dark:text-gray-300"
										>
											Deskripsi
										</label>
										<Textarea
											id="description"
											name="description"
											value={newComplaint.description}
											onChange={handleInputChange}
											placeholder="Jelaskan pengaduan Anda secara detail..."
											rows={4}
											className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
											required
										/>
									</div>

									<Button
										type="submit"
										className="w-full dark:bg-blue-600 dark:hover:bg-blue-700"
									>
										Kirim Pengaduan
									</Button>
								</form>
							</CardContent>
						</Card>
					</div>

					{/* Complaints List */}
					<div className="lg:col-span-2">
						<Card className="dark:bg-gray-800 dark:border-gray-700">
							<CardHeader>
								<CardTitle className="dark:text-white">
									Daftar Pengaduan
								</CardTitle>
							</CardHeader>
							<CardContent>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="dark:text-gray-300">
												Judul
											</TableHead>
											<TableHead className="dark:text-gray-300">
												Kategori
											</TableHead>
											<TableHead className="dark:text-gray-300">
												Status
											</TableHead>
											<TableHead className="dark:text-gray-300">
												Prioritas
											</TableHead>
											<TableHead className="dark:text-gray-300">
												Tanggal
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{complaints.map((complaint) => (
											<TableRow key={complaint.id}>
												<TableCell className="font-medium dark:text-white">
													{complaint.title}
												</TableCell>
												<TableCell className="dark:text-gray-300">
													{complaint.category}
												</TableCell>
												<TableCell>
													<Badge
														variant={
															complaint.status === "Resolved"
																? "success"
																: complaint.status === "In Progress"
																	? "secondary"
																	: "destructive"
														}
													>
														{complaint.status}
													</Badge>
												</TableCell>
												<TableCell>
													<Badge
														variant={
															complaint.priority === "High"
																? "destructive"
																: complaint.priority === "Medium"
																	? "secondary"
																	: "default"
														}
													>
														{complaint.priority}
													</Badge>
												</TableCell>
												<TableCell className="dark:text-gray-300">
													{complaint.date}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					</div>
				</div>
			) : (
				<div>
					<Card className="dark:bg-gray-800 dark:border-gray-700">
						<CardHeader>
							<CardTitle className="dark:text-white">
								Layanan Publik Tersedia
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{services.map((service) => (
									<Card
										key={service.id}
										className="dark:bg-gray-700 dark:border-gray-600"
									>
										<CardHeader>
											<CardTitle className="text-lg dark:text-white">
												{service.name}
											</CardTitle>
										</CardHeader>
										<CardContent>
											<p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
												{service.description}
											</p>
											<div className="flex justify-between items-center">
												<Badge
													variant={
														service.status === "Available"
															? "success"
															: service.status === "Limited"
																? "secondary"
																: "destructive"
													}
												>
													{service.status}
												</Badge>
												<span className="text-xs text-gray-500 dark:text-gray-400">
													{service.category}
												</span>
											</div>
											<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
												Terakhir diperbarui: {service.lastUpdated}
											</p>
										</CardContent>
									</Card>
								))}
							</div>
						</CardContent>
					</Card>

					<Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
						<CardHeader>
							<CardTitle className="dark:text-white">
								Statistik Layanan
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
									<h3 className="text-lg font-semibold dark:text-white">
										Jumlah Layanan Tersedia
									</h3>
									<p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
										12
									</p>
								</div>
								<div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
									<h3 className="text-lg font-semibold dark:text-white">
										Layanan Terpopuler
									</h3>
									<p className="text-3xl font-bold text-green-600 dark:text-green-400">
										4
									</p>
								</div>
								<div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
									<h3 className="text-lg font-semibold dark:text-white">
										Permintaan Baru
									</h3>
									<p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
										23
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
};

export default PengaduanLayananPublik;
