import { Grid, GridCol, Stack } from "@mantine/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSnapshot } from "valtio";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useTranslate } from "@/hooks/useTranslate";
import { umkmStore } from "../store/umkm";
import { HeaderToggle } from "./umkm/header-toggle";
import { ProdukUnggulan } from "./umkm/produk-unggulan";
import { SalesDetailModal } from "./umkm/sales-detail-modal";
import type { SalesData } from "./umkm/sales-table";
import { SalesTable } from "./umkm/sales-table";
import { SummaryCards } from "./umkm/summary-cards";
import { TopProducts } from "./umkm/top-products";

interface KpiData {
	umkmAktif: number;
	totalUmkm: number;
	omzetBulanan: number;
	kategoriTerbanyak: string;
	jumlahKategoriTerbanyak: number;
}

interface RingkasanData {
	totalPenjualan: number;
	persentasePerubahan: number;
	kategoriAktif: number;
	totalTransaksi: number;
}

interface TopProdukItem {
	namaProduk: string;
	namaUmkm: string;
	totalPenjualan: number;
	jumlahTerjual: number;
	growth: number;
}

interface DetailPenjualanItem {
	namaProduk: string;
	penjualanBulanIni: number;
	penjualanBulanLalu: number;
	trend: "up" | "down";
	trendPersen: number;
	volume: number;
	stok: number;
	statusStok: string;
}

interface SelectOption {
	value: string;
	label: string;
}

