import {
	Accordion,
	ActionIcon,
	Avatar,
	Badge,
	Box,
	Container,
	Divider,
	Grid,
	Group,
	Modal,
	ScrollArea,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	ThemeIcon,
	Title,
} from "@mantine/core";
import {
	IconBook,
	IconFileText,
	IconHeadphones,
	IconHelpCircle,
	IconKey,
	IconMessage,
	IconPlayerPlay,
	IconSend,
	IconShieldCheck,
	IconUsers,
	IconVideo,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { HelpCard } from "@/components/ui/help-card";
import { supportConfig } from "@/config/support";
import { useIsDark } from "@/hooks/useIsDark";

export const Route = createFileRoute("/admin/help")({
	component: AdminHelpPage,
});

const guideItems = [
	{
		icon: <IconUsers size={18} />,
		title: "Manajemen Pengguna",
		description: "Tambah, edit, dan kelola akun pengguna",
		content: `1. Buka menu "Pengguna" di sidebar kiri panel admin.\n2. Klik tombol "Tambah Pengguna" untuk membuat akun baru — isi nama, email, dan pilih role (Admin / Pengguna).\n3. Untuk mengedit, klik ikon pensil di baris pengguna yang dituju.\n4. Untuk menonaktifkan akun tanpa menghapus, ubah status menjadi Nonaktif di form edit.\n5. Untuk menghapus akun permanen, klik ikon hapus dan konfirmasi modal. Tindakan ini tidak dapat dibatalkan.\n6. Gunakan kolom pencarian di atas tabel untuk menemukan pengguna berdasarkan nama atau email.`,
	},
	{
		icon: <IconKey size={18} />,
		title: "Manajemen API Key",
		description: "Generate, rotasi, dan revoke kunci API",
		content: `1. Buka menu "API Key" di sidebar panel admin.\n2. Klik "Generate API Key" untuk membuat kunci baru — beri nama deskriptif (misal: "Integrasi NOC Sistem").\n3. Salin API key yang ditampilkan segera — key hanya ditampilkan sekali demi keamanan.\n4. Rotasi key secara berkala (minimal setiap 90 hari): klik ikon rotasi, key lama otomatis dinonaktifkan.\n5. Jika key diduga bocor, segera revoke melalui tombol "Cabut" — akses menggunakan key tersebut akan langsung dihentikan.\n6. Pantau log penggunaan tiap key untuk mendeteksi pola akses mencurigakan.`,
	},
	{
		icon: <IconShieldCheck size={18} />,
		title: "Konfigurasi & Monitoring",
		description: "Pengaturan sistem dan pemantauan status",
		content: `1. Halaman "Pengaturan" menampilkan status komponen sistem: database, email, storage.\n2. Periksa indikator status secara berkala — status merah menandakan komponen bermasalah dan perlu penanganan segera.\n3. Informasi versi aplikasi dan environment (staging/production) tersedia di bagian bawah halaman Pengaturan.\n4. Untuk sinkronisasi data dari NOC System, pastikan koneksi ke NOC API aktif sebelum menjalankan sync manual.\n5. Backup database dijadwalkan otomatis — hubungi tim DevOps jika backup terakhir lebih dari 24 jam lalu.\n6. Perubahan konfigurasi sensitif (SMTP, database URL) hanya dapat dilakukan melalui environment variable di server.`,
	},
	{
		icon: <IconShieldCheck size={18} />,
		title: "Tips Keamanan Admin",
		description: "Praktik terbaik untuk menjaga keamanan sistem",
		content: `1. Gunakan password yang kuat (min. 12 karakter, kombinasi huruf besar/kecil, angka, simbol) dan aktifkan 2FA jika tersedia.\n2. Jangan bagikan kredensial admin kepada siapapun — buat akun terpisah untuk setiap operator.\n3. Logout dari panel admin setelah selesai bekerja, terutama dari perangkat bersama.\n4. Tinjau daftar pengguna aktif secara berkala — nonaktifkan akun yang sudah tidak digunakan.\n5. Jangan pernah expose API key di kode frontend atau repository publik.\n6. Pantau log aktivitas login untuk mendeteksi akses tidak sah — laporkan anomali ke tim keamanan.`,
	},
];

const faqItems = [
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

const videoItems = [
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

const documentationItems = [
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

const stats = [
	{ value: "4", label: "Panduan Admin" },
	{ value: "4", label: "FAQ Tersedia" },
	{ value: "24/7", label: "Support Aktif" },
];

const QUICK_REPLIES = [
	"Cara tambah pengguna baru?",
	"Bagaimana cara rotasi API key?",
	"Status sistem tidak normal, apa yang harus dilakukan?",
	"Cara menonaktifkan akun pengguna?",
];

function AdminHelpPage() {
	const dark = useIsDark();

	const [selectedGuide, setSelectedGuide] = useState<
		(typeof guideItems)[0] | null
	>(null);
	const [selectedVideo, setSelectedVideo] = useState<
		(typeof videoItems)[0] | null
	>(null);
	const [selectedDoc, setSelectedDoc] = useState<
		(typeof documentationItems)[0] | null
	>(null);

	const [messages, setMessages] = useState([
		{
			id: 1,
			text: "Halo! Saya Jenna, asisten virtual untuk admin sistem. Ada yang bisa saya bantu terkait manajemen pengguna, API key, atau konfigurasi sistem?",
			sender: "jenna",
		},
	]);
	const [inputValue, setInputValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const chatBottomRef = useRef<HTMLDivElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll on every message/loading change
	useEffect(() => {
		chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isLoading]);

	const handleSendMessage = async () => {
		if (inputValue.trim() === "" || isLoading) return;

		const currentInput = inputValue;
		const userMsg = { id: Date.now(), text: currentInput, sender: "user" };

		setMessages((prev) => [...prev, userMsg]);
		setInputValue("");
		setIsLoading(true);

		try {
			const res = await fetch("/api/jenna/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: currentInput, history: messages }),
			});

			const json = await res.json();
			const reply = res.ok ? json.reply : (json.error ?? "Terjadi kesalahan.");

			setMessages((prev) => [
				...prev,
				{ id: Date.now() + 1, text: reply, sender: "jenna" },
			]);
		} catch {
			setMessages((prev) => [
				...prev,
				{
					id: Date.now() + 1,
					text: "Koneksi gagal. Coba lagi.",
					sender: "jenna",
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			void handleSendMessage();
		}
	};

	const amber = {
		cardBg: "rgba(251, 240, 223, 0.05)",
		border: "rgba(251, 240, 223, 0.1)",
		subtleBg: "rgba(251, 240, 223, 0.02)",
		innerBg: "rgba(251, 240, 223, 0.03)",
	};

	const cardStyle = {
		borderColor: dark ? amber.border : "white",
		boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
		transition: "transform 0.15s ease, box-shadow 0.15s ease",
	};

	return (
		<Container size="lg" py="xl">
			<Title order={1} c={"orange"} variant="light" mb="xs" ta="center">
				Pusat Bantuan Admin
			</Title>
			<Text size="lg" c="dimmed" ta="center" mb="xl">
				Panduan dan referensi teknis untuk administrator sistem Dashboard Desa
			</Text>

			{/* Stats */}
			<SimpleGrid cols={3} spacing="lg" mb="xl">
				{stats.map((stat) => (
					<HelpCard
						key={stat.label}
						bg={dark ? amber.cardBg : "white"}
						p="lg"
						style={{ textAlign: "center", ...cardStyle }}
						h="100%"
					>
						<Text size="xl" fw={700} style={{ fontSize: "32px" }}>
							{stat.value}
						</Text>
						<Text size="sm" c="dimmed">
							{stat.label}
						</Text>
					</HelpCard>
				))}
			</SimpleGrid>

			<Stack gap="lg">
				{/* Row 1: Panduan + Video + FAQ */}
				<Box>
					<Grid gutter="lg" justify="center">
						{/* Panduan Admin */}
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<HelpCard
								style={cardStyle}
								bg={dark ? amber.cardBg : "white"}
								icon={<IconBook size={24} color="white" />}
								title="Panduan Admin"
								h="100%"
							>
								<Box>
									{guideItems.map((item) => (
										<Box
											key={item.title}
											py="sm"
											style={{
												borderBottom: "1px solid #eee",
												cursor: "pointer",
											}}
											onClick={() => setSelectedGuide(item)}
										>
											<Text fw={500}>{item.title}</Text>
											<Text size="sm" c="dimmed">
												{item.description}
											</Text>
										</Box>
									))}
								</Box>
							</HelpCard>
						</Grid.Col>

						{/* Video Tutorial */}
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<HelpCard
								style={cardStyle}
								bg={dark ? amber.cardBg : "white"}
								icon={<IconVideo size={24} color="white" />}
								title="Video Tutorial"
								h="100%"
							>
								<Box>
									{videoItems.map((item) => (
										<Box
											key={item.title}
											py="sm"
											style={{
												borderBottom: "1px solid #eee",
												cursor: "pointer",
											}}
											onClick={() => setSelectedVideo(item)}
										>
											<Text fw={500}>{item.title}</Text>
											<Text size="sm" c="dimmed">
												{item.duration}
											</Text>
										</Box>
									))}
								</Box>
							</HelpCard>
						</Grid.Col>

						{/* FAQ */}
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<HelpCard
								style={cardStyle}
								bg={dark ? amber.cardBg : "white"}
								icon={<IconHelpCircle size={24} color="white" />}
								title="FAQ Admin"
								h="100%"
							>
								<Accordion variant="separated">
									{faqItems.map((item) => (
										<Accordion.Item
											style={{
												backgroundColor: dark ? amber.innerBg : "#F1F5F9",
											}}
											key={item.question}
											value={item.question}
										>
											<Accordion.Control>
												<Text size="sm">{item.question}</Text>
											</Accordion.Control>
											<Accordion.Panel>
												<Text size="sm">{item.answer}</Text>
											</Accordion.Panel>
										</Accordion.Item>
									))}
								</Accordion>
							</HelpCard>
						</Grid.Col>
					</Grid>
				</Box>

				{/* Row 2: Support + Dokumentasi + Jenna */}
				<Box>
					<Grid>
						{/* Hubungi Support */}
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<HelpCard
								style={cardStyle}
								bg={dark ? amber.cardBg : "white"}
								icon={<IconHeadphones size={24} color="white" />}
								title="Hubungi Support"
								h="100%"
							>
								<Box>
									<Text fw={500}>Email</Text>
									<Text size="sm" c="dimmed" mb="md">
										<a href={`mailto:${supportConfig.email}`}>
											{supportConfig.email}
										</a>
									</Text>

									<Text fw={500}>WhatsApp</Text>
									<Text size="sm" c="dimmed" mb="md">
										<a
											href={`https://wa.me/${supportConfig.whatsapp.number}`}
											target="_blank"
											rel="noreferrer"
										>
											{supportConfig.whatsapp.label}
										</a>
									</Text>

									<Text fw={500}>Jam Kerja</Text>
									<Text size="sm" c="dimmed">
										Senin – Jumat, 09:00 – 17:00 WITA
									</Text>

									<Text fw={500} mt="md">
										Waktu Respon
									</Text>
									<Text size="sm" c="dimmed">
										Rata-rata 2–4 jam kerja
									</Text>
								</Box>
							</HelpCard>
						</Grid.Col>

						{/* Dokumentasi Teknis */}
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<HelpCard
								style={cardStyle}
								bg={dark ? amber.cardBg : "white"}
								icon={<IconFileText size={24} color="white" />}
								title="Dokumentasi Teknis"
								h="100%"
							>
								<Box>
									{documentationItems.map((item) => (
										<Box
											key={item.title}
											py="sm"
											style={{
												borderBottom: "1px solid #eee",
												cursor: "pointer",
											}}
											onClick={() => setSelectedDoc(item)}
										>
											<Text fw={500}>{item.title}</Text>
											<Text size="sm" c="dimmed">
												{item.description}
											</Text>
										</Box>
									))}
								</Box>
							</HelpCard>
						</Grid.Col>
					</Grid>
				</Box>
			</Stack>

			{/* Modal: Panduan */}
			<Modal
				opened={!!selectedGuide}
				onClose={() => setSelectedGuide(null)}
				size="md"
				radius="lg"
				padding="xl"
				withCloseButton={false}
				styles={{ content: { overflow: "hidden" }, body: { padding: 0 } }}
			>
				<Box
					px="xl"
					pt="xl"
					pb="md"
					style={{
						background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
					}}
				>
					<Group gap="sm" mb="xs">
						<ThemeIcon
							size={36}
							radius="md"
							color="white"
							variant="white"
							style={{ color: "#6366f1" }}
						>
							<IconBook size={20} />
						</ThemeIcon>
						<Badge
							color="white"
							variant="white"
							size="sm"
							style={{ color: "#6366f1" }}
						>
							Panduan Admin
						</Badge>
					</Group>
					<Title order={3} c="white" mb={4}>
						{selectedGuide?.title}
					</Title>
					<Text size="sm" c="white" opacity={0.8}>
						{selectedGuide?.description}
					</Text>
				</Box>

				<Divider />

				<ScrollArea h={320} px="xl" py="lg">
					{selectedGuide?.content
						.split("\n")
						.filter(Boolean)
						.map((line, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: static ordered list, no reorder
							<Group key={i} gap="sm" mb="sm" align="flex-start">
								<ThemeIcon
									size={22}
									radius="xl"
									variant="light"
									color="indigo"
									style={{ flexShrink: 0, marginTop: 2 }}
								>
									<Text size="xs" fw={700}>
										{i + 1}
									</Text>
								</ThemeIcon>
								<Text size="sm" style={{ flex: 1, lineHeight: 1.6 }}>
									{line.replace(/^\d+\.\s*/, "")}
								</Text>
							</Group>
						))}
				</ScrollArea>

				<Divider />
				<Box px="xl" py="md" ta="right">
					<Text
						size="sm"
						c="dimmed"
						style={{ cursor: "pointer" }}
						onClick={() => setSelectedGuide(null)}
						fw={500}
					>
						Tutup
					</Text>
				</Box>
			</Modal>

			{/* Modal: Video */}
			<Modal
				opened={!!selectedVideo}
				onClose={() => setSelectedVideo(null)}
				size="xl"
				radius="lg"
				padding="xl"
				withCloseButton={false}
				styles={{ content: { overflow: "hidden" }, body: { padding: 0 } }}
			>
				<Box
					px="xl"
					pt="xl"
					pb="md"
					style={{
						background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
					}}
				>
					<Group gap="sm" mb="xs">
						<ThemeIcon
							size={36}
							radius="md"
							color="white"
							variant="white"
							style={{ color: "#ef4444" }}
						>
							<IconPlayerPlay size={20} />
						</ThemeIcon>
						<Badge
							color="white"
							variant="white"
							size="sm"
							style={{ color: "#ef4444" }}
						>
							Video Tutorial
						</Badge>
					</Group>
					<Title order={3} c="white" mb={4}>
						{selectedVideo?.title}
					</Title>
					<Text size="sm" c="white" opacity={0.8}>
						Durasi: {selectedVideo?.duration}
					</Text>
				</Box>

				<Divider />

				<Box p="xl">
					<Box
						style={{ borderRadius: 8, overflow: "hidden", aspectRatio: "16/9" }}
					>
						<iframe
							src={selectedVideo?.url}
							title={selectedVideo?.title}
							allowFullScreen
							style={{
								border: 0,
								borderRadius: 8,
								width: "100%",
								height: "100%",
							}}
						/>
					</Box>
				</Box>

				<Divider />
				<Box px="xl" py="md" ta="right">
					<Text
						size="sm"
						c="dimmed"
						style={{ cursor: "pointer" }}
						onClick={() => setSelectedVideo(null)}
						fw={500}
					>
						Tutup
					</Text>
				</Box>
			</Modal>

			{/* Modal: Dokumentasi */}
			<Modal
				opened={!!selectedDoc}
				onClose={() => setSelectedDoc(null)}
				size="lg"
				radius="lg"
				padding="xl"
				withCloseButton={false}
				styles={{ content: { overflow: "hidden" }, body: { padding: 0 } }}
			>
				<Box
					px="xl"
					pt="xl"
					pb="md"
					style={{
						background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
					}}
				>
					<Group gap="sm" mb="xs">
						<ThemeIcon
							size={36}
							radius="md"
							color="white"
							variant="white"
							style={{ color: "#10b981" }}
						>
							<IconFileText size={20} />
						</ThemeIcon>
						<Badge
							color="white"
							variant="white"
							size="sm"
							style={{ color: "#10b981" }}
						>
							Dokumentasi
						</Badge>
					</Group>
					<Title order={3} c="white" mb={4}>
						{selectedDoc?.title}
					</Title>
					<Text size="sm" c="white" opacity={0.8}>
						{selectedDoc?.description}
					</Text>
				</Box>

				<Divider />

				<ScrollArea h={340} px="xl" py="lg">
					<Box
						p="md"
						style={{
							fontFamily: "monospace",
							fontSize: 13,
							borderRadius: 8,
							background: dark ? amber.subtleBg : "#f8fafc",
							border: `1px solid ${dark ? amber.border : "#e2e8f0"}`,
							whiteSpace: "pre-wrap",
							lineHeight: 1.7,
						}}
					>
						{selectedDoc?.content}
					</Box>
				</ScrollArea>

				<Divider />
				<Box px="xl" py="md" ta="right">
					<Text
						size="sm"
						c="dimmed"
						style={{ cursor: "pointer" }}
						onClick={() => setSelectedDoc(null)}
						fw={500}
					>
						Tutup
					</Text>
				</Box>
			</Modal>
		</Container>
	);
}
