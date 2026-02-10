
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button"; // Correct import for Button
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/app/components/ui/table";

const KinerjaDivisi = () => {
	// Sample data for division performance
	const divisions = [
		{
			id: 1,
			name: "Divisi Teknologi",
			target: 95,
			achievement: 87,
			status: "On Track",
			projects: 12,
			budget: "Rp 2.5M",
			lastUpdate: "2 days ago",
		},
		{
			id: 2,
			name: "Divisi Keuangan",
			target: 90,
			achievement: 92,
			status: "Above Target",
			projects: 8,
			budget: "Rp 1.8M",
			lastUpdate: "1 day ago",
		},
		{
			id: 3,
			name: "Divisi SDM",
			target: 85,
			achievement: 78,
			status: "Needs Attention",
			projects: 6,
			budget: "Rp 1.2M",
			lastUpdate: "3 days ago",
		},
		{
			id: 4,
			name: "Divisi Operasional",
			target: 92,
			achievement: 89,
			status: "On Track",
			projects: 15,
			budget: "Rp 3.2M",
			lastUpdate: "5 hours ago",
		},
		{
			id: 5,
			name: "Divisi Pemasaran",
			target: 88,
			achievement: 91,
			status: "Above Target",
			projects: 10,
			budget: "Rp 2.1M",
			lastUpdate: "1 day ago",
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
					Kinerja Divisi
				</h1>
				<div className="flex space-x-4">
					<Button variant="default">Export Data</Button>
					<Button variant="outline">Filter</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Divisi</CardTitle>
						<div className="h-6 w-6 text-muted-foreground">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								className="h-6 w-6"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
								/>
							</svg>
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">5</div>
						<p className="text-xs text-muted-foreground">Jumlah divisi aktif</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Rata-rata Pencapaian
						</CardTitle>
						<div className="h-6 w-6 text-muted-foreground">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								className="h-6 w-6"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">87.4%</div>
						<p className="text-xs text-muted-foreground">Target tercapai</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Divisi Melebihi Target
						</CardTitle>
						<div className="h-6 w-6 text-muted-foreground">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								className="h-6 w-6"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
								/>
							</svg>
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">2</div>
						<p className="text-xs text-muted-foreground">Dari total 5 divisi</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Detail Kinerja Divisi</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nama Divisi</TableHead>
								<TableHead>Target (%)</TableHead>
								<TableHead>Pencapaian (%)</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Proyek Aktif</TableHead>
								<TableHead>Anggaran</TableHead>
								<TableHead>Terakhir Diperbarui</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{divisions.map((division) => (
								<TableRow key={division.id}>
									<TableCell className="font-medium dark:text-white">
										{division.name}
									</TableCell>
									<TableCell className="dark:text-white">
										{division.target}%
									</TableCell>
									<TableCell className="dark:text-white">
										{division.achievement}%
									</TableCell>
									<TableCell>
										<div className="flex items-center">
											<Progress
												value={division.achievement}
												max={100}
												className="w-24 mr-2"
											/>
											<Badge
												variant={
													division.status === "Above Target"
														? "success"
														: division.status === "On Track"
															? "secondary"
															: "destructive"
												}
											>
												{division.status}
											</Badge>
										</div>
									</TableCell>
									<TableCell className="dark:text-white">
										{division.projects}
									</TableCell>
									<TableCell className="dark:text-white">
										{division.budget}
									</TableCell>
									<TableCell className="dark:text-white">
										{division.lastUpdate}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Grafik Pencapaian Divisi</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
							<p className="text-gray-500 dark:text-gray-300">
								Grafik pencapaian akan ditampilkan di sini
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Distribusi Anggaran Divisi</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
							<p className="text-gray-500 dark:text-gray-300">
								Diagram distribusi anggaran akan ditampilkan di sini
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default KinerjaDivisi;
