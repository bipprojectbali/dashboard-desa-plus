import {
	Avatar,
	Badge,
	Box,
	Button,
	Card,
	Grid,
	Group,
	Progress,
	SimpleGrid,
	Skeleton,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconClock, IconServer, IconUserCheck } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { apiClient } from "@/utils/api-client";
import { authClient } from "@/utils/auth-client";
import { authStore } from "../../store/auth";

export const Route = createFileRoute("/admin/")({
	component: DashboardComponent,
});

interface AdminStats {
	userCount: number;
	adminCount: number;
	version: string;
	appName: string;
	environment: string;
}

interface SystemStats {
	memPct: number;
	cpuPct: number;
	diskUsedPct: number;
	diskFreePct: number;
}

function statusBadgeProps(value: number, threshold = 80) {
	if (value >= 90) return { color: "red", label: "Critical" } as const;
	if (value >= threshold) return { color: "orange", label: "Warning" } as const;
	return { color: "green", label: "OK" } as const;
}

function DashboardComponent() {
	const snap = useSnapshot(authStore);
	const navigate = useNavigate();
	const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
	const [sysStats, setSysStats] = useState<SystemStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		setLoading(true);
		setError(null);
		try {
			const [statsRes, sysRes] = await Promise.all([
				apiClient.GET("/api/admin/stats"),
				apiClient.GET("/api/system/stats"),
			]);
			if (statsRes.data) setAdminStats(statsRes.data as unknown as AdminStats);
			if (sysRes.data) {
				const d = sysRes.data as unknown as { data: SystemStats };
				setSysStats(d.data ?? d);
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : "Gagal memuat data");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const openLogoutModal = () =>
		modals.openConfirmModal({
			title: "Confirm Logout",
			centered: true,
			children: <Text size="sm">Are you sure you want to log out?</Text>,
			labels: { confirm: "Logout", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: async () => {
				await authClient.signOut();
				navigate({ to: "/signin", search: { redirect: undefined } });
			},
		});

	const statsSkeleton = (
		<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb="xl">
			{[...Array(4)].map((_, i) => (
				<Card key={i.toString()} withBorder p="lg" radius="md">
					<Group justify="space-between">
						<Box style={{ flex: 1 }}>
							<Skeleton height={14} width="60%" mb={8} />
							<Skeleton height={24} width="40%" />
						</Box>
						<Skeleton height={24} circle />
					</Group>
				</Card>
			))}
		</SimpleGrid>
	);

	const statsIcons = [
		<IconUserCheck key="users" size={24} />,
		<IconUserCheck key="admin" size={24} />,
		<IconClock key="version" size={24} />,
		<IconServer key="env" size={24} />,
	];

	const statsData = adminStats
		? [
				{
					title: "Total Users",
					value: adminStats.userCount.toLocaleString(),
					icon: statsIcons[0],
				},
				{
					title: "Admin Users",
					value: adminStats.adminCount.toLocaleString(),
					icon: statsIcons[1],
				},
				{
					title: "App Version",
					value: `v${adminStats.version}`,
					icon: statsIcons[2],
				},
				{
					title: "Environment",
					value: adminStats.environment,
					icon: statsIcons[3],
				},
			]
		: [];

	return (
		<Box py="xl">
			<Title
				order={1}
				ta="center"
				c={"orange"}
				variant="light"
				pb={20}
			>
				Dashboard Overview
			</Title>

			{/* User Profile Card */}
			<Card
				withBorder
				p="xl"
				radius="md"
				mb="xl"
				style={{ border: "1px solid var(--mantine-color-default-border)" }}
			>
				<Group justify="space-between">
					<Group>
						<Avatar
							src={snap.user?.image}
							size={80}
							radius="xl"
							style={{
								cursor: "pointer",
								border: "2px solid var(--mantine-color-orange-filled)",
							}}
							onClick={() => navigate({ to: "/profile" })}
						>
							{snap.user?.name?.charAt(0).toUpperCase()}
						</Avatar>
						<div>
							<Text size="lg" fw={600}>
								{snap.user?.name}
							</Text>
							<Text c="dimmed" size="sm">
								{snap.user?.email}
							</Text>
							<Badge mt="xs" variant="light" color="green">
								Verified Account
							</Badge>
						</div>
					</Group>
					<Button variant="outline" color="red" onClick={openLogoutModal}>
						Sign Out
					</Button>
				</Group>
			</Card>

			{/* Stats Grid */}
			{loading ? (
				statsSkeleton
			) : error ? (
				<Card withBorder p="lg" radius="md" mb="xl" ta="center">
					<Text c="red" size="sm" mb="sm">
						{error}
					</Text>
					<Button variant="light" size="xs" onClick={fetchData}>
						Retry
					</Button>
				</Card>
			) : (
				<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb="xl">
					{statsData.map((stat, index) => (
						<Card key={index.toString()} withBorder p="lg" radius="md">
							<Group justify="space-between">
								<Box>
									<Text size="sm" c="dimmed">
										{stat.title}
									</Text>
									<Text size="lg" fw={700}>
										{stat.value}
									</Text>
								</Box>
								<Box c="orange.6">{stat.icon}</Box>
							</Group>
						</Card>
					))}
				</SimpleGrid>
			)}

			<Grid gutter="lg">
				<Grid.Col span={{ base: 12, md: 8 }}>
					<Card withBorder p="lg" radius="md" mb="lg">
						<Title order={3} mb="md">
							System Performance
						</Title>
						{loading ? (
							<Stack gap="md">
								{[...Array(3)].map((_, i) => (
									<Box key={i.toString()}>
										<Skeleton height={14} width="30%" mb={8} />
										<Skeleton height={10} />
									</Box>
								))}
							</Stack>
						) : sysStats ? (
							<Stack gap="md">
								<Box>
									<Group justify="space-between" mb="xs">
										<Text size="sm">CPU Usage</Text>
										<Text size="sm" fw={500}>
											{sysStats.cpuPct}%
										</Text>
									</Group>
									<Progress
										value={sysStats.cpuPct}
										color={
											sysStats.cpuPct >= 90
												? "red"
												: sysStats.cpuPct >= 70
													? "yellow"
													: "green"
										}
									/>
								</Box>
								<Box>
									<Group justify="space-between" mb="xs">
										<Text size="sm">Memory Usage</Text>
										<Text size="sm" fw={500}>
											{sysStats.memPct}%
										</Text>
									</Group>
									<Progress
										value={sysStats.memPct}
										color={
											sysStats.memPct >= 90
												? "red"
												: sysStats.memPct >= 70
													? "yellow"
													: "blue"
										}
									/>
								</Box>
								<Box>
									<Group justify="space-between" mb="xs">
										<Text size="sm">Disk Usage</Text>
										<Text size="sm" fw={500}>
											{sysStats.diskUsedPct}%
										</Text>
									</Group>
									<Progress
										value={sysStats.diskUsedPct}
										color={
											sysStats.diskUsedPct >= 90
												? "red"
												: sysStats.diskUsedPct >= 70
													? "yellow"
													: "blue"
										}
									/>
								</Box>
							</Stack>
						) : null}
					</Card>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 4 }}>
					<Card withBorder p="lg" radius="md">
						<Title order={3} mb="md">
							Server Status
						</Title>
						{loading ? (
							<Stack gap="sm">
								{[...Array(4)].map((_, i) => (
									<Group key={i.toString()} justify="space-between">
										<Skeleton height={14} width="40%" />
										<Skeleton height={20} width="25%" />
									</Group>
								))}
							</Stack>
						) : (
							<Stack gap="sm">
								<Group justify="space-between">
									<Text size="sm">Main Server</Text>
									<Badge color="green" variant="light">
										Online
									</Badge>
								</Group>
								<Group justify="space-between">
									<Text size="sm">Database</Text>
									<Badge color={adminStats ? "green" : "red"} variant="light">
										{adminStats ? "Connected" : "Error"}
									</Badge>
								</Group>
								{sysStats && (
									<>
										<Group justify="space-between">
											<Text size="sm">Memory</Text>
											<Badge
												color={statusBadgeProps(sysStats.memPct).color}
												variant="light"
											>
												{statusBadgeProps(sysStats.memPct).label}
											</Badge>
										</Group>
										<Group justify="space-between">
											<Text size="sm">Disk</Text>
											<Badge
												color={statusBadgeProps(sysStats.diskUsedPct).color}
												variant="light"
											>
												{statusBadgeProps(sysStats.diskUsedPct).label}
											</Badge>
										</Group>
									</>
								)}
							</Stack>
						)}
					</Card>
				</Grid.Col>
			</Grid>
		</Box>
	);
}
