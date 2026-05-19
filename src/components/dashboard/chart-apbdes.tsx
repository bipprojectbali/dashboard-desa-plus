import {
	Box,
	Card,
	Group,
	Loader,
	Progress,
	Stack,
	Text,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { IconArrowDownRight, IconArrowUpRight } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslate } from "@/hooks/useTranslate";
import { apiClient } from "@/utils/api-client";

interface ApbdesData {
	name: string;
	anggaran: number;
	realisasi: number;
	percentage: number;
	color: string;
}

// Helper to format currency
function formatCurrency(value: number): string {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
}

// Get progress color based on realization percentage
function getProgressColor(persen: number): string {
	if (persen >= 100) return "teal";
	if (persen >= 80) return "blue";
	if (persen >= 60) return "yellow";
	return "red";
}

// Get status message based on realization percentage
function getStatusMessage(
	persen: number,
	messages: { status100: string; statusBaik: string; statusCukup: string; statusRendah: string },
): { text: string; color: string } {
	if (persen >= 100) {
		return { text: messages.status100, color: "teal" };
	}
	if (persen >= 80) {
		return { text: messages.statusBaik, color: "blue" };
	}
	if (persen >= 60) {
		return { text: messages.statusCukup, color: "yellow" };
	}
	return { text: messages.statusRendah, color: "red" };
}

interface ApbdesSummaryProps {
	title: string;
	data: ApbdesData;
	icon: string;
}

function ApbdesSummary({ title, data, icon }: ApbdesSummaryProps) {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";
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

export function ChartAPBDes() {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";
	const t = useTranslate();

	const [data, setData] = useState<ApbdesData[]>([]);
	const [loading, setLoading] = useState(true);
	const [apbdesTitle, setApbdesTitle] = useState("Grafik Realisasi APBDes");

	useEffect(() => {
		async function fetchApbdes() {
			try {
				// Fetch from new NOC endpoint that integrates with external Desa API
				// Using specific ID for APBDes: cmk-apbdes-001
				const res = await apiClient.GET("/api/noc/apbdes-data", {
					params: { query: { idDesa: "cmk-apbdes-001" } },
				});

				if (res.data?.data) {
					setData(
						res.data.data.map((d) => ({
							name: d.category,
							anggaran: d.anggaran,
							realisasi: d.realisasi,
							percentage: d.percentage,
							color: d.color,
						})),
					);
				}

				// Update title with APBDes info from message
				if (res.data?.message) {
					setApbdesTitle(res.data.message.replace("data", "Realisasi"));
				}
			} catch (error) {
				console.error("Failed to fetch APBDes data", error);
			} finally {
				setLoading(false);
			}
		}

		fetchApbdes();
	}, []);

	return (
		<Card
			p="lg"
			radius="xl"
			withBorder
			bg={dark ? "#1E293B" : "white"}
			style={{
				borderColor: dark ? "#334155" : "white",
				boxShadow: dark
					? "0 1px 3px 0 rgb(0 0 0 / 0.1)"
					: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
			}}
			h="100%"
		>
			<Title
				order={5}
				c={dark ? "blue.3" : "blue.9"}
				fz={{ base: "1rem", md: "1.1rem" }}
				fw={700}
				mb="lg"
			>
				{apbdesTitle}
			</Title>
			<Stack gap="xl">
				{loading ? (
					<Group justify="center" py="xl">
						<Loader />
					</Group>
				) : data.length > 0 ? (
					data.map((item) => {
						const icons: Record<string, string> = {
							Pendapatan: "💰",
							Belanja: "💸",
							Pembiayaan: "📊",
						};
						return (
							<ApbdesSummary
								key={item.name}
								title={item.name}
								data={item}
								icon={icons[item.name] || "📈"}
							/>
						);
					})
				) : (
					<Text size="sm" c="dimmed" ta="center">
						{t.dashboard.tidakAdaDataApbdes}
					</Text>
				)}
			</Stack>
		</Card>
	);
}
