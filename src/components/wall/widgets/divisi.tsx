import { Badge, Box, Group, Progress, Stack, Text } from "@mantine/core";
import type { WallDivisi } from "@/types/wall";
import { DonutBody } from "../donut-body";
import { HorizontalBar } from "../horizontal-bar";
import { WALL_THEME } from "../wall-theme";

/** Kinerja divisi: donut progres kegiatan per status (% live dari NOC). */
export function DivisiKinerjaBody({
	data,
}: {
	data: WallDivisi["activities"];
}) {
	return <DonutBody data={data} unit="kegiatan" />;
}

/** Dokumen per jenis (bar horizontal). */
export function DivisiDocumentsBody({
	data,
}: {
	data: WallDivisi["documents"];
}) {
	const rows = data.map((d) => ({ name: d.name, jumlah: d.jumlah }));
	return (
		<HorizontalBar
			data={rows}
			dataKey="name"
			valueKey="jumlah"
			color={WALL_THEME.ACCENT}
		/>
	);
}

function statusColor(status: string): string {
	if (status === "SELESAI") return WALL_THEME.OK;
	if (status === "BERJALAN") return WALL_THEME.ACCENT;
	return WALL_THEME.WARN;
}

/** Kegiatan terbaru: list title + progress bar + status badge. */
export function DivisiKegiatanBody({ data }: { data: WallDivisi["projects"] }) {
	return (
		<Stack gap="sm" style={{ height: "100%", overflow: "hidden" }}>
			{data.map((p) => (
				<Box key={p.id}>
					<Group justify="space-between" mb={4}>
						<Text
							size="sm"
							fw={600}
							style={{
								color: WALL_THEME.TEXT,
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
								flex: 1,
							}}
						>
							{p.title}
						</Text>
						<Badge
							size="xs"
							radius="xl"
							style={{
								backgroundColor: statusColor(p.status),
								color: "#fff",
								flexShrink: 0,
							}}
						>
							{p.status === "SELESAI" ? "Selesai" : "Berjalan"}
						</Badge>
					</Group>
					<Progress
						value={p.progress}
						size="sm"
						radius="xl"
						color={statusColor(p.status)}
						styles={{ root: { backgroundColor: WALL_THEME.TRACK } }}
					/>
					<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }} mt={2}>
						{p.divisi}
					</Text>
				</Box>
			))}
		</Stack>
	);
}

/** Diskusi terbaru: list pesan + divisi + tanggal (tanpa nama pengirim). */
export function DivisiDiskusiBody({
	data,
}: {
	data: WallDivisi["discussions"];
}) {
	return (
		<Stack gap="sm" style={{ height: "100%", overflow: "hidden" }}>
			{data.map((d) => (
				<Box
					key={d.id}
					style={{
						borderLeft: `3px solid ${WALL_THEME.ACCENT}`,
						paddingLeft: 10,
					}}
				>
					<Text
						size="sm"
						style={{
							color: WALL_THEME.TEXT,
							overflow: "hidden",
							display: "-webkit-box",
							WebkitLineClamp: 2,
							WebkitBoxOrient: "vertical",
						}}
					>
						{d.message}
					</Text>
					<Group gap="xs" mt={2}>
						<Text size="xs" style={{ color: WALL_THEME.ACCENT }}>
							{d.divisi}
						</Text>
						<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }}>
							·
						</Text>
						<Text size="xs" style={{ color: WALL_THEME.TEXT_DIM }}>
							{d.date ? new Date(d.date).toLocaleDateString("id-ID") : "—"}
						</Text>
					</Group>
				</Box>
			))}
		</Stack>
	);
}
