import {
	Card,
	Grid,
	Group,
	Skeleton,
	Stack,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import { Receipt } from "lucide-react";
import type { KeuanganReport } from "@/api/transforms/keuangan-apbdes";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";

interface LaporanCardProps {
	report: KeuanganReport | null;
	loading: boolean;
}

export function LaporanCard({ report, loading }: LaporanCardProps) {
	const t = useTranslate();
	const dark = useIsDark();

	const empty =
		!report || (report.income.length === 0 && report.expenses.length === 0);

	// Nilai untuk baris laporan (anggaran per kategori) dalam juta
	const incomeRows = (report?.income ?? []).map((i) => ({
		...i,
		amountM: i.amount / 1_000_000,
	}));
	const expenseRows = (report?.expenses ?? []).map((e) => ({
		...e,
		amountM: e.amount / 1_000_000,
	}));
	// Total = realisasi real dalam juta
	const totalIncomeM = (report?.totalIncome ?? 0) / 1_000_000;
	const totalExpenseM = (report?.totalExpense ?? 0) / 1_000_000;
	const saldoM = totalIncomeM - totalExpenseM;

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			style={{
				backgroundColor: "var(--app-card)",
				borderColor: "var(--app-border)",
				boxShadow: "var(--mantine-shadow-xs)",
			}}
			h="100%"
		>
			<Group gap="xs" mb="md">
				<ThemeIcon
					color="darmasaba-navy.7"
					variant="filled"
					size="sm"
					radius="sm"
				>
					<Receipt size={14} />
				</ThemeIcon>
				<Title order={4} c={dark ? "white" : "gray.9"}>
					{t.keuanganAnggaran.laporanApbdes}
				</Title>
			</Group>

			{loading ? (
				<Skeleton height={280} radius="md" />
			) : empty ? (
				<Group justify="center" align="center" h={280}>
					<Text size="sm" c="dimmed">
						Belum ada data laporan APBDes.
					</Text>
				</Group>
			) : (
				<>
					<Grid gutter="md">
						<Grid.Col span={6}>
							<Card
								p="sm"
								radius="lg"
								withBorder
								style={{
									backgroundColor: "var(--app-success-subtle)",
									borderColor: "var(--app-success)",
								}}
							>
								<Title
									order={5}
									style={{ color: "var(--app-success)" }}
									mb="sm"
								>
									{t.keuanganAnggaran.pendapatan}
								</Title>
								<Stack gap="xs">
									{incomeRows.map((item) => (
										<Group key={item.category} justify="space-between">
											<Text size="sm" c={dark ? "gray.3" : "gray.7"}>
												{item.category}
											</Text>
											<Text
												size="sm"
												fw={600}
												style={{ color: "var(--app-success)" }}
											>
												Rp {item.amountM.toLocaleString()}jt
											</Text>
										</Group>
									))}
									<Group
										justify="space-between"
										mt="sm"
										pt="sm"
										style={{
											borderTop: "1px solid var(--app-success)",
										}}
									>
										<Text fw={700} style={{ color: "var(--app-success)" }}>
											{t.keuanganAnggaran.total}
										</Text>
										<Text fw={700} style={{ color: "var(--app-success)" }}>
											Rp {totalIncomeM.toLocaleString()}jt
										</Text>
									</Group>
								</Stack>
							</Card>
						</Grid.Col>

						<Grid.Col span={6}>
							<Card
								p="sm"
								radius="lg"
								withBorder
								style={{
									backgroundColor: "var(--app-danger-subtle)",
									borderColor: "var(--app-danger)",
								}}
							>
								<Title order={5} style={{ color: "var(--app-danger)" }} mb="sm">
									{t.keuanganAnggaran.belanja}
								</Title>
								<Stack gap="xs">
									{expenseRows.map((item) => (
										<Group key={item.category} justify="space-between">
											<Text size="sm" c={dark ? "gray.3" : "gray.7"}>
												{item.category}
											</Text>
											<Text
												size="sm"
												fw={600}
												style={{ color: "var(--app-danger)" }}
											>
												Rp {item.amountM.toLocaleString()}jt
											</Text>
										</Group>
									))}
									<Group
										justify="space-between"
										mt="sm"
										pt="sm"
										style={{
											borderTop: "1px solid var(--app-danger)",
										}}
									>
										<Text fw={700} style={{ color: "var(--app-danger)" }}>
											{t.keuanganAnggaran.total}
										</Text>
										<Text fw={700} style={{ color: "var(--app-danger)" }}>
											Rp {totalExpenseM.toLocaleString()}jt
										</Text>
									</Group>
								</Stack>
							</Card>
						</Grid.Col>
					</Grid>

					<Group
						justify="space-between"
						mt="md"
						pt="md"
						style={{
							borderTop: `1px solid var(--mantine-color-${dark ? "dark-4" : "gray-2"})`,
						}}
					>
						<Text fw={700} c={dark ? "white" : "gray.9"}>
							{t.keuanganAnggaran.saldo}
						</Text>
						<Text
							fw={700}
							size="lg"
							style={{
								color: saldoM >= 0 ? "var(--app-success)" : "var(--app-danger)",
							}}
						>
							Rp {saldoM.toLocaleString()}jt
						</Text>
					</Group>
				</>
			)}
		</Card>
	);
}
