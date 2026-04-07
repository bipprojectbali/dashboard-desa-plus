import {
	ActionIcon,
	Anchor,
	Avatar,
	Badge,
	Box,
	Breadcrumbs,
	Divider,
	Group,
	Text,
	useMantineColorScheme,
} from "@mantine/core";
import {
	IconLayoutSidebarLeftCollapse,
	IconUserShield,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Bell, Moon, Sun, User as UserIcon } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

interface HeaderProps {
	onSidebarToggle?: () => void;
}

export function Header({ onSidebarToggle }: HeaderProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";
	const isMobile = useMobile();

	const pathnames = location.pathname.split("/").filter((x) => x);

	// Limit breadcrumbs on mobile
	const maxBreadcrumbs = isMobile ? 2 : 10;
	const displayPathnames = pathnames.slice(0, maxBreadcrumbs);

	const breadcrumbItems = [
		<Anchor
			key="home"
			onClick={() => navigate({ to: "/" })}
			c="white"
			size={isMobile ? "xs" : "sm"}
			underline="hover"
		>
			{isMobile ? "Home" : "Desa Darmasaba"}
		</Anchor>,
		...displayPathnames.map((value, index) => {
			const to = `/${pathnames.slice(0, index + 1).join("/")}`;
			const isLast = index === displayPathnames.length - 1;

			// Map route path to human-readable label
			const labelMap: Record<string, string> = {
				"kinerja-divisi": "Kinerja Divisi",
				"pengaduan-layanan-publik": "Pengaduan",
				"jenna-analytic": "Jenna Analytic",
				"demografi-pekerjaan": "Demografi",
				"keuangan-anggaran": "Keuangan",
				bumdes: "Bumdes",
				sosial: "Sosial",
				keamanan: "Keamanan",
				bantuan: "Bantuan",
				pengaturan: "Pengaturan",
				umum: "Umum",
				notifikasi: "Notifikasi",
				"akses-dan-tim": "Akses & Tim",
				sinkronisasi: "Sinkronisasi",
				profile: "Profil",
				edit: "Edit",
			};

			const label =
				labelMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

			return isLast ? (
				<Text key={to} c="white" size={isMobile ? "xs" : "sm"} fw={600}>
					{label}
				</Text>
			) : (
				<Anchor
					key={to}
					onClick={() => navigate({ to })}
					c="white"
					size={isMobile ? "xs" : "sm"}
					underline="hover"
				>
					{label}
				</Anchor>
			);
		}),
	];

	return (
		<Group justify="space-between" w="100%">
			{/* Title & Breadcrumbs */}
			<Group gap="md" style={{ flex: 1, minWidth: 0 }}>
				<ActionIcon
					onClick={onSidebarToggle}
					variant="subtle"
					size="lg"
					radius="xl"
					visibleFrom="sm"
					aria-label="Toggle sidebar"
				>
					<IconLayoutSidebarLeftCollapse
						color="white"
						style={{ width: "70%", height: "70%" }}
					/>
				</ActionIcon>
				<Box style={{ minWidth: 0, overflow: "hidden" }}>
					<Breadcrumbs
						separator={
							<Text c="white" size="xs">
								/
							</Text>
						}
						styles={{
							separator: { color: "white" },
						}}
					>
						{breadcrumbItems}
					</Breadcrumbs>
				</Box>
			</Group>

			{/* Right Section */}
			<Group gap={"xs"}>
				{/* User Info - Hidden on mobile */}
				<Group gap="sm" visibleFrom="sm">
					<Box ta="right">
						<Text c={"white"} size="sm" fw={500}>
							I. B. Surya Prabhawa M...
						</Text>
						<Text c={"white"} size="xs">
							Kepala Desa
						</Text>
					</Box>
					<Avatar color="blue" radius="xl" size="md">
						<UserIcon color="white" style={{ width: "70%", height: "70%" }} />
					</Avatar>
				</Group>

				{/* User Avatar Only on Mobile */}
				<Avatar
					color="blue"
					radius="xl"
					size="sm"
					hiddenFrom="sm"
				>
					<UserIcon color="white" style={{ width: "70%", height: "70%" }} />
				</Avatar>

				{/* Divider - Hidden on mobile */}
				<Divider orientation="vertical" h={30} visibleFrom="sm" />

				{/* Icons */}
				<Group gap={"xs"}>
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
					<ActionIcon
						variant="subtle"
						size="lg"
						radius="xl"
						pos="relative"
					>
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
					<ActionIcon
						variant="subtle"
						size="lg"
						radius="xl"
						visibleFrom="sm"
					>
						<IconUserShield
							color="white"
							style={{ width: "70%", height: "70%" }}
							onClick={() => navigate({ to: "/admin" })}
						/>
					</ActionIcon>
				</Group>
			</Group>
		</Group>
	);
}
