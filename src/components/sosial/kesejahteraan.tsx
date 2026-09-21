import {
	Card,
	Group,
	Pagination,
	Skeleton,
	Stack,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import { IconHeartHandshake } from "@tabler/icons-react";
import { useState } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";
import { apiClient } from "@/utils/api-client";

const PAGE_SIZE = 4;

interface KesejahteraanProgram {
	id: string;
	judul: string;
	deskripsi: string | null;
}

// Proxy server-side (/api/sosial/kesejahteraan/find-many) — Desa API tak
// mengirim header CORS, jadi diambil di server lalu diteruskan ke browser.
async function fetchKesejahteraan(): Promise<KesejahteraanProgram[]> {
	const res = await apiClient.GET("/api/sosial/kesejahteraan/find-many");
	const body = res.data as
		| { success: boolean; data: KesejahteraanProgram[] | null }
		| undefined;
	return body?.success ? (body.data ?? []) : [];
}

export const Kesejahteraan = () => {
	const t = useTranslate();
	const dark = useIsDark();
	const [page, setPage] = useState(1);

	const { data: programs = [], isLoading: loading } = useApiQuery(
		["sosial-ext", "kesejahteraan"],
		fetchKesejahteraan,
	);

	const totalPages = Math.max(1, Math.ceil(programs.length / PAGE_SIZE));
	const paginated = programs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
				{t.sosial.kesejahteraanMasyarakat}
			</Title>
			<Stack gap="sm">
				{loading ? (
					Array.from({ length: PAGE_SIZE }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
						<Skeleton key={i} height={72} radius="md" />
					))
				) : paginated.length === 0 ? (
					<Text size="sm" c="dimmed" ta="center" py="md">
						{t.sosial.kesejahteraanKosong}
					</Text>
				) : (
					paginated.map((program) => (
						<Card
							key={program.id}
							p="md"
							radius="md"
							withBorder
							bg={dark ? "#263852ff" : "#F1F5F9"}
							style={{ borderColor: dark ? "#263852ff" : "#F1F5F9" }}
						>
							<Group gap="sm" align="flex-start" wrap="nowrap">
								<ThemeIcon
									color="darmasaba-success"
									size="md"
									radius="xl"
									variant="light"
									style={{ flexShrink: 0 }}
								>
									<IconHeartHandshake size={16} />
								</ThemeIcon>
								<Stack gap={4}>
									<Text fw={600} c={dark ? "dark.0" : "#1e3a5f"}>
										{program.judul}
									</Text>
									{program.deskripsi && (
										<Text size="sm" c={dark ? "white" : "gray.6"} lineClamp={2}>
											{program.deskripsi}
										</Text>
									)}
								</Stack>
							</Group>
						</Card>
					))
				)}
			</Stack>
			{totalPages > 1 && (
				<Group justify="center" mt="md">
					<Pagination
						value={page}
						onChange={setPage}
						total={totalPages}
						size="sm"
						radius="md"
						color="darmasaba-blue"
					/>
				</Group>
			)}
		</Card>
	);
};
