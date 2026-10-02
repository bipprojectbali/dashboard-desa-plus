import {
	Box,
	Card,
	Group,
	Select,
	Skeleton,
	Stack,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import { PieChart as PieChartIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
	groupReligion,
	type RawReligionRow,
	religionYears,
} from "@/api/transforms/religion";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { CHART } from "@/theme";
import type { ReligionData } from "./demografi.types";

// Warna per key agama ternormalisasi (lihat transforms/religion.ts).
const RELIGION_COLORS: Record<string, string> = {
	HINDU: CHART.red,
	ISLAM: CHART.blue,
	KRISTEN_PROTESTAN: CHART.green,
	KRISTEN_KATOLIK: CHART.grape,
	BUDDHA: CHART.amber,
	KONGHUCU: CHART.orange,
	LAINNYA: CHART.gray,
};

interface DemografiReligionCardProps {
	religionRows: RawReligionRow[];
	loading: boolean;
}

export const DemografiReligionCard = ({
	religionRows,
	loading,
}: DemografiReligionCardProps) => {
	const t = useTranslate();
	const dark = useIsDark();

	// Dropdown tahun distribusi agama — default tahun terbaru, ganti tanpa refetch.
	const [selectedReligionYear, setSelectedReligionYear] = useState<
		string | null
	>(null);
	const religionYearOptions = useMemo(
		() => religionYears(religionRows).map((y) => String(y)),
		[religionRows],
	);
	const activeReligionYear =
		selectedReligionYear ?? religionYearOptions[0] ?? null;
	const religionData: ReligionData[] = useMemo(
		() =>
			groupReligion(
				religionRows,
				activeReligionYear ? Number(activeReligionYear) : null,
			).map((slice) => ({
				name: slice.label,
				value: slice.count,
				color: RELIGION_COLORS[slice.key] ?? CHART.gray,
			})),
		[religionRows, activeReligionYear],
	);

	return (
		<Card
			data-ai-target="demografi.agama"
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
			<Group gap="xs" mb="md" justify="space-between" wrap="nowrap">
				<Group gap="xs" wrap="nowrap">
					<ThemeIcon
						color="darmasaba-navy.7"
						variant="filled"
						size="sm"
						radius="sm"
					>
						<PieChartIcon size={14} />
					</ThemeIcon>
					<Title order={4} c={dark ? "white" : "gray.9"}>
						{t.demografiPekerjaan.distribusiAgama}
					</Title>
				</Group>
				{religionYearOptions.length > 1 && (
					<Select
						size="xs"
						w={100}
						aria-label="Pilih tahun distribusi agama"
						data={religionYearOptions}
						value={activeReligionYear}
						onChange={setSelectedReligionYear}
						allowDeselect={false}
						wrapperProps={{ "data-ai-target": "demografi.tahun-agama" }}
						comboboxProps={{ withinPortal: true }}
					/>
				)}
			</Group>
			{loading ? (
				<Skeleton height={250} radius="md" />
			) : religionData.length === 0 ? (
				<Group justify="center" align="center" h={250}>
					<Text size="sm" c="dimmed">
						Belum ada data distribusi agama.
					</Text>
				</Group>
			) : (
				<>
					<ResponsiveContainer width="100%" height={250}>
						<PieChart>
							<Pie
								data={religionData}
								cx="50%"
								cy="50%"
								innerRadius={60}
								outerRadius={90}
								paddingAngle={2}
								dataKey="value"
								stroke="none"
							>
								{religionData.map((entry) => (
									<Cell key={`cell-${entry.name}`} fill={entry.color} />
								))}
							</Pie>
							<Tooltip
								contentStyle={{
									backgroundColor: dark ? "#1E293B" : "white",
									borderColor: dark ? "#334155" : "#e5e7eb",
									borderRadius: "8px",
								}}
								itemStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
								labelStyle={{ color: dark ? "#E2E8F0" : "#374151" }}
							/>
						</PieChart>
					</ResponsiveContainer>
					<Stack gap="xs" mt="md">
						{religionData.map((item) => (
							<Group key={item.name} justify="space-between">
								<Group gap="xs">
									<Box
										w={10}
										h={10}
										style={{
											backgroundColor: item.color,
											borderRadius: 2,
										}}
									/>
									<Text size="sm" c={dark ? "white" : "gray.7"}>
										{item.name}
									</Text>
								</Group>
								<Text size="sm" fw={600} c={dark ? "white" : "gray.9"}>
									{item.value.toLocaleString()}
								</Text>
							</Group>
						))}
					</Stack>
				</>
			)}
		</Card>
	);
};
