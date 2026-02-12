import { useLocation } from "@tanstack/react-router";
import { Bell, Moon, Sun, User as UserIcon } from "lucide-react"; // Renamed User to UserIcon to avoid conflict with Mantine's User component if it exists

import {
	Group,
	Text,
	Title,
	ActionIcon,
	Divider,
	Avatar,
	Box,
	Badge,
	useMantineColorScheme,
} from "@mantine/core";

export function Header() {
	const location = useLocation();
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	// Define page titles based on route
	const getPageTitle = () => {
		switch (location.pathname) {
			case "/":
				return "Desa Darmasaba";
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
			case "/keamanan":
				return "Keamanan";
			case "/bantuan":
				return "Bantuan";
			case "/pengaturan":
				return "Pengaturan";
			default:
				return "Desa Darmasaba";
		}
	};

	return (
		<Group justify="space-between" w="100%">
			{/* Title */}
			<Title order={3} c={"white"}>{getPageTitle()}</Title>

			{/* Right Section */}
			<Group gap="md">


				{/* User Info */}
				<Group gap="sm">
					<Box ta="right">
						<Text c={"white"} size="sm" fw={500}>
							I. B. Surya Prabhawa M...
						</Text>
						<Text c={"white"} size="xs">
							Kepala Desa
						</Text>
					</Box>
					<Avatar color="blue" radius="xl">
						<UserIcon color="white" style={{ width: "70%", height: "70%" }} />
					</Avatar>
				</Group>

				{/* Divider */}
				<Divider orientation="vertical" h={30} />

				{/* Icons */}
				<Group gap="sm">
					<ActionIcon
						onClick={() => toggleColorScheme()}
						variant="subtle"
						size="lg"
						radius="xl"
						aria-label="Toggle color scheme"
					>
						{dark ? (
							<Sun color="white" style={{ width: "70%", height: "70%" }} />
						) : (
							<Moon color="white" style={{ width: "70%", height: "70%" }} />
						)}
					</ActionIcon>
					<ActionIcon variant="subtle" size="lg" radius="xl" pos="relative">
						<Bell color="white" style={{ width: "70%", height: "70%" }} />
						<Badge
							size="xs"
							color="red"
							variant="filled"
							style={{ position: "absolute", top: 0, right: 0 }}
							radius={"xl"}
						>
							10
						</Badge>
					</ActionIcon>
				</Group>
			</Group>
		</Group>
	);
}
