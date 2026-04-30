import {
	Alert,
	Badge,
	Card,
	Container,
	Divider,
	Group,
	SimpleGrid,
	Skeleton,
	Stack,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import {
	IconAlertCircle,
	IconBrandGithub,
	IconDatabase,
	IconKey,
	IconMail,
	IconServer,
	IconSettings,
	IconShield,
	IconUsers,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { protectedRouteMiddleware } from "../../middleware/authMiddleware";

export const Route = createFileRoute("/admin/settings")({
	beforeLoad: protectedRouteMiddleware,
	component: DashboardSettingsComponent,
});

interface SystemStats {
	userCount: number;
	adminCount: number;
	version: string;
	appName: string;
	environment: string;
}

function StatCard({
	icon,
	label,
	value,
	color = "orange",
}: {
	icon: React.ReactNode;
	label: string;
	value: React.ReactNode;
	color?: string;
}) {
	return (
		<Card withBorder p="md" radius="md">
			<Group>
				<ThemeIcon size={40} radius="md" color={color} variant="light">
					{icon}
				</ThemeIcon>
				<div>
					<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
						{label}
					</Text>
					<Text size="lg" fw={700}>
						{value}
					</Text>
				</div>
			</Group>
		</Card>
	);
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<Group justify="space-between" py="xs">
			<Text size="sm" c="dimmed">
				{label}
			</Text>
			<Text size="sm" fw={500}>
				{value}
			</Text>
		</Group>
	);
}

function DashboardSettingsComponent() {
	const [stats, setStats] = useState<SystemStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch("/api/admin/stats", { credentials: "include" });
				if (!res.ok) throw new Error("Gagal memuat data sistem");
				const data = await res.json();
				setStats(data);
			} catch {
				setError("Gagal memuat informasi sistem");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	return (
		<Container size="lg" py="xl">
			<Stack gap={2} mb="xl">
				<Title order={2}>Pengaturan Sistem</Title>
				<Text size="sm" c="dimmed">
					Informasi konfigurasi dan status aplikasi
				</Text>
			</Stack>

			{error && (
				<Alert
					icon={<IconAlertCircle size={16} />}
					color="red"
					mb="md"
					withCloseButton
					onClose={() => setError(null)}
				>
					{error}
				</Alert>
			)}

			{/* Stats cards */}
			<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="xl">
				{loading ? (
					Array.from({ length: 4 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
						<Skeleton key={i} height={80} radius="md" />
					))
				) : (
					<>
						<StatCard
							icon={<IconUsers size={20} />}
							label="Total Pengguna"
							value={stats?.userCount ?? 0}
							color="blue"
						/>
						<StatCard
							icon={<IconShield size={20} />}
							label="Administrator"
							value={stats?.adminCount ?? 0}
							color="orange"
						/>
						<StatCard
							icon={<IconServer size={20} />}
							label="Versi Aplikasi"
							value={`v${stats?.version ?? "-"}`}
							color="teal"
						/>
						<StatCard
							icon={<IconDatabase size={20} />}
							label="Environment"
							value={
								<Badge
									color={
										stats?.environment === "production" ? "green" : "yellow"
									}
									variant="light"
								>
									{stats?.environment ?? "-"}
								</Badge>
							}
							color="violet"
						/>
					</>
				)}
			</SimpleGrid>

			{/* App info */}
			<Card withBorder p="lg" radius="md" mb="md">
				<Group mb="md">
					<ThemeIcon size={32} radius="md" color="orange" variant="light">
						<IconSettings size={18} />
					</ThemeIcon>
					<Title order={4}>Informasi Aplikasi</Title>
				</Group>
				<Divider mb="sm" />
				{loading ? (
					<Stack gap="xs">
						{Array.from({ length: 3 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
							<Skeleton key={i} height={24} />
						))}
					</Stack>
				) : (
					<>
						<InfoRow label="Nama Aplikasi" value={stats?.appName ?? "-"} />
						<Divider variant="dashed" />
						<InfoRow label="Versi" value={`v${stats?.version ?? "-"}`} />
						<Divider variant="dashed" />
						<InfoRow
							label="Environment"
							value={
								<Badge
									color={
										stats?.environment === "production" ? "green" : "yellow"
									}
									variant="light"
								>
									{stats?.environment ?? "-"}
								</Badge>
							}
						/>
					</>
				)}
			</Card>

			{/* Auth providers */}
			<Card withBorder p="lg" radius="md" mb="md">
				<Group mb="md">
					<ThemeIcon size={32} radius="md" color="blue" variant="light">
						<IconKey size={18} />
					</ThemeIcon>
					<Title order={4}>Provider Autentikasi</Title>
				</Group>
				<Divider mb="sm" />
				<InfoRow
					label="Email & Password"
					value={
						<Group gap="xs">
							<IconMail size={14} />
							<Badge color="green" variant="light">
								Aktif
							</Badge>
						</Group>
					}
				/>
				<Divider variant="dashed" />
				<InfoRow
					label="GitHub OAuth"
					value={
						<Group gap="xs">
							<IconBrandGithub size={14} />
							<Badge color="green" variant="light">
								Aktif
							</Badge>
						</Group>
					}
				/>
			</Card>

			{/* Session config */}
			<Card withBorder p="lg" radius="md">
				<Group mb="md">
					<ThemeIcon size={32} radius="md" color="teal" variant="light">
						<IconShield size={18} />
					</ThemeIcon>
					<Title order={4}>Konfigurasi Sesi</Title>
				</Group>
				<Divider mb="sm" />
				<InfoRow label="Durasi Sesi" value="7 hari" />
				<Divider variant="dashed" />
				<InfoRow label="Cookie Cache" value="Aktif (1 jam)" />
				<Divider variant="dashed" />
				<InfoRow label="Trust Proxy" value="Aktif" />
			</Card>
		</Container>
	);
}
