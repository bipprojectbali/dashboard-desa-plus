import { useNavigate, useLocation } from "@tanstack/react-router";
import { Search } from "lucide-react";
import {
	Stack,
	Group,
	Text,
	Badge,
	Input,
	NavLink as MantineNavLink,
	Box,
	useMantineColorScheme,
} from "@mantine/core";

interface SidebarProps {
	className?: string;
}

export function Sidebar({ className }: SidebarProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const { colorScheme } = useMantineColorScheme();
	const isActiveBg = colorScheme === 'dark' ? "#182949" : "#E6F0FF";
	const isActiveBorder = colorScheme === 'dark' ? "#00398D" : "#1F41AE";

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
		{ name: "Pengaturan", path: "/dashboard/pengaturan" },
	];

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
			<Stack gap={0} px="xs" flex={1} style={{ overflowY: "auto" }}>
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
			</Stack>
		</Box>
	);
}
