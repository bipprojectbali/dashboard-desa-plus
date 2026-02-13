import { useNavigate, useLocation } from "@tanstack/react-router";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import {
	Stack,
	Group,
	Text,
	Badge,
	Input,
	NavLink as MantineNavLink,
	Box,
	useMantineColorScheme,
	Collapse,
} from "@mantine/core";
import { useState } from "react";

interface SidebarProps {
	className?: string;
}

export function Sidebar({ className }: SidebarProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const { colorScheme } = useMantineColorScheme();
	const isActiveBg = colorScheme === 'dark' ? "#182949" : "#E6F0FF";
	const isActiveBorder = colorScheme === 'dark' ? "#00398D" : "#1F41AE";
	
	// State for settings submenu collapse
	const [settingsOpen, setSettingsOpen] = useState(
		location.pathname.startsWith('/dashboard/pengaturan')
	);

	// Define menu items with their paths
	const menuItems = [
		{ name: "Beranda", path: "/dashboard" },
		{ name: "Kinerja Divisi", path: "/dashboard/kinerja-divisi" },
		{ name: "Pengaduan & Layanan Publik", path: "/dashboard/pengaduan-layanan-publik" },
		{ name: "Jenna Analytic", path: "/dashboard/jenna-analytic" },
		{ name: "Demografi & Kependudukan", path: "/dashboard/demografi-pekerjaan" },
		{ name: "Keuangan & Anggaran", path: "/dashboard/keuangan-anggaran" },
		{ name: "Bumdes & UMKM Desa", path: "/dashboard/bumdes" },
		{ name: "Sosial", path: "/dashboard/sosial" },
		{ name: "Keamanan", path: "/dashboard/keamanan" },
		{ name: "Bantuan", path: "/dashboard/bantuan" },
	];

	// Settings submenu items
	const settingsItems = [
		{ name: "Umum", path: "/dashboard/pengaturan/umum" },
		{ name: "Notifikasi", path: "/dashboard/pengaturan/notifikasi" },
		{ name: "Keamanan", path: "/dashboard/pengaturan/keamanan" },
		{ name: "Akses & Tim", path: "/dashboard/pengaturan/akses-dan-tim" },
	];

	// Check if any settings submenu is active
	const isSettingsActive = settingsItems.some(item => 
		location.pathname === item.path
	);

	return (
		<Box className={className}>
			{/* Logo */}
			<Box p="md" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
				<Group gap="xs">
					<Badge
						color="dark"
						variant="filled"
						size="xl"
						radius="md"
						py="xs"
						px="md"
						style={{ fontSize: "1.5rem", fontWeight: "bold" }}
					>
						DESA
					</Badge>
					<Badge color="green" variant="filled" size="md" radius="md">
						+
					</Badge>
				</Group>
				<Text size="xs" c="dimmed" mt="xs">
					Digitalisasi Desa Transparansi Kerja
				</Text>
			</Box>

			{/* Search */}
			<Box p="md">
				<Input
					placeholder="cari apa saja"
					leftSection={<Search size={16} />}
					styles={{
						input: {
							"&::placeholder": {
								color: "var(--mantine-color-gray-5)",
							},
						},
					}}
				/>
			</Box>

			{/* Menu Items */}
			<Stack gap={0} px="xs" style={{ overflowY: "auto" }}>
				{menuItems.map((item, index) => {
					const isActive = location.pathname === item.path;
					return (
						<MantineNavLink
							key={index}
							onClick={() => navigate({ to: item.path })}
							label={item.name}
							active={isActive}
							variant="subtle"
							color="blue"
							style={{
								background: isActive ? isActiveBg : "transparent",
								fontWeight: isActive ? "bold" : "normal",
								borderLeft: isActive ? `4px solid ${isActiveBorder}` : "4px solid transparent",
								borderRadius: "8px",
								transition: "all 200ms ease",
								margin: "2px 0",
							}}
							styles={{
								body: {
									"&:hover": {
										background: "#F1F5F9",
									}
								}
							}}
						/>
					);
				})}

				{/* Settings with submenu */}
				<Box>
					<MantineNavLink
						onClick={() => setSettingsOpen(!settingsOpen)}
						rightSection={settingsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
						label="Pengaturan"
						active={isSettingsActive}
						variant="subtle"
						color="blue"
						style={{
							background: isSettingsActive ? isActiveBg : "transparent",
							fontWeight: isSettingsActive ? "bold" : "normal",
							borderLeft: isSettingsActive ? `4px solid ${isActiveBorder}` : "4px solid transparent",
							borderRadius: "8px",
							transition: "all 200ms ease",
							margin: "2px 0",
						}}
						styles={{
							body: {
								"&:hover": {
									background: "#F1F5F9",
								}
							}
						}}
					/>
					<Collapse in={settingsOpen}>
						<Stack gap={0} ml="lg" style={{ overflowY: 'auto', maxHeight: '200px' }}>
							{settingsItems.map((item, index) => {
								const isActive = location.pathname === item.path;
								return (
									<MantineNavLink
										key={index}
										onClick={() => navigate({ to: item.path })}
										label={item.name}
										active={isActive}
										variant="subtle"
										color="blue"
										style={{
											background: isActive ? isActiveBg : "transparent",
											fontWeight: isActive ? "bold" : "normal",
											borderLeft: isActive ? `4px solid ${isActiveBorder}` : "4px solid transparent",
											borderRadius: "8px",
											transition: "all 200ms ease",
											margin: "2px 0",
										}}
										styles={{
											body: {
												"&:hover": {
													background: "#F1F5F9",
												}
											}
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
