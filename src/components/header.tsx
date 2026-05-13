import {
	ActionIcon,
	Anchor,
	Avatar,
	Badge,
	Box,
	Breadcrumbs,
	Divider,
	Group,
	Text,
	useMantineColorScheme,
} from "@mantine/core";
import {
	IconLayoutSidebarLeftCollapse,
	IconUserShield,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Bell, Moon, Sun, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { useTranslate } from "@/hooks/useTranslate";
import { authStore } from "@/store/auth";
import { i18nStore } from "@/store/i18n";

interface HeaderProps {
	onSidebarToggle?: () => void;
	/** Jumlah notifikasi belum dibaca, default 0 */
	unreadCount?: number;
}

export function Header({ onSidebarToggle, unreadCount = 0 }: HeaderProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";
	const snap = useSnapshot(authStore);
	const { zonaWaktu, formatTanggal } = useSnapshot(i18nStore);
	const t = useTranslate();
	const [waktu, setWaktu] = useState("");
	const [tanggal, setTanggal] = useState("");

	// ── Clock ──────────────────────────────────────────────────────────────────
	useEffect(() => {
		const fmt = new Intl.DateTimeFormat([], {
			timeZone: zonaWaktu,
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
		});
		const tick = () => setWaktu(fmt.format(new Date()));
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, [zonaWaktu]);

	// ── Date ───────────────────────────────────────────────────────────────────
	useEffect(() => {
		const now = new Date();
		const parts = new Intl.DateTimeFormat("en-CA", {
			timeZone: zonaWaktu,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		})
			.formatToParts(now)
			.reduce(
				(acc, p) => {
					if (p.type !== "literal") acc[p.type] = p.value;
					return acc;
				},
				{} as Record<string, string>,
			);
		const { year, month, day } = parts;
		const formatted =
			formatTanggal === "MM/DD/YYYY"
				? `${month}/${day}/${year}`
				: formatTanggal === "YYYY-MM-DD"
					? `${year}-${month}-${day}`
					: `${day}/${month}/${year}`;
		setTanggal(formatted);
	}, [zonaWaktu, formatTanggal]);

	// ── User info ──────────────────────────────────────────────────────────────
	const isAdmin = snap.user?.role === "admin";
	const displayName = snap.user?.name ?? snap.user?.email ?? "";
	const initials = displayName.charAt(0).toUpperCase();

	// Ambil nama kota dari timezone, tangani semua format (Asia/Jakarta, America/New_York, dll)
	const kotaLabel = zonaWaktu.split("/").pop()?.replace(/_/g, " ") ?? zonaWaktu;

	// ── Breadcrumb ─────────────────────────────────────────────────────────────
	const pathnames = location.pathname.split("/").filter(Boolean);

	const labelMap: Record<string, string> = {
		"kinerja-divisi": t.breadcrumb.kinerjaDevisi,
		"pengaduan-layanan-publik": t.breadcrumb.pengaduanLayanan,
		"jenna-analytic": t.breadcrumb.jennaAnalytic,
		"demografi-pekerjaan": t.breadcrumb.demografi,
		"keuangan-anggaran": t.breadcrumb.keuangan,
		bumdes: t.breadcrumb.bumdes,
		sosial: t.breadcrumb.sosial,
		keamanan: t.breadcrumb.keamanan,
		bantuan: t.breadcrumb.bantuan,
		pengaturan: t.breadcrumb.pengaturan,
		umum: t.breadcrumb.umum,
		notifikasi: t.breadcrumb.notifikasi,
		"akses-dan-tim": t.breadcrumb.aksesDanTim,
		sinkronisasi: t.breadcrumb.sinkronisasi,
		profile: t.breadcrumb.profile,
		edit: t.breadcrumb.edit,
	};

	/**
	 * Kembalikan label yang ramah untuk satu segmen path.
	 * Segmen yang berupa UUID / angka murni dibiarkan apa adanya supaya
	 * kamu bisa mengganti logika ini dengan fetch nama dari API jika diperlukan.
	 */
	const getSegmentLabel = (segment: string) =>
		labelMap[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);

	const breadcrumbItems = [
		<Anchor
			key="home"
			onClick={() => navigate({ to: "/" })}
			c="white"
			size="sm"
			underline="hover"
		>
			{t.breadcrumb.home}
		</Anchor>,
		...pathnames.map((segment, index) => {
			const to = `/${pathnames.slice(0, index + 1).join("/")}`;
			const isLast = index === pathnames.length - 1;
			const label = getSegmentLabel(segment);

			return isLast ? (
				<Text key={to} c="white" size="sm" fw={600}>
					{label}
				</Text>
			) : (
				<Anchor
					key={to}
					onClick={() => navigate({ to })}
					c="white"
					size="sm"
					underline="hover"
				>
					{label}
				</Anchor>
			);
		}),
	];

	// ── Render ─────────────────────────────────────────────────────────────────
	return (
		<Group justify="space-between" w="100%">
			{/* Kiri: Toggle sidebar + Breadcrumb */}
			<Group gap="md">
				<ActionIcon
					onClick={onSidebarToggle}
					variant="subtle"
					size="lg"
					radius="xl"
					visibleFrom="sm"
					aria-label="Toggle sidebar"
				>
					<IconLayoutSidebarLeftCollapse
						color="white"
						style={{ width: "70%", height: "70%" }}
					/>
				</ActionIcon>

				<Breadcrumbs
					separator={
						<Text c="white" size="xs">
							/
						</Text>
					}
				>
					{breadcrumbItems}
				</Breadcrumbs>
			</Group>

			{/* Kanan: Jam, info user, aksi */}
			<Group gap="md">
				{/* Jam & tanggal zona waktu */}
				{waktu && (
					<Box ta="center" visibleFrom="sm">
						<Text c="white" size="sm" fw={600} ff="monospace">
							{waktu}
						</Text>
						<Text c="white" size="xs" opacity={0.6}>
							{tanggal} · {kotaLabel}
						</Text>
					</Box>
				)}

				{/* Info user */}
				<Group gap="sm">
					<Box
						ta="right"
						visibleFrom="sm"
						style={{ maxWidth: 160, overflow: "hidden" }}
					>
						<Text
							c="white"
							size="sm"
							fw={500}
							style={{
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}
						>
							{displayName}
						</Text>
						<Text c="white" size="xs" opacity={0.75}>
							{isAdmin ? t.common.administrator : t.common.pengguna}
						</Text>
					</Box>

					<Avatar
						src={snap.user?.image}
						color="blue"
						radius="xl"
						style={{ cursor: "pointer" }}
						onClick={() => navigate({ to: "/profile" })}
						aria-label={`Profil ${displayName}`}
					>
						{initials || (
							<UserIcon color="white" style={{ width: "70%", height: "70%" }} />
						)}
					</Avatar>
				</Group>

				<Divider
					orientation="vertical"
					style={{ alignSelf: "stretch" }}
					my="xs"
				/>

				{/* Ikon aksi */}
				<Group gap="sm">
					<ActionIcon
						onClick={() => toggleColorScheme()}
						variant="subtle"
						size="lg"
						radius="xl"
						aria-label="Ganti tema"
					>
						{dark ? (
							<Sun color="white" style={{ width: "70%", height: "70%" }} />
						) : (
							<Moon color="white" style={{ width: "70%", height: "70%" }} />
						)}
					</ActionIcon>

					<ActionIcon
						variant="subtle"
						size="lg"
						radius="xl"
						aria-label={`Notifikasi, ${unreadCount} belum dibaca`}
						style={{ position: "relative" }}
					>
						<Bell color="white" style={{ width: "70%", height: "70%" }} />
						{unreadCount > 0 && (
							<Badge
								size="xs"
								color="red"
								variant="filled"
								style={{ position: "absolute", top: 0, right: 0 }}
								radius="xl"
							>
								{unreadCount > 99 ? "99+" : unreadCount}
							</Badge>
						)}
					</ActionIcon>

					{isAdmin && (
						<ActionIcon
							variant="subtle"
							size="lg"
							radius="xl"
							onClick={() => navigate({ to: "/admin" })}
							aria-label="Panel admin"
						>
							<IconUserShield
								color="white"
								style={{ width: "70%", height: "70%" }}
							/>
						</ActionIcon>
					)}
				</Group>
			</Group>
		</Group>
	);
}
