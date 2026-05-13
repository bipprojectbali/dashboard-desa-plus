import {
	Alert,
	Badge,
	Box,
	Button,
	CopyButton,
	Divider,
	Group,
	Modal,
	ScrollArea,
	Select,
	Skeleton,
	Stack,
	Text,
	TextInput,
	Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
	IconCheck,
	IconClock,
	IconCopy,
	IconLink,
	IconMailPlus,
	IconRefresh,
	IconX,
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

interface InviteResult {
	link: string;
	role: string;
	expiresAt: string;
}

interface InviteEntry {
	id: string;
	link: string;
	email: string | null;
	role: string;
	expiresAt: string;
	expired: boolean;
	used: boolean;
	createdAt: string;
}

const ROLE_OPTIONS = [
	{ value: "user", label: "Pengguna" },
	{ value: "admin", label: "Administrator" },
];

interface Props {
	opened: boolean;
	onClose: () => void;
}

export function UndanganModal({ opened, onClose }: Props) {
	const [generating, setGenerating] = useState(false);
	const [result, setResult] = useState<InviteResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [history, setHistory] = useState<InviteEntry[]>([]);
	const [historyLoading, setHistoryLoading] = useState(false);

	const form = useForm({
		initialValues: { email: "", role: "user" },
	});

	const fetchHistory = useCallback(async () => {
		setHistoryLoading(true);
		try {
			const res = await fetch("/api/invitation/list");
			if (!res.ok) return;
			const json = await res.json();
			setHistory(json.data ?? []);
		} catch {
			// silent
		} finally {
			setHistoryLoading(false);
		}
	}, []);

	useEffect(() => {
		if (opened) {
			setResult(null);
			setError(null);
			form.reset();
			fetchHistory();
		}
	}, [opened, fetchHistory]);

	const handleGenerate = form.onSubmit(async (values) => {
		setGenerating(true);
		setError(null);
		setResult(null);
		try {
			const res = await fetch("/api/invitation", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: values.email || undefined,
					role: values.role,
				}),
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json.error ?? "Gagal membuat undangan");
			setResult(json.data as InviteResult);
			fetchHistory();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Gagal membuat undangan");
		} finally {
			setGenerating(false);
		}
	});

	function formatExpiry(date: string) {
		return new Date(date).toLocaleString("id-ID", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Group gap="xs">
					<IconMailPlus size={18} />
					<Text fw={700}>Undangan Anggota Baru</Text>
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

				{/* Form generate link */}
				<form onSubmit={handleGenerate}>
					<Stack gap="sm">
						<Text fz="sm" fw={600}>
							Generate Link Undangan
						</Text>
						<Group align="flex-end" wrap="nowrap" gap="sm">
							<TextInput
								label="Email (opsional)"
								placeholder="email@desa.go.id"
								radius="md"
								style={{ flex: 1 }}
								{...form.getInputProps("email")}
							/>
							<Select
								label="Role"
								data={ROLE_OPTIONS}
								radius="md"
								w={150}
								allowDeselect={false}
								{...form.getInputProps("role")}
							/>
							<Button
								type="submit"
								loading={generating}
								radius="md"
								variant="gradient"
								gradient={{ from: "violet", to: "grape" }}
								leftSection={<IconLink size={16} />}
								mb={1}
							>
								Generate
							</Button>
						</Group>
						<Text fz="xs" c="dimmed">
							Link berlaku 48 jam. Bagikan ke calon anggota — mereka daftar via
							link ini.
						</Text>
					</Stack>
				</form>

				{/* Hasil link */}
				{result && (
					<Box
						p="md"
						style={(theme) => ({
							border: `1px solid ${theme.colors.green[4]}`,
							borderRadius: theme.radius.md,
							background: theme.colors.green[0],
						})}
					>
						<Group justify="space-between" mb="xs">
							<Group gap="xs">
								<IconCheck size={16} color="green" />
								<Text fz="sm" fw={600} c="green.7">
									Link berhasil dibuat
								</Text>
							</Group>
							<Badge
								size="xs"
								color={result.role === "admin" ? "red" : "blue"}
								variant="light"
							>
								{result.role === "admin" ? "Administrator" : "Pengguna"}
							</Badge>
						</Group>
						<Group gap="xs" wrap="nowrap">
							<Text
								fz="xs"
								ff="monospace"
								c="dimmed"
								style={{
									flex: 1,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}
							>
								{result.link}
							</Text>
							<CopyButton value={result.link} timeout={2000}>
								{({ copied, copy }) => (
									<Tooltip label={copied ? "Tersalin!" : "Salin link"}>
										<Button
											size="xs"
											variant="light"
											color={copied ? "green" : "violet"}
											radius="md"
											onClick={copy}
											leftSection={
												copied ? (
													<IconCheck size={14} />
												) : (
													<IconCopy size={14} />
												)
											}
										>
											{copied ? "Tersalin" : "Salin"}
										</Button>
									</Tooltip>
								)}
							</CopyButton>
						</Group>
						<Group gap="xs" mt="xs">
							<IconClock size={12} color="gray" />
							<Text fz="xs" c="dimmed">
								Kadaluarsa: {formatExpiry(result.expiresAt)}
							</Text>
						</Group>
					</Box>
				)}

				<Divider />

				{/* Riwayat undangan */}
				<Group justify="space-between">
					<Text fz="sm" fw={600}>
						Riwayat Undangan
					</Text>
					<Tooltip label="Refresh">
						<Button
							size="xs"
							variant="subtle"
							leftSection={<IconRefresh size={14} />}
							loading={historyLoading}
							onClick={fetchHistory}
						>
							Refresh
						</Button>
					</Tooltip>
				</Group>

				<ScrollArea.Autosize mah={220}>
					<Stack gap="xs">
						{historyLoading ? (
							<>
								<Skeleton height={48} radius="md" />
								<Skeleton height={48} radius="md" />
							</>
						) : history.length === 0 ? (
							<Text fz="sm" c="dimmed" ta="center" py="sm">
								Belum ada undangan dibuat
							</Text>
						) : (
							history.map((inv) => (
								<Group
									key={inv.id}
									justify="space-between"
									wrap="nowrap"
									p="sm"
									style={(theme) => ({
										border: `1px solid ${theme.colors.gray[3]}`,
										borderRadius: theme.radius.md,
										opacity: inv.expired || inv.used ? 0.6 : 1,
									})}
								>
									<Box style={{ minWidth: 0, flex: 1 }}>
										<Group gap="xs">
											<Text fz="xs" fw={600} truncate>
												{inv.email ?? "Tanpa email"}
											</Text>
											<Badge
												size="xs"
												color={inv.role === "admin" ? "red" : "blue"}
												variant="light"
											>
												{inv.role === "admin" ? "Admin" : "User"}
											</Badge>
											{inv.used && (
												<Badge size="xs" color="green" variant="light">
													Digunakan
												</Badge>
											)}
											{!inv.used && inv.expired && (
												<Badge size="xs" color="gray" variant="light">
													Kadaluarsa
												</Badge>
											)}
											{!inv.used && !inv.expired && (
												<Badge size="xs" color="orange" variant="light">
													Aktif
												</Badge>
											)}
										</Group>
										<Text fz="xs" c="dimmed">
											Berlaku s.d. {formatExpiry(inv.expiresAt)}
										</Text>
									</Box>
									{!inv.used && !inv.expired && (
										<CopyButton value={inv.link} timeout={2000}>
											{({ copied, copy }) => (
												<Tooltip label={copied ? "Tersalin!" : "Salin link"}>
													<Button
														size="xs"
														variant="subtle"
														color={copied ? "green" : "gray"}
														onClick={copy}
													>
														{copied ? (
															<IconCheck size={14} />
														) : (
															<IconCopy size={14} />
														)}
													</Button>
												</Tooltip>
											)}
										</CopyButton>
									)}
								</Group>
							))
						)}
					</Stack>
				</ScrollArea.Autosize>
			</Stack>
		</Modal>
	);
}
