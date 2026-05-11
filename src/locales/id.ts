export type TranslationKeys = {
	common: {
		batal: string;
		simpan: string;
		simpanPreferensi: string;
		berhasilDisimpan: string;
		gagalMuat: string;
		gagalSimpan: string;
		berhasil: string;
		kesalahan: string;
		administrator: string;
		pengguna: string;
	};
	breadcrumb: {
		home: string;
		kinerjaDevisi: string;
		pengaduanLayanan: string;
		jennaAnalytic: string;
		demografi: string;
		keuangan: string;
		bumdes: string;
		sosial: string;
		keamanan: string;
		bantuan: string;
		pengaturan: string;
		umum: string;
		notifikasi: string;
		aksesDanTim: string;
		sinkronisasi: string;
		profile: string;
		edit: string;
	};
	sidebar: {
		cariApaSaja: string;
		beranda: string;
		kinerjaDevisi: string;
		pengaduanLayanan: string;
		analitik: string;
		demografi: string;
		keuangan: string;
		bumdes: string;
		sosial: string;
		keamanan: string;
		bantuan: string;
		pengaturan: string;
		settingsUmum: string;
		settingsNotifikasi: string;
		settingsKeamanan: string;
		settingsAksesTim: string;
		settingsSinkronisasi: string;
	};
	umum: {
		judulTampilan: string;
		judulDashboard: string;
		bahasaAplikasi: string;
		zonaWaktu: string;
		formatTanggal: string;
		refreshOtomatis: string;
		intervalRefresh: string;
		tampilkanGrid: string;
		animasiTransisi: string;
	};
	notifikasi: {
		metodeNotifikasi: string;
		preferensiAlert: string;
		notifikasiPush: string;
		laporanHarian: string;
		alertSistem: string;
		updateKeamanan: string;
		newsletterBulanan: string;
		tresholdMemori: string;
		tresholdCpu: string;
		tresholdDisk: string;
		alertKritis: string;
		aktivitasTim: string;
		komentarMention: string;
		bunyiNotifikasi: string;
	};
	keamanan: {
		autentikasi: string;
		password: string;
		auditLog: string;
		twoFactor: string;
		biometrikLogin: string;
		ipWhitelist: string;
		logAktivitas: string;
		ubahPassword: string;
		riwayatLogin: string;
		perangkatTerdaftar: string;
		downloadLog: string;
	};
	akses: {
		manajemenTim: string;
		hakAkses: string;
		kolaborasi: string;
		undanganAnggota: string;
		kelolaRole: string;
		daftarAnggotaAktif: string;
		administrator: string;
		editor: string;
		viewer: string;
		orang: string;
		anggota: string;
		izinExport: string;
		requireApproval: string;
	};
	sinkronisasi: {
		judul: string;
		deskripsi: string;
		dataNoc: string;
		websiteDesa: string;
		informasiSumber: string;
		statusTerakhir: string;
		waktuSinkronisasi: string;
		terkoneksi: string;
		belumPernah: string;
		belumPernahDilakukan: string;
		sinkronkanNoc: string;
		sinkronkanDesa: string;
		tidakAdaAkses: string;
		gagalSinkronisasi: string;
		sinkronisasiBerhasil: string;
		responseGagal: string;
		kesalahanSistem: string;
		gagalDemografi: string;
		berhasilDemografi: string;
		kesalahanDemografi: string;
		model: string;
		url: string;
		nocNama: string;
		desaNama: string;
	};
};

