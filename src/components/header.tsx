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
import { useTranslate } from "@/hooks/useTranslate";

interface HeaderProps {
	onSidebarToggle?: () => void;
}

export function Header({ onSidebarToggle }: HeaderProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";
	const snap = useSnapshot(authStore);
	const t = useTranslate();
	const isAdmin = snap.user?.role === "admin";
	const displayName = snap.user?.name ?? snap.user?.email ?? "";
	const truncatedName =
		displayName.length > 20 ? `${displayName.slice(0, 20)}...` : displayName;
	const initials = displayName.charAt(0).toUpperCase();

	const pathnames = location.pathname.split("/").filter((x) => x);

	const labelMap: Record<string, string> = {
		"kinerja-divisi": t.breadcrumb.kinerjaDevisi,
		"pengaduan-layanan-publik": t.breadcrumb.pengaduanLayanan,
		"jenna-analytic": t.breadcrumb.jennaAnalytic,
		"demografi-pekerjaan": t.breadcrumb.demografi,
		"keuangan-anggaran": t.breadcrumb.keuangan,
		bumdes: t.breadcrumb.bumdes,
		sosial: t.breadcrumb.sosial,
		keamanan: t.breadcrumb.keamanan,
		bantuan: t.breadcrumb.bantuan,
		pengaturan: t.breadcrumb.pengaturan,
		umum: t.breadcrumb.umum,
		notifikasi: t.breadcrumb.notifikasi,
		"akses-dan-tim": t.breadcrumb.aksesDanTim,
		sinkronisasi: t.breadcrumb.sinkronisasi,
		profile: t.breadcrumb.profile,
		edit: t.breadcrumb.edit,
	};

	const breadcrumbItems = [
		<Anchor
			key="home"
			onClick={() => navigate({ to: "/" })}
			c="white"
			size="sm"
			underline="hover"
		>
			{t.breadcrumb.home}
		</Anchor>,
		...pathnames.map((value, index) => {
			const to = `/${pathnames.slice(0, index + 1).join("/")}`;
			const isLast = index === pathnames.length - 1;
			const label = labelMap[value] ?? value.charAt(0).toUpperCase() + value.slice(1);

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
							{isAdmin ? t.common.administrator : t.common.pengguna}
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
