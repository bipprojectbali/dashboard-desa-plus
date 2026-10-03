/** Batas ukuran screenshot lampiran tiket (byte). */
export const MAX_SCREENSHOT_BYTES = 2 * 1024 * 1024;

/** Panjang minimal deskripsi supaya tombol kirim aktif. */
export const MIN_TICKET_DESCRIPTION_LENGTH = 10;

export const TICKET_CATEGORY_OPTIONS = [
	"Akses & Login",
	"Data & Sinkronisasi",
	"Fitur & Navigasi",
	"Laporan & Ekspor",
	"Lainnya",
];

export interface TicketFields {
	nama: string;
	email: string;
	kategori: string | null;
	deskripsi: string;
}

/** Semua kolom wajib terisi (syarat minimal sebelum tiket dikirim). */
export function hasRequiredTicketFields(f: TicketFields): boolean {
	return !!(f.nama && f.email && f.kategori && f.deskripsi);
}

/** Tombol kirim aktif: kolom wajib terisi dan deskripsi cukup panjang. */
export function canSubmitTicket(f: TicketFields): boolean {
	return (
		!!(f.nama && f.email && f.kategori) &&
		f.deskripsi.length >= MIN_TICKET_DESCRIPTION_LENGTH
	);
}

/** Screenshot di atas batas ukuran ditolak (tidak dilampirkan). */
export function isScreenshotAccepted(file: File | null): boolean {
	return !(file && file.size > MAX_SCREENSHOT_BYTES);
}

/** Encode byte biner ke base64 (untuk lampiran screenshot di body JSON). */
export function bytesToBase64(bytes: Uint8Array): string {
	let bin = "";
	for (let i = 0; i < bytes.length; i++) {
		bin += String.fromCharCode(bytes[i] as number);
	}
	return btoa(bin);
}
