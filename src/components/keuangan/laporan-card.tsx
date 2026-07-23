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
			bg={dark ? "#1E293B" : "white"}
			style={{
				borderColor: dark ? "#374b6aff" : "var(--mantine-color-white)",
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
								bg="var(--mantine-color-green-light)"
								style={{
									borderColor: "var(--mantine-color-green-light-color)",
								}}
							>
								<Title order={5} c="green.5" mb="sm">
									{t.keuanganAnggaran.pendapatan}
								</Title>
								<Stack gap="xs">
									{incomeRows.map((item) => (
										<Group key={item.category} justify="space-between">
											<Text size="sm" c={dark ? "gray.3" : "gray.7"}>
												{item.category}
											</Text>
											<Text size="sm" fw={600} c="green.5">
												Rp {item.amountM.toLocaleString()}jt
											</Text>
										</Group>
									))}
									<Group
										justify="space-between"
										mt="sm"
										pt="sm"
										style={{
											borderTop:
												"1px solid var(--mantine-color-green-light-color)",
										}}
									>
										<Text fw={700} c="green.5">
											{t.keuanganAnggaran.total}
										</Text>
										<Text fw={700} c="green.5">
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
								bg="var(--mantine-color-red-light)"
								style={{
									borderColor: "var(--mantine-color-red-light-color)",
								}}
							>
								<Title order={5} c="red.5" mb="sm">
									{t.keuanganAnggaran.belanja}
								</Title>
								<Stack gap="xs">
									{expenseRows.map((item) => (
										<Group key={item.category} justify="space-between">
											<Text size="sm" c={dark ? "gray.3" : "gray.7"}>
												{item.category}
											</Text>
											<Text size="sm" fw={600} c="red.5">
												Rp {item.amountM.toLocaleString()}jt
											</Text>
										</Group>
									))}
									<Group
										justify="space-between"
										mt="sm"
										pt="sm"
										style={{
											borderTop:
												"1px solid var(--mantine-color-red-light-color)",
										}}
									>
										<Text fw={700} c="red.5">
											{t.keuanganAnggaran.total}
										</Text>
										<Text fw={700} c="red.5">
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
						<Text fw={700} size="lg" c={saldoM >= 0 ? "green.5" : "red.5"}>
							Rp {saldoM.toLocaleString()}jt
						</Text>
					</Group>
				</>
			)}
		</Card>
	);
}
