import { Link, useLocation } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { cn } from "./ui/utils";

interface SidebarProps {
	className?: string;
  sidebarOpened: boolean;
  closeSidebar: () => void;
}

export function DashboardSidebar({ className, sidebarOpened, closeSidebar }: SidebarProps) {
	const location = useLocation();

	// Define menu items with their paths
	const menuItems = [
		{ name: "Beranda", path: "/" },
		{ name: "Kinerja Divisi", path: "/kinerja-divisi" },
		{ name: "Pengaduan & Layanan Publik", path: "/pengaduan" },
		{ name: "Jenna Analytic", path: "/analytic" },
		{ name: "Demografi & Kependudukan", path: "/demografi" },
		{ name: "Keuangan & Anggaran", path: "/keuangan" },
		{ name: "Bumdes & UMKM Desa", path: "/bumdes" },
		{ name: "Sosial", path: "/sosial" },
		{ name: "Keamanan", path: "/keamanan" },
		{ name: "Bantuan", path: "/bantuan" },
		{ name: "Pengaturan", path: "/pengaturan" },
	];

	return (
		<div
			className={cn(
				"w-[300px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col",
				className,
			)}
		>
			{/* Logo */}
			<div className="p-6 border-b border-gray-200 dark:border-gray-700">
				<div className="flex items-center gap-2">
					<div className="bg-slate-800 dark:bg-slate-900 text-white px-3 py-2 rounded font-bold text-2xl">
						DESA
					</div>
					<div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">
						+
					</div>
				</div>
				<p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
					Digitalisasi Desa Transparansi Kerja
				</p>
			</div>

			{/* Search */}
			<div className="px-6 py-4">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
					<input
						type="text"
						placeholder="cari apa saja"
						className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-slate-200"
					/>
				</div>
			</div>

			{/* Menu Items */}
			<nav className="flex-1 px-4 overflow-y-auto">
				<div className="space-y-1">
					{menuItems.map((item, _index) => (
						<Link
							key={item.name}
							to={item.path}
							className={cn(
								"w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors block",
								location.pathname === item.path
									? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
									: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
							)}
						>
							{item.name}
						</Link>
					))}
				</div>
			</nav>
		</div>
	);
}
