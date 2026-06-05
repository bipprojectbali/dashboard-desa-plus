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
import {
	IconAlertCircle,
	IconCheck,
	IconDeviceFloppy,
	IconRefresh,
	IconShieldLock,
	IconX,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/admin/roles")({
	component: RolesPage,
});

type FeatureDef = { key: string; label: string };

type PermissionMatrix = Record<string, Record<string, boolean>>;

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
	admin: { label: "ADMIN", color: "red" },
	user: { label: "PENGGUNA", color: "blue" },
};

function RolesPage() {
	const [matrix, setMatrix] = useState<PermissionMatrix>({});
	const [features, setFeatures] = useState<FeatureDef[]>([]);
	const [roles, setRoles] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [dirty, setDirty] = useState(false);
	const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const abortRef = useRef<AbortController | null>(null);
	const mountedRef = useRef(true);

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
			abortRef.current?.abort();
			if (successTimer.current) clearTimeout(successTimer.current);
		};
	}, []);

	const fetchPermissions = useCallback(async () => {
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/admin/roles/permissions", {
				signal: controller.signal,
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(
					(body as { error?: string }).error ?? "Gagal memuat data permission",
				);
			}
			const data = (await res.json()) as {
				matrix: PermissionMatrix;
				features: FeatureDef[];
				roles: string[];
			};
			if (!mountedRef.current) return;
			setMatrix(data.matrix);
			setFeatures(data.features);
			setRoles(data.roles);
			setDirty(false);
		} catch (err) {
			if (err instanceof Error && err.name === "AbortError") return;
			if (mountedRef.current)
				setError(err instanceof Error ? err.message : "Terjadi kesalahan");
		} finally {
			if (!controller.signal.aborted && mountedRef.current) setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchPermissions();
	}, [fetchPermissions]);

	const toggle = (role: string, feature: string) => {
		if (role === "admin") return; // admin selalu full access
		if (feature === "sync-noc") return; // sync-noc tidak bisa diubah oleh siapapun selain admin
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
		setSaveError(null);
		setSaveSuccess(false);
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

			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(
					(body as { error?: string }).error ?? "Gagal menyimpan permission",
				);
			}

			if (!mountedRef.current) return;
			setDirty(false);
			setSaveSuccess(true);
			if (successTimer.current) clearTimeout(successTimer.current);
			successTimer.current = setTimeout(() => {
				if (mountedRef.current) setSaveSuccess(false);
			}, 4000);
		} catch (err) {
			if (mountedRef.current)
				setSaveError(err instanceof Error ? err.message : "Terjadi kesalahan");
		} finally {
			if (mountedRef.current) setSaving(false);
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
						<Title order={2} fw={700} c={"orange"} variant="light">
							Manajemen Role & Permission
						</Title>
					</Group>
					<Text size="sm" c="dimmed">
						Konfigurasi akses menu per role. Admin mendapat akses penuh termasuk
						Sinkronisasi. Pengguna hanya bisa melihat data.
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

			{saveSuccess && (
				<Alert
					icon={<IconCheck size={16} />}
					color="green"
					variant="light"
					withCloseButton
					onClose={() => setSaveSuccess(false)}
				>
					Konfigurasi permission berhasil diperbarui.
				</Alert>
			)}

			{saveError && (
				<Alert
					icon={<IconX size={16} />}
					color="red"
					variant="light"
					withCloseButton
					onClose={() => setSaveError(null)}
				>
					{saveError}
				</Alert>
			)}

			{dirty && !saveSuccess && (
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
										const isSyncNocForUser =
											role !== "admin" && feature.key === "sync-noc";
										const isDisabled = isAdmin || isSyncNocForUser;
										const checked = isAdmin
											? true
											: isSyncNocForUser
												? false
												: (matrix[role]?.[feature.key] ?? false);
										const tooltipLabel = isAdmin
											? "Admin selalu memiliki akses penuh"
											: isSyncNocForUser
												? "Sinkronisasi Data hanya tersedia untuk Admin"
												: checked
													? "Klik untuk menonaktifkan"
													: "Klik untuk mengaktifkan";
										return (
											<Table.Td key={role} style={{ textAlign: "center" }}>
												<Tooltip label={tooltipLabel} openDelay={400}>
													<Center>
														<Checkbox
															checked={checked}
															disabled={isDisabled}
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
				* Role <strong>ADMIN</strong> selalu memiliki akses ke semua menu
				termasuk Sinkronisasi dan tidak dapat diubah. Role{" "}
				<strong>PENGGUNA</strong> secara default hanya dapat melihat data.
			</Text>
		</Stack>
	);
}
