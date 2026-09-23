import {
	Avatar,
	Badge,
	Box,
	Button,
	Card,
	Container,
	Divider,
	Group,
	Skeleton,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import {
	IconArrowLeft,
	IconCalendar,
	IconMail,
	IconShield,
	IconUser,
} from "@tabler/icons-react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { protectedRouteMiddleware } from "@/middleware/authMiddleware";

export const Route = createFileRoute("/users/$id")({
	beforeLoad: protectedRouteMiddleware,
	component: UserDetailPage,
});

interface UserRow {
	id: string;
	name: string | null;
	email: string;
	image: string | null;
	role: string | null;
	createdAt: string;
	emailVerified: boolean;
}

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("id-ID", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}

function UserDetailPage() {
	const { id } = useParams({ from: "/users/$id" });
	const [user, setUser] = useState<UserRow | null>(null);
	const [loading, setLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch("/api/admin/users", { credentials: "include" });
				if (!res.ok) throw new Error();
				const data = await res.json();
				const found = (data.users as UserRow[]).find((u) => u.id === id);
				if (found) setUser(found);
				else setNotFound(true);
			} catch {
				setNotFound(true);
			} finally {
				setLoading(false);
			}
		})();
	}, [id]);

	return (
		<Container size="sm" py="xl">
			<Button
				component={Link}
				to="/users"
				variant="subtle"
				color="gray"
				leftSection={<IconArrowLeft size={16} />}
				mb="lg"
			>
				Kembali ke Daftar
			</Button>

			{loading ? (
				<Stack gap="md">
					<Skeleton height={120} radius="xl" />
					<Skeleton height={60} radius="md" />
					<Skeleton height={60} radius="md" />
				</Stack>
			) : notFound || !user ? (
				<Stack align="center" py="xl" gap="sm">
					<IconUser
						size={48}
						stroke={1.2}
						color="var(--mantine-color-dimmed)"
					/>
					<Title order={3} c="dimmed">
						Pengguna tidak ditemukan
					</Title>
					<Text c="dimmed" size="sm">
						ID: {id}
					</Text>
				</Stack>
			) : (
				<Card withBorder radius="xl" p="xl">
					<Stack align="center" gap="md" mb="lg">
						<Avatar src={user.image} size={80} radius="xl">
							{(user.name ?? user.email).charAt(0).toUpperCase()}
						</Avatar>
						<Box ta="center">
							<Title order={3}>{user.name ?? "-"}</Title>
							<Text c="dimmed" size="sm">
								{user.email}
							</Text>
						</Box>
						<Group gap="xs">
							{user.role === "admin" ? (
								<Badge
									color="orange"
									variant="light"
									leftSection={<IconShield size={12} />}
								>
									Admin
								</Badge>
							) : (
								<Badge
									color="blue"
									variant="light"
									leftSection={<IconUser size={12} />}
								>
									Pengguna
								</Badge>
							)}
							<Badge
								color={user.emailVerified ? "green" : "gray"}
								variant="dot"
							>
								{user.emailVerified ? "Terverifikasi" : "Belum Terverifikasi"}
							</Badge>
						</Group>
					</Stack>

					<Divider mb="lg" />

					<Stack gap="md">
						<Group gap="sm">
							<IconMail size={18} color="var(--mantine-color-dimmed)" />
							<Box>
								<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
									Email
								</Text>
								<Text size="sm">{user.email}</Text>
							</Box>
						</Group>
						<Group gap="sm">
							<IconCalendar size={18} color="var(--mantine-color-dimmed)" />
							<Box>
								<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
									Bergabung
								</Text>
								<Text size="sm">{formatDate(user.createdAt)}</Text>
							</Box>
						</Group>
					</Stack>
				</Card>
			)}
		</Container>
	);
}
