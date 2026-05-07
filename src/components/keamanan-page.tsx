import {
	Badge,
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
	useMantineColorScheme,
} from "@mantine/core";
import {
	IconAlertTriangle,
	IconCamera,
	IconClock,
	IconMapPin,
} from "@tabler/icons-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";

const DESA_API =
	typeof import.meta.env !== "undefined" && import.meta.env?.VITE_DESA_API_URL
		? import.meta.env.VITE_DESA_API_URL
		: "https://desa-darmasaba-stg.wibudev.com";

type CctvItem = {
	id: string;
	kode: string;
	nama: string;
	lokasi: string;
	latitude: number;
	longitude: number;
	status: string; // "Online" | "Offline"
	lastActive: string;
	isActive: boolean;
};

type LaporanItem = {
	id: string;
	judul: string;
	lokasi: string;
	tanggalWaktu: string;
	status: string; // "Proses" | "Selesai" | "Baru"
};

type CctvStats = {
	cctvOnline: number;
	laporanMingguIni: number;
};

const CCTV_PER_PAGE = 5;

const markerIcon = L.icon({
	iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
	shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

const CctvMap = ({
	cctvList,
	dark,
}: {
	cctvList: CctvItem[];
	dark: boolean;
}) => {
	const mapRef = useRef<HTMLDivElement>(null);
	const leafletMap = useRef<L.Map | null>(null);

	useEffect(() => {
		if (!mapRef.current || leafletMap.current) return;

		const validItems = cctvList.filter((c) => c.latitude && c.longitude);
		const first = validItems[0];
		const center: [number, number] = first
			? [first.latitude, first.longitude]
			: [-8.6705, 115.212];

		const map = L.map(mapRef.current, { center, zoom: 14 });
		leafletMap.current = map;

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: "© OpenStreetMap contributors",
		}).addTo(map);

		for (const cctv of validItems) {
			L.marker([cctv.latitude, cctv.longitude], { icon: markerIcon })
				.addTo(map)
				.bindPopup(
					`<b>${cctv.kode}</b><br>${cctv.nama}<br><small>${cctv.lokasi}</small><br><span style="color:${cctv.status === "Online" ? "green" : "gray"}">${cctv.status}</span>`,
				);
		}

		if (validItems.length > 1) {
			const bounds = L.latLngBounds(
				validItems.map((c) => [c.latitude, c.longitude]),
			);
			map.fitBounds(bounds, { padding: [40, 40] });
		}

		return () => {
			map.remove();
			leafletMap.current = null;
		};
	}, [cctvList]);

	return (
		<div
			ref={mapRef}
			style={{
				height: "400px",
				borderRadius: "8px",
				border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
				zIndex: 0,
			}}
		/>
	);
};