const BumdesPage = () => {
	const t = useTranslate();
	const { selectedRange } = useSnapshot(umkmStore);

	const [kpi, setKpi] = useState<KpiData | null>(null);
	const [ringkasan, setRingkasan] = useState<RingkasanData | null>(null);
	const [topProduk, setTopProduk] = useState<TopProdukItem[] | null>(null);
	const [detailPenjualan, setDetailPenjualan] = useState<
		DetailPenjualanItem[] | null
	>(null);
	const [kategoriOptions, setKategoriOptions] = useState<SelectOption[]>([]);
	const [umkmOptions, setUmkmOptions] = useState<SelectOption[]>([]);

	const [kategoriId, setKategoriId] = useState<string | null>(null);
	const [umkmId, setUmkmId] = useState<string | null>(null);

	const [selectedProduct, setSelectedProduct] = useState<SalesData | null>(
		null,
	);
	const [detailModalOpen, setDetailModalOpen] = useState(false);

	// Fetch KPI, ringkasan, top produk, and filter lists (re-fetch on range change for future backend support)
	const fetchStatic = useCallback(async () => {
		try {
			const [kpiRes, ringkasanRes, topProdukRes, kategoriRes, umkmRes] =
				await Promise.all([
					fetch(`/api/bumdes/kpi?period=${selectedRange}`),
					fetch(`/api/bumdes/ringkasan-penjualan?period=${selectedRange}`),
					fetch(`/api/bumdes/top-produk?period=${selectedRange}`),
					fetch("/api/bumdes/kategori"),
					fetch("/api/bumdes/umkm-list"),
				]);

			const [kpiJson, ringkasanJson, topProdukJson, kategoriJson, umkmJson] =
				await Promise.all([
					kpiRes.json(),
					ringkasanRes.json(),
					topProdukRes.json(),
					kategoriRes.json(),
					umkmRes.json(),
				]);

			if (kpiJson.success) setKpi(kpiJson.data);
			if (ringkasanJson.success) setRingkasan(ringkasanJson.data);
			if (topProdukJson.success) setTopProduk(topProdukJson.data);
			if (kategoriJson.success)
				setKategoriOptions(
					(kategoriJson.data ?? []).map((k: { id: string; nama: string }) => ({
						value: k.id,
						label: k.nama,
					})),
				);
			if (umkmJson.success)
				setUmkmOptions(
					(umkmJson.data ?? []).map((u: { id: string; nama: string }) => ({
						value: u.id,
						label: u.nama,
					})),
				);
		} catch (err) {
			console.error("[BUMDes] Failed to fetch static data:", err);
		}
	}, [selectedRange]);

	// Fetch detail penjualan separately (re-fetch on filter change)
	const fetchDetail = useCallback(async () => {
		try {
			const params = new URLSearchParams();
			if (kategoriId) params.set("kategoriId", kategoriId);
			if (umkmId) params.set("umkmId", umkmId);
			params.set("period", selectedRange);

			const res = await fetch(`/api/bumdes/detail-penjualan?${params}`);
			const json = await res.json();
			if (json.success) setDetailPenjualan(json.data);
		} catch (err) {
			console.error("[BUMDes] Failed to fetch detail penjualan:", err);
		}
	}, [kategoriId, umkmId, selectedRange]);

	// Refs agar handleForceRefresh tetap stabil tanpa re-create saat range/filter berubah
	const fetchStaticRef = useRef(fetchStatic);
	const fetchDetailRef = useRef(fetchDetail);
	useEffect(() => {
		fetchStaticRef.current = fetchStatic;
	}, [fetchStatic]);
	useEffect(() => {
		fetchDetailRef.current = fetchDetail;
	}, [fetchDetail]);

	// Stabil — deps kosong karena pakai refs di atas
	const handleForceRefresh = useCallback(async () => {
		try {
			await fetch("/api/bumdes/cache-invalidate", { method: "POST" });
		} catch {
			// lanjut fetch meskipun invalidate gagal
		}
		await Promise.all([fetchStaticRef.current(), fetchDetailRef.current()]);
	}, []);

	// Mount / browser reload: selalu force refresh
	useEffect(() => {
		handleForceRefresh();
	}, [handleForceRefresh]);

	// Range change: normal fetch tanpa invalidate cache
	const didMount = useRef(false);
	useEffect(() => {
		if (!didMount.current) return;
		fetchStatic();
	}, [fetchStatic]);
	useEffect(() => {
		if (!didMount.current) {
			didMount.current = true;
			return;
		}
		fetchDetail();
	}, [fetchDetail]);

	// Auto interval sesuai pengaturan preferences (refreshOtomatis + intervalRefresh)
	useAutoRefresh(handleForceRefresh);

	// Map API data to component props
	const summaryCardsData = kpi
		? {
				umkmAktif: kpi.umkmAktif,
				umkmTerdaftar: kpi.totalUmkm,
				omzet: kpi.omzetBulanan,
				kategoriTerbanyak: {
					count: kpi.jumlahKategoriTerbanyak,
					name: kpi.kategoriTerbanyak,
				},
			}
		: undefined;

	const produkUnggulanData = ringkasan
		? {
				totalPenjualan: ringkasan.totalPenjualan,
				produkAktif: ringkasan.kategoriAktif,
				totalTransaksi: ringkasan.totalTransaksi,
				trend: {
					value: ringkasan.persentasePerubahan,
					label: t.bumdes.vsBulanLalu,
				},
			}
		: undefined;

	const topProductsData = topProduk?.map((p, i) => ({
		rank: i + 1,
		name: p.namaProduk,
		umkmName: p.namaUmkm,
		revenue: p.totalPenjualan,
		quantitySold: p.jumlahTerjual,
		trend: p.growth,
	}));

	const salesTableData: SalesData[] | undefined = detailPenjualan?.map((p) => ({
		id: p.namaProduk,
		produk: p.namaProduk,
		penjualanBulanIni: p.penjualanBulanIni,
		bulanLalu: p.penjualanBulanLalu,
		trend: p.trend === "up" ? p.trendPersen : -p.trendPersen,
		volume: `${p.volume}`,
		stok: p.stok,
		unit: "",
	}));

	const handleDetailClick = (product: SalesData) => {
		setSelectedProduct(product);
		setDetailModalOpen(true);
	};

	return (
		<Stack gap="lg">
			<SalesDetailModal
				product={selectedProduct}
				opened={detailModalOpen}
				onClose={() => setDetailModalOpen(false)}
			/>
			<SummaryCards data={summaryCardsData} />

			<HeaderToggle />

			<Grid gutter="md">
				<GridCol span={{ base: 12, lg: 4 }}>
					<Stack gap="md">
						<ProdukUnggulan data={produkUnggulanData} />
						<TopProducts products={topProductsData ?? undefined} />
					</Stack>
				</GridCol>

				<GridCol span={{ base: 12, lg: 8 }}>
					<SalesTable
						data={salesTableData}
						onDetailClick={handleDetailClick}
						kategoriOptions={kategoriOptions}
						umkmOptions={umkmOptions}
						onKategoriChange={setKategoriId}
						onUmkmChange={setUmkmId}
					/>
				</GridCol>
			</Grid>
		</Stack>
	);
};

export default BumdesPage;
