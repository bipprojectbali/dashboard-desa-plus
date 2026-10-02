import {
	Alert,
	Badge,
	Button,
	Card,
	Grid,
	GridCol,
	Group,
	Pagination,
	Skeleton,
	Stack,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import {
	IconAlertCircle,
	IconAlertTriangle,
	IconCamera,
	IconClock,
	IconRefresh,
} from "@tabler/icons-react";
import { useState } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { CctvMap } from "./keamanan/cctv-map";
import type {
	CctvItem,
	CctvStats,
	LaporanItem,
} from "./keamanan/keamanan.types";
import { LaporanCard } from "./keamanan/laporan-card";

const CCTV_PER_PAGE = 5;

interface KeamananData {
	cctvStats: CctvStats;
	cctvList: CctvItem[];
	laporanList: LaporanItem[];
}

async function fetchKeamananAll(): Promise<KeamananData> {
	const [statsRes, cctvRes, laporanRes] = await Promise.all([
		fetch("/api/keamanan/cctv/stats").then((r) => r.json()),
		fetch("/api/keamanan/cctv/find-many").then((r) => r.json()),
		fetch("/api/keamanan/laporan-publik/find-many").then((r) => r.json()),
	]);
	return {
		cctvStats: (statsRes.data as CctvStats) ?? {
			cctvOnline: 0,
			laporanMingguIni: 0,
		},
		cctvList: Array.isArray(cctvRes.data) ? (cctvRes.data as CctvItem[]) : [],
		laporanList: Array.isArray(laporanRes.data)
			? (laporanRes.data as LaporanItem[])
			: [],
	};
}

const EMPTY_KEAMANAN: KeamananData = {
	cctvStats: { cctvOnline: 0, laporanMingguIni: 0 },
	cctvList: [],
	laporanList: [],
};

const KeamananPage = () => {
	const t = useTranslate();
	const dark = useIsDark();

	const [cctvPage, setCctvPage] = useState(1);

	const {
		data = EMPTY_KEAMANAN,
		isLoading: loading,
		isError,
		refetch,
	} = useApiQuery(["keamanan", "all"], fetchKeamananAll, { autoRefresh: true });
	const { cctvStats, cctvList, laporanList } = data;
	const error = isError
		? "Gagal memuat data keamanan. Periksa koneksi dan coba lagi."
		: null;

	// Refresh manual: bust server cache lalu ambil ulang (hanya saat user klik).
	const handleForceRefresh = async () => {
		try {
			await fetch("/api/keamanan/cache-invalidate", { method: "POST" });
		} catch {
			// lanjut fetch meskipun invalidate gagal
		}
		await refetch();
	};

	const cctvTotalPages = Math.ceil(cctvList.length / CCTV_PER_PAGE);
	const cctvPaged = cctvList.slice(
		(cctvPage - 1) * CCTV_PER_PAGE,
		cctvPage * CCTV_PER_PAGE,
	);

	const kpiCards = [
		{
			title: t.keamanan.cctvAktif,
			value: cctvStats.cctvOnline,
			subtitle: t.keamanan.kameraOnline,
			icon: <IconCamera size={24} />,
			color: "darmasaba-success",
		},
		{
			title: t.keamanan.laporanKeamanan,
			value: cctvStats.laporanMingguIni,
			subtitle: t.keamanan.mingguIni,
			icon: <IconAlertTriangle size={24} />,
			color: "darmasaba-danger",
		},
	];

	return (
		<Stack gap="lg">
			{error && (
				<Alert
					icon={<IconAlertCircle size={16} />}
					color="red"
					title="Gagal memuat data"
					radius="md"
				>
					{error}
					<Button
						size="xs"
						variant="light"
						color="red"
						leftSection={<IconRefresh size={14} />}
						onClick={handleForceRefresh}
						mt="xs"
					>
						Coba lagi
					</Button>
				</Alert>
			)}
			<Grid gutter="md">
				{/* Peta Keamanan CCTV */}
				<GridCol span={{ base: 12, lg: 6 }}>
					<Stack gap={"xs"}>
						{/* KPI Cards */}
						<Grid gutter="md">
							{kpiCards.map((kpi) => (
								<GridCol key={kpi.title} span={{ base: 12, sm: 6, md: 6 }}>
									<Card
										p="md"
										radius="md"
										withBorder
										bg={dark ? "#1E293B" : "white"}
										style={{
											borderColor: dark ? "#334155" : "white",
											boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
											transition: "transform 0.15s ease, box-shadow 0.15s ease",
										}}
										h="100%"
									>
										<Group justify="space-between" align="center" wrap="nowrap">
											<Stack gap={4}>
												<Text size="sm" fw={500} c={dark ? "dark.1" : "dimmed"}>
													{kpi.title}
												</Text>
												{loading ? (
													<Skeleton height={32} width={60} radius="sm" />
												) : (
													<Text
														size="xl"
														fw={700}
														lh={1}
														c={dark ? "dark.0" : "black"}
													>
														{kpi.value}
													</Text>
												)}
												<Text size="xs" c={dark ? "dark.3" : "dimmed"}>
													{kpi.subtitle}
												</Text>
											</Stack>
											<ThemeIcon
												variant="light"
												color={kpi.color}
												size={52}
												radius="xl"
												style={{ flexShrink: 0 }}
											>
												{kpi.icon}
											</ThemeIcon>
										</Group>
									</Card>
								</GridCol>
							))}
						</Grid>
						<Card
							p="md"
							radius="md"
							withBorder
							bg={dark ? "#1E293B" : "white"}
							style={{
								borderColor: dark ? "#334155" : "white",
								boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
								transition: "transform 0.15s ease, box-shadow 0.15s ease",
							}}
							h="100%"
						>
							<Title order={3} mb="md" c={dark ? "dark.0" : "black"}>
								{t.keamanan.petaKeamananCctv}
							</Title>
							<Text size="sm" c={dark ? "white" : "dimmed"} mb="md">
								{t.keamanan.titikLokasiCctv}
							</Text>

							{loading ? (
								<Skeleton height={400} radius="md" />
							) : (
								<CctvMap cctvList={cctvList} dark={dark} />
							)}

							{/* CCTV Locations List */}
							<Stack mt="md" gap="sm">
								<Group justify="space-between" align="center">
									<Title order={4} c={dark ? "dark.0" : "black"}>
										{t.keamanan.daftarCctv}
									</Title>
									{!loading && cctvList.length > 0 && (
										<Text size="xs" c={dark ? "dark.3" : "dimmed"}>
											{cctvList.length} {t.keamanan.kamera}
										</Text>
									)}
								</Group>
								{loading && (
									<Stack gap="sm">
										{[1, 2, 3].map((i) => (
											<Skeleton key={i} height={60} radius="md" />
										))}
									</Stack>
								)}
								{!loading && cctvList.length === 0 && (
									<Text
										size="sm"
										c={dark ? "dark.3" : "dimmed"}
										ta="center"
										py="md"
									>
										{t.keamanan.belumAdaDataCctv}
									</Text>
								)}
								{cctvPaged.map((cctv) => (
									<Card
										key={cctv.id}
										p="md"
										radius="md"
										withBorder
										bg={dark ? "#263852ff" : "#F1F5F9"}
										style={{ borderColor: dark ? "#263852ff" : "#F1F5F9" }}
									>
										<Group justify="space-between" align="center">
											<Stack gap={0}>
												<Group gap="xs">
													<Text fw={500} c={dark ? "dark.0" : "black"}>
														{cctv.kode}
													</Text>
													<Badge
														variant="dot"
														color={cctv.status === "Online" ? "green" : "gray"}
													>
														{cctv.status}
													</Badge>
												</Group>
												<Text size="sm" c={dark ? "white" : "dimmed"}>
													{cctv.nama}
												</Text>
												<Text size="xs" c={dark ? "dark.3" : "dimmed"}>
													{cctv.lokasi}
												</Text>
											</Stack>
											<Group gap={4} align="center">
												<IconClock size={14} stroke={1.5} />
												<Text size="sm" c={dark ? "white" : "dimmed"}>
													{new Date(cctv.lastActive).toLocaleDateString(
														"id-ID",
														{
															day: "numeric",
															month: "short",
															hour: "2-digit",
															minute: "2-digit",
														},
													)}
												</Text>
											</Group>
										</Group>
									</Card>
								))}
								{!loading && cctvTotalPages > 1 && (
									<Group justify="center" mt="xs">
										<Pagination
											total={cctvTotalPages}
											value={cctvPage}
											onChange={setCctvPage}
											size="sm"
										/>
									</Group>
								)}
							</Stack>
						</Card>
					</Stack>
				</GridCol>

				{/* Daftar Laporan Keamanan */}
				<GridCol span={{ base: 12, lg: 6 }}>
					<LaporanCard laporanList={laporanList} loading={loading} />
				</GridCol>
			</Grid>
		</Stack>
	);
};

export default KeamananPage;
