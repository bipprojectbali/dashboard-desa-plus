import type { WallDivisi } from "@/types/wall";
import { prisma } from "@/utils/db";

/**
 * Kinerja divisi: statistik aktivitas per status + jumlah dokumen per tipe.
 * Query sama dengan division.ts (activities/stats + documents/stats).
 * Tanpa PII (hanya count status & tipe dokumen — bukan nama divisi/isi).
 */
export async function buildDivisi(): Promise<WallDivisi> {
	const [selesai, berjalan, tertunda, dibatalkan, gambar, dokumen] =
		await Promise.all([
			prisma.activity.count({ where: { status: "SELESAI" } }),
			prisma.activity.count({ where: { status: "BERJALAN" } }),
			prisma.activity.count({ where: { status: "TERTUNDA" } }),
			prisma.activity.count({ where: { status: "DIBATALKAN" } }),
			prisma.document.count({ where: { type: "Gambar" } }),
			prisma.document.count({ where: { type: "Dokumen" } }),
		]);

	const total = selesai + berjalan + tertunda + dibatalkan;
	const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

	return {
		activities: {
			total,
			counts: { selesai, berjalan, tertunda, dibatalkan },
			percentages: {
				selesai: pct(selesai),
				berjalan: pct(berjalan),
				tertunda: pct(tertunda),
				dibatalkan: pct(dibatalkan),
			},
		},
		documents: [
			{ name: "Gambar", jumlah: gambar, color: "#FACC15" },
			{ name: "Dokumen", jumlah: dokumen, color: "#22C55E" },
		],
	};
}
