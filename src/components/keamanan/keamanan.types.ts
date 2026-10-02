export type CctvItem = {
	id: string;
	kode: string;
	nama: string;
	lokasi: string;
	latitude: number;
	longitude: number;
	status: string; // "Online" | "Offline"
	lastActive: string;
	isActive: boolean;
};

export type LaporanItem = {
	id: string;
	judul: string;
	lokasi: string;
	tanggalWaktu: string;
	status: string; // "Proses" | "Selesai" | "Baru"
};

export type CctvStats = {
	cctvOnline: number;
	laporanMingguIni: number;
};
