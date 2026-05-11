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
import { useTranslate } from "@/hooks/useTranslate";

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

	const [settingsOpen, setSettingsOpen] = useState(
		location.pathname.startsWith("/pengaturan"),
	);

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
		{ name: t.sidebar.settingsKeamanan, path: "/pengaturan/keamanan" },
		{ name: t.sidebar.settingsAksesTim, path: "/pengaturan/akses-dan-tim" },
		{ name: t.sidebar.settingsSinkronisasi, path: "/pengaturan/sinkronisasi" },
	];

	const isSettingsActive = settingsItems.some(
		(item) => location.pathname === item.path,
	);

	return (
		<Box className={className}>
			{/* Logo */}
			<Image src={dark ? "/white.png" : "/light-mode.png"} alt="Logo" />

			{/* Search */}
			<Box p="md">
				<Input
					placeholder={t.sidebar.cariApaSaja}
					leftSection={<Search size={16} />}
					styles={{
						input: {
							"&::placeholder": {
								color: dark ? "#F1F5F9" : "#263852ff",
							},
						},
					}}
				/>
			</Box>

			{/* Menu Items */}
			<Stack gap={0} px="xs" style={{ overflowY: "auto" }}>
				{menuItems.map((item) => {
					const isActive = location.pathname === item.path;
					return (
						<MantineNavLink
							key={item.path}
							onClick={() => navigate({ to: item.path })}
							label={item.name}
							active={isActive}
							variant="subtle"
							color="blue"
							style={{
								background: isActive ? isActiveBg : "transparent",
								fontWeight: isActive ? "bold" : "normal",
								borderLeft: isActive
									? `4px solid ${isActiveBorder}`
									: "4px solid transparent",
								borderRadius: "8px",
								transition: "all 200ms ease",
								margin: "2px 0",
							}}
							styles={{
								body: {
									"&:hover": {
										background: "#F1F5F9",
									},
								},
							}}
						/>
					);
				})}

				{/* Settings with submenu */}
				<Box>
					<MantineNavLink
						onClick={() => setSettingsOpen(!settingsOpen)}
						rightSection={
							settingsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />
						}
						label={t.sidebar.pengaturan}
						active={isSettingsActive}
						variant="subtle"
						color="blue"
						style={{
							background: isSettingsActive ? isActiveBg : "transparent",
							fontWeight: isSettingsActive ? "bold" : "normal",
							borderLeft: isSettingsActive
								? `4px solid ${isActiveBorder}`
								: "4px solid transparent",
							borderRadius: "8px",
							transition: "all 200ms ease",
							margin: "2px 0",
						}}
						styles={{
							body: {
								"&:hover": {
									background: "#F1F5F9",
								},
							},
						}}
					/>
					<Collapse in={settingsOpen}>
						<Stack
							gap={0}
							ml="lg"
							style={{ overflowY: "auto", maxHeight: "200px" }}
						>
							{settingsItems.map((item) => {
								const isActive = location.pathname === item.path;
								return (
									<MantineNavLink
										key={item.path}
										onClick={() => navigate({ to: item.path })}
										label={item.name}
										active={isActive}
										variant="subtle"
										color="blue"
										style={{
											background: isActive ? isActiveBg : "transparent",
											fontWeight: isActive ? "bold" : "normal",
											borderLeft: isActive
												? `4px solid ${isActiveBorder}`
												: "4px solid transparent",
											borderRadius: "8px",
											transition: "all 200ms ease",
											margin: "2px 0",
										}}
										styles={{
											body: {
												"&:hover": {
													background: "#F1F5F9",
												},
											},
										}}
									/>
								);
							})}
						</Stack>
					</Collapse>
				</Box>
			</Stack>
		</Box>
	);
}
