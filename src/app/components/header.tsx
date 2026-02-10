import { useLocation } from "@tanstack/react-router";
import { Bell, Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";

export function Header() {
	const location = useLocation();
	const { theme, setTheme } = useTheme();

	// Define page titles based on route
	const getPageTitle = () => {
		switch (location.pathname) {
			case "/":
				return "Dashboard";
			case "/kinerja-divisi":
				return "Kinerja Divisi";
			case "/pengaduan":
				return "Pengaduan & Layanan Publik";
			case "/analytic":
				return "Jenna Analytic";
			case "/demografi":
				return "Demografi & Kependudukan";
			case "/keuangan":
				return "Keuangan & Anggaran";
			case "/bumdes":
				return "Bumdes & UMKM Desa";
			case "/sosial":
				return "Sosial";
			case "/keamanan":
				return "Keamanan";
			case "/bantuan":
				return "Bantuan";
			case "/pengaturan":
				return "Pengaturan";
			default:
				return "Dashboard";
		}
	};

	return (
		<header className="bg-slate-800 dark:bg-slate-900 text-white px-8 py-4">
			<div className="flex items-center justify-between">
				{/* Title */}
				<h1 className="text-xl font-semibold">{getPageTitle()}</h1>

				{/* Right Section */}
				<div className="flex items-center gap-6">
					{/* Dark Mode Toggle */}
					<button
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						className="p-2 rounded-full hover:bg-slate-700 dark:hover:bg-slate-700 transition-colors"
						aria-label="Toggle theme"
					>
						{theme === "dark" ? (
							<Sun className="w-5 h-5" />
						) : (
							<Moon className="w-5 h-5" />
						)}
					</button>

					{/* User Info */}
					<div className="flex items-center gap-4">
						<div className="text-right">
							<p className="text-sm font-medium">I. B. Surya Prabhawa M...</p>
							<p className="text-xs text-gray-300 dark:text-gray-400">
								Kepala Desa
							</p>
						</div>
						<div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
							<User className="w-6 h-6 text-slate-800" />
						</div>
					</div>

					{/* Divider */}
					<div className="h-12 w-px bg-gray-600 dark:bg-gray-700"></div>

					{/* Icons */}
					<div className="flex items-center gap-4">
						<button className="relative">
							<Bell className="w-5 h-5" />
							<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
								10
							</span>
						</button>
					</div>
				</div>
			</div>
		</header>
	);
}
