import {
	Avatar,
	Badge,
	Box,
	Container,
	Group,
	LoadingOverlay,
	Paper,
	Stack,
	Table,
	Text,
	Title,
} from "@mantine/core";
import { IconShield, IconUser, IconUsers } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { protectedRouteMiddleware } from "@/middleware/authMiddleware";

export const Route = createFileRoute("/users/")({
	beforeLoad: protectedRouteMiddleware,
	component: UsersPage,
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

function RoleBadge({ role }: { role: string | null }) {
	if (role === "admin")
		return (
			<Badge
				color="orange"
				variant="light"
				leftSection={<IconShield size={12} />}
			>
				Admin
			</Badge>
		);
	return (
		<Badge color="blue" variant="light" leftSection={<IconUser size={12} />}>
			Pengguna
		</Badge>
	);
}

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

function UsersPage() {
	const [users, setUsers] = useState<UserRow[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchUsers = useCallback(async () => {
		try {
			setLoading(true);
			const res = await fetch("/api/admin/users", { credentials: "include" });
			if (!res.ok) throw new Error();
			const data = await res.json();
			setUsers(data.users ?? []);
		} catch {
			// keep empty
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	return (
		<Container size="lg" py="xl">
			<Group justify="space-between" mb="lg">
				<Stack gap={2}>
					<Title order={2}>Anggota Tim</Title>
					<Text size="sm" c="dimmed">
						Daftar pengguna yang terdaftar di sistem
					</Text>
				</Stack>
				<Badge
					size="lg"
					variant="outline"
					leftSection={<IconUsers size={14} />}
				>
					{users.length} pengguna
				</Badge>
			</Group>

			<div style={{ position: "relative", minHeight: 120 }}>
				<LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />

				{!loading && users.length === 0 ? (
					<Stack align="center" py="xl" gap="sm">
						<IconUsers
							size={48}
							stroke={1.2}
							color="var(--mantine-color-dimmed)"
						/>
						<Text c="dimmed">Belum ada pengguna terdaftar</Text>
					</Stack>
				) : (
					<>
						{/* Mobile: card */}
						<Stack hiddenFrom="sm" gap="sm">
							{users.map((u) => (
								<Paper
									key={u.id}
									component={Link}
									to="/users/$id"
									params={{ id: u.id }}
									p="md"
									withBorder
									radius="md"
									style={{ textDecoration: "none", color: "inherit" }}
								>
									<Group
										justify="space-between"
										align="flex-start"
										wrap="nowrap"
									>
										<Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
											<Avatar src={u.image} size={40} radius="xl" flex="none">
												{(u.name ?? u.email).charAt(0).toUpperCase()}
											</Avatar>
											<div style={{ minWidth: 0 }}>
												<Text size="sm" fw={600} truncate>
													{u.name ?? "-"}
												</Text>
												<Text size="xs" c="dimmed" truncate>
													{u.email}
												</Text>
											</div>
										</Group>
										<Group gap="xs" flex="none">
											<RoleBadge role={u.role} />
											<Badge
												color={u.emailVerified ? "green" : "gray"}
												variant="dot"
												size="sm"
											>
												{u.emailVerified ? "Terverifikasi" : "Belum"}
											</Badge>
										</Group>
									</Group>
								</Paper>
							))}
						</Stack>

						{/* Desktop: table */}
						<Box visibleFrom="sm">
							<Table
								striped
								highlightOnHover
								verticalSpacing="sm"
								withTableBorder
							>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Pengguna</Table.Th>
										<Table.Th>Email</Table.Th>
										<Table.Th>Role</Table.Th>
										<Table.Th>Verifikasi</Table.Th>
										<Table.Th>Bergabung</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{users.map((u) => (
										<Table.Tr
											key={u.id}
											component={Link}
											to="/users/$id"
											params={{ id: u.id }}
											style={{ cursor: "pointer", textDecoration: "none" }}
										>
											<Table.Td>
												<Group gap="sm">
													<Avatar src={u.image} size={36} radius="xl">
														{(u.name ?? u.email).charAt(0).toUpperCase()}
													</Avatar>
													<Text size="sm" fw={500}>
														{u.name ?? "-"}
													</Text>
												</Group>
											</Table.Td>
											<Table.Td>
												<Text size="sm">{u.email}</Text>
											</Table.Td>
											<Table.Td>
												<RoleBadge role={u.role} />
											</Table.Td>
											<Table.Td>
												<Badge
													color={u.emailVerified ? "green" : "gray"}
													variant="dot"
												>
													{u.emailVerified ? "Terverifikasi" : "Belum"}
												</Badge>
											</Table.Td>
											<Table.Td>
												<Text size="sm" c="dimmed">
													{formatDate(u.createdAt)}
												</Text>
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</Box>
					</>
				)}
			</div>
		</Container>
	);
}
