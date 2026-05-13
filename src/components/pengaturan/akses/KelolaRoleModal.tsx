import {
	Alert,
	Avatar,
	Badge,
	Box,
	Button,
	Group,
	Modal,
	ScrollArea,
	Select,
	Skeleton,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import { IconCheck, IconKey, IconRefresh, IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

interface UserRow {
	id: string;
	name: string | null;
	email: string;
	image: string | null;
	role: string | null;
}

const ROLE_OPTIONS = [
	{ value: "admin", label: "Administrator" },
	{ value: "user", label: "Pengguna" },
];

interface Props {
	opened: boolean;
	onClose: () => void;
	onRoleChanged?: () => void;
}

export function KelolaRoleModal({ opened, onClose, onRoleChanged }: Props) {
	const [users, setUsers] = useState<UserRow[]>([]);
	const [loading, setLoading] = useState(false);
	const [updating, setUpdating] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [toast, setToast] = useState<string | null>(null);

	const fetchUsers = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/admin/users");
			if (!res.ok) throw new Error("Gagal memuat daftar pengguna");
			const json = await res.json();
			setUsers(json.users ?? []);
		} catch {
			setError("Gagal memuat daftar pengguna");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (opened) fetchUsers();
	}, [opened, fetchUsers]);

	useEffect(() => {
		if (!toast) return;
		const t = setTimeout(() => setToast(null), 2500);
		return () => clearTimeout(t);
	}, [toast]);

	const handleRoleChange = async (userId: string, newRole: string) => {
		setUpdating(userId);
		setError(null);
		try {
			const res = await fetch("/api/admin/users/update-role", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: userId, role: newRole }),
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json.error ?? "Gagal mengubah role");
			setUsers((prev) =>
				prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
			);
			setToast("Role berhasil diubah");
			onRoleChanged?.();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Gagal mengubah role");
		} finally {
			setUpdating(null);
		}
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Group gap="xs">
					<IconKey size={18} />
					<Text fw={700}>Kelola Role & Permission</Text>
				</Group>
			}
			radius="lg"
			size="lg"
		>
			<Stack gap="md">
				{error && (
					<Alert
						color="red"
						icon={<IconX size={16} />}
						radius="md"
						withCloseButton
						onClose={() => setError(null)}
					>
						{error}
					</Alert>
				)}
				{toast && (
					<Alert color="green" icon={<IconCheck size={16} />} radius="md">
						{toast}
					</Alert>
				)}

				<Group justify="space-between">
					<Text fz="sm" c="dimmed">
						{users.length} pengguna terdaftar
					</Text>
					<Tooltip label="Refresh">
						<Button
							size="xs"
							variant="subtle"
							leftSection={<IconRefresh size={14} />}
							loading={loading}
							onClick={fetchUsers}
						>
							Refresh
						</Button>
					</Tooltip>
				</Group>

				<ScrollArea.Autosize mah={440}>
					<Stack gap="xs">
						{loading ? (
							<>
								<Skeleton height={60} radius="md" />
								<Skeleton height={60} radius="md" />
								<Skeleton height={60} radius="md" />
							</>
						) : users.length === 0 ? (
							<Text fz="sm" c="dimmed" ta="center" py="lg">
								Tidak ada pengguna
							</Text>
						) : (
							users.map((u) => (
								<Group
									key={u.id}
									justify="space-between"
									wrap="nowrap"
									p="sm"
									style={(theme) => ({
										border: `1px solid ${theme.colors.gray[3]}`,
										borderRadius: theme.radius.md,
									})}
								>
									<Group
										gap="sm"
										wrap="nowrap"
										style={{ flex: 1, minWidth: 0 }}
									>
										<Avatar src={u.image} radius="xl" size={36} color="violet">
											{(u.name ?? u.email)[0]?.toUpperCase() ?? "?"}
										</Avatar>
										<Box style={{ minWidth: 0 }}>
											<Text fz="sm" fw={600} truncate>
												{u.name ?? "—"}
											</Text>
											<Text fz="xs" c="dimmed" truncate>
												{u.email}
											</Text>
										</Box>
									</Group>
									<Group gap="xs" wrap="nowrap">
										<Badge
											size="xs"
											color={u.role === "admin" ? "red" : "blue"}
											variant="light"
										>
											{u.role === "admin" ? "Admin" : "User"}
										</Badge>
										<Select
											size="xs"
											radius="md"
											data={ROLE_OPTIONS}
											value={u.role ?? "user"}
											onChange={(val) => val && handleRoleChange(u.id, val)}
											disabled={updating === u.id}
											w={140}
											allowDeselect={false}
										/>
									</Group>
								</Group>
							))
						)}
					</Stack>
				</ScrollArea.Autosize>
			</Stack>
		</Modal>
	);
}
