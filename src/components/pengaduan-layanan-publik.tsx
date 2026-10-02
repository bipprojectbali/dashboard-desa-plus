import { Alert, Button, Grid, Stack } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import { PengaduanMusrenbangCard } from "./pengaduan/pengaduan-musrenbang-card";
import { PengaduanRecentCard } from "./pengaduan/pengaduan-recent-card";
import { PengaduanSummaryCards } from "./pengaduan/pengaduan-summary-cards";
import { PengaduanSuratCard } from "./pengaduan/pengaduan-surat-card";
import { PengaduanTrendCard } from "./pengaduan/pengaduan-trend-card";
import { usePengaduanNoc } from "./pengaduan/use-pengaduan-noc";

const PengaduanLayananPublik = () => {
	const { data, loading, error, refresh } = usePengaduanNoc();

	const stats = data?.stats ?? { total: 0, baru: 0, diproses: 0, selesai: 0 };
	const trends = (data?.trends ?? []).map((item) => ({
		bulan: item.bulan,
		jumlah: item.count,
	}));
	const suratTerbanyak = (data?.surat_terbanyak ?? []).map((item) => ({
		jenis: item.jenis,
		jumlah: item.count,
	}));
	const pengajuanTerbaru = (data?.pengajuan_terbaru ?? []).slice(0, 5);
	const musrenbang = (data?.musrenbang ?? []).slice(0, 5);

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
						onClick={refresh}
						mt="xs"
					>
						Coba lagi
					</Button>
				</Alert>
			)}

			<PengaduanSummaryCards stats={stats} loading={loading} />
			<PengaduanTrendCard trends={trends} loading={loading} />

			<Grid gutter="md">
				<Grid.Col span={{ base: 12, lg: 4 }}>
					<PengaduanSuratCard
						suratTerbanyak={suratTerbanyak}
						loading={loading}
					/>
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 4 }}>
					<PengaduanRecentCard items={pengajuanTerbaru} loading={loading} />
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 4 }}>
					<PengaduanMusrenbangCard items={musrenbang} loading={loading} />
				</Grid.Col>
			</Grid>
		</Stack>
	);
};

export default PengaduanLayananPublik;
