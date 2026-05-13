import {
	ActionIcon,
	Alert,
	Badge,
	Box,
	Button,
	Group,
	Modal,
	ScrollArea,
	Skeleton,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import {
	IconDeviceDesktop,
	IconDeviceMobile,
	IconLogout,
	IconRefresh,
	IconShieldLock,
	IconX,
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { authClient } from "@/utils/auth-client";

interface Session {
	id: string;
	token: string;
	ipAddress?: string | null;
	userAgent?: string | null;
	createdAt: string | Date;
	expiresAt: string | Date;
	current?: boolean;
}

function parseDevice(userAgent?: string | null): {
	label: string;
	mobile: boolean;
} {
	if (!userAgent) return { label: "Perangkat tidak diketahui", mobile: false };
	const ua = userAgent.toLowerCase();
	const mobile =
		ua.includes("mobile") || ua.includes("android") || ua.includes("iphone");
	if (ua.includes("chrome"))
		return { label: `Chrome (${mobile ? "Mobile" : "Desktop"})`, mobile };
	if (ua.includes("firefox"))
		return { label: `Firefox (${mobile ? "Mobile" : "Desktop"})`, mobile };
	if (ua.includes("safari"))
		return { label: `Safari (${mobile ? "Mobile" : "Desktop"})`, mobile };
	if (ua.includes("edge"))
		return { label: `Edge (${mobile ? "Mobile" : "Desktop"})`, mobile };
	return { label: mobile ? "Browser Mobile" : "Browser Desktop", mobile };
}

function formatDate(date: string | Date) {
	return new Date(date).toLocaleString("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

interface Props {
	opened: boolean;
	onClose: () => void;
}

export function SesiAktifModal({ opened, onClose }: Props) {
	const [sessions, setSessions] = useState<Session[]>([]);
	const [loading, setLoading] = useState(false);
	const [revoking, setRevoking] = useState<string | null>(null);
	const [revokingAll, setRevokingAll] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { log } = useActivityLogger();

	const fetchSessions = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await authClient.listSessions();
			if (res.error) throw new Error(res.error.message ?? "Gagal memuat sesi");
			setSessions((res.data as Session[]) ?? []);
		} catch {
			setError("Gagal memuat daftar sesi aktif");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (opened) fetchSessions();
	}, [opened, fetchSessions]);

	const handleRevoke = async (token: string) => {
		setRevoking(token);
		try {
			await authClient.revokeSession({ token });
			setSessions((prev) => prev.filter((s) => s.token !== token));
			log("cabut-sesi", "Satu sesi dicabut secara manual");
		} catch {
			setError("Gagal mencabut sesi");
		} finally {
			setRevoking(null);
		}
	};

	const handleRevokeOthers = async () => {
		setRevokingAll(true);
		try {
			await authClient.revokeOtherSessions();
			log("logout-semua-sesi", "Semua sesi lain dicabut");
			await fetchSessions();
		} catch {
			setError("Gagal logout sesi lain");
		} finally {
			setRevokingAll(false);
		}
	};

	const currentSession = sessions.find((s) => s.current);
	const otherSessions = sessions.filter((s) => !s.current);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Group gap="xs">
					<IconShieldLock size={18} />
					<Text fw={700}>Sesi Aktif & Perangkat Terdaftar</Text>
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

				<Group justify="space-between">
					<Text fz="sm" c="dimmed">
						{sessions.length} sesi aktif ditemukan
					</Text>
					<Group gap="xs">
						<Tooltip label="Refresh">
							<ActionIcon
								variant="subtle"
								onClick={fetchSessions}
								loading={loading}
							>
								<IconRefresh size={16} />
							</ActionIcon>
						</Tooltip>
						{otherSessions.length > 0 && (
							<Button
								size="xs"
								color="red"
								variant="light"
								radius="md"
								loading={revokingAll}
								leftSection={<IconLogout size={14} />}
								onClick={handleRevokeOthers}
							>
								Logout Semua Sesi Lain
							</Button>
						)}
					</Group>
				</Group>

				<ScrollArea.Autosize mah={420}>
					<Stack gap="sm">
						{loading ? (
							<>
								<Skeleton height={72} radius="md" />
								<Skeleton height={72} radius="md" />
								<Skeleton height={72} radius="md" />
							</>
						) : sessions.length === 0 ? (
							<Text fz="sm" c="dimmed" ta="center" py="lg">
								Tidak ada sesi aktif
							</Text>
						) : (
							<>
								{currentSession && (
									<SessionCard
										session={currentSession}
										isCurrent
										onRevoke={handleRevoke}
										revoking={revoking}
									/>
								)}
								{otherSessions.map((s) => (
									<SessionCard
										key={s.id}
										session={s}
										isCurrent={false}
										onRevoke={handleRevoke}
										revoking={revoking}
									/>
								))}
							</>
						)}
					</Stack>
				</ScrollArea.Autosize>
			</Stack>
		</Modal>
	);
}

function SessionCard({
	session,
	isCurrent,
	onRevoke,
	revoking,
}: {
	session: Session;
	isCurrent: boolean;
	onRevoke: (token: string) => void;
	revoking: string | null;
}) {
	const device = parseDevice(session.userAgent);

	return (
		<Box
			p="md"
			style={(theme) => ({
				border: `1px solid ${isCurrent ? theme.colors.blue[5] : theme.colors.gray[3]}`,
				borderRadius: theme.radius.md,
				background: isCurrent ? theme.colors.blue[0] : undefined,
			})}
		>
			<Group justify="space-between" wrap="nowrap">
				<Group gap="sm" wrap="nowrap">
					{device.mobile ? (
						<IconDeviceMobile size={24} color="gray" />
					) : (
						<IconDeviceDesktop size={24} color="gray" />
					)}
					<Box>
						<Group gap={6}>
							<Text fz="sm" fw={600}>
								{device.label}
							</Text>
							{isCurrent && (
								<Badge size="xs" color="blue" variant="light">
									Sesi Ini
								</Badge>
							)}
						</Group>
						<Text fz="xs" c="dimmed">
							{session.ipAddress ?? "IP tidak diketahui"} · Login{" "}
							{formatDate(session.createdAt)}
						</Text>
					</Box>
				</Group>
				{!isCurrent && (
					<Tooltip label="Cabut sesi ini">
						<ActionIcon
							color="red"
							variant="light"
							radius="md"
							loading={revoking === session.token}
							onClick={() => onRevoke(session.token)}
						>
							<IconLogout size={16} />
						</ActionIcon>
					</Tooltip>
				)}
			</Group>
		</Box>
	);
}
