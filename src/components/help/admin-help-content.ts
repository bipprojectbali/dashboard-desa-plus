import type { HelpArticle, HelpStat, HelpVideo } from "./help-content.types";

/** Pasangan tanya-jawab statis FAQ admin. */
export interface AdminFaqItem {
	question: string;
	answer: string;
}

export const adminGuideItems: HelpArticle[] = [
	{
		title: "Manajemen Pengguna",
		description: "Tambah, edit, dan kelola akun pengguna",
		content: `1. Buka menu "Pengguna" di sidebar kiri panel admin.\n2. Klik tombol "Tambah Pengguna" untuk membuat akun baru — isi nama, email, dan pilih role (Admin / Pengguna).\n3. Untuk mengedit, klik ikon pensil di baris pengguna yang dituju.\n4. Untuk menonaktifkan akun tanpa menghapus, ubah status menjadi Nonaktif di form edit.\n5. Untuk menghapus akun permanen, klik ikon hapus dan konfirmasi modal. Tindakan ini tidak dapat dibatalkan.\n6. Gunakan kolom pencarian di atas tabel untuk menemukan pengguna berdasarkan nama atau email.`,
	},
	{
		title: "Manajemen API Key",
		description: "Generate, rotasi, dan revoke kunci API",
		content: `1. Buka menu "API Key" di sidebar panel admin.\n2. Klik "Generate API Key" untuk membuat kunci baru — beri nama deskriptif (misal: "Integrasi NOC Sistem").\n3. Salin API key yang ditampilkan segera — key hanya ditampilkan sekali demi keamanan.\n4. Rotasi key secara berkala (minimal setiap 90 hari): klik ikon rotasi, key lama otomatis dinonaktifkan.\n5. Jika key diduga bocor, segera revoke melalui tombol "Cabut" — akses menggunakan key tersebut akan langsung dihentikan.\n6. Pantau log penggunaan tiap key untuk mendeteksi pola akses mencurigakan.`,
	},
	{
		title: "Konfigurasi & Monitoring",
		description: "Pengaturan sistem dan pemantauan status",
		content: `1. Halaman "Pengaturan" menampilkan status komponen sistem: database, email, storage.\n2. Periksa indikator status secara berkala — status merah menandakan komponen bermasalah dan perlu penanganan segera.\n3. Informasi versi aplikasi dan environment (staging/production) tersedia di bagian bawah halaman Pengaturan.\n4. Untuk sinkronisasi data dari NOC System, pastikan koneksi ke NOC API aktif sebelum menjalankan sync manual.\n5. Backup database dijadwalkan otomatis — hubungi tim DevOps jika backup terakhir lebih dari 24 jam lalu.\n6. Perubahan konfigurasi sensitif (SMTP, database URL) hanya dapat dilakukan melalui environment variable di server.`,
	},
	{
		title: "Tips Keamanan Admin",
		description: "Praktik terbaik untuk menjaga keamanan sistem",
		content: `1. Gunakan password yang kuat (min. 12 karakter, kombinasi huruf besar/kecil, angka, simbol) dan aktifkan 2FA jika tersedia.\n2. Jangan bagikan kredensial admin kepada siapapun — buat akun terpisah untuk setiap operator.\n3. Logout dari panel admin setelah selesai bekerja, terutama dari perangkat bersama.\n4. Tinjau daftar pengguna aktif secara berkala — nonaktifkan akun yang sudah tidak digunakan.\n5. Jangan pernah expose API key di kode frontend atau repository publik.\n6. Pantau log aktivitas login untuk mendeteksi akses tidak sah — laporkan anomali ke tim keamanan.`,
	},
];