const KeamananPage = () => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const [cctvStats, setCctvStats] = useState<CctvStats>({
		cctvOnline: 0,
		laporanMingguIni: 0,
	});
	const [cctvList, setCctvList] = useState<CctvItem[]>([]);
	const [laporanList, setLaporanList] = useState<LaporanItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [cctvPage, setCctvPage] = useState(1);

	useEffect(() => {
		const fetchAll = async () => {
			try {
				const [statsRes, cctvRes, laporanRes] = await Promise.all([
					fetch(`${DESA_API}/api/keamanan/cctv/stats`).then((r) => r.json()),
					fetch(`${DESA_API}/api/keamanan/cctv/find-many`).then((r) =>
						r.json(),
					),
					fetch(`${DESA_API}/api/keamanan/laporanpublik/find-many`).then((r) =>
						r.json(),
					),
				]);
				if (statsRes.data) setCctvStats(statsRes.data as CctvStats);
				if (Array.isArray(cctvRes.data))
					setCctvList(cctvRes.data as CctvItem[]);
				if (Array.isArray(laporanRes.data))
					setLaporanList(laporanRes.data as LaporanItem[]);
			} finally {
				setLoading(false);
			}
		};
		fetchAll();
	}, []);

	const cctvTotalPages = Math.ceil(cctvList.length / CCTV_PER_PAGE);
	const cctvPaged = cctvList.slice(
		(cctvPage - 1) * CCTV_PER_PAGE,
		cctvPage * CCTV_PER_PAGE,
	);

	const kpiCards = [
		{
			title: "CCTV Aktif",
			value: cctvStats.cctvOnline,
			subtitle: "Kamera Online",
			icon: <IconCamera size={24} />,
			color: "darmasaba-success",
		},
		{
			title: "Laporan Keamanan",
			value: cctvStats.laporanMingguIni,
			subtitle: "Minggu ini",
			icon: <IconAlertTriangle size={24} />,
			color: "darmasaba-danger",
		},
	];

	return (
		<Stack gap="lg">
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
										<Group justify="space-between" align="center">
											<Stack gap={0}>
												<Text size="sm" c={dark ? "dark.3" : "dimmed"}>
													{kpi.subtitle}
												</Text>
												<Group gap="xs" align="center">
													<Skeleton
														visible={loading}
														width={40}
														height={28}
														radius="sm"
													>
														<Text
															size="xl"
															fw={700}
															c={dark ? "dark.0" : "black"}
														>
															{kpi.value}
														</Text>
													</Skeleton>
													<Text size="sm" c={dark ? "white" : "dimmed"}>
														{kpi.title}
													</Text>
												</Group>
											</Stack>
											<ThemeIcon
												variant="light"
												color={kpi.color}
												size="xl"
												radius="xl"
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
								Peta Keamanan CCTV
							</Title>
							<Text size="sm" c={dark ? "white" : "dimmed"} mb="md">
								Titik Lokasi CCTV
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
										Daftar CCTV
									</Title>
									{!loading && cctvList.length > 0 && (
										<Text size="xs" c={dark ? "dark.3" : "dimmed"}>
											{cctvList.length} kamera
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
										Belum ada data CCTV
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
										<Group justify="space-between">
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
											<Group gap="xs">
												<IconClock size={16} stroke={1.5} />
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
							Laporan Publik
						</Title>
						<Stack gap="sm">
							{loading && (
								<Stack gap="sm">
									{[1, 2, 3, 4].map((i) => (
										<Skeleton key={i} height={80} radius="md" />
									))}
								</Stack>
							)}
							{!loading && laporanList.length === 0 && (
								<Text
									size="sm"
									c={dark ? "dark.3" : "dimmed"}
									ta="center"
									py="xl"
								>
									Belum ada laporan keamanan
								</Text>
							)}
							{laporanList.map((report) => (
								<Card
									key={report.id}
									p="md"
									radius="md"
									withBorder
									bg={dark ? "#263852ff" : "#F1F5F9"}
									style={{ borderColor: dark ? "#263852ff" : "#F1F5F9" }}
								>
									<Group justify="space-between" mb="xs" align="flex-start">
										<Text
											fw={500}
											c={dark ? "dark.0" : "black"}
											style={{ flex: 1 }}
										>
											{report.judul}
										</Text>
										<Badge
											variant="light"
											color={
												report.status === "Selesai"
													? "green"
													: report.status === "Proses"
														? "yellow"
														: "red"
											}
											ml="xs"
										>
											{report.status}
										</Badge>
									</Group>

									<Group justify="space-between">
										<Group gap="xs">
											<IconMapPin size={16} stroke={1.5} />
											<Text size="sm" c={dark ? "white" : "dimmed"}>
												{report.lokasi}
											</Text>
										</Group>
										<Group gap="xs">
											<IconClock size={16} stroke={1.5} />
											<Text size="sm" c={dark ? "white" : "dimmed"}>
												{new Date(report.tanggalWaktu).toLocaleDateString(
													"id-ID",
													{
														day: "numeric",
														month: "short",
														year: "numeric",
													},
												)}
											</Text>
										</Group>
									</Group>
								</Card>
							))}
						</Stack>
					</Card>
				</GridCol>
			</Grid>
		</Stack>
	);
};

export default KeamananPage;