const id: TranslationKeys = {
	common: {
		batal: "Batal",
		simpan: "Simpan Perubahan",
		simpanPreferensi: "Simpan Preferensi",
		berhasilDisimpan: "Preferensi berhasil disimpan",
		gagalMuat: "Gagal memuat preferensi",
		gagalSimpan: "Gagal menyimpan preferensi",
		berhasil: "Berhasil",
		kesalahan: "Kesalahan",
		administrator: "Administrator",
		pengguna: "Pengguna",
	},
	breadcrumb: {
		home: "Desa Darmasaba",
		kinerjaDevisi: "Kinerja Divisi",
		pengaduanLayanan: "Pengaduan & Layanan Publik",
		jennaAnalytic: "Jenna Analytic",
		demografi: "Demografi & Kependudukan",
		keuangan: "Keuangan & Anggaran",
		bumdes: "Bumdes & UMKM",
		sosial: "Sosial",
		keamanan: "Keamanan",
		bantuan: "Bantuan",
		pengaturan: "Pengaturan",
		umum: "Umum",
		notifikasi: "Notifikasi",
		aksesDanTim: "Akses & Tim",
		sinkronisasi: "Sinkronisasi NOC",
		profile: "Profil",
		edit: "Edit",
	},
	sidebar: {
		cariApaSaja: "cari apa saja",
		beranda: "Beranda",
		kinerjaDevisi: "Kinerja Divisi",
		pengaduanLayanan: "Pengaduan & Layanan Publik",
		analitik: "Jenna Analytic",
		demografi: "Demografi & Kependudukan",
		keuangan: "Keuangan & Anggaran",
		bumdes: "Bumdes & UMKM Desa",
		sosial: "Sosial",
		keamanan: "Keamanan",
		bantuan: "Bantuan",
		pengaturan: "Pengaturan",
		settingsUmum: "Umum",
		settingsNotifikasi: "Notifikasi",
		settingsKeamanan: "Keamanan",
		settingsAksesTim: "Akses & Tim",
		settingsSinkronisasi: "Sinkronisasi NOC",
	},
	umum: {
		judulTampilan: "Preferensi Tampilan",
		judulDashboard: "Dashboard",
		bahasaAplikasi: "Bahasa Aplikasi",
		zonaWaktu: "Zona Waktu",
		formatTanggal: "Format Tanggal",
		refreshOtomatis: "Refresh Otomatis",
		intervalRefresh: "Interval Refresh",
		tampilkanGrid: "Tampilkan Grid",
		animasiTransisi: "Animasi Transisi",
	},
	notifikasi: {
		metodeNotifikasi: "Metode Notifikasi",
		preferensiAlert: "Preferensi Alert",
		notifikasiPush: "Notifikasi Push",
		laporanHarian: "Laporan Harian",
		alertSistem: "Alert Sistem",
		updateKeamanan: "Update Keamanan",
		newsletterBulanan: "Newsletter Bulanan",
		tresholdMemori: "Treshold Memori",
		tresholdCpu: "Treshold CPU",
		tresholdDisk: "Treshold Disk",
		alertKritis: "Alert Kritis",
		aktivitasTim: "Aktivitas Tim",
		komentarMention: "Komentar & Mention",
		bunyiNotifikasi: "Bunyi Notifikasi",
	},
	keamanan: {
		autentikasi: "Autentikasi",
		password: "Password",
		auditLog: "Audit & Log",
		twoFactor: "Two-Factor Authentication",
		biometrikLogin: "Biometrik Login",
		ipWhitelist: "IP Whitelist",
		logAktivitas: "Log Aktivitas",
		ubahPassword: "Ubah Password",
		riwayatLogin: "Riwayat Login",
		perangkatTerdaftar: "Perangkat Terdaftar",
		downloadLog: "Download Log",
	},
	akses: {
		manajemenTim: "Manajemen Tim",
		hakAkses: "Hak Akses",
		kolaborasi: "Kolaborasi",
		undanganAnggota: "Undangan Anggota Baru",
		kelolaRole: "Kelola Role & Permission",
		daftarAnggotaAktif: "Daftar Anggota Teraktif",
		administrator: "Administrator",
		editor: "Editor",
		viewer: "Viewer",
		orang: "Orang",
		anggota: "Anggota",
		izinExport: "Izin Export Data",
		requireApproval: "Require Approval Untuk Perubahan",
	},
	sinkronisasi: {
		judul: "Sinkronisasi Data",
		deskripsi: "Gunakan fitur ini untuk memperbarui data dashboard dengan data terbaru dari server sumber.",
		dataNoc: "Data NOC (muku.id)",
		websiteDesa: "Website Desa (darmasaba.desa.id)",
		informasiSumber: "Informasi Sumber Data",
		statusTerakhir: "Status Terakhir",
		waktuSinkronisasi: "Waktu Sinkronisasi Terakhir:",
		terkoneksi: "Terkoneksi",
		belumPernah: "Belum Pernah Sinkron",
		belumPernahDilakukan: "Belum pernah dilakukan",
		sinkronkanNoc: "Sinkronkan NOC",
		sinkronkanDesa: "Sinkronkan Website Desa",
		tidakAdaAkses: "Anda tidak memiliki akses. Pastikan Anda login sebagai admin.",
		gagalSinkronisasi: "Gagal melakukan sinkronisasi. Periksa console untuk detail.",
		sinkronisasiBerhasil: "Sinkronisasi berhasil dilakukan",
		responseGagal: "Response tidak dikenali dari server",
		kesalahanSistem: "Terjadi kesalahan sistem saat sinkronisasi. Periksa console untuk detail.",
		gagalDemografi: "Gagal melakukan sinkronisasi data demografi.",
		berhasilDemografi: "Sinkronisasi data demografi berhasil",
		kesalahanDemografi: "Terjadi kesalahan sistem saat sinkronisasi data demografi.",
		model: "Model:",
		url: "URL:",
		nocNama: "Network Operation Center (NOC)",
		desaNama: "Website Desa Darmasaba",
	},
};

export default id;
