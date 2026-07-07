import { Grid, GridCol, Stack } from "@mantine/core";
import { useState } from "react";
import { useSnapshot } from "valtio";
import { useApiQuery } from "@/hooks/useApiQuery";
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

interface BumdesStatic {
	kpi: KpiData | null;
	ringkasan: RingkasanData | null;
	topProduk: TopProdukItem[] | null;
	kategoriOptions: SelectOption[];
	umkmOptions: SelectOption[];
}

async function fetchBumdesStatic(selectedRange: string): Promise<BumdesStatic> {
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

	return {
		kpi: kpiJson.success ? kpiJson.data : null,
		ringkasan: ringkasanJson.success ? ringkasanJson.data : null,
		topProduk: topProdukJson.success ? topProdukJson.data : null,
		kategoriOptions: kategoriJson.success
			? (kategoriJson.data ?? []).map((k: { id: string; nama: string }) => ({
					value: k.id,
					label: k.nama,
				}))
			: [],
		umkmOptions: umkmJson.success
			? (umkmJson.data ?? []).map((u: { id: string; nama: string }) => ({
					value: u.id,
					label: u.nama,
				}))
			: [],
	};
}

async function fetchBumdesDetail(
	kategoriId: string | null,
	umkmId: string | null,
	selectedRange: string,
): Promise<DetailPenjualanItem[] | null> {
	const params = new URLSearchParams();
	if (kategoriId) params.set("kategoriId", kategoriId);
	if (umkmId) params.set("umkmId", umkmId);
	params.set("period", selectedRange);

	const res = await fetch(`/api/bumdes/detail-penjualan?${params}`);
	const json = await res.json();
	return json.success ? json.data : null;
}

const EMPTY_STATIC: BumdesStatic = {
	kpi: null,
	ringkasan: null,
	topProduk: null,
	kategoriOptions: [],
	umkmOptions: [],
};

const BumdesPage = () => {
	const t = useTranslate();
	const { selectedRange } = useSnapshot(umkmStore);

	const [kategoriId, setKategoriId] = useState<string | null>(null);
	const [umkmId, setUmkmId] = useState<string | null>(null);

	const [selectedProduct, setSelectedProduct] = useState<SalesData | null>(
		null,
	);
	const [detailModalOpen, setDetailModalOpen] = useState(false);

	const { data: staticData = EMPTY_STATIC } = useApiQuery(
		["bumdes", "static", selectedRange],
		() => fetchBumdesStatic(selectedRange),
		{ autoRefresh: true },
	);
	const { kpi, ringkasan, topProduk, kategoriOptions, umkmOptions } =
		staticData;

	const { data: detailPenjualan = null } = useApiQuery(
		["bumdes", "detail", selectedRange, kategoriId, umkmId],
		() => fetchBumdesDetail(kategoriId, umkmId, selectedRange),
		{ autoRefresh: true },
	);

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
