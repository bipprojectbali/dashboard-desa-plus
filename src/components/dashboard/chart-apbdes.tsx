import {
	Box,
	Card,
	Group,
	Progress,
	Select,
	Skeleton,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { IconArrowDownRight, IconArrowUpRight } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { apiClient } from "@/utils/api-client";

interface ApbdesCategory {
	category: string;
	anggaran: number;
	realisasi: number;
	percentage: number;
	color: string;
}

interface ApbdesYear {
	id: string;
	tahun: number;
	name: string;
	title: string;
	data: ApbdesCategory[];
}

async function fetchApbdes(): Promise<{ years: ApbdesYear[] }> {
	const res = await apiClient.GET("/api/noc/apbdes-data", {});
	return { years: res.data?.years ?? [] };
}

function formatCurrency(value: number): string {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
}

function getProgressColor(persen: number): string {
	if (persen >= 100) return "teal";
	if (persen >= 80) return "blue";
	if (persen >= 60) return "yellow";
	return "red";
}

function getStatusMessage(
	persen: number,
	messages: {
		status100: string;
		statusBaik: string;
		statusCukup: string;
		statusRendah: string;
	},
): { text: string; color: string } {
	if (persen >= 100) return { text: messages.status100, color: "teal" };
	if (persen >= 80) return { text: messages.statusBaik, color: "blue" };
	if (persen >= 60) return { text: messages.statusCukup, color: "yellow" };
	return { text: messages.statusRendah, color: "red" };
}

interface ApbdesSummaryProps {
	title: string;
	data: ApbdesCategory;
	icon: string;
}

function ApbdesSummary({ title, data, icon }: ApbdesSummaryProps) {
	const dark = useIsDark();
	const t = useTranslate();
	const progressColor = getProgressColor(data.percentage);
	const statusMessage = getStatusMessage(data.percentage, t.dashboard);

	return (
		<Box>
			<Group justify="space-between" mb="xs">
				<Group gap="xs">
					<Box
						w={32}
						h={32}
						style={{
							borderRadius: 8,
							backgroundColor: dark
								? "rgba(72, 187, 120, 0.1)"
								: "var(--mantine-color-green-0)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Text fz="lg">{icon}</Text>
					</Box>
					<Text fw={700} fz="md" c={dark ? "white" : "gray.8"}>
						{title}
					</Text>
				</Group>
				<Group gap="xs">
					{data.percentage >= 100 ? (
						<IconArrowUpRight
							size={18}
							color="var(--mantine-color-teal-7)"
							stroke={2.5}
						/>
					) : data.percentage < 60 ? (
						<IconArrowDownRight
							size={18}
							color="var(--mantine-color-red-7)"
							stroke={2.5}
						/>
					) : null}
					<Text
						fw={700}
						fz="lg"
						c={progressColor}
						style={{ minWidth: 60, textAlign: "right" }}
					>
						{data.percentage.toFixed(1)}%
					</Text>
				</Group>
			</Group>

			<Text fz="xs" c={dark ? "gray.5" : "gray.6"} mb="sm" lh={1.5}>
				{t.dashboard.realisasiLabel}:{" "}
				<Text component="span" fw={700} c={dark ? "blue.3" : "blue.9"}>
					{formatCurrency(data.realisasi)}
				</Text>{" "}
				/ {t.dashboard.anggaranLabel}:{" "}
				<Text component="span" fw={700} c={dark ? "gray.4" : "gray.7"}>
					{formatCurrency(data.anggaran)}
				</Text>
			</Text>

			<Progress
				value={data.percentage}
				size="xl"
				radius="xl"
				color={progressColor}
				striped={data.percentage < 100}
				animated={data.percentage < 100}
				mb="xs"
			/>

			<Text
				fz="xs"
				c={statusMessage.color}
				fw={600}
				style={{
					backgroundColor: dark
						? "rgba(72, 187, 120, 0.1)"
						: `var(--mantine-color-${statusMessage.color}-0)`,
					padding: "6px 10px",
					borderRadius: 6,
					display: "inline-block",
				}}
			>
				{data.percentage >= 100 && "✓ "}
				{statusMessage.text}
			</Text>
		</Box>
	);
}

const ICONS: Record<string, string> = {
	Pendapatan: "💰",
	Belanja: "💸",
	Pembiayaan: "📊",
};

export function ChartAPBDes() {
	const dark = useIsDark();
	const t = useTranslate();
	const [selectedTahun, setSelectedTahun] = useState<number | null>(null);

	const { data: apbdes, isLoading: loading } = useApiQuery(
		["dashboard", "apbdes"],
		fetchApbdes,
		{ autoRefresh: true },
	);

	const years = apbdes?.years ?? [];

	useEffect(() => {
		if (selectedTahun === null && years.length > 0 && years[0]) {
			setSelectedTahun(years[0].tahun);
		}
	}, [years, selectedTahun]);

	const activeTahun = selectedTahun ?? years[0]?.tahun ?? null;
	const activeYear = years.find((y) => y.tahun === activeTahun);
	const chartData = activeYear?.data ?? [];
	const cardTitle = activeYear?.title ?? "Grafik Realisasi APBDes";

	const selectOptions = years.map((y) => ({
		value: String(y.tahun),
		label: `Tahun ${y.tahun}`,
	}));

	return (
		<Card
			p="lg"
			radius="xl"
			withBorder
			bg={dark ? "#1E293B" : "white"}
			style={{
				borderColor: dark ? "#334155" : "white",
				boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
			}}
			h="100%"
		>
			<Group justify="space-between" align="flex-start" mb="lg">
				<Title
					order={5}
					c={dark ? "blue.3" : "blue.9"}
					fz={{ base: "1rem", md: "1.1rem" }}
					fw={700}
					style={{ flex: 1 }}
				>
					{cardTitle}
				</Title>
				{years.length > 1 && (
					<Select
						size="xs"
						w={130}
						data={selectOptions}
						value={activeTahun !== null ? String(activeTahun) : null}
						onChange={(v) => setSelectedTahun(v ? Number(v) : null)}
						allowDeselect={false}
					/>
				)}
			</Group>
			<Stack gap="xl">
				{loading ? (
					<Stack gap="xl">
						{Array.from({ length: 3 }).map((_, i) => (
							<Skeleton key={i} height={80} radius="sm" />
						))}
					</Stack>
				) : chartData.length > 0 ? (
					chartData.map((item) => (
						<ApbdesSummary
							key={item.category}
							title={item.category}
							data={item}
							icon={ICONS[item.category] || "📈"}
						/>
					))
				) : (
					<Text size="sm" c="dimmed" ta="center">
						{t.dashboard.tidakAdaDataApbdes}
					</Text>
				)}
			</Stack>
		</Card>
	);
}
