import {
	ActionIcon,
	Avatar,
	Badge,
	Box,
	Button,
	Card,
	Code,
	Divider,
	Grid,
	Group,
	Paper,
	rem,
	Stack,
	Text,
	Title,
	Tooltip,
} from "@mantine/core";

import { modals } from "@mantine/modals";
import {
	IconAt,
	IconCheck,
	IconCopy,
	IconDashboard,
	IconEdit,
	IconExternalLink,
	IconId,
	IconLogout,
	IconShield,
	IconUser,
} from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSnapshot } from "valtio";
import { protectedRouteMiddleware } from "@/middleware/authMiddleware";
import { authClient } from "@/utils/auth-client";
import { authStore } from "../../store/auth";

export const Route = createFileRoute("/profile/")({
	component: Profile,
	beforeLoad: protectedRouteMiddleware,
});

function Profile() {
	const snap = useSnapshot(authStore);
	const navigate = useNavigate();
	const [copied, setCopied] = useState<string | null>(null);

	async function logout() {
		await authClient.signOut();
		navigate({ to: "/signin", search: { redirect: undefined } });
	}

	const openLogoutModal = () =>
		modals.openConfirmModal({
			title: <Text fw={700}>Konfirmasi Keluar</Text>,
			centered: true,
			size: "sm",
			children: (
				<Text size="sm">
					Apakah Anda yakin ingin keluar dari akun Anda? Anda harus masuk
					kembali untuk mengakses data Anda.
				</Text>
			),
			labels: { confirm: "Keluar", cancel: "Batal" },
			confirmProps: { color: "red", leftSection: <IconLogout size={16} /> },
			onConfirm: logout,
		});

	const copyToClipboard = (text: string, key: string) => {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(text);
			setCopied(key);
			setTimeout(() => setCopied(null), 2000);
		}
	};

	interface InfoFieldProps {
		icon: React.ElementType;
		label: string;
		value: string | null | undefined;
		copyable?: boolean;
		id?: string;
	}

	const InfoField = ({
		icon: Icon,
		label,
		value,
		copyable = false,
		id = "",
	}: InfoFieldProps) => (
		<Paper
			withBorder
			p="md"
			radius="md"
			style={{ border: "1px solid var(--mantine-color-default-border)" }}
		>
			<Group wrap="nowrap" align="flex-start">
				<Box mt={3}>
					<Icon
						size={20}
						stroke={1.5}
						color="var(--mantine-color-orange-filled)"
					/>
				</Box>
				<Box style={{ flex: 1 }}>
					<Text size="xs" c="dimmed" tt="uppercase" fw={700} lts={0.5}>
						{label}
					</Text>
					<Group gap="xs" mt={4} wrap="nowrap">
						<Text fw={500} size="sm" truncate="end" style={{ flex: 1 }}>
							{value || "N/A"}
						</Text>
						{copyable && value && (
							<Tooltip
								label={copied === id ? "Copied!" : "Salin ke papan klip"}
								position="top"
								withArrow
							>
								<ActionIcon
									variant="subtle"
									color={copied === id ? "green" : "gray"}
									size="sm"
									onClick={() => copyToClipboard(value, id)}
								>
									{copied === id ? (
										<IconCheck size={14} />
									) : (
										<IconCopy size={14} />
									)}
								</ActionIcon>
							</Tooltip>
						)}
					</Group>
				</Box>
			</Group>
		</Paper>
	);

	return (
		<Stack gap="xl" px={{ base: "xs", sm: "lg" }}>
			{/* Header Section — mobile: icon actions, desktop: full buttons */}
			<Group justify="space-between" align="flex-start" wrap="nowrap">
				<Box style={{ minWidth: 0 }}>
					<Title order={1} c="orange.6">
						Profil Saya
					</Title>
					<Text c="dimmed" size="sm">
						Kelola informasi akun dan pengaturan keamanan Anda
					</Text>
				</Box>

				{/* Mobile: icon-only actions */}
				<Group gap="xs" wrap="nowrap" hiddenFrom="sm" style={{ flexShrink: 0 }}>
					{snap.user?.role === "admin" && (
						<Tooltip label="Admin Panel">
							<ActionIcon
								variant="light"
								color="orange"
								size="lg"
								onClick={() => navigate({ to: "/admin" })}
							>
								<IconDashboard size={16} />
							</ActionIcon>
						</Tooltip>
					)}
					<Tooltip label="Edit Profil">
						<ActionIcon
							variant="light"
							color="blue"
							size="lg"
							onClick={() => navigate({ to: "/profile/edit" })}
						>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label="Keluar">
						<ActionIcon
							variant="outline"
							color="red"
							size="lg"
							onClick={openLogoutModal}
						>
							<IconLogout size={16} />
						</ActionIcon>
					</Tooltip>
				</Group>

				{/* Desktop: full buttons */}
				<Group visibleFrom="sm" style={{ flexShrink: 0 }}>
					{snap.user?.role === "admin" && (
						<Button
							variant="light"
							color="orange"
							leftSection={<IconDashboard size={18} />}
							onClick={() => navigate({ to: "/admin" })}
						>
							Admin Panel
						</Button>
					)}
					<Button
						variant="light"
						color="blue"
						leftSection={<IconEdit size={18} />}
						onClick={() => navigate({ to: "/profile/edit" })}
					>
						Edit Profil
					</Button>
					<Button
						variant="outline"
						color="red"
						leftSection={<IconLogout size={18} />}
						onClick={openLogoutModal}
					>
						Keluar
					</Button>
				</Group>
			</Group>

			<Divider style={{ opacity: 0.1 }} />

			{/* Profile Overview Card */}
			<Card withBorder radius="lg" p={0} style={{ overflow: "hidden" }}>
				<Box
					h={120}
					style={{
						background:
							"linear-gradient(45deg, var(--mantine-color-gray-filled) 0%, var(--mantine-color-dark-filled) 100%)",
						borderBottom: "1px solid var(--mantine-color-default-border)",
					}}
				/>
				<Box px={{ base: "md", sm: "xl" }} pb={{ base: "md", sm: "xl" }} style={{ marginTop: rem(-60) }}>
					<Group align="flex-end" gap="md" mb="md" wrap="nowrap">
						<Avatar
							src={snap.user?.image}
							size={100}
							radius={120}
							style={{
								border: "4px solid var(--mantine-color-body)",
								boxShadow: "var(--mantine-shadow-md)",
								flexShrink: 0,
							}}
						>
							{snap.user?.name?.charAt(0).toUpperCase()}
						</Avatar>
						<Stack gap={0} pb={{ base: "xs", sm: "md" }} style={{ minWidth: 0 }}>
							<Title order={2}>
								{snap.user?.name}
							</Title>
							<Group gap="xs" wrap="wrap">
								<Text c="dimmed" size="sm" truncate>
									{snap.user?.email}
								</Text>
								<Text c="dimmed" size="xs" visibleFrom="xs">•</Text>
								<Badge
									variant="dot"
									color={snap.user?.role === "admin" ? "orange" : "blue"}
									size="sm"
								>
									{snap.user?.role || "user"}
								</Badge>
							</Group>
						</Stack>
					</Group>
				</Box>
			</Card>

			<Grid gutter="lg">
				<Grid.Col span={{ base: 12, md: 7 }}>
					<Stack gap="md">
						<Title order={4} c="orange.6">
							Informasi Identitas
						</Title>
						<Grid gutter="sm">
							<Grid.Col span={{ base: 12, xs: 6 }}>
								<InfoField
									icon={IconUser}
									label="Nama Lengkap"
									value={snap.user?.name}
								/>
							</Grid.Col>
							<Grid.Col span={{ base: 12, xs: 6 }}>
								<InfoField
									icon={IconShield}
									label="Peran"
									value={snap.user?.role || "User"}
								/>
							</Grid.Col>
							<Grid.Col span={12}>
								<InfoField
									icon={IconAt}
									label="Alamat Email"
									value={snap.user?.email}
									copyable
									id="email"
								/>
							</Grid.Col>
							<Grid.Col span={12}>
								<InfoField
									icon={IconId}
									label="Unique User ID"
									value={snap.user?.id}
									copyable
									id="userid"
								/>
							</Grid.Col>
						</Grid>
					</Stack>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 5 }}>
					<Stack gap="md">
						<Title order={4} c="orange.6">
							Keamanan & Sesi
						</Title>
						<Card
							withBorder
							radius="md"
							p="lg"
							style={{
								border: "1px solid var(--mantine-color-default-border)",
							}}
						>
							<Stack gap="md">
								<Box>
									<Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={8}>
										Sesi Saat Ini
									</Text>
									<Group justify="space-between" align="center">
										<Badge color="green" variant="light">
											Aktif Sekarang
										</Badge>
										<Text size="xs" c="dimmed">
											ID: {snap.session?.id?.substring(0, 8)}...
										</Text>
									</Group>
								</Box>

								<Box>
									<Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={8}>
										Session Token
									</Text>
									<Group gap="xs" wrap="nowrap">
										<Code
											block
											style={{
												fontSize: rem(11),
												flex: 1,
											}}
										>
											{snap.session?.token
												? `${snap.session.token.substring(0, 32)}...`
												: "N/A"}
										</Code>
										<ActionIcon
											variant="light"
											color="gray"
											onClick={() =>
												snap.session?.token &&
												copyToClipboard(snap.session.token, "token")
											}
										>
											{copied === "token" ? (
												<IconCheck size={16} />
											) : (
												<IconCopy size={16} />
											)}
										</ActionIcon>
									</Group>
								</Box>

								<Button
									variant="light"
									color="gray"
									fullWidth
									leftSection={<IconExternalLink size={16} />}
								>
									Riwayat Sesi
								</Button>
							</Stack>
						</Card>
					</Stack>
				</Grid.Col>
			</Grid>
		</Stack>
	);
}
