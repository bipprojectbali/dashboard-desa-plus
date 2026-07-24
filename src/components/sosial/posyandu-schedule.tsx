import {
	Alert,
	Badge,
	Card,
	Center,
	Group,
	Skeleton,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { IconAlertCircle, IconBuildingHospital } from "@tabler/icons-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { apiClient } from "@/utils/api-client";

function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, "").trim();
}

function extractTime(html: string): string {
	const text = stripHtml(html);
	const match = text.match(/\d{2}:\d{2}\s*[–-]\s*\d{2}:\d{2}/);
	if (!match) return "";
	return match[0].replace(/\s*–\s*/g, " - ");
}

function extractScheduleDesc(html: string): string {
	const text = stripHtml(html);
	return text.length > 60 ? `${text.slice(0, 57)}...` : text;
}

interface PosyanduApiItem {
	id: string;
	name: string;
	jadwalPelayanan: string;
}

async function fetchPosyandu(): Promise<PosyanduApiItem[]> {
	// Lewat proxy internal (/api/sosial/*) agar tidak kena CORS saat cross-origin
	// dari browser ke Desa API — server-to-server tidak butuh header CORS.
	const res = await apiClient.GET("/api/sosial/posyandu/find-many");
	const body = res.data as
		| { success: boolean; data: PosyanduApiItem[] | null }
		| undefined;
	if (body?.success && body.data) return body.data.slice(0, 5);
	throw new Error("Data tidak tersedia");
}

export const PosyanduSchedule = () => {
	const t = useTranslate();
	const dark = useIsDark();

	const {
		data: items = [],
		isLoading: loading,
		isError,
	} = useApiQuery(["sosial-ext", "posyandu"], fetchPosyandu);
	const error = isError ? "Gagal memuat jadwal posyandu" : null;

	return (
		<Card
			p="md"
			radius="xl"
			withBorder
			shadow="sm"
			style={{
				backgroundColor: "var(--app-card)",
				borderColor: "var(--app-border)",
				boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
				transition: "transform 0.15s ease, box-shadow 0.15s ease",
			}}
		>
			<Title order={3} mb="md" c={dark ? "dark.0" : "#1e3a5f"}>
				{t.sosial.jadwalPosyandu}
			</Title>

			{loading ? (
				<Stack gap="sm">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton
							// biome-ignore lint/suspicious/noArrayIndexKey: static list
							key={i}
							height={60}
							radius="md"
						/>
					))}
				</Stack>
			) : error ? (
				<Alert
					icon={<IconAlertCircle size={16} />}
					color="red"
					radius="md"
					title="Gagal memuat data"
				>
					{error}
				</Alert>
			) : items.length === 0 ? (
				<Center py="xl">
					<Stack align="center" gap="xs">
						<IconBuildingHospital
							size={40}
							color={dark ? "#475569" : "#CBD5E1"}
						/>
						<Text c="dimmed" size="sm">
							Belum ada jadwal posyandu
						</Text>
					</Stack>
				</Center>
			) : (
				<Stack gap="sm">
					{items.map((item) => (
						<Card
							key={item.id}
							p="md"
							radius="md"
							withBorder
							bg={dark ? "#263852ff" : "#F1F5F9"}
							style={{ borderColor: dark ? "#263852ff" : "#F1F5F9" }}
						>
							<Group justify="space-between">
								<Stack gap={0}>
									<Text fw={600} c={dark ? "white" : "#1e3a5f"}>
										{item.name}
									</Text>
									<Text size="sm" c={dark ? "white" : "dimmed"}>
										{extractScheduleDesc(item.jadwalPelayanan)}
									</Text>
								</Stack>
								{extractTime(item.jadwalPelayanan) && (
									<Badge variant="light" color="darmasaba-blue" size="md">
										{extractTime(item.jadwalPelayanan)}
									</Badge>
								)}
							</Group>
						</Card>
					))}
				</Stack>
			)}
		</Card>
	);
};
