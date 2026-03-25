import {
	Box,
	Card,
	Group,
	Stack,
	Text,
	useMantineColorScheme,
} from "@mantine/core";
import { ChevronRight } from "lucide-react";

interface DivisionItem {
	name: string;
	count: number;
}

const divisionData: DivisionItem[] = [
	{ name: "Kesejahteraan", count: 37 },
	{ name: "Pemerintahan", count: 26 },
	{ name: "Keuangan", count: 17 },
	{ name: "Sekretaris Desa", count: 15 },
	{ name: "Tata Usaha TK", count: 14 },
	{ name: "Perangkat Kewilayahan", count: 12 },
	{ name: "Pelayanan", count: 10 },
	{ name: "Perencanaan", count: 9 },
	{ name: "Tata Usaha & Umum", count: 7 },
];

export function DivisionList() {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	return (
		<Card
			p="md"
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
			<Text size="sm" fw={600} c={dark ? "white" : "#1E3A5F"} mb="md">
				Divisi Teraktif
			</Text>
			<Stack gap="xs">
				{divisionData.map((division, index) => (
					<Group
						key={index}
						justify="space-between"
						align="center"
						style={{
							padding: "8px 12px",
							borderRadius: 8,
							backgroundColor: dark ? "#334155" : "#F1F5F9",
							transition: "background-color 0.2s",
							cursor: "pointer",
						}}
					>
						<Text size="sm" c={dark ? "white" : "#1E3A5F"}>
							{division.name}
						</Text>
						<Group gap="xs">
							<Text size="sm" fw={600} c={dark ? "white" : "#1E3A5F"}>
								{division.count}
							</Text>
							<ChevronRight size={16} color={dark ? "#94A3B8" : "#64748B"} />
						</Group>
					</Group>
				))}
			</Stack>
		</Card>
	);
}
