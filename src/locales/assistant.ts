/**
 * Teks panel AI assistant (id/en). Dipisah dari `id.ts`/`en.ts` karena file
 * itu sudah melewati batas ukuran. `{name}` diganti nama asisten dari config.
 */

export interface AssistantText {
	fabLabel: string;
	beta: string;
	conversations: string;
	newConversation: string;
	maximize: string;
	restore: string;
	close: string;
	greeting: string;
	disclaimer: string;
	placeholder: string;
	send: string;
	charsLeft: string;
	thinking: string;
	checking: string;
	stop: string;
	source: string;
	pointToSource: string;
	returnToChat: string;
	pointerFailed: string;
	copy: string;
	copied: string;
	retry: string;
	loadOlder: string;
	loadMore: string;
	noConversations: string;
	rename: string;
	save: string;
	cancel: string;
	delete: string;
	confirmDelete: string;
	failedMessage: string;
	embedded: { noAccess: string; inactive: string; openSettings: string };
	errors: {
		session: string;
		forbidden: string;
		notFound: string;
		notReady: string;
		tooLong: string;
		empty: string;
		limited: string;
		unavailable: string;
		network: string;
		loadFailed: string;
		cancelled: string;
	};
	duration: { seconds: string; minutes: string; hours: string };
	sources: Record<string, string>;
}

const id: AssistantText = {
	fabLabel: "Tanya {name}",
	beta: "Beta",
	conversations: "Daftar percakapan",
	newConversation: "Percakapan baru",
	maximize: "Perbesar panel",
	restore: "Kecilkan panel",
	close: "Tutup panel",
	greeting:
		"Halo! Saya {name}, asisten virtual dashboard desa. Ada yang bisa saya bantu?",
	disclaimer:
		"{name} adalah asisten virtual — jawaban mungkin tidak selalu akurat",
	placeholder: "Tulis pertanyaan…",
	send: "Kirim",
	charsLeft: "{n} karakter tersisa",
	thinking: "Memeriksa data…",
	checking: "Memeriksa data {modul}…",
	stop: "Hentikan jawaban",
	source: "Sumber",
	pointToSource: "Tunjukkan {modul} di layar",
	returnToChat: "Kembali ke chat",
	pointerFailed: "Maaf, saya belum bisa menunjukkan bagian itu di layar.",
	copy: "Salin jawaban",
	copied: "Tersalin",
	retry: "Kirim ulang",
	loadOlder: "Muat pesan sebelumnya",
	loadMore: "Muat lagi",
	noConversations: "Belum ada percakapan.",
	rename: "Ganti judul",
	save: "Simpan",
	cancel: "Batal",
	delete: "Hapus",
	confirmDelete: "Hapus percakapan ini?",
	failedMessage: "Gagal terkirim",
	embedded: {
		noAccess: "Asisten AI belum tersedia untuk akun Anda.",
		inactive: "Asisten AI belum aktif. Hubungi admin untuk mengaktifkannya.",
		openSettings: "Buka pengaturan AI Assistant",
	},
	errors: {
		session: "Sesi Anda berakhir. Silakan masuk lagi.",
		forbidden: "Anda tidak punya akses ke asisten AI.",
		notFound: "Percakapan tidak ditemukan. Mulai percakapan baru.",
		notReady: "Asisten AI sedang tidak aktif atau belum siap. Hubungi admin.",
		tooLong: "Pesan terlalu panjang. Maksimal {n} karakter.",
		empty: "Pesan tidak boleh kosong.",
		limited: "Batas pemakaian tercapai. Coba lagi dalam {durasi}.",
		unavailable: "Layanan AI sedang tidak tersedia. Coba lagi sebentar.",
		network: "Gagal terhubung ke server.",
		loadFailed: "Gagal memuat data percakapan.",
		cancelled: "Pertanyaan dibatalkan.",
	},
	duration: { seconds: "{n} detik", minutes: "{n} menit", hours: "{n} jam" },
	sources: {
		ringkasan_beranda: "Beranda",
		ringkasan_keuangan: "Keuangan & Anggaran",
		statistik_pengaduan: "Pengaduan & Layanan Publik",
		statistik_demografi: "Demografi & Pekerjaan",
		kinerja_divisi: "Kinerja Divisi",
		lookup_faq: "FAQ Bantuan",
	},
};

const en: AssistantText = {
	fabLabel: "Ask {name}",
	beta: "Beta",
	conversations: "Conversations",
	newConversation: "New conversation",
	maximize: "Maximize panel",
	restore: "Restore panel",
	close: "Close panel",
	greeting:
		"Hello! I'm {name}, the village dashboard virtual assistant. How can I help?",
	disclaimer:
		"{name} is a virtual assistant — answers may not always be accurate",
	placeholder: "Type a question…",
	send: "Send",
	charsLeft: "{n} characters left",
	thinking: "Checking data…",
	checking: "Checking {modul} data…",
	stop: "Stop answer",
	source: "Source",
	pointToSource: "Show {modul} on screen",
	returnToChat: "Back to chat",
	pointerFailed: "Sorry, I could not show that part on screen.",
	copy: "Copy answer",
	copied: "Copied",
	retry: "Resend",
	loadOlder: "Load earlier messages",
	loadMore: "Load more",
	noConversations: "No conversations yet.",
	rename: "Rename",
	save: "Save",
	cancel: "Cancel",
	delete: "Delete",
	confirmDelete: "Delete this conversation?",
	failedMessage: "Not sent",
	embedded: {
		noAccess: "The AI assistant is not available for your account.",
		inactive: "The AI assistant is not active yet. Ask an admin to enable it.",
		openSettings: "Open AI Assistant settings",
	},
	errors: {
		session: "Your session has ended. Please sign in again.",
		forbidden: "You do not have access to the AI assistant.",
		notFound: "Conversation not found. Start a new conversation.",
		notReady:
			"The AI assistant is disabled or not ready yet. Contact an admin.",
		tooLong: "Message is too long. Maximum {n} characters.",
		empty: "Message cannot be empty.",
		limited: "Usage limit reached. Try again in {durasi}.",
		unavailable: "The AI service is unavailable. Please try again shortly.",
		network: "Could not reach the server.",
		loadFailed: "Failed to load conversation data.",
		cancelled: "Question cancelled.",
	},
	duration: {
		seconds: "{n} seconds",
		minutes: "{n} minutes",
		hours: "{n} hours",
	},
	sources: {
		ringkasan_beranda: "Home",
		ringkasan_keuangan: "Finance & Budget",
		statistik_pengaduan: "Complaints & Public Services",
		statistik_demografi: "Demographics & Occupations",
		kinerja_divisi: "Division Performance",
		lookup_faq: "Help FAQ",
	},
};

export const assistantTexts = { id, en } as const;
