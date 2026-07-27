import { Card, Group, Skeleton, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconAward } from "@tabler/icons-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { apiClient } from "@/utils/api-client";

interface BeasiswaStats {
	total: number;
	lakiLaki: number;
	perempuan: number;
	periode: string | null;
}

// Proxy server-side (/api/sosial/beasiswa/stats) — PII pendaftar tidak
// diteruskan ke browser; hanya agregat (total, L/P, periode).
async function fetchBeasiswa(): Promise<BeasiswaStats | null> {
	const res = await apiClient.GET("/api/sosial/beasiswa/stats");
	const body = res.data as
		| { success: boolean; data: BeasiswaStats | null }
		| undefined;
	return body?.success ? (body.data ?? null) : null;
}

export const Beasiswa = () => {
	const t = useTranslate();
	const dark = useIsDark();

	const { data: stats = null, isLoading: loading } = useApiQuery(
		["sosial-ext", "beasiswa"],
		fetchBeasiswa,
	);

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
			h={"100%"}
		>
			<Group justify="space-between" align="center">
				<Stack gap={2}>
					<Text size="sm" c={dark ? "white" : "dimmed"} fw={500}>
						{t.sosial.beasiswaDesa}
					</Text>
					{loading ? (
						<Skeleton height={28} width={120} radius="sm" />
					) : (
						<Text size="xl" fw={700} c={dark ? "white" : "#1e3a5f"}>
							{t.sosial.penerima}: {stats?.total ?? 0}
						</Text>
					)}
				</Stack>
				<ThemeIcon
					variant="light"
					color="darmasaba-success"
					size="xl"
					radius="xl"
				>
					<IconAward size={24} />
				</ThemeIcon>
			</Group>
			<Stack gap="xs" mt="md">
				<Group justify="space-between">
					<Text c={dark ? "white" : "dimmed"}>{t.sosial.lakiLaki}:</Text>
					{loading ? (
						<Skeleton height={20} width={40} radius="sm" />
					) : (
						<Text fw={700} c={dark ? "white" : "#1e3a5f"}>
							{stats?.lakiLaki ?? 0}
						</Text>
					)}
				</Group>
				<Group justify="space-between">
					<Text c={dark ? "white" : "dimmed"}>{t.sosial.perempuan}:</Text>
					{loading ? (
						<Skeleton height={20} width={40} radius="sm" />
					) : (
						<Text fw={700} c={dark ? "white" : "#1e3a5f"}>
							{stats?.perempuan ?? 0}
						</Text>
					)}
				</Group>
				<Group justify="space-between">
					<Text c={dark ? "white" : "dimmed"}>{t.sosial.periode}:</Text>
					{loading ? (
						<Skeleton height={20} width={40} radius="sm" />
					) : (
						<Text c={dark ? "white" : "#1e3a5f"}>{stats?.periode ?? "—"}</Text>
					)}
				</Group>
			</Stack>
		</Card>
	);
};
