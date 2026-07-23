import { Alert, Button, Grid, Group, Select, Stack } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import type { KeuanganYear } from "@/api/transforms/keuangan-apbdes";
import {
	AllocationChart,
	DanaBantuanCard,
	IncomeExpenseChart,
	KpiCards,
	LaporanCard,
} from "@/components/keuangan";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useTranslate } from "@/hooks/useTranslate";
import { i18nStore } from "@/store/i18n";
import { apiClient } from "@/utils/api-client";

async function fetchKeuanganDetail(): Promise<{ years: KeuanganYear[] }> {
	const res = await apiClient.GET("/api/keuangan/apbdes-detail");
	return { years: res.data?.years ?? [] };
}

const EMPTY_YEARS: KeuanganYear[] = [];

const KeuanganAnggaran = () => {
	const t = useTranslate();
	const { tampilkanGrid } = useSnapshot(i18nStore);

	const [selectedTahun, setSelectedTahun] = useState<number | null>(null);

	const {
		data,
		isLoading: loading,
		isError,
		refetch,
	} = useApiQuery(["keuangan", "apbdes-detail"], fetchKeuanganDetail, {
		autoRefresh: true,
	});

	const years = data?.years ?? EMPTY_YEARS;

	// Default: tahun terbaru (index 0 — sudah sort desc dari transform)
	useEffect(() => {
		if (selectedTahun === null && years.length > 0 && years[0]) {
			setSelectedTahun(years[0].tahun);
		}
	}, [years, selectedTahun]);

	const activeTahun = selectedTahun ?? years[0]?.tahun ?? null;
	const activeYear =
		activeTahun != null
			? (years.find((y) => y.tahun === activeTahun) ?? null)
			: null;

	const monthLabels = [
		t.keuanganAnggaran.jan,
		t.keuanganAnggaran.feb,
		t.keuanganAnggaran.mar,
		t.keuanganAnggaran.apr,
		t.keuanganAnggaran.mei,
		t.keuanganAnggaran.jun,
		t.keuanganAnggaran.jul,
		t.keuanganAnggaran.agu,
		t.keuanganAnggaran.sep,
		t.keuanganAnggaran.okt,
		t.keuanganAnggaran.nov,
		t.keuanganAnggaran.des,
	];

	const selectOptions = years.map((y) => ({
		value: String(y.tahun),
		label: `${t.keuanganAnggaran.tahun} ${y.tahun}`,
	}));

	return (
		<Stack gap="lg">
			{isError && (
				<Alert
					icon={<IconAlertCircle size={16} />}
					color="red"
					title="Gagal memuat data"
					radius="md"
				>
					Gagal memuat data keuangan. Periksa koneksi dan coba lagi.
					<Button
						size="xs"
						variant="light"
						color="red"
						leftSection={<IconRefresh size={14} />}
						onClick={() => refetch()}
						mt="xs"
					>
						Coba lagi
					</Button>
				</Alert>
			)}

			{selectOptions.length > 1 && (
				<Group>
					<Select
						data={selectOptions}
						value={activeTahun != null ? String(activeTahun) : null}
						onChange={(v) => setSelectedTahun(v ? Number(v) : null)}
						w={160}
						size="sm"
						radius="md"
					/>
				</Group>
			)}

			{/* KPI Cards */}
			<Grid gutter="md">
				<KpiCards year={activeYear} loading={loading} />
			</Grid>

			{/* Charts */}
			<Grid gutter="lg">
				<Grid.Col span={{ base: 12, lg: 8 }}>
					<IncomeExpenseChart
						monthly={activeYear?.monthly ?? []}
						monthLabels={monthLabels}
						loading={loading}
						tampilkanGrid={tampilkanGrid}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 4 }}>
					<AllocationChart
						allocation={activeYear?.allocation ?? []}
						loading={loading}
						tampilkanGrid={tampilkanGrid}
					/>
				</Grid.Col>
			</Grid>

			{/* Laporan & Dana Bantuan */}
			<Grid gutter="lg">
				<Grid.Col span={{ base: 12, lg: 6 }}>
					<LaporanCard report={activeYear?.report ?? null} loading={loading} />
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 6 }}>
					<DanaBantuanCard aid={activeYear?.aid ?? []} loading={loading} />
				</Grid.Col>
			</Grid>
		</Stack>
	);
};

export default KeuanganAnggaran;
