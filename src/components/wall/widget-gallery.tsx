import { Stack, Text, UnstyledButton } from "@mantine/core";
import { modals } from "@mantine/modals";
import type { WallCategory, WidgetId } from "./wall-layout-utils";
import { WALL_THEME } from "./wall-theme";
import { unplacedWidgets } from "./widget-registry";

const CATEGORY_LABELS: Record<WallCategory, string> = {
	beranda: "Beranda",
	divisi: "Kinerja Divisi",
	pengaduan: "Pengaduan & Layanan",
	demografi: "Demografi",
	keuangan: "Keuangan",
	keamanan: "Keamanan",
	jenna: "Jenna Analytic",
	ops: "Sistem",
};

/**
 * Buka galeri tambah-widget: daftar widget yang BELUM terpasang, dikelompokkan
 * per kategori. Klik satu → `onPick(id)` lalu tutup. Bila semua sudah terpasang,
 * tampilkan pesan kosong.
 */
export function openWidgetGallery(
	order: readonly string[],
	onPick: (id: WidgetId) => void,
) {
	const available = unplacedWidgets(order);

	const grouped = new Map<WallCategory, typeof available>();
	for (const def of available) {
		const list = grouped.get(def.category) ?? [];
		list.push(def);
		grouped.set(def.category, list);
	}

	modals.open({
		title: "Tambah Widget",
		centered: true,
		children:
			available.length === 0 ? (
				<Text c="dimmed" size="sm">
					Semua widget sudah terpasang.
				</Text>
			) : (
				<Stack gap="lg">
					{[...grouped.entries()].map(([category, defs]) => (
						<Stack key={category} gap="xs">
							<Text size="xs" fw={700} c="dimmed" tt="uppercase">
								{CATEGORY_LABELS[category]}
							</Text>
							{defs.map((def) => (
								<UnstyledButton
									key={def.id}
									onClick={() => {
										onPick(def.id);
										modals.closeAll();
									}}
									style={{
										padding: "10px 14px",
										borderRadius: 8,
										border: `1px solid ${WALL_THEME.BORDER}`,
									}}
								>
									<Text fw={600}>{def.title}</Text>
								</UnstyledButton>
							))}
						</Stack>
					))}
				</Stack>
			),
	});
}
