import {
	ActionIcon,
	Alert,
	Avatar,
	Badge,
	Box,
	Button,
	Container,
	Group,
	LoadingOverlay,
	Modal,
	Paper,
	Select,
	Stack,
	Table,
	Text,
	Title,
	Tooltip,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
	IconAlertCircle,
	IconCircleCheck,
	IconCircleX,
	IconShield,
	IconTrash,
	IconUser,
	IconUsers,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { protectedRouteMiddleware } from "../../middleware/authMiddleware";
import { authStore } from "../../store/auth";

export const Route = createFileRoute("/admin/users")({
	beforeLoad: protectedRouteMiddleware,
	component: DashboardUsersComponent,
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

function DashboardUsersComponent() {
	const snap = useSnapshot(authStore);
	const [users, setUsers] = useState<UserRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [roleModalOpen, setRoleModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
	const [newRole, setNewRole] = useState<string | null>(null);
	const [updating, setUpdating] = useState(false);

	const fetchUsers = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await fetch("/api/admin/users", { credentials: "include" });
			if (!res.ok) throw new Error("Gagal memuat data pengguna");
			const data = await res.json();
			setUsers(data.users ?? []);
		} catch {
			setError("Gagal memuat data pengguna");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const openRoleModal = (user: UserRow) => {
		setSelectedUser(user);
		setNewRole(user.role ?? "user");
		setRoleModalOpen(true);
	};

	const handleUpdateRole = async () => {
		if (!selectedUser || !newRole) return;
		try {
			setUpdating(true);
			const res = await fetch("/api/admin/users/update-role", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: selectedUser.id, role: newRole }),
			});
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error ?? "Gagal mengubah role");
			}
			setUsers((prev) =>
				prev.map((u) =>
					u.id === selectedUser.id ? { ...u, role: newRole } : u,
				),
			);
			setRoleModalOpen(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Gagal mengubah role");
		} finally {
			setUpdating(false);
		}
	};

	const handleToggleVerify = (user: UserRow) => {
		const willVerify = !user.emailVerified;
		modals.openConfirmModal({
			title: willVerify ? "Verifikasi Pengguna" : "Batalkan Verifikasi",
			centered: true,
			children: (
				<Text size="sm">
					{willVerify ? "Verifikasi email" : "Batalkan verifikasi email"} untuk{" "}
					<Text span fw={600}>
						{user.name ?? user.email}
					</Text>
					?
				</Text>
			),
			labels: {
				confirm: willVerify ? "Verifikasi" : "Batalkan Verifikasi",
				cancel: "Tutup",
			},
			confirmProps: { color: willVerify ? "green" : "gray" },
			onConfirm: async () => {
				try {
					const res = await fetch("/api/admin/users/verify", {
						method: "POST",
						credentials: "include",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ id: user.id, verified: willVerify }),
					});
					if (!res.ok) {
						const data = await res.json();
						throw new Error(data.error ?? "Gagal mengubah status verifikasi");
					}
					setUsers((prev) =>
						prev.map((u) =>
							u.id === user.id ? { ...u, emailVerified: willVerify } : u,
						),
					);
				} catch (err) {
					setError(
						err instanceof Error
							? err.message
							: "Gagal mengubah status verifikasi",
					);
				}
			},
		});
	};

	const handleDeleteUser = (user: UserRow) => {
		modals.openConfirmModal({
			title: "Hapus Pengguna",
			centered: true,
			children: (
				<Text size="sm">
					Yakin ingin menghapus{" "}
					<Text span fw={600}>
						{user.name ?? user.email}
					</Text>
					? Tindakan ini tidak dapat dibatalkan.
				</Text>
			),
			labels: { confirm: "Hapus", cancel: "Batal" },
			confirmProps: { color: "red" },
			onConfirm: async () => {
				try {
					const res = await fetch("/api/admin/users/delete", {
						method: "POST",
						credentials: "include",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ id: user.id }),
					});
					if (!res.ok) {
						const data = await res.json();
						throw new Error(data.error ?? "Gagal menghapus pengguna");
					}
					setUsers((prev) => prev.filter((u) => u.id !== user.id));
				} catch (err) {
					setError(
						err instanceof Error ? err.message : "Gagal menghapus pengguna",
					);
				}
			},
		});
	};

	const formatDate = (iso: string) =>
		new Date(iso).toLocaleDateString("id-ID", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});

	const roleBadge = (role: string | null) => {
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
	};

	return (
		<Container size="lg" py="xl">
			<Group justify="space-between" mb="lg">
				<Stack gap={2}>
					<Title order={2}>Manajemen Pengguna</Title>
					<Text size="sm" c="dimmed">
						Kelola akun dan hak akses pengguna sistem
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

			<div style={{ position: "relative" }}>
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
						{/* Mobile: card layout */}
						<Stack hiddenFrom="sm" gap="sm">
							{users.map((u) => {
								const isSelf = u.id === snap.user?.id;
								return (
									<Paper key={u.id} p="md" withBorder radius="md">
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
													{isSelf && (
														<Text size="xs" c="orange">
															(Anda)
														</Text>
													)}
												</div>
											</Group>
											<Group gap="xs" wrap="nowrap" flex="none">
												<Tooltip
													label={
														isSelf
															? "Tidak dapat mengubah role sendiri"
															: "Ubah role"
													}
												>
													<ActionIcon
														variant="light"
														color="orange"
														size="md"
														disabled={isSelf}
														onClick={() => openRoleModal(u)}
													>
														<IconShield size={14} />
													</ActionIcon>
												</Tooltip>
												<Tooltip
													label={
														u.emailVerified
															? "Batalkan verifikasi"
															: "Verifikasi manual"
													}
												>
													<ActionIcon
														variant="light"
														color={u.emailVerified ? "gray" : "green"}
														size="md"
														onClick={() => handleToggleVerify(u)}
													>
														{u.emailVerified ? (
															<IconCircleX size={14} />
														) : (
															<IconCircleCheck size={14} />
														)}
													</ActionIcon>
												</Tooltip>
												<Tooltip
													label={
														isSelf
															? "Tidak dapat menghapus akun sendiri"
															: "Hapus pengguna"
													}
												>
													<ActionIcon
														variant="light"
														color="red"
														size="md"
														disabled={isSelf}
														onClick={() => handleDeleteUser(u)}
													>
														<IconTrash size={14} />
													</ActionIcon>
												</Tooltip>
											</Group>
										</Group>
										<Group mt="xs" gap="xs">
											{roleBadge(u.role)}
											<Badge
												color={u.emailVerified ? "green" : "gray"}
												variant="dot"
												size="sm"
											>
												{u.emailVerified ? "Terverifikasi" : "Belum"}
											</Badge>
											<Text size="xs" c="dimmed">
												{formatDate(u.createdAt)}
											</Text>
										</Group>
									</Paper>
								);
							})}
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
										<Table.Th>Aksi</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{users.map((u) => {
										const isSelf = u.id === snap.user?.id;
										return (
											<Table.Tr key={u.id}>
												<Table.Td>
													<Group gap="sm">
														<Avatar src={u.image} size={36} radius="xl">
															{(u.name ?? u.email).charAt(0).toUpperCase()}
														</Avatar>
														<div>
															<Text size="sm" fw={500}>
																{u.name ?? "-"}
															</Text>
															{isSelf && (
																<Text size="xs" c="orange">
																	(Anda)
																</Text>
															)}
														</div>
													</Group>
												</Table.Td>
												<Table.Td>
													<Text size="sm">{u.email}</Text>
												</Table.Td>
												<Table.Td>{roleBadge(u.role)}</Table.Td>
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
												<Table.Td>
													<Group gap="xs">
														<Tooltip
															label={
																isSelf
																	? "Tidak dapat mengubah role sendiri"
																	: "Ubah role"
															}
														>
															<ActionIcon
																variant="light"
																color="orange"
																size="lg"
																disabled={isSelf}
																onClick={() => openRoleModal(u)}
															>
																<IconShield size={16} />
															</ActionIcon>
														</Tooltip>
														<Tooltip
															label={
																u.emailVerified
																	? "Batalkan verifikasi"
																	: "Verifikasi manual"
															}
														>
															<ActionIcon
																variant="light"
																color={u.emailVerified ? "gray" : "green"}
																size="lg"
																onClick={() => handleToggleVerify(u)}
															>
																{u.emailVerified ? (
																	<IconCircleX size={16} />
																) : (
																	<IconCircleCheck size={16} />
																)}
															</ActionIcon>
														</Tooltip>
														<Tooltip
															label={
																isSelf
																	? "Tidak dapat menghapus akun sendiri"
																	: "Hapus pengguna"
															}
														>
															<ActionIcon
																variant="light"
																color="red"
																size="lg"
																disabled={isSelf}
																onClick={() => handleDeleteUser(u)}
															>
																<IconTrash size={16} />
															</ActionIcon>
														</Tooltip>
													</Group>
												</Table.Td>
											</Table.Tr>
										);
									})}
								</Table.Tbody>
							</Table>
						</Box>
					</>
				)}
			</div>

			<Modal
				opened={roleModalOpen}
				onClose={() => setRoleModalOpen(false)}
				title="Ubah Role Pengguna"
				centered
				size="sm"
			>
				<LoadingOverlay visible={updating} overlayProps={{ blur: 2 }} />
				<Stack>
					{selectedUser && (
						<Group>
							<Avatar src={selectedUser.image} radius="xl" size="md">
								{(selectedUser.name ?? selectedUser.email)
									.charAt(0)
									.toUpperCase()}
							</Avatar>
							<div>
								<Text fw={600}>{selectedUser.name ?? "-"}</Text>
								<Text size="sm" c="dimmed">
									{selectedUser.email}
								</Text>
							</div>
						</Group>
					)}
					<Select
						label="Role"
						value={newRole}
						onChange={setNewRole}
						data={[
							{ value: "user", label: "Pengguna" },
							{ value: "admin", label: "Admin" },
						]}
					/>
					<Group justify="flex-end" mt="sm">
						<Button
							variant="subtle"
							color="gray"
							onClick={() => setRoleModalOpen(false)}
						>
							Batal
						</Button>
						<Button color="orange" onClick={handleUpdateRole}>
							Simpan
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Container>
	);
}
