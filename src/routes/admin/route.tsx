import {
	ActionIcon,
	AppShell,
	Avatar,
	Box,
	Burger,
	Group,
	Menu,
	NavLink,
	rem,
	ScrollArea,
	Stack,
	Text,
	Tooltip,
	useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
	IconChevronRight,
	IconHelpCircle,
	IconHome,
	IconKey,
	IconLogout,
	IconMoon,
	IconSettings,
	IconSun,
	IconUser,
	IconUsers,
} from "@tabler/icons-react";
import {
	createFileRoute,
	Link,
	Outlet,
	useLocation,
	useNavigate,
} from "@tanstack/react-router";
import { useSnapshot } from "valtio";
import { protectedRouteMiddleware } from "@/middleware/authMiddleware";
import { authClient } from "@/utils/auth-client";
import { authStore } from "../../store/auth";

export const Route = createFileRoute("/admin")({
	component: DashboardLayout,
	beforeLoad: protectedRouteMiddleware,
});

function DashboardLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const snap = useSnapshot(authStore);
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";
	const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
	const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

	const navItems = [
		{
			icon: IconHome,
			label: "Beranda",
			to: "/admin",
			description: "Ringkasan sistem & statistik",
		},
		{
			icon: IconUsers,
			label: "Pengguna",
			to: "/admin/users",
			description: "Kelola akun & hak akses",
		},
		{
			icon: IconKey,
			label: "API Key",
			to: "/admin/apikey",
			description: "Manajemen kunci akses API",
		},
		{
			icon: IconSettings,
			label: "Pengaturan",
			to: "/admin/settings",
			description: "Konfigurasi sistem",
		},
	];

	const handleLogout = async () => {
		modals.openConfirmModal({
			title: "Konfirmasi Keluar",
			centered: true,
			children: (
				<Text size="sm">
					Apakah Anda yakin ingin keluar dari sistem? Sesi Anda akan berakhir.
				</Text>
			),
			labels: { confirm: "Keluar", cancel: "Batal" },
			confirmProps: { color: "red" },
			onConfirm: async () => {
				await authClient.signOut();
				navigate({ to: "/signin", search: { redirect: undefined } });
			},
		});
	};

	const isActive = (path: string) => {
		const current = location.pathname;
		if (path === "/admin") return current === "/admin" || current === "/admin/";
		return current.startsWith(path);
	};

	return (
		<AppShell
			header={{ height: 70 }}
			navbar={{
				width: 280,

				breakpoint: "sm",

				collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
			}}
			padding="md"
			transitionDuration={500}
			transitionTimingFunction="ease"
		>
			<AppShell.Header
				style={{
					backdropFilter: "blur(10px)",

					borderBottom: "1px solid var(--mantine-color-default-border)",
				}}
			>
				<Group h="100%" px="md" justify="space-between">
					<Group gap="xs">
						<Burger
							opened={mobileOpened}
							onClick={toggleMobile}
							hiddenFrom="sm"
							size="sm"
						/>

						<Burger
							opened={desktopOpened}
							onClick={toggleDesktop}
							visibleFrom="sm"
							size="sm"
						/>

						<Box visibleFrom="xs" ml="xs">
							<Text
								fw={800}
								size="xl"
								c="orange.6"
								style={{ letterSpacing: "-0.5px" }}
							>
								ADMIN
								<Text span c="var(--mantine-color-text)">
									PANEL
								</Text>
							</Text>
						</Box>
					</Group>

					<Group gap="md">
						<ActionIcon
							onClick={() => toggleColorScheme()}
							variant="subtle"
							size="lg"
							radius="xl"
							aria-label="Ganti tema"
						>
							{dark ? (
								<IconSun
									style={{ width: rem(18), height: rem(18) }}
									stroke={1.5}
								/>
							) : (
								<IconMoon
									style={{ width: rem(18), height: rem(18) }}
									stroke={1.5}
								/>
							)}
						</ActionIcon>

						<Menu
							shadow="md"
							width={200}
							position="bottom-end"
							transitionProps={{ transition: "pop-top-right" }}
						>
							<Menu.Target>
								<Group
									gap="xs"
									style={{ cursor: "pointer" }}
									p="xs"
									className="hover:bg-gray-50 dark:hover:bg-white/5 rounded-md"
								>
									<div
										style={{ textAlign: "right" }}
										className="visible-from-sm"
									>
										<Text size="sm" fw={600}>
											{snap.user?.name}
										</Text>

										<Text size="xs" c="dimmed">
											Administrator
										</Text>
									</div>

									<Avatar
										src={snap.user?.image}
										radius="xl"
										size="md"
										style={{
											border: "2px solid var(--mantine-color-orange-filled)",
										}}
									>
										{snap.user?.name?.charAt(0)}
									</Avatar>
								</Group>
							</Menu.Target>

							<Menu.Dropdown>
								<Menu.Label>Akun</Menu.Label>

								<Menu.Item
									leftSection={
										<IconUser style={{ width: rem(14), height: rem(14) }} />
									}
									onClick={() => navigate({ to: "/profile" })}
								>
									Profil Saya
								</Menu.Item>

								<Menu.Item
									leftSection={
										<IconSettings style={{ width: rem(14), height: rem(14) }} />
									}
									onClick={() => navigate({ to: "/admin/settings" })}
								>
									Pengaturan
								</Menu.Item>

								<Menu.Divider />

								<Menu.Label>Bahaya</Menu.Label>

								<Menu.Item
									color="red"
									leftSection={
										<IconLogout style={{ width: rem(14), height: rem(14) }} />
									}
									onClick={handleLogout}
								>
									Keluar Sistem
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					</Group>
				</Group>
			</AppShell.Header>

			<AppShell.Navbar
				p="md"
				style={{ borderRight: "1px solid var(--mantine-color-default-border)" }}
			>
				<AppShell.Section grow component={ScrollArea} mx="-md" px="md">
					<Stack gap="xs" mt="md">
						{navItems.map((item) => (
							<Tooltip
								key={item.to}
								label={item.description}
								position="right"
								disabled={!desktopOpened}
								openDelay={500}
							>
								<NavLink
									onClick={() => {
										navigate({ to: item.to });

										if (mobileOpened) toggleMobile();
									}}
									leftSection={
										<item.icon
											style={{ width: rem(20), height: rem(20) }}
											stroke={1.5}
										/>
									}
									label={
										<Box>
											<Text size="sm" fw={isActive(item.to) ? 700 : 500}>
												{item.label}
											</Text>
										</Box>
									}
									rightSection={<IconChevronRight size="0.8rem" stroke={1.5} />}
									active={isActive(item.to)}
									variant="light"
									color="orange"
									styles={{
										root: {
											borderRadius: rem(8),

											marginBottom: rem(4),
										},

										label: {
											fontSize: rem(14),
										},
									}}
								/>
							</Tooltip>
						))}
					</Stack>
				</AppShell.Section>

				<AppShell.Section
					style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
					pt="md"
				>
					<NavLink
						component={Link}
						to="/admin/help"
						label="Pusat Bantuan"
						onClick={() => {
							if (mobileOpened) toggleMobile();
						}}
						leftSection={
							<IconHelpCircle
								style={{ width: rem(18), height: rem(18) }}
								stroke={1.5}
							/>
						}
						active={isActive("/admin/help")}
						styles={{ root: { borderRadius: rem(8) } }}
					/>

					<NavLink
						label="Keluar"
						onClick={() => {
							if (mobileOpened) toggleMobile();
							handleLogout();
						}}
						leftSection={
							<IconLogout
								style={{ width: rem(18), height: rem(18) }}
								stroke={1.5}
								color="red"
							/>
						}
						c="red"
						styles={{ root: { borderRadius: rem(8) } }}
					/>
				</AppShell.Section>
			</AppShell.Navbar>

			<AppShell.Main>
				<Outlet />
			</AppShell.Main>
		</AppShell>
	);
}
