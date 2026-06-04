import {
	Alert,
	Badge,
	Box,
	Button,
	Code,
	Container,
	Group,
	LoadingOverlay,
	MultiSelect,
	Pagination,
	Paper,
	Select,
	Stack,
	Table,
	Text,
	Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
	IconAlertCircle,
	IconDownload,
	IconShieldCheck,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { protectedRouteMiddleware } from "../../middleware/authMiddleware";

export const Route = createFileRoute("/admin/audit-log")({
	beforeLoad: protectedRouteMiddleware,
	component: AuditLogComponent,
});

interface LogRow {
	id: string;
	userId: string;
	action: string;
	detail: string | null;
	ipAddress: string | null;
	createdAt: string;
	user: { name: string | null; email: string } | null;
}

interface UserOption {
	value: string;
	label: string;
}

const ACTION_OPTIONS = [
	{ value: "login", label: "Login" },
	{ value: "update-role", label: "Update Role" },
	{ value: "delete-user", label: "Delete User" },
	{ value: "create-api-key", label: "Create API Key" },
	{ value: "delete-api-key", label: "Delete API Key" },
	{ value: "demografi-sync", label: "Demografi Sync" },
	{ value: "noc-sync", label: "NOC Sync" },
];

function formatDetail(detail: string | null): string {
	if (!detail) return "-";
	try {
		const obj = JSON.parse(detail) as Record<string, unknown>;
		return Object.entries(obj)
			.map(([k, v]) => `${k}: ${v}`)
			.join(", ");
	} catch {
		return detail;
	}
}

function AuditLogComponent() {
	const [logs, setLogs] = useState<LogRow[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [userId, setUserId] = useState<string | null>(null);
	const [actions, setActions] = useState<string[]>([]);
	const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
		null,
		null,
	]);
	const [users, setUsers] = useState<UserOption[]>([]);

	useEffect(() => {
		fetch("/api/admin/users", { credentials: "include" })
			.then((r) => r.json())
			.then(
				(data: {
					users?: { id: string; name: string | null; email: string }[];
				}) => {
					setUsers(
						(data.users ?? []).map((u) => ({
							value: u.id,
							label: u.name ? `${u.name} (${u.email})` : u.email,
						})),
					);
				},
			)
			.catch(() => {});
	}, []);

	const fetchLogs = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const params = new URLSearchParams({ page: String(page) });
			if (userId) params.set("userId", userId);
			if (actions.length) params.set("action", actions.join(","));
			if (dateRange[0]) params.set("from", dateRange[0].toISOString());
			if (dateRange[1]) params.set("to", dateRange[1].toISOString());

			const res = await fetch(`/api/admin/activity-logs?${params}`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error("Gagal memuat audit log");
			const json = (await res.json()) as { data: LogRow[]; total: number };
			setLogs(json.data ?? []);
			setTotal(json.total ?? 0);
		} catch {
			setError("Gagal memuat audit log");
		} finally {
			setLoading(false);
		}
	}, [page, userId, actions, dateRange]);

	useEffect(() => {
		fetchLogs();
	}, [fetchLogs]);

	const handleExportCSV = () => {
		const params = new URLSearchParams();
		if (userId) params.set("userId", userId);
		if (actions.length) params.set("action", actions.join(","));
		if (dateRange[0]) params.set("from", dateRange[0].toISOString());
		if (dateRange[1]) params.set("to", dateRange[1].toISOString());
		window.location.href = `/api/admin/activity-logs/export?${params}`;
	};

	const formatDate = (iso: string) =>
		new Date(iso).toLocaleString("id-ID", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});

	return (
		<Container size="xl" py="xl">
			<Group justify="space-between" mb="lg">
				<Stack gap={2}>
					<Title c={"orange"} variant="light" order={2}>
						Audit Log
					</Title>
					<Text size="sm" c="dimmed">
						Riwayat aktivitas seluruh pengguna sistem
					</Text>
				</Stack>
				<Badge
					size="lg"
					variant="outline"
					leftSection={<IconShieldCheck size={14} />}
				>
					{total} log
				</Badge>
			</Group>

			<Paper p="md" withBorder radius="md" mb="md">
				<Group align="flex-end" wrap="wrap" gap="sm">
					<Select
						label="User"
						placeholder="Semua user"
						data={users}
						value={userId}
						onChange={(v) => {
							setUserId(v);
							setPage(1);
						}}
						clearable
						searchable
						w={220}
					/>
					<MultiSelect
						label="Action"
						placeholder="Semua action"
						data={ACTION_OPTIONS}
						value={actions}
						onChange={(v) => {
							setActions(v);
							setPage(1);
						}}
						clearable
						w={240}
					/>
					<DatePickerInput
						type="range"
						label="Rentang Tanggal"
						placeholder="Pilih rentang"
						value={dateRange}
						onChange={(v) => {
							setDateRange([
								v[0] ? new Date(v[0]) : null,
								v[1] ? new Date(v[1]) : null,
							]);
							setPage(1);
						}}
						clearable
						w={260}
					/>
					<Button
						variant="outline"
						leftSection={<IconDownload size={16} />}
						onClick={handleExportCSV}
					>
						Export CSV
					</Button>
				</Group>
			</Paper>

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

				{!loading && logs.length === 0 ? (
					<Stack align="center" py="xl" gap="sm">
						<IconShieldCheck
							size={48}
							stroke={1.2}
							color="var(--mantine-color-dimmed)"
						/>
						<Text c="dimmed">Tidak ada log ditemukan</Text>
					</Stack>
				) : (
					<Box>
						<Table
							striped
							highlightOnHover
							verticalSpacing="sm"
							withTableBorder
						>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Waktu</Table.Th>
									<Table.Th>User</Table.Th>
									<Table.Th>Action</Table.Th>
									<Table.Th>Detail</Table.Th>
									<Table.Th>IP Address</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{logs.map((log) => (
									<Table.Tr key={log.id}>
										<Table.Td>
											<Text
												size="xs"
												c="dimmed"
												style={{ whiteSpace: "nowrap" }}
											>
												{formatDate(log.createdAt)}
											</Text>
										</Table.Td>
										<Table.Td>
											<Text size="sm" fw={500}>
												{log.user?.name ?? "-"}
											</Text>
											<Text size="xs" c="dimmed">
												{log.user?.email ?? "-"}
											</Text>
										</Table.Td>
										<Table.Td>
											<Code>{log.action}</Code>
										</Table.Td>
										<Table.Td>
											<Text size="xs" c="dimmed" style={{ maxWidth: 300 }}>
												{formatDetail(log.detail)}
											</Text>
										</Table.Td>
										<Table.Td>
											<Code>{log.ipAddress ?? "-"}</Code>
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>

						{total > 50 && (
							<Group justify="center" mt="md">
								<Pagination
									value={page}
									onChange={setPage}
									total={Math.ceil(total / 50)}
									size="sm"
								/>
							</Group>
						)}
					</Box>
				)}
			</div>
		</Container>
	);
}
