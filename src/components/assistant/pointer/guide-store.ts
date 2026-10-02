import { proxy } from "valtio";

/**
 * State tampilan kartu panduan bertahap. `stage` "moving" = kursor masih menuju
 * langkah (kartu disembunyikan), "shown" = kursor tiba dan kartu tampil.
 */
export const guideStore = proxy<{
	active: boolean;
	stage: "moving" | "shown";
	/** Indeks langkah (mulai 0) dan jumlah seluruh langkah. */
	index: number;
	total: number;
	/** Penjelasan langkah — teks biasa, dirender sebagai text node. */
	text: string;
	/** Detik lanjut otomatis (hanya /wall); null = lanjut manual. */
	autoAdvanceSec: number | null;
}>({
	active: false,
	stage: "moving",
	index: 0,
	total: 0,
	text: "",
	autoAdvanceSec: null,
});
