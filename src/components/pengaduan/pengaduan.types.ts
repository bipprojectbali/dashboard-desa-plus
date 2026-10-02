export type PengaduanData = {
	stats: {
		total: number;
		baru: number;
		diproses: number;
		selesai: number;
		ditolak?: number;
	};
	trends: { bulan: string; count: number }[];
	surat_terbanyak: { jenis: string; count: number }[];
	pengajuan_terbaru: {
		id: string;
		kategori: string;
		sub_kategori: string | null;
		status: string;
		created_at: string;
	}[];
	musrenbang: {
		id: string;
		judul: string;
		nama_pengusul: string;
		created_at: string;
	}[];
};
