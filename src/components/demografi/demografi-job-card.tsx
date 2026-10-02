import { Card, Group, Skeleton, Text, ThemeIcon, Title } from "@mantine/core";
import { Building2 } from "lucide-react";
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
import type { JobData } from "./demografi.types";

interface DemografiJobCardProps {
	jobData: JobData[];
	loading: boolean;
}

export const DemografiJobCard = ({
	jobData,
	loading,
}: DemografiJobCardProps) => {
	const t = useTranslate();
	const dark = useIsDark();
	const { tampilkanGrid } = useSnapshot(i18nStore);

	return (
		<Card
			data-ai-target="demografi.pekerjaan"
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
					<Building2 size={14} />
				</ThemeIcon>
				<Title order={4} c={dark ? "white" : "gray.9"}>
					{t.demografiPekerjaan.demografiPekerjaan}
				</Title>
			</Group>
			{loading ? (
				<Skeleton height={250} radius="md" />
			) : jobData.length === 0 ? (
				<Group justify="center" align="center" h={250}>
					<Text size="sm" c="dimmed">
						Belum ada data demografi pekerjaan.
					</Text>
				</Group>
			) : (
				<ResponsiveContainer width="100%" height={250}>
					<BarChart data={jobData} layout="vertical">
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
							tick={{
								fill: dark ? "#E2E8F0" : "#374151",
								fontSize: 12,
							}}
						/>
						<YAxis
							type="category"
							dataKey="job"
							axisLine={false}
							tickLine={false}
							tick={{
								fill: dark ? "#E2E8F0" : "#374151",
								fontSize: 12,
							}}
							width={110}
							tickFormatter={(v: string) =>
								v.length > 14 ? `${v.slice(0, 13)}…` : v
							}
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
							radius={[0, 8, 8, 0]}
							maxBarSize={30}
						>
							<LabelList
								dataKey="total"
								position="right"
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
