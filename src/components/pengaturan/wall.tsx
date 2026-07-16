import {
	Alert,
	Box,
	Button,
	Group,
	LoadingOverlay,
	MantineProvider,
	Text,
	Title,
} from "@mantine/core";
import { IconCheck, IconPlus, IconRefresh, IconX } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { fetchWallSnapshot } from "@/components/wall/fetch-wall-snapshot";
import { WallGrid } from "@/components/wall/wall-grid";
import type { WidgetId } from "@/components/wall/wall-layout-utils";
import { WALL_THEME } from "@/components/wall/wall-theme";
import { openWidgetGallery } from "@/components/wall/widget-gallery";
import {
	addWidget,
	isDirty,
	loadLayout,
	moveWidget,
	removeWidget,
	resetToDefault,
	saveLayout,
	wallLayoutStore,
} from "@/store/wall-layout";

/**
 * Halaman admin pengaturan video wall. Preview WYSIWYG memakai komponen grid
 * yang sama seperti `/wall` (mode edit) dalam frame gelap 16:9. Simpan → PUT
 * singleton global → semua TV ikut berubah dalam 1 siklus refetch.
 */
const WallSettings = () => {
	const snap = useSnapshot(wallLayoutStore);
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	// Snapshot data dipakai preview supaya widget menampilkan angka nyata.
	const { data: snapshot } = useQuery({
		queryKey: ["wall", "snapshot", "admin-preview"],
		queryFn: () => fetchWallSnapshot(undefined),
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		loadLayout();
	}, []);

	useEffect(() => {
		if (!toast) return;
		const timer = setTimeout(() => setToast(null), 3000);
		return () => clearTimeout(timer);
	}, [toast]);

	const dirty = isDirty();

	const handleSave = async () => {
		try {
			await saveLayout();
			setToast({ type: "success", message: "Layout wall tersimpan" });
		} catch (err) {
			setToast({
				type: "error",
				message: err instanceof Error ? err.message : "Gagal menyimpan layout",
			});
		}
	};

	return (
		<Box maw={960} pos="relative">
			<LoadingOverlay visible={snap.status === "loading"} />

			{toast && (
				<Alert
					color={toast.type === "success" ? "green" : "red"}
					icon={
						toast.type === "success" ? (
							<IconCheck size={16} />
						) : (
							<IconX size={16} />
						)
					}
					withCloseButton
					onClose={() => setToast(null)}
					mb="md"
					radius="md"
				>
					{toast.message}
				</Alert>
			)}

			<Group justify="space-between" mb="lg" align="flex-end">
				<div>
					<Title order={3}>Video Wall</Title>
					<Text size="sm" c="dimmed">
						Atur widget yang tampil di layar `/wall`. Seret untuk menyusun
						ulang.
					</Text>
				</div>
				<Group gap="sm">
					<Button
						variant="light"
						leftSection={<IconPlus size={16} />}
						onClick={() =>
							openWidgetGallery(wallLayoutStore.order, (id) => addWidget(id))
						}
					>
						Tambah
					</Button>
					<Button
						variant="subtle"
						color="gray"
						leftSection={<IconRefresh size={16} />}
						onClick={resetToDefault}
					>
						Reset default
					</Button>
					<Button
						onClick={handleSave}
						loading={snap.status === "saving"}
						disabled={!dirty}
					>
						Simpan
					</Button>
				</Group>
			</Group>

			{/* Preview WYSIWYG: frame gelap 16:9, sama seperti tampilan /wall. */}
			<MantineProvider forceColorScheme="dark">
				<div
					style={{
						aspectRatio: "16 / 9",
						background: WALL_THEME.PAGE_BG,
						border: `1px solid ${WALL_THEME.BORDER}`,
						borderRadius: 12,
						padding: 18,
					}}
				>
					<WallGrid
						order={[...snap.order]}
						snapshot={snapshot}
						mode="edit"
						onReorder={moveWidget}
						onRemove={(id) => removeWidget(id as WidgetId)}
						onAdd={() =>
							openWidgetGallery(wallLayoutStore.order, (id) => addWidget(id))
						}
					/>
				</div>
			</MantineProvider>

			{snap.status === "error" && snap.error ? (
				<Text size="sm" c="red" mt="md">
					{snap.error}
				</Text>
			) : null}
		</Box>
	);
};

export default WallSettings;
