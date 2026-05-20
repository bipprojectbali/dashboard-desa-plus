import {
	Box,
	Collapse,
	Image,
	Input,
	NavLink as MantineNavLink,
	Stack,
	useMantineColorScheme,
} from "@mantine/core";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useState } from "react";
import { useSnapshot } from "valtio";
import { useTranslate } from "@/hooks/useTranslate";
import { authStore } from "@/store/auth";

interface SidebarProps {
	className?: string;
}

export function Sidebar({ className }: SidebarProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const { colorScheme } = useMantineColorScheme();
	const t = useTranslate();
	const dark = colorScheme === "dark";
	const isActiveBg = colorScheme === "dark" ? "#182949" : "#E6F0FF";
	const isActiveBorder = colorScheme === "dark" ? "#00398D" : "#1F41AE";

	const snap = useSnapshot(authStore);
	const isAdmin = snap.user?.role === "admin";

	const [settingsOpen, setSettingsOpen] = useState(
		location.pathname.startsWith("/pengaturan"),
	);
	const [query, setQuery] = useState("");

	const menuItems = [
		{ name: t.sidebar.beranda, path: "/" },
		{ name: t.sidebar.kinerjaDevisi, path: "/kinerja-divisi" },
		{ name: t.sidebar.pengaduanLayanan, path: "/pengaduan-layanan-publik" },
		{ name: t.sidebar.analitik, path: "/jenna-analytic" },
		{ name: t.sidebar.demografi, path: "/demografi-pekerjaan" },
		{ name: t.sidebar.keuangan, path: "/keuangan-anggaran" },
		{ name: t.sidebar.bumdes, path: "/bumdes" },
		{ name: t.sidebar.sosial, path: "/sosial" },
		{ name: t.sidebar.keamanan, path: "/keamanan" },
		{ name: t.sidebar.bantuan, path: "/bantuan" },
	];

	const settingsItems = [
		{ name: t.sidebar.settingsUmum, path: "/pengaturan/umum" },
		{ name: t.sidebar.settingsNotifikasi, path: "/pengaturan/notifikasi" },
		...(isAdmin
			? [
					{ name: t.sidebar.settingsKeamanan, path: "/pengaturan/keamanan" },
					{
						name: t.sidebar.settingsAksesTim,
						path: "/pengaturan/akses-dan-tim",
					},
					{
						name: t.sidebar.settingsSinkronisasi,
						path: "/pengaturan/sinkronisasi",
					},
				]
			: []),
	];

	const q = query.trim().toLowerCase();

	const filteredMenu = q
		? menuItems.filter((item) => item.name.toLowerCase().includes(q))
		: menuItems;

	const filteredSettings = q
		? settingsItems.filter((item) => item.name.toLowerCase().includes(q))
		: settingsItems;

	// When searching, auto-open settings collapse if there are setting results
	const showSettings = q ? filteredSettings.length > 0 : true;
	const settingsCollapseOpen = q ? filteredSettings.length > 0 : settingsOpen;

	const isSettingsActive = settingsItems.some(
		(item) => location.pathname === item.path,
	);

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

				{/* Settings with submenu */}
				{showSettings && (
					<Box>
						{!q && (
							<MantineNavLink
								onClick={() => setSettingsOpen(!settingsOpen)}
								rightSection={
									settingsOpen ? (
										<ChevronUp size={16} />
									) : (
										<ChevronDown size={16} />
									)
								}
								label={t.sidebar.pengaturan}
								active={isSettingsActive}
								variant="subtle"
								color="blue"
								style={navLinkStyle(isSettingsActive)}
								styles={navLinkStyles}
							/>
						)}
						<Collapse in={settingsCollapseOpen}>
							<Stack
								gap={0}
								ml={q ? 0 : "lg"}
								style={{ overflowY: "auto", maxHeight: "200px" }}
							>
								{filteredSettings.map((item) => {
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
						</Collapse>
					</Box>
				)}
			</Stack>
		</Box>
	);
}
