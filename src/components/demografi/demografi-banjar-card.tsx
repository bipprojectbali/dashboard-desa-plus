import {
	Box,
	Card,
	Group,
	Skeleton,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import { Users } from "lucide-react";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { CHART } from "@/theme";
import type { BanjarData } from "./demografi.types";

interface DemografiBanjarCardProps {
	banjarData: BanjarData[];
	loading: boolean;
}

export const DemografiBanjarCard = ({
	banjarData,
	loading,
}: DemografiBanjarCardProps) => {
	const t = useTranslate();
	const dark = useIsDark();

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
			<Group gap="xs" mb="md">
				<ThemeIcon
					color="darmasaba-navy.7"
					variant="filled"
					size="sm"
					radius="sm"
				>
					<Users size={14} />
				</ThemeIcon>
				<Title order={4} c={dark ? "white" : "gray.9"}>
					{t.demografiPekerjaan.dataPerBanjar}
				</Title>
			</Group>
			{loading ? (
				<Skeleton height={250} radius="md" />
			) : banjarData.length === 0 ? (
				<Group justify="center" align="center" h={250}>
					<Text size="sm" c="dimmed">
						Belum ada data per banjar.
					</Text>
				</Group>
			) : (
				<Box style={{ overflowX: "auto" }}>
					<table style={{ width: "100%", borderCollapse: "collapse" }}>
						<thead>
							<tr>
								<th
									style={{
										textAlign: "left",
										padding: "8px",
										fontSize: "12px",
										fontWeight: 600,
										color: dark ? "#94A3B8" : "#64748B",
										borderBottom: `1px solid ${dark ? "#334155" : "#e5e7eb"}`,
									}}
								>
									{t.demografiPekerjaan.banjar}
								</th>
								<th
									style={{
										textAlign: "right",
										padding: "8px",
										fontSize: "12px",
										fontWeight: 600,
										color: dark ? "#94A3B8" : "#64748B",
										borderBottom: `1px solid ${dark ? "#334155" : "#e5e7eb"}`,
									}}
								>
									{t.demografiPekerjaan.penduduk}
								</th>
								<th
									style={{
										textAlign: "right",
										padding: "8px",
										fontSize: "12px",
										fontWeight: 600,
										color: dark ? "#94A3B8" : "#64748B",
										borderBottom: `1px solid ${dark ? "#334155" : "#e5e7eb"}`,
									}}
								>
									{t.demografiPekerjaan.kk}
								</th>
								<th
									style={{
										textAlign: "right",
										padding: "8px",
										fontSize: "12px",
										fontWeight: 600,
										color: dark ? "#94A3B8" : "#64748B",
										borderBottom: `1px solid ${dark ? "#334155" : "#e5e7eb"}`,
									}}
								>
									{t.demografiPekerjaan.miskin}
								</th>
							</tr>
						</thead>
						<tbody>
							{banjarData.map((item) => (
								<tr
									key={item.id}
									style={{
										backgroundColor:
											banjarData.indexOf(item) % 2 === 0
												? dark
													? "#334155"
													: "#F8FAFC"
												: "transparent",
										transition: "background-color 0.15s ease",
									}}
								>
									<td
										style={{
											padding: "10px 8px",
											fontSize: "13px",
											fontWeight: 500,
											color: dark ? "#E2E8F0" : "#1E293B",
										}}
									>
										{item.name}
									</td>
									<td
										style={{
											padding: "10px 8px",
											textAlign: "right",
											fontSize: "13px",
											color: dark ? "#E2E8F0" : "#1E293B",
										}}
									>
										{(item.totalPopulation || 0).toLocaleString()}
									</td>
									<td
										style={{
											padding: "10px 8px",
											textAlign: "right",
											fontSize: "13px",
											color: dark ? "#E2E8F0" : "#1E293B",
										}}
									>
										{(item.totalKK || 0).toLocaleString()}
									</td>
									<td
										style={{
											padding: "10px 8px",
											textAlign: "right",
											fontSize: "13px",
											color: CHART.red,
											fontWeight: 600,
										}}
									>
										{(item.totalPoor || 0).toLocaleString()}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</Box>
			)}
		</Card>
	);
};
