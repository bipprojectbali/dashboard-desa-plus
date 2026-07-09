import { Button, Card, Group, Title } from "@mantine/core";
import { useSnapshot } from "valtio";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { setRange, umkmStore } from "../../store/umkm";

type TimeRange = "minggu" | "bulan";

interface HeaderToggleProps {
	title?: string;
	onRangeChange?: (range: TimeRange) => void;
}

export const HeaderToggle = ({ title, onRangeChange }: HeaderToggleProps) => {
	const t = useTranslate();
	const dark = useIsDark();
	const { selectedRange } = useSnapshot(umkmStore);
	const displayTitle = title ?? t.bumdes.updatePenjualan;

	const handleRangeChange = (range: TimeRange) => {
		setRange(range);
		onRangeChange?.(range);
	};

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			shadow="sm"
			bg={dark ? "#1e3a5f" : "#1e3a5f"}
			style={{ borderColor: dark ? "#1e3a5f" : "#1e3a5f" }}
		>
			<Group justify="space-between" align="center" px="md" py="xs">
				<Title order={3} c="white">
					{displayTitle}
				</Title>
				<Group gap="xs">
					<Button
						variant={selectedRange === "minggu" ? "white" : "transparent"}
						onClick={() => handleRangeChange("minggu")}
						c={selectedRange === "minggu" ? "#1e3a5f" : "white"}
						fw={600}
						radius="xl"
						size="sm"
						style={{
							opacity: selectedRange === "minggu" ? 1 : 0.8,
						}}
					>
						{t.bumdes.mingguIni}
					</Button>
					<Button
						variant={selectedRange === "bulan" ? "white" : "transparent"}
						onClick={() => handleRangeChange("bulan")}
						c={selectedRange === "bulan" ? "#1e3a5f" : "white"}
						fw={600}
						radius="xl"
						size="sm"
						style={{
							opacity: selectedRange === "bulan" ? 1 : 0.8,
						}}
					>
						{t.bumdes.bulanIni}
					</Button>
				</Group>
			</Group>
		</Card>
	);
};
