/** Tipe data riwayat kesehatan warga (proxy `/api/sosial/kesehatan/riwayat-warga`). */

export interface BanjarOption {
	id: string;
	name: string;
}

export interface IbuHamil {
	id: string;
	nama: string;
	nik: string;
	usiaKehamilan: number;
	hpht: string | null;
	taksiranLahir: string | null;
	status: string;
	catatan: string | null;
	posyandu: {
		id: string;
		name: string;
		banjar: { id: string; name: string };
	} | null;
}

export interface Balita {
	id: string;
	nama: string;
	tanggalLahir: string;
	jenisKelamin: string;
	beratBadanKg: number;
	tinggiBadanCm: number;
	namaOrtu: string;
	statusStunting: string;
	imunisasiLengkap: boolean;
	giziBaik: boolean;
	catatan: string | null;
	posyandu: {
		id: string;
		name: string;
		banjar: { id: string; name: string };
	} | null;
}

export interface PenderitaPenyakit {
	id: string;
	nama: string;
	tanggal: string;
	jenisKelamin: string;
	alamat: string;
	penyakit: string;
	banjar: { id: string; name: string };
}

/**
 * Response gabungan dari endpoint tunggal `/api/kesehatan/riwayatwarga/find-many`.
 * Satu request mengembalikan daftar banjar + ketiga dataset kesehatan sekaligus.
 */
export interface RiwayatWargaResponse {
	banjarList: BanjarOption[];
	ibuHamil: IbuHamil[];
	balita: Balita[];
	penyakit: PenderitaPenyakit[];
}