export const adminFaqItems: AdminFaqItem[] = [
	{
		question: "Bagaimana cara mereset password pengguna?",
		answer:
			'Buka halaman "Pengguna", cari akun yang dituju, klik ikon edit. Di form edit tersedia opsi "Kirim Email Reset Password" — sistem akan otomatis mengirimkan link reset ke email pengguna tersebut.',
	},
	{
		question: "Apa perbedaan role Admin dan Pengguna Biasa?",
		answer:
			"Admin memiliki akses penuh: manajemen pengguna, API key, dan konfigurasi sistem. Pengguna Biasa hanya dapat mengakses dashboard data desa (kinerja divisi, demografi, keuangan, dll) tanpa akses ke panel admin.",
	},
	{
		question: "Kapan saya harus merotasi API Key?",
		answer:
			"Rotasi API key minimal setiap 90 hari sebagai praktik keamanan standar. Rotasi segera jika: key pernah terekspos di log publik, ada dugaan akses tidak sah, atau developer yang memegang key tersebut tidak lagi bekerja.",
	},
	{
		question: "Bagaimana cara menonaktifkan akun pengguna sementara?",
		answer:
			'Di halaman "Pengguna", klik ikon edit pada baris pengguna, lalu ubah status dari "Aktif" ke "Nonaktif". Akun tidak dihapus — pengguna tidak bisa login, namun seluruh data dan histori tetap tersimpan dan bisa diaktifkan kembali.',
	},
];

export const adminVideoItems: HelpVideo[] = [
	{
		title: "Cara Mengelola Akun Pengguna",
		duration: "4:15",
		url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
	},
	{
		title: "Setup & Rotasi API Key",
		duration: "3:40",
		url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
	},
	{
		title: "Monitoring Status Sistem",
		duration: "5:20",
		url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
	},
	{
		title: "Best Practices Keamanan Admin",
		duration: "6:00",
		url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
	},
];

export const adminDocumentationItems: HelpArticle[] = [
	{
		title: "Admin API Endpoints",
		description: "Endpoint khusus manajemen pengguna dan sistem",
		content: `# User Management
GET    /api/admin/users          — daftar semua pengguna
POST   /api/admin/users          — buat pengguna baru
PATCH  /api/admin/users/:id      — update pengguna
DELETE /api/admin/users/:id      — hapus pengguna

# API Key Management
GET    /api/admin/apikey         — daftar API key aktif
POST   /api/admin/apikey         — generate key baru
DELETE /api/admin/apikey/:id     — revoke key

# System
GET    /api/admin/settings       — info sistem & status
GET    /api/health               — health check (publik)

Header wajib semua endpoint admin:
Authorization: Bearer <admin-session-token>`,
	},
	{
		title: "Struktur Role & Akses",
		description: "Definisi role dan hak akses per fitur",
		content: `Role yang tersedia:
  ADMIN  — Akses penuh: panel admin, manajemen user, API key, settings
  USER   — Akses dashboard desa: beranda, kinerja divisi, demografi, keuangan, layanan publik

Mapping fitur → role minimum:
  /admin/*              → ADMIN
  /dashboard/*          → USER, ADMIN
  /api/admin/*          → ADMIN (backend)
  /api/complaint/*      → USER, ADMIN
  /api/demografi/*      → USER, ADMIN

Catatan: role diassign saat create user dan dapat diubah via edit user.`,
	},
	{
		title: "Format & Validasi Data",
		description: "Spesifikasi input yang diterima sistem",
		content: `Email        : RFC 5322, max 255 karakter
Password     : Min 8 karakter, wajib ada huruf & angka
Nama         : Min 2, max 100 karakter, boleh spasi
API Key Name : Min 3, max 50 karakter, alphanumeric + spasi
Role Enum    : "admin" | "user" (case-sensitive lowercase)
Status Enum  : "active" | "inactive"
Tanggal      : ISO 8601 (YYYY-MM-DD)`,
	},
	{
		title: "Panduan Keamanan Sistem",
		description: "Konfigurasi dan praktik keamanan yang disarankan",
		content: `• Session timeout: 8 jam inaktif (dapat dikonfigurasi via ENV SESSION_MAX_AGE)
• Rate limiting: max 100 req/menit per IP untuk endpoint auth
• API key tidak disimpan plaintext — hanya hash yang tersimpan di DB
• Semua perubahan admin (create/delete user, revoke key) dicatat di audit log
• HTTPS wajib di production — HTTP redirect otomatis ke HTTPS
• CORS hanya mengizinkan origin yang terdaftar di ENV ALLOWED_ORIGINS
• Password di-hash dengan bcrypt cost factor 12`,
	},
];

export const adminHelpStats: HelpStat[] = [
	{ value: "4", label: "Panduan Admin" },
	{ value: "4", label: "FAQ Tersedia" },
	{ value: "24/7", label: "Support Aktif" },
];
