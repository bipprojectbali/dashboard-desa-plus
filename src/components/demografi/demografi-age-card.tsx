import { Card, Group, Skeleton, Text, ThemeIcon, Title } from "@mantine/core";
import { BarChart3 } from "lucide-react";
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
import type { AgeData } from "./demografi.types";

interface DemografiAgeCardProps {
	ageData: AgeData[];
	loading: boolean;
}

export const DemografiAgeCard = ({
	ageData,
	loading,
}: DemografiAgeCardProps) => {
	const t = useTranslate();
	const dark = useIsDark();
	const { tampilkanGrid } = useSnapshot(i18nStore);

	return (
		<Card
			data-ai-target="demografi.umur"
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
			<Group gap="xs" mb="md">
				<ThemeIcon
					color="darmasaba-navy.7"
					variant="filled"
					size="sm"
					radius="sm"
				>
					<BarChart3 size={14} />
				</ThemeIcon>
				<Title order={4} c={dark ? "white" : "gray.9"}>
					{t.demografiPekerjaan.pengelompokanUmur}
				</Title>
			</Group>
			{loading ? (
				<Skeleton height={250} radius="md" />
			) : ageData.length === 0 ? (
				<Group justify="center" align="center" h={250}>
					<Text size="sm" c="dimmed">
						Belum ada data kelompok umur.
					</Text>
				</Group>
			) : (
				<ResponsiveContainer width="100%" height={250}>
					<BarChart data={ageData}>
						{tampilkanGrid && (
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke={dark ? "#334155" : "#e5e7eb"}
							/>
						)}
						<XAxis
							dataKey="ageRange"
							axisLine={false}
							tickLine={false}
							tick={{
								fill: dark ? "#E2E8F0" : "#374151",
								fontSize: 12,
							}}
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{
								fill: dark ? "#E2E8F0" : "#374151",
								fontSize: 12,
							}}
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
						<Bar
							dataKey="total"
							fill="#396aaaff"
							radius={[8, 8, 0, 0]}
							maxBarSize={40}
						>
							<LabelList
								dataKey="total"
								position="top"
								style={{
									fill: dark ? "#E2E8F0" : "#374151",
									fontSize: 11,
								}}
							/>
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			)}
		</Card>
	);
};
