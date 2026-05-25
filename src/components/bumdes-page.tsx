import { Grid, GridCol, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { useTranslate } from "@/hooks/useTranslate";
import { umkmStore } from "../store/umkm";
import { HeaderToggle } from "./umkm/header-toggle";
import { ProdukUnggulan } from "./umkm/produk-unggulan";
import { SalesDetailModal } from "./umkm/sales-detail-modal";
import type { SalesData } from "./umkm/sales-table";
import { SalesTable } from "./umkm/sales-table";
import { SummaryCards } from "./umkm/summary-cards";
import { TopProducts } from "./umkm/top-products";

const DESA_API =
	typeof import.meta.env !== "undefined" && import.meta.env?.VITE_DESA_API_URL
		? import.meta.env.VITE_DESA_API_URL
		: "https://desa-darmasaba-stg.wibudev.com";

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
	useEffect(() => {
		async function fetchStatic() {
			try {
				const [kpiRes, ringkasanRes, topProdukRes, kategoriRes, umkmRes] =
					await Promise.all([
						fetch(
							`${DESA_API}/api/ekonomi/umkm/dashboard/kpi?period=${selectedRange}`,
						),
						fetch(
							`${DESA_API}/api/ekonomi/umkm/dashboard/ringkasan-penjualan?period=${selectedRange}`,
						),
						fetch(
							`${DESA_API}/api/ekonomi/umkm/dashboard/top-produk?period=${selectedRange}`,
						),
						fetch(`${DESA_API}/api/ekonomi/kategoriproduk/find-many-all`),
						fetch(`${DESA_API}/api/ekonomi/umkm/find-many-all`),
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
						(kategoriJson.data ?? []).map(
							(k: { id: string; nama: string }) => ({
								value: k.id,
								label: k.nama,
							}),
						),
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
		}

		fetchStatic();
	}, [selectedRange]);

	// Fetch detail penjualan separately (re-fetch on filter change)
	useEffect(() => {
		async function fetchDetail() {
			try {
				const params = new URLSearchParams();
				if (kategoriId) params.set("kategoriId", kategoriId);
				if (umkmId) params.set("umkmId", umkmId);
				params.set("period", selectedRange);

				const res = await fetch(
					`${DESA_API}/api/ekonomi/umkm/dashboard/detail-penjualan?${params}`,
				);
				const json = await res.json();
				if (json.success) setDetailPenjualan(json.data);
			} catch (err) {
				console.error("[BUMDes] Failed to fetch detail penjualan:", err);
			}
		}

		fetchDetail();
	}, [kategoriId, umkmId, selectedRange]);

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
