import {
	ActionIcon,
	Box,
	Image,
	Input,
	NavLink as MantineNavLink,
	Stack,
	Tooltip,
} from "@mantine/core";
import {
	IconBuildingStore,
	IconChartBar,
	IconCoin,
	IconHeartHandshake,
	IconHome,
	IconLayoutSidebarLeftExpand,
	IconMessageReport,
	IconShieldCheck,
	IconSparkles,
	IconUsers,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { useSnapshot } from "valtio";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { permissionStore } from "@/store/permission";

interface SidebarProps {
	className?: string;
	/** Rel ikon: hanya ikon + tooltip nama menu (panel asisten terbuka di layar sempit). */
	rail?: boolean;
	/** Dipanggil saat user memperlebar rel secara manual. */
	onWiden?: () => void;
}

const ICON_SIZE = 20;

export function Sidebar({ className, rail = false, onWiden }: SidebarProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const dark = useIsDark();
	const t = useTranslate();
	const isActiveBg = dark ? "#182949" : "#E6F0FF";
	const isActiveBorder = dark ? "#00398D" : "#1F41AE";

	const [query, setQuery] = useState("");
	const { allowed } = useSnapshot(permissionStore);

	const allMenuItems = [
		{
			name: t.sidebar.beranda,
			path: "/",
			permission: "view-dashboard",
			icon: IconHome,
		},
		{
			name: t.sidebar.kinerjaDevisi,
			path: "/kinerja-divisi",
			permission: "view-kinerja-divisi",
			icon: IconChartBar,
		},
		{
			name: t.sidebar.pengaduanLayanan,
			path: "/pengaduan-layanan-publik",
			permission: "view-pengaduan",
			icon: IconMessageReport,
		},
		{
			name: t.sidebar.analitik,
			path: "/jenna-analytic",
			permission: "view-jenna-analytic",
			icon: IconSparkles,
		},
		{
			name: t.sidebar.demografi,
			path: "/demografi-pekerjaan",
			permission: "view-demografi",
			icon: IconUsers,
		},
		{
			name: t.sidebar.keuangan,
			path: "/keuangan-anggaran",
			permission: "view-keuangan",
			icon: IconCoin,
		},
		{
			name: t.sidebar.bumdes,
			path: "/bumdes",
			permission: "view-bumdes",
			icon: IconBuildingStore,
		},
		{
			name: t.sidebar.sosial,
			path: "/sosial",
			permission: "view-sosial",
			icon: IconHeartHandshake,
		},
		{
			name: t.sidebar.keamanan,
			path: "/keamanan",
			permission: "view-keamanan",
			icon: IconShieldCheck,
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

	const railLinkStyles = {
		root: { justifyContent: "center", paddingInline: 0 },
		section: { margin: 0 },
		body: { display: "none" },
	};

	const renderLink = (item: (typeof allMenuItems)[number]) => {
		const isActive = location.pathname === item.path;
		const Icon = item.icon;
		const link = (
			<MantineNavLink
				key={item.path}
				onClick={() => navigate({ to: item.path })}
				label={rail ? undefined : item.name}
				aria-label={item.name}
				leftSection={<Icon size={ICON_SIZE} stroke={1.8} />}
				active={isActive}
				variant="subtle"
				color="blue"
				style={navLinkStyle(isActive)}
				styles={rail ? railLinkStyles : navLinkStyles}
			/>
		);
		if (!rail) return link;
		return (
			<Tooltip key={item.path} label={item.name} position="right" withArrow>
				{link}
			</Tooltip>
		);
	};

	if (rail) {
		return (
			<Stack gap={0} className={className} data-sidebar-rail="true">
				{menuItems.map(renderLink)}
				{onWiden && (
					<Tooltip label={t.sidebar.perlebarMenu} position="right" withArrow>
						<ActionIcon
							variant="subtle"
							color="gray"
							size="lg"
							mt="sm"
							mx="auto"
							aria-label={t.sidebar.perlebarMenu}
							onClick={onWiden}
						>
							<IconLayoutSidebarLeftExpand size={ICON_SIZE} />
						</ActionIcon>
					</Tooltip>
				)}
			</Stack>
		);
	}

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
				{filteredMenu.map(renderLink)}
			</Stack>
		</Box>
	);
}
