import { Text } from "@mantine/core";
import { WALL_THEME } from "./wall-theme";

interface StatRowProps {
	/** Label kiri (mis. "Selesai", "Baru"). */
	label: string;
	/** Nilai yang ditonjolkan di kanan. */
	value: number | string;
	/** Warna aksen (dot + bar + value). */
	color: string;
	/**
	 * Proporsi 0..1 untuk lebar bar. Bila diberi, bar proporsi dirender di
	 * bawah label — memberi konteks visual, bukan angka telanjang di ruang kosong.
	 */
	fraction?: number;
	/** Format nilai dgn pemisah ribuan id-ID. */
	numeric?: boolean;
}

/**
 * Baris statistik kaya untuk widget wall bergaya daftar (pengaduan, keamanan,
 * divisi, sdgs). Dot status + label + bar proporsi + nilai besar — mengisi
 * ruang kartu dengan makna alih-alih angka mengambang. Dibaca dari jarak jauh
 * (TV) berkat dot warna & bar.
 */
export function StatRow({
	label,
	value,
	color,
	fraction,
	numeric = false,
}: StatRowProps) {
	const pct =
		fraction == null ? null : Math.max(0, Math.min(1, fraction)) * 100;
	const display =
		numeric && typeof value === "number"
			? value.toLocaleString("id-ID")
			: value;

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "baseline",
					gap: 12,
				}}
			>
				<div
					style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}
				>
					<span
						style={{
							width: 8,
							height: 8,
							borderRadius: "50%",
							background: color,
							flexShrink: 0,
						}}
					/>
					<Text
						size="sm"
						style={{
							color: WALL_THEME.TEXT,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{label}
					</Text>
				</div>
				<Text fw={800} style={{ fontSize: 22, color, lineHeight: 1 }}>
					{display}
				</Text>
			</div>
			{pct != null ? (
				<div
					style={{
						height: 6,
						borderRadius: 999,
						background: WALL_THEME.TRACK,
						overflow: "hidden",
					}}
				>
					<div
						style={{
							width: `${pct}%`,
							height: "100%",
							borderRadius: 999,
							background: color,
							transition: "width 400ms ease",
						}}
					/>
				</div>
			) : null}
		</div>
	);
}
