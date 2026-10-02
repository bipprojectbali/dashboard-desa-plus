import { Card, Skeleton, Title } from "@mantine/core";
import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useSnapshot } from "valtio";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { i18nStore } from "@/store/i18n";
import { EmptyState } from "./pengaduan-empty-state";

interface Props {
	suratTerbanyak: { jenis: string; jumlah: number }[];
	loading: boolean;
}

export function PengaduanSuratCard({ suratTerbanyak, loading }: Props) {
	const t = useTranslate();
	const dark = useIsDark();
	const { tampilkanGrid } = useSnapshot(i18nStore);

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			bg={dark ? "#1E293B" : "white"}
			style={{
				borderColor: dark ? "#334155" : "white",
				boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
			}}
			h="100%"
		>
			<Title order={4} c={dark ? "white" : "gray.9"} mb="md">
				{t.pengaduanLayanan.suratTerbanyak}
			</Title>
			{loading ? (
				<Skeleton height={250} radius="md" />
			) : suratTerbanyak.length > 0 ? (
				<ResponsiveContainer width="100%" height={250}>
					<BarChart
						data={suratTerbanyak}
						layout="vertical"
						margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
					>
						{tampilkanGrid && (
							<CartesianGrid
								strokeDasharray="3 3"
								horizontal={false}
								stroke={dark ? "#334155" : "#e5e7eb"}
							/>
						)}
						<XAxis
							type="number"
							axisLine={false}
							tickLine={false}
							tick={{ fill: dark ? "#E2E8F0" : "#374151" }}
						/>
						<YAxis
							type="category"
							dataKey="jenis"
							axisLine={false}
							tickLine={false}
							tickMargin={8}
							tick={{ fill: dark ? "#E2E8F0" : "#374151", fontSize: 12 }}
							width={128}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: dark ? "#1E293B" : "white",
								borderColor: dark ? "#334155" : "#e5e7eb",
								borderRadius: "8px",
							}}
							itemStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
							labelStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
						/>
						<Bar dataKey="jumlah" fill="#396aaaff" radius={[0, 4, 4, 0]}>
							<LabelList
								dataKey="jumlah"
								position="right"
								style={{
									fill: dark ? "#E2E8F0" : "#374151",
									fontSize: 11,
								}}
							/>
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			) : (
				<EmptyState
					message={t.pengaduanLayanan.tidakAdaDataPengaduan}
					height={250}
				/>
			)}
		</Card>
	);
}
