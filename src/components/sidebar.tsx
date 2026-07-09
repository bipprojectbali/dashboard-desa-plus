import {
	Box,
	Image,
	Input,
	NavLink as MantineNavLink,
	Stack,
} from "@mantine/core";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { useSnapshot } from "valtio";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { permissionStore } from "@/store/permission";

interface SidebarProps {
	className?: string;
}

export function Sidebar({ className }: SidebarProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const dark = useIsDark();
	const t = useTranslate();
	const isActiveBg = dark ? "#182949" : "#E6F0FF";
	const isActiveBorder = dark ? "#00398D" : "#1F41AE";

	const [query, setQuery] = useState("");
	const { allowed } = useSnapshot(permissionStore);

	const allMenuItems = [
		{ name: t.sidebar.beranda, path: "/", permission: "view-dashboard" },
		{
			name: t.sidebar.kinerjaDevisi,
			path: "/kinerja-divisi",
			permission: "view-kinerja-divisi",
		},
		{
			name: t.sidebar.pengaduanLayanan,
			path: "/pengaduan-layanan-publik",
			permission: "view-pengaduan",
		},
		{
			name: t.sidebar.analitik,
			path: "/jenna-analytic",
			permission: "view-jenna-analytic",
		},
		{
			name: t.sidebar.demografi,
			path: "/demografi-pekerjaan",
			permission: "view-demografi",
		},
		{
			name: t.sidebar.keuangan,
			path: "/keuangan-anggaran",
			permission: "view-keuangan",
		},
		{ name: t.sidebar.bumdes, path: "/bumdes", permission: "view-bumdes" },
		{ name: t.sidebar.sosial, path: "/sosial", permission: "view-sosial" },
		{
			name: t.sidebar.keamanan,
			path: "/keamanan",
			permission: "view-keamanan",
		},
	];

	// allowed === null berarti masih loading — tampilkan semua agar tidak flash kosong
	const menuItems =
		allowed === null
			? allMenuItems
			: allMenuItems.filter((item) => allowed.includes(item.permission));

	const q = query.trim().toLowerCase();

	const filteredMenu = q
		? menuItems.filter((item) => item.name.toLowerCase().includes(q))
		: menuItems;

	const navLinkStyle = (isActive: boolean) => ({
		background: isActive ? isActiveBg : "transparent",
		fontWeight: isActive ? ("bold" as const) : ("normal" as const),
		borderLeft: isActive
			? `4px solid ${isActiveBorder}`
			: "4px solid transparent",
		borderRadius: "8px",
		transition: "all 200ms ease",
		margin: "2px 0",
	});

	const navLinkStyles = {
		body: {
			"&:hover": {
				background: "#F1F5F9",
			},
		},
	};

	return (
		<Box className={className}>
			{/* Logo — fixed size regardless of color scheme */}
			<Box
				p="md"
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Image
					src={dark ? "/white-1.png" : "/light-mode.png"}
					alt="Logo"
					w={215}
					h={100}
				/>
			</Box>

			{/* Search */}
			<Box px="md" pb="md">
				<Input
					placeholder={t.sidebar.cariApaSaja}
					leftSection={<Search size={16} />}
					value={query}
					onChange={(e) => setQuery(e.currentTarget.value)}
				/>
			</Box>

			{/* Menu Items */}
			<Stack gap={0} px="xs" style={{ overflowY: "auto" }}>
				{filteredMenu.map((item) => {
					const isActive = location.pathname === item.path;
					return (
						<MantineNavLink
							key={item.path}
							onClick={() => navigate({ to: item.path })}
							label={item.name}
							active={isActive}
							variant="subtle"
							color="blue"
							style={navLinkStyle(isActive)}
							styles={navLinkStyles}
						/>
					);
				})}
			</Stack>
		</Box>
	);
}
