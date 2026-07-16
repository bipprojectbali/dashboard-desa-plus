import { Text } from "@mantine/core";
import type { ReactNode } from "react";
import { WALL_THEME } from "./wall-theme";

interface WidgetCardProps {
	title: string;
	/** Isi kartu. Opsional — saat `empty`, empty state yang dirender. */
	children?: ReactNode;
	/** Aksi opsional di kanan header (mis. tombol ✕ saat mode edit). */
	actions?: ReactNode;
	/** True → tampilkan empty state alih-alih children. */
	empty?: boolean;
	emptyLabel?: string;
}

/**
 * Kartu pembungkus tiap widget wall. Menggantikan `Panel` yang sebelumnya
 * diduplikasi di tiap scene. Flex-column dengan body `flex:1;minHeight:0`
 * supaya chart di dalamnya bisa mengisi tinggi slot (responsive), bukan
 * tinggi tetap — penting karena kini 6 panel berbagi satu layar.
 */
export function WidgetCard({
	title,
	children,
	actions,
	empty,
	emptyLabel = "Belum ada data",
}: WidgetCardProps) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				background: WALL_THEME.CARD,
				border: `1px solid ${WALL_THEME.BORDER}`,
				borderRadius: 12,
				padding: 18,
				height: "100%",
				minHeight: 0,
				boxSizing: "border-box",
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 12,
					flexShrink: 0,
				}}
			>
				<Text fw={700} style={{ color: WALL_THEME.TEXT }}>
					{title}
				</Text>
				{actions}
			</div>

			<div style={{ flex: 1, minHeight: 0 }}>
				{empty ? (
					<Text c="dimmed" size="sm">
						{emptyLabel}
					</Text>
				) : (
					children
				)}
			</div>
		</div>
	);
}
