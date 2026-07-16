import {
	Alert,
	Button,
	Group,
	MantineProvider,
	Stack,
	Text,
} from "@mantine/core";
import { IconCheck, IconPlus, IconRefresh, IconX } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import {
	addWidget,
	initBufferFrom,
	isDirty,
	loadLayout,
	moveWidget,
	removeWidget,
	resetToDefault,
	saveLayout,
	wallLayoutStore,
} from "@/store/wall-layout";
import type { WallSnapshot } from "@/types/wall";
import { WallGrid } from "./wall-grid";
import type { WidgetId } from "./wall-layout-utils";
import { WALL_THEME } from "./wall-theme";
import { openWidgetGallery } from "./widget-gallery";

type SeedMode =
	| { mode: "fetch" } // ambil dari server (section admin, tak punya order awal)
	| { mode: "order"; order: WidgetId[] }; // seed dari order tampil (inline /wall)

interface WallLayoutEditorProps {
	snapshot: WallSnapshot | null | undefined;
	/** Cara mengisi buffer saat mount. */
	seed: SeedMode;
	/** true → bungkus grid di frame gelap 16:9 (section admin di halaman terang). */
	framed?: boolean;
	/** Callback setelah simpan sukses (inline: kembali ke mode display). */
	onSaved?: () => void;
	/** Callback tombol Selesai/Batal. Bila diberikan, tombol muncul. */
	onDone?: () => void;
}

/**
 * Editor layout wall bersama — dipakai mode edit inline `/wall` (admin) dan
 * section "Video Wall" di `/admin/settings`. Toolbar Tambah/Reset/Simpan
 * (+Selesai opsional) + `WallGrid mode="edit"`. Simpan → PUT singleton →
 * invalidate query layout supaya display (`/wall`) ikut refresh.
 */
export function WallLayoutEditor({
	snapshot,
	seed,
	framed = false,
	onSaved,
	onDone,
}: WallLayoutEditorProps) {
	const snap = useSnapshot(wallLayoutStore);
	const queryClient = useQueryClient();
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	// Seed buffer sekali saat mount sesuai sumber. Sengaja hanya saat mount —
	// buffer tak boleh di-reset tiap render (seed.order bisa berubah referensi).
	// biome-ignore lint/correctness/useExhaustiveDependencies: seed sekali di mount saja
	useEffect(() => {
		if (seed.mode === "order") {
			initBufferFrom(seed.order);
		} else {
			loadLayout();
		}
	}, []);

	useEffect(() => {
		if (!toast) return;
		const timer = setTimeout(() => setToast(null), 3000);
		return () => clearTimeout(timer);
	}, [toast]);

	const dirty = isDirty();
	// Section admin (framed) pakai aksen grape agar selaras kartu; inline /wall
	// (dark) tetap biru default.
	const accent = framed ? "grape" : undefined;

	const handleSave = async () => {
		try {
			await saveLayout();
			await queryClient.invalidateQueries({ queryKey: ["wall", "layout"] });
			setToast({ type: "success", message: "Layout wall tersimpan" });
			onSaved?.();
		} catch (err) {
			setToast({
				type: "error",
				message: err instanceof Error ? err.message : "Gagal menyimpan layout",
			});
		}
	};

	const openGallery = () =>
		openWidgetGallery(wallLayoutStore.order, (id) => addWidget(id));

	const grid = (
		<WallGrid
			order={[...snap.order]}
			snapshot={snapshot}
			mode="edit"
			onReorder={moveWidget}
			onRemove={(id) => removeWidget(id as WidgetId)}
			onAdd={openGallery}
		/>
	);

	return (
		<Stack
			gap="md"
			style={{ height: framed ? undefined : "100%", minHeight: 0 }}
		>
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
					radius="md"
				>
					{toast.message}
				</Alert>
			)}

			<Group justify="flex-end" gap="sm">
				<Button
					variant="light"
					color={accent}
					leftSection={<IconPlus size={16} />}
					onClick={openGallery}
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
					color={accent}
					onClick={handleSave}
					loading={snap.status === "saving"}
					disabled={!dirty}
				>
					Simpan
				</Button>
				{onDone ? (
					<Button variant="default" onClick={onDone}>
						Selesai
					</Button>
				) : null}
			</Group>

			{framed ? (
				// Bungkus preview dalam frame gelap "layar". Di mobile lebar sempit,
				// 3 kolom mustahil terbaca → jaga proporsi TV (minWidth) & scroll
				// horizontal, bukan menciutkan sel jadi berantakan.
				<div style={{ overflowX: "auto", borderRadius: 12 }}>
					<MantineProvider forceColorScheme="dark">
						<div
							style={{
								aspectRatio: "16 / 9",
								minWidth: 680,
								background: WALL_THEME.PAGE_BG,
								border: `1px solid ${WALL_THEME.BORDER}`,
								borderRadius: 12,
								padding: 18,
							}}
						>
							{grid}
						</div>
					</MantineProvider>
				</div>
			) : (
				<div style={{ flex: 1, minHeight: 0 }}>{grid}</div>
			)}

			{snap.status === "error" && snap.error ? (
				<Text size="sm" c="red">
					{snap.error}
				</Text>
			) : null}
		</Stack>
	);
}
