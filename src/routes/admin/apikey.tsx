/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation */
import {
	ActionIcon,
	Alert,
	Badge,
	Box,
	Button,
	Card,
	Container,
	CopyButton,
	Group,
	LoadingOverlay,
	Modal,
	Paper,
	Stack,
	Switch,
	Table,
	Text,
	TextInput,
	Title,
	Tooltip,
} from "@mantine/core";
import { DatePicker, type DatePickerValue } from "@mantine/dates";
import {
	IconCalendar,
	IconCircleCheck,
	IconCircleX,
	IconClock,
	IconCopy,
	IconEye,
	IconEyeOff,
	IconInfoCircle,
	IconKey,
	IconPlus,
	IconTrash,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { protectedRouteMiddleware } from "../../middleware/authMiddleware";
import { apiClient } from "../../utils/api-client";

export const Route = createFileRoute("/admin/apikey")({
	beforeLoad: protectedRouteMiddleware,
	component: DashboardApikeyComponent,
});

interface ApiKey {
	id: string;
	name: string;
	key: string;
	isActive: boolean;
	expiresAt: string | null;
	createdAt: string;
	updatedAt: string;
}

function DashboardApikeyComponent() {
	const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [newKeyName, setNewKeyName] = useState("");
	const [newKeyExpiresAt, setNewKeyExpiresAt] = useState<DatePickerValue>(null);
	const [creating, setCreating] = useState(false);
	const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

	const fetchApiKeys = useCallback(async () => {
		try {
			setLoading(true);
			const { data, error } = await apiClient.GET("/api/apikey/");
			if (data) {
				setApiKeys((data.apiKeys as any) || []);
			}
			if (error) {
				setError("Failed to load API keys");
			}
		} catch (err) {
			setError("Failed to load API keys");
			console.error(err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchApiKeys();
	}, [fetchApiKeys]);

	const handleCreateApiKey = async () => {
		if (!newKeyName.trim()) {
			setError("API key name is required");
			return;
		}

		try {
			setCreating(true);
			const { data, error } = await apiClient.POST("/api/apikey/", {
				body: {
					name: newKeyName,
					expiresAt: newKeyExpiresAt
						? dayjs(newKeyExpiresAt).toISOString()
						: undefined,
				},
			});

			if (data) {
				setApiKeys([...apiKeys, data.apiKey as any]);
				setNewKeyName("");
				setNewKeyExpiresAt(null);
				setCreateModalOpen(false);
			}
			if (error) {
				setError("Failed to create API key");
			}
		} catch (err) {
			setError("Failed to create API key");
			console.error(err);
		} finally {
			setCreating(false);
		}
	};

	const handleToggleApiKey = async (id: string, currentStatus: boolean) => {
		try {
			if (!id) {
				setError("API key ID is required");
				return;
			}
			const { data, error } = await apiClient.POST("/api/apikey/update", {
				body: {
					id,
					isActive: !currentStatus,
				},
			});

			if (data) {
				setApiKeys(
					apiKeys.map((key) =>
						key.id === id ? { ...key, isActive: !currentStatus } : key,
					),
				);
			}
			if (error) {
				setError("Failed to update API key status");
			}
		} catch (err) {
			setError("Failed to update API key status");
			console.error(err);
		}
	};

	const handleDeleteApiKey = async (id: string) => {
		// Store the key ID and open the confirmation modal
		setKeyToDelete(id);
		setDeleteModalOpen(true);
	};

	const confirmDeleteApiKey = async () => {
		if (!keyToDelete) return;

		try {
			const { error } = await apiClient.POST("/api/apikey/delete", {
				body: {
					id: keyToDelete,
				},
			});
			if (!error) {
				setApiKeys(apiKeys.filter((key: ApiKey) => key.id !== keyToDelete));
				setDeleteModalOpen(false);
				setKeyToDelete(null);
			} else {
				setError("Failed to delete API key");
			}
		} catch (err) {
			setError("Failed to delete API key");
			console.error(err);
		}
	};

	const toggleShowKey = (id: string) => {
		setShowKey((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};

	const formatTime = (dateString: string) => {
		return new Date(dateString).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<Container size="lg" py="xl">
			<Title c={"orange"} variant="light" order={1} mb="lg" ta="center">
				API Keys Management
			</Title>

			{error && (
				<Alert title="Error" color="red" mb="md">
					{error}
				</Alert>
			)}

			<Card withBorder p={{ base: "md", sm: "xl" }} radius="md">
				{/* Header: stack on mobile, row on desktop */}
				<Stack hiddenFrom="sm" gap="sm" mb="md">
					<div>
						<Title order={3}>Your API Keys</Title>
						<Text size="sm" c="dimmed">
							Manage your API keys for secure access to our services
						</Text>
					</div>
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={() => setCreateModalOpen(true)}
						variant="light"
						color="blue"
						fullWidth
					>
						Create New API Key
					</Button>
				</Stack>
				<Group visibleFrom="sm" justify="space-between" mb="md">
					<Stack gap={0}>
						<Title order={3}>Your API Keys</Title>
						<Text size="sm" c="dimmed">
							Manage your API keys for secure access to our services
						</Text>
					</Stack>
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={() => setCreateModalOpen(true)}
						variant="light"
						color="blue"
					>
						Create New API Key
					</Button>
				</Group>

				{/* Mobile: card layout */}
				<Stack hiddenFrom="sm" gap="sm">
					{apiKeys.map((apiKey) => (
						<Paper key={apiKey.id} withBorder radius="md" p="md">
							{/* Name + Status toggle */}
							<Group
								justify="space-between"
								align="center"
								mb="xs"
								wrap="nowrap"
							>
								<Text
									fw={600}
									size="sm"
									style={{ flex: 1, minWidth: 0 }}
									truncate
								>
									{apiKey.name}
								</Text>
								<Tooltip
									label={`API Key is ${apiKey.isActive ? "Active" : "Inactive"}`}
								>
									<Switch
										checked={apiKey.isActive}
										onChange={() =>
											handleToggleApiKey(apiKey.id, apiKey.isActive)
										}
										size="sm"
										color={apiKey.isActive ? "green" : "gray"}
										onLabel={<IconCircleCheck size={10} stroke={1.5} />}
										offLabel={<IconCircleX size={10} stroke={1.5} />}
									/>
								</Tooltip>
							</Group>

							{/* Key row */}
							<Group gap={4} mb="sm" wrap="nowrap" style={{ minWidth: 0 }}>
								<Text
									c={showKey[apiKey.id] ? "orange" : "dimmed"}
									style={{
										fontFamily: "monospace",
										fontSize: "0.78rem",
										flex: 1,
										minWidth: 0,
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
								>
									{showKey[apiKey.id] ? apiKey.key : "••••••••••••••••••••••••"}
								</Text>
								<CopyButton value={apiKey.key}>
									{({ copied, copy }) => (
										<Tooltip label={copied ? "Copied" : "Copy"}>
											<ActionIcon
												color={copied ? "green" : "gray"}
												onClick={copy}
												variant="subtle"
												size="sm"
												flex="none"
											>
												<IconCopy size={14} />
											</ActionIcon>
										</Tooltip>
									)}
								</CopyButton>
								<Tooltip label={showKey[apiKey.id] ? "Hide key" : "Show key"}>
									<ActionIcon
										color="gray"
										onClick={() => toggleShowKey(apiKey.id)}
										variant="subtle"
										size="sm"
										flex="none"
									>
										{showKey[apiKey.id] ? (
											<IconEyeOff size={14} />
										) : (
											<IconEye size={14} />
										)}
									</ActionIcon>
								</Tooltip>
							</Group>

							{/* Footer: expiry + created + delete */}
							<Group justify="space-between" align="flex-end">
								<Stack gap={4}>
									<Group gap={4}>
										<IconCalendar
											size={12}
											color="var(--mantine-color-dimmed)"
										/>
										{apiKey.expiresAt ? (
											<Text size="xs">{formatDate(apiKey.expiresAt)}</Text>
										) : (
											<Badge variant="outline" color="blue" size="xs">
												Never Expires
											</Badge>
										)}
									</Group>
									<Group gap={4}>
										<IconClock size={12} color="var(--mantine-color-dimmed)" />
										<Text size="xs" c="dimmed">
											{formatDate(apiKey.createdAt)}{" "}
											{formatTime(apiKey.createdAt)}
										</Text>
									</Group>
								</Stack>
								<Tooltip label="Delete API Key">
									<ActionIcon
										color="red"
										onClick={() => handleDeleteApiKey(apiKey.id)}
										variant="light"
										size="md"
									>
										<IconTrash size={14} />
									</ActionIcon>
								</Tooltip>
							</Group>
						</Paper>
					))}
				</Stack>

				{/* Desktop: table */}
				<Box visibleFrom="sm">
					<Table striped highlightOnHover mt="md" verticalSpacing="md">
						<Table.Thead>
							<Table.Tr>
								<Table.Th>
									<Group gap={6}>
										<IconKey size={16} stroke={1.5} /> Name
									</Group>
								</Table.Th>
								<Table.Th>
									<Group gap={6}>
										<IconKey size={16} stroke={1.5} /> Key
									</Group>
								</Table.Th>
								<Table.Th>
									<Group gap={6}>
										<IconCircleCheck size={16} stroke={1.5} /> Status
									</Group>
								</Table.Th>
								<Table.Th>
									<Group gap={6}>
										<IconCalendar size={16} stroke={1.5} /> Expiration
									</Group>
								</Table.Th>
								<Table.Th>
									<Group gap={6}>
										<IconClock size={16} stroke={1.5} /> Created
									</Group>
								</Table.Th>
								<Table.Th>
									<Group gap={6}>
										<IconInfoCircle size={16} stroke={1.5} /> Actions
									</Group>
								</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{apiKeys.map((apiKey) => (
								<Table.Tr key={apiKey.id}>
									<Table.Td>
										<Text fw={500}>{apiKey.name}</Text>
									</Table.Td>
									<Table.Td>
										<Group gap={6}>
											{showKey[apiKey.id] ? (
												<Text
													c="orange"
													style={{
														fontFamily: "monospace",
														fontSize: "0.85rem",
													}}
												>
													{apiKey.key}
												</Text>
											) : (
												<Text
													c="dimmed"
													style={{
														fontFamily: "monospace",
														fontSize: "0.85rem",
													}}
												>
													••••••••••••••••••••••••••••••••
												</Text>
											)}
											<CopyButton value={apiKey.key}>
												{({ copied, copy }) => (
													<Tooltip label={copied ? "Copied" : "Copy"}>
														<ActionIcon
															color={copied ? "green" : "gray"}
															onClick={copy}
															variant="subtle"
															size="sm"
														>
															<IconCopy size={16} />
														</ActionIcon>
													</Tooltip>
												)}
											</CopyButton>
											<Tooltip
												label={showKey[apiKey.id] ? "Hide key" : "Show key"}
											>
												<ActionIcon
													color="gray"
													onClick={() => toggleShowKey(apiKey.id)}
													variant="subtle"
													size="sm"
												>
													{showKey[apiKey.id] ? (
														<IconEyeOff size={16} />
													) : (
														<IconEye size={16} />
													)}
												</ActionIcon>
											</Tooltip>
										</Group>
									</Table.Td>
									<Table.Td>
										<Group>
											<Tooltip
												label={`API Key is ${apiKey.isActive ? "Active" : "Inactive"}`}
											>
												<Switch
													checked={apiKey.isActive}
													onChange={() =>
														handleToggleApiKey(apiKey.id, apiKey.isActive)
													}
													size="md"
													color={apiKey.isActive ? "green" : "gray"}
													onLabel={<IconCircleCheck size={12} stroke={1.5} />}
													offLabel={<IconCircleX size={12} stroke={1.5} />}
												/>
											</Tooltip>
										</Group>
									</Table.Td>
									<Table.Td>
										{apiKey.expiresAt ? (
											<Group>
												<Text>{formatDate(apiKey.expiresAt)}</Text>
												<Text c="dimmed" size="sm">
													{formatTime(apiKey.expiresAt)}
												</Text>
											</Group>
										) : (
											<Badge variant="outline" color="blue">
												Never Expires
											</Badge>
										)}
									</Table.Td>
									<Table.Td>
										<Group>
											<Text>{formatDate(apiKey.createdAt)}</Text>
											<Text c="dimmed" size="sm">
												{formatTime(apiKey.createdAt)}
											</Text>
										</Group>
									</Table.Td>
									<Table.Td>
										<Group>
											<Tooltip label="Delete API Key">
												<ActionIcon
													color="red"
													onClick={() => handleDeleteApiKey(apiKey.id)}
													variant="light"
													size="lg"
												>
													<IconTrash size={16} />
												</ActionIcon>
											</Tooltip>
										</Group>
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</Box>

				{apiKeys.length === 0 && !loading && (
					<Card p="xl" radius="md" withBorder mt="xl">
						<Group justify="center" align="center">
							<Stack align="center" gap="md">
								<IconKey
									size={48}
									stroke={1.2}
									color="var(--mantine-color-dimmed)"
								/>
								<Text ta="center" c="dimmed" fz="lg">
									No API keys created yet
								</Text>
								<Text ta="center" c="dimmed" size="sm">
									Get started by creating your first API key
								</Text>
								<Button
									leftSection={<IconPlus size={16} />}
									onClick={() => setCreateModalOpen(true)}
									variant="light"
									color="blue"
									mt="md"
								>
									Create New API Key
								</Button>
							</Stack>
						</Group>
					</Card>
				)}
			</Card>

			<Modal
				opened={createModalOpen}
				onClose={() => {
					setCreateModalOpen(false);
					setError(null);
				}}
				title="Create New API Key"
				centered
				size="md"
			>
				<LoadingOverlay
					visible={creating}
					zIndex={1000}
					overlayProps={{ radius: "sm", blur: 2 }}
				/>

				<TextInput
					label="API Key Name"
					placeholder="Enter a descriptive name for your API key"
					value={newKeyName}
					onChange={(e) => setNewKeyName(e.currentTarget.value)}
					mb="md"
					description="Choose a name that identifies the purpose of this API key"
				/>

				<DatePicker
					value={newKeyExpiresAt}
					onChange={setNewKeyExpiresAt}
					mb="md"
				/>

				<Group justify="flex-end" mt="xl">
					<Button
						variant="subtle"
						color="gray"
						onClick={() => {
							setCreateModalOpen(false);
							setError(null);
						}}
					>
						Cancel
					</Button>
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={handleCreateApiKey}
						color="blue"
					>
						Create API Key
					</Button>
				</Group>
			</Modal>

			<Modal
				opened={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				title="Confirm Delete"
				centered
				size="md"
			>
				<Stack>
					<Text>Are you sure you want to delete this API key?</Text>
					<Text size="sm" c="dimmed">
						This action cannot be undone.
					</Text>

					<Group justify="flex-end" mt="xl">
						<Button
							variant="subtle"
							color="gray"
							onClick={() => setDeleteModalOpen(false)}
						>
							Cancel
						</Button>
						<Button color="red" onClick={confirmDeleteApiKey}>
							Delete API Key
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Container>
	);
}
