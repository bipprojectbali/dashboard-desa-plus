import {
	Button,
	Card,
	Group,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { useSnapshot } from "valtio";
import { setRange, umkmStore } from "../../store/umkm";

type TimeRange = "minggu" | "bulan";

interface HeaderToggleProps {
	title?: string;
	onRangeChange?: (range: TimeRange) => void;
}

export const HeaderToggle = ({
	title = "Update Penjualan Produk",
	onRangeChange,
}: HeaderToggleProps) => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";
	const { selectedRange } = useSnapshot(umkmStore);

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
					{title}
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
						Minggu ini
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
						Bulan ini
					</Button>
				</Group>
			</Group>
		</Card>
	);
};
