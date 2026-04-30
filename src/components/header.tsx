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
import { useSnapshot } from "valtio";
import { authStore } from "@/store/auth";

interface HeaderProps {
	onSidebarToggle?: () => void;
}

export function Header({ onSidebarToggle }: HeaderProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";
	const snap = useSnapshot(authStore);
	const isAdmin = snap.user?.role === "admin";
	const displayName = snap.user?.name ?? snap.user?.email ?? "";
	const truncatedName =
		displayName.length > 20 ? `${displayName.slice(0, 20)}...` : displayName;
	const initials = displayName.charAt(0).toUpperCase();

	const pathnames = location.pathname.split("/").filter((x) => x);

	const breadcrumbItems = [
		<Anchor
			key="home"
			onClick={() => navigate({ to: "/" })}
			c="white"
			size="sm"
			underline="hover"
		>
			Desa Darmasaba
		</Anchor>,
		...pathnames.map((value, index) => {
			const to = `/${pathnames.slice(0, index + 1).join("/")}`;
			const isLast = index === pathnames.length - 1;

			// Map route path to human-readable label
			const labelMap: Record<string, string> = {
				"kinerja-divisi": "Kinerja Divisi",
				"pengaduan-layanan-publik": "Pengaduan & Layanan Publik",
				"jenna-analytic": "Jenna Analytic",
				"demografi-pekerjaan": "Demografi & Kependudukan",
				"keuangan-anggaran": "Keuangan & Anggaran",
				bumdes: "Bumdes & UMKM",
				sosial: "Sosial",
				keamanan: "Keamanan",
				bantuan: "Bantuan",
				pengaturan: "Pengaturan",
				umum: "Umum",
				notifikasi: "Notifikasi",
				"akses-dan-tim": "Akses & Tim",
				profile: "Profil",
				edit: "Edit",
			};

			const label =
				labelMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

			return isLast ? (
				<Text key={to} c="white" size="sm" fw={600}>
					{label}
				</Text>
			) : (
				<Anchor
					key={to}
					onClick={() => navigate({ to })}
					c="white"
					size="sm"
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
			<Group gap="md">
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
			</Group>

			{/* Right Section */}
			<Group gap="md">
				{/* User Info */}
				<Group gap="sm">
					<Box ta="right" visibleFrom="sm">
						<Text c="white" size="sm" fw={500}>
							{truncatedName}
						</Text>
						<Text c="white" size="xs" opacity={0.75}>
							{isAdmin ? "Administrator" : "Pengguna"}
						</Text>
					</Box>
					<Avatar
						src={snap.user?.image}
						color="blue"
						radius="xl"
						style={{ cursor: "pointer" }}
						onClick={() => navigate({ to: "/profile" })}
					>
						{initials || (
							<UserIcon color="white" style={{ width: "70%", height: "70%" }} />
						)}
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
					{isAdmin && (
						<ActionIcon
							variant="subtle"
							size="lg"
							radius="xl"
							onClick={() => navigate({ to: "/admin" })}
							aria-label="Admin panel"
						>
							<IconUserShield
								color="white"
								style={{ width: "70%", height: "70%" }}
							/>
						</ActionIcon>
					)}
				</Group>
			</Group>
		</Group>
	);
}
