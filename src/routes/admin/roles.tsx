import {
	ActionIcon,
	Alert,
	Badge,
	Box,
	Button,
	Card,
	Center,
	Checkbox,
	Group,
	Loader,
	rem,
	Stack,
	Table,
	Text,
	Title,
	Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
	IconAlertCircle,
	IconCheck,
	IconDeviceFloppy,
	IconRefresh,
	IconShieldLock,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

export const Route = createFileRoute("/admin/roles")({
	component: RolesPage,
});

type FeatureDef = { key: string; label: string };

type PermissionMatrix = Record<string, Record<string, boolean>>;

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
	admin: { label: "ADMIN", color: "red" },
	petugas: { label: "PETUGAS", color: "blue" },
	viewer: { label: "VIEWER", color: "gray" },
};

function RolesPage() {
	const [matrix, setMatrix] = useState<PermissionMatrix>({});
	const [features, setFeatures] = useState<FeatureDef[]>([]);
	const [roles, setRoles] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [dirty, setDirty] = useState(false);

	const fetchPermissions = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/admin/roles/permissions");
			if (!res.ok) throw new Error("Gagal memuat data permission");
			const data = (await res.json()) as {
				matrix: PermissionMatrix;
				features: FeatureDef[];
				roles: string[];
			};
			setMatrix(data.matrix);
			setFeatures(data.features);
			setRoles(data.roles);
			setDirty(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Terjadi kesalahan");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchPermissions();
	}, [fetchPermissions]);

	const toggle = (role: string, feature: string) => {
		if (role === "admin") return; // admin selalu full access
		setMatrix((prev) => ({
			...prev,
			[role]: {
				...prev[role],
				[feature]: !prev[role]?.[feature],
			},
		}));
		setDirty(true);
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			const permissions: { role: string; feature: string; allowed: boolean }[] =
				[];
			for (const role of roles) {
				if (role === "admin") continue;
				for (const f of features) {
					permissions.push({
						role,
						feature: f.key,
						allowed: matrix[role]?.[f.key] ?? false,
					});
				}
			}

			const res = await fetch("/api/admin/roles/permissions", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ permissions }),
			});

			if (!res.ok) throw new Error("Gagal menyimpan permission");

			setDirty(false);
			notifications.show({
				title: "Tersimpan",
				message: "Konfigurasi permission berhasil diperbarui",
				color: "green",
				icon: <IconCheck size={16} />,
			});
		} catch (err) {
			notifications.show({
				title: "Gagal menyimpan",
				message: err instanceof Error ? err.message : "Terjadi kesalahan",
				color: "red",
			});
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<Center h={300}>
				<Loader size="lg" color="orange" />
			</Center>
		);
	}

	if (error) {
		return (
			<Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
				{error}
				<Button
					mt="sm"
					size="xs"
					onClick={fetchPermissions}
					leftSection={<IconRefresh size={14} />}
				>
					Coba lagi
				</Button>
			</Alert>
		);
	}

	return (
		<Stack gap="lg">
			<Group justify="space-between" align="flex-start">
				<Box>
					<Group gap="xs" mb={4}>
						<IconShieldLock
							style={{ width: rem(24), height: rem(24) }}
							color="var(--mantine-color-orange-6)"
						/>
						<Title order={2} fw={700}>
							Manajemen Role & Permission
						</Title>
					</Group>
					<Text size="sm" c="dimmed">
						Konfigurasi hak akses fitur per role pengguna. Admin selalu memiliki
						akses penuh.
					</Text>
				</Box>

				<Group gap="xs">
					<Tooltip label="Muat ulang data">
						<ActionIcon
							variant="light"
							size="lg"
							onClick={fetchPermissions}
							disabled={saving}
						>
							<IconRefresh size={18} />
						</ActionIcon>
					</Tooltip>

					<Button
						leftSection={<IconDeviceFloppy size={16} />}
						color="orange"
						onClick={handleSave}
						loading={saving}
						disabled={!dirty}
					>
						Simpan Perubahan
					</Button>
				</Group>
			</Group>

			{dirty && (
				<Alert color="yellow" variant="light">
					Ada perubahan yang belum disimpan. Klik{" "}
					<strong>Simpan Perubahan</strong> untuk menerapkan.
				</Alert>
			)}

			<Card withBorder radius="md" p={0}>
				<Box style={{ overflowX: "auto" }}>
					<Table highlightOnHover striped withTableBorder withColumnBorders>
						<Table.Thead>
							<Table.Tr>
								<Table.Th
									style={{
										minWidth: 220,
										position: "sticky",
										left: 0,
										background: "var(--mantine-color-body)",
										zIndex: 1,
									}}
								>
									<Text size="sm" fw={600}>
										Fitur / Permission
									</Text>
								</Table.Th>
								{roles.map((role) => (
									<Table.Th
										key={role}
										style={{ textAlign: "center", minWidth: 110 }}
									>
										<Badge
											color={ROLE_LABELS[role]?.color ?? "gray"}
											variant="filled"
											size="md"
										>
											{ROLE_LABELS[role]?.label ?? role.toUpperCase()}
										</Badge>
									</Table.Th>
								))}
							</Table.Tr>
						</Table.Thead>

						<Table.Tbody>
							{features.map((feature) => (
								<Table.Tr key={feature.key}>
									<Table.Td
										style={{
											position: "sticky",
											left: 0,
											background: "var(--mantine-color-body)",
											zIndex: 1,
										}}
									>
										<Text size="sm">{feature.label}</Text>
										<Text size="xs" c="dimmed" ff="monospace">
											{feature.key}
										</Text>
									</Table.Td>
									{roles.map((role) => {
										const isAdmin = role === "admin";
										const checked = isAdmin
											? true
											: (matrix[role]?.[feature.key] ?? false);
										return (
											<Table.Td key={role} style={{ textAlign: "center" }}>
												<Tooltip
													label={
														isAdmin
															? "Admin selalu memiliki akses penuh"
															: checked
																? "Klik untuk menonaktifkan"
																: "Klik untuk mengaktifkan"
													}
													openDelay={400}
												>
													<Center>
														<Checkbox
															checked={checked}
															disabled={isAdmin}
															onChange={() => toggle(role, feature.key)}
															color="orange"
															size="md"
														/>
													</Center>
												</Tooltip>
											</Table.Td>
										);
									})}
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</Box>
			</Card>

			<Text size="xs" c="dimmed">
				* Role <strong>ADMIN</strong> selalu memiliki akses ke semua fitur dan
				tidak dapat diubah. Perubahan permission hanya berlaku untuk role{" "}
				<strong>PETUGAS</strong> dan <strong>VIEWER</strong>.
			</Text>
		</Stack>
	);
}
