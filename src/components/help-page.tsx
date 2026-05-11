import {
	Accordion,
	ActionIcon,
	AspectRatio,
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
	useMantineColorScheme,
} from "@mantine/core";
import {
	IconBook,
	IconFileText,
	IconHeadphones,
	IconHelpCircle,
	IconMessage,
	IconPlayerPlay,
	IconSend,
	IconVideo,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { HelpCard } from "@/components/ui/help-card";
import { supportConfig } from "@/config/support";

const HelpPage = () => {
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";
	// Sample data for sections
	const guideItems = [
		{
			title: "Cara Login",
			description: "Langkah-langkah untuk login ke dashboard",
			content: `1. Buka browser dan akses URL dashboard desa.\n2. Masukkan email dan password akun Anda pada form login.\n3. Klik tombol "Masuk" untuk melanjutkan.\n4. Jika berhasil, Anda akan diarahkan ke halaman utama dashboard.\n5. Jika lupa password, klik "Lupa Password" dan ikuti instruksi yang dikirim ke email Anda.`,
		},
		{
			title: "Navigasi Dashboard",
			description: "Penjelasan tentang tata letak dan navigasi",
			content: `1. Sidebar kiri berisi menu utama: Beranda, Kinerja Divisi, Layanan Publik, Demografi, Keuangan, dan Pengaturan.\n2. Header atas menampilkan nama pengguna, notifikasi, dan tombol logout.\n3. Area utama (konten tengah) menampilkan data sesuai menu yang dipilih.\n4. Gunakan breadcrumb di atas konten untuk mengetahui posisi halaman Anda.\n5. Pada perangkat mobile, sidebar dapat dibuka/tutup via ikon menu (hamburger) di header.`,
		},
		{
			title: "Fitur Dasar",
			description: "Panduan penggunaan fitur-fitur utama",
			content: `1. Beranda: Menampilkan ringkasan statistik desa, aktivitas terbaru, dan grafik utama.\n2. Kinerja Divisi: Pantau kegiatan, dokumen, dan diskusi per divisi.\n3. Layanan Publik: Kelola surat pengaduan dan surat layanan warga.\n4. Demografi: Lihat data penduduk, banjar, kesehatan, dan ketenagakerjaan.\n5. Keuangan & UMKM: Pantau anggaran desa dan daftar UMKM.\n6. Pengaturan: Kelola profil pengguna dan konfigurasi sistem.`,
		},
		{
			title: "Tips & Trik",
			description: "Tips untuk meningkatkan produktivitas",
			content: `1. Gunakan shortcut keyboard untuk navigasi lebih cepat di tabel data.\n2. Filter dan pencarian tersedia di setiap halaman daftar — manfaatkan untuk menemukan data spesifik.\n3. Export data ke CSV/Excel dengan tombol Export di halaman tabel untuk laporan offline.\n4. Aktifkan dark mode di Pengaturan untuk kenyamanan bekerja malam hari.\n5. Refresh data secara manual dengan tombol reload jika data tampak tidak sinkron dengan sistem pusat.\n6. Gunakan fitur Jenna (Virtual Assistant) di halaman ini untuk bantuan cepat.`,
		},
	];

	const [selectedGuide, setSelectedGuide] = useState<
		(typeof guideItems)[0] | null
	>(null);

	const videoItems = [
		{
			title: "Dashboard Overview",
			duration: "5:23",
			url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
		},
		{
			title: "Analisis Data",
			duration: "8:45",
			url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
		},
		{
			title: "Membuat Laporan",
			duration: "6:12",
			url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
		},
		{
			title: "Export Data",
			duration: "4:30",
			url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
		},
	];

	const [selectedVideo, setSelectedVideo] = useState<
		(typeof videoItems)[0] | null
	>(null);

	const faqItems = [
		{
			question: "Bagaimana cara reset password?",
			answer:
				'Anda dapat mereset password melalui halaman login dengan klik "Lupa Password"',
		},
		{
			question: "Apakah saya bisa mengakses data offline?",
			answer: "Saat ini aplikasi hanya dapat diakses secara online",
		},
		{
			question: "Berapa lama waktu respon support?",
			answer:
				"Tim support kami biasanya merespon dalam waktu kurang dari 24 jam",
		},
		{
			question: "Bagaimana cara menambahkan pengguna baru?",
			answer:
				"Fitur penambahan pengguna dapat ditemukan di menu Pengaturan > Manajemen Pengguna",
		},
	];

	const documentationItems = [
		{
			title: "API Reference",
			description: "Dokumentasi lengkap untuk integrasi API",
			content: `GET /api/demografi/summary
curl -H "Authorization: Bearer <token>" \\
  https://dashboard-desa-plus-stg.wibudev.com/api/demografi/summary
Response: {"totalPenduduk": 5234, "lakiLaki": 2617, "perempuan": 2617}

GET /api/complaint/stats
curl -H "Authorization: Bearer <token>" \\
  https://dashboard-desa-plus-stg.wibudev.com/api/complaint/stats
Response: {"total": 42, "selesai": 30, "proses": 8, "pending": 4}

GET /api/umkm/summary
curl -H "Authorization: Bearer <token>" \\
  https://dashboard-desa-plus-stg.wibudev.com/api/umkm/summary
Response: {"totalUmkm": 87, "aktif": 72, "nonaktif": 15}`,
		},
		{
			title: "Integrasi Sistem",
			description: "Cara mengintegrasikan dengan sistem eksternal",
			content: `1. Autentikasi: Gunakan JWT token atau session cookie. Dapatkan token via POST /api/auth/login dengan email & password.
2. Base URL per environment:
   - Staging: https://dashboard-desa-plus-stg.wibudev.com/api
   - Production: https://dashboard-desa-plus.wibudev.com/api
3. Header wajib:
   - Content-Type: application/json
   - Authorization: Bearer <token>
4. Contoh request dari sistem luar:
   curl -X POST https://dashboard-desa-plus-stg.wibudev.com/api/complaint \\
     -H "Content-Type: application/json" \\
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
     -d '{"title": "Aduan Jalan Rusak", "description": "Jalan di Banjar Kaja berlubang"}'`,
		},
		{
			title: "Format Data",
			description: "Spesifikasi format data yang didukung",
			content: `Tanggal    : ISO 8601 (YYYY-MM-DD), contoh: 2026-05-08
Waktu      : HH:mm:ss WIB, contoh: 14:30:00 WIB
Mata Uang  : IDR tanpa desimal, contoh: 15000000
Koordinat  : Latitude/Longitude desimal, contoh: -8.12345, 115.12345
Status Enum:
  - AKTIF / NONAKTIF
  - NORMAL / ALERT / STUNTING`,
		},
		{
			title: "Best Practices",
			description: "Praktik terbaik dalam penggunaan platform",
			content: `• Gunakan pagination (?page=&limit=) untuk mengambil data besar
• Hindari polling interval < 30 detik untuk mengurangi beban server
• Cache response di client-side untuk data yang jarang berubah
• Gunakan filter periode (startDate/endDate) untuk query besar
• Jangan expose API key di frontend — selalu gunakan token dari server`,
		},
	];

	const [selectedDoc, setSelectedDoc] = useState<
		(typeof documentationItems)[0] | null
	>(null);

	const stats = [
		{ value: "150+", label: "Artikel Panduan" },
		{ value: "50+", label: "Video Tutorial" },
		{ value: "24/7", label: "Support Aktif" },
	];

	// State for chat functionality
	const [messages, setMessages] = useState([
		{
			id: 1,
			text: "Halo! Saya Jenna, asisten virtual Anda. Bagaimana saya bisa membantu hari ini?",
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

	const QUICK_REPLIES = [
		"Cara login ke dashboard?",
		"Bagaimana cara sinkronisasi data?",
		"Fitur apa saja yang tersedia?",
		"Cara ubah pengaturan bahasa?",
	];

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
				body: JSON.stringify({
					message: currentInput,
					history: messages,
				}),
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

	return (
		<Container size="lg" py="xl">
			<Title order={1} mb="xl" ta="center">
				Pusat Bantuan
			</Title>
			<Text size="lg" color="dimmed" ta="center" mb="xl">
				Temukan jawaban untuk pertanyaan Anda atau hubungi tim support kami
			</Text>

			{/* Statistics Section */}
			<SimpleGrid cols={3} spacing="lg" mb="xl">
				{stats.map((stat) => (
					<HelpCard
						key={stat.label}
						bg={dark ? "#1E293B" : "white"}
						p="lg"
						style={{
							textAlign: "center",
							borderColor: dark ? "#334155" : "white",
							boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
							transition: "transform 0.15s ease, box-shadow 0.15s ease",
						}}
						h="100%"
					>
						<Text size="xl" fw={700} style={{ fontSize: "32px" }}>
							{stat.value}
						</Text>
						<Text size="sm" color="dimmed">
							{stat.label}
						</Text>
					</HelpCard>
				))}
			</SimpleGrid>

			<Stack gap="lg">
				<Box>
					<Grid gutter="lg" justify="center">
						{/* Panduan Memulai */}
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<HelpCard
								style={{
									borderColor: dark ? "#334155" : "white",
									boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
									transition: "transform 0.15s ease, box-shadow 0.15s ease",
								}}
								bg={dark ? "#1E293B" : "white"}
								icon={<IconBook size={24} color="white" />}
								title="Panduan Memulai"
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
											<Text size="sm" color="dimmed">
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
								style={{
									borderColor: dark ? "#334155" : "white",
									boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
									transition: "transform 0.15s ease, box-shadow 0.15s ease",
								}}
								bg={dark ? "#1E293B" : "white"}
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
											<Text size="sm" color="dimmed">
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
								style={{
									borderColor: dark ? "#334155" : "white",
									boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
									transition: "transform 0.15s ease, box-shadow 0.15s ease",
								}}
								bg={dark ? "#1E293B" : "white"}
								icon={<IconHelpCircle size={24} color="white" />}
								title="FAQ"
								h="100%"
							>
								<Accordion variant="separated">
									{faqItems.map((item) => (
										<Accordion.Item
											style={{
												backgroundColor: dark ? "#263852ff" : "#F1F5F9",
											}}
											key={item.question}
											value={item.question}
										>
											<Accordion.Control>{item.question}</Accordion.Control>
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

				<Box>
					<Grid>
						{/* Hubungi Support */}
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<HelpCard
								style={{
									borderColor: dark ? "#334155" : "white",
									boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
									transition: "transform 0.15s ease, box-shadow 0.15s ease",
								}}
								bg={dark ? "#1E293B" : "white"}
								icon={<IconHeadphones size={24} color="white" />}
								title="Hubungi Support"
								h="100%"
							>
								<Box>
									<Text fw={500}>Email</Text>
									<Text size="sm" color="dimmed" mb="md">
										<a href={`mailto:${supportConfig.email}`}>
											{supportConfig.email}
										</a>
									</Text>

									<Text fw={500}>WhatsApp</Text>
									<Text size="sm" color="dimmed" mb="md">
										<a href={`https://wa.me/${supportConfig.whatsapp.number}`}>
											{supportConfig.whatsapp.label}
										</a>
									</Text>

									<Text fw={500}>Jam Kerja</Text>
									<Text size="sm" color="dimmed">
										{supportConfig.jamKerja}
									</Text>

									<Text fw={500} mt="md">
										Waktu Respon
									</Text>
									<Text size="sm" color="dimmed">
										{supportConfig.waktuRespon}
									</Text>
								</Box>
							</HelpCard>
						</Grid.Col>

						{/* Dokumentasi */}
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<HelpCard
								style={{
									borderColor: dark ? "#334155" : "white",
									boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
									transition: "transform 0.15s ease, box-shadow 0.15s ease",
								}}
								bg={dark ? "#1E293B" : "white"}
								icon={<IconFileText size={24} color="white" />}
								title="Dokumentasi"
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
											<Text size="sm" color="dimmed">
												{item.description}
											</Text>
										</Box>
									))}
								</Box>
							</HelpCard>
						</Grid.Col>

						{/* Jenna - Virtual Assistant */}
						<Grid.Col span={{ base: 12, sm: 12, md: 12 }}>
							<Box
								style={{
									borderRadius: 16,
									overflow: "hidden",
									border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
									boxShadow: "0 4px 24px 0 rgb(0 0 0 / 0.08)",
									background: dark ? "#1E293B" : "white",
								}}
							>
								{/* Header */}
								<Box
									style={{
										background:
											"linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
										padding: "16px 20px",
									}}
								>
									<Group justify="space-between">
										<Group gap="sm">
											<Avatar
												size={40}
												radius="xl"
												style={{
													background: "rgba(255,255,255,0.2)",
													border: "2px solid rgba(255,255,255,0.4)",
												}}
											>
												<IconMessage size={20} color="white" />
											</Avatar>
											<Box>
												<Text fw={700} c="white" size="sm">
													Jenna
												</Text>
												<Group gap={6}>
													<Box
														style={{
															width: 7,
															height: 7,
															borderRadius: "50%",
															background: "#4ade80",
															flexShrink: 0,
														}}
													/>
													<Text size="xs" c="white" opacity={0.85}>
														Virtual Assistant • Online
													</Text>
												</Group>
											</Box>
										</Group>
										<Badge
											color="white"
											variant="white"
											size="sm"
											style={{ color: "#6366f1", fontWeight: 600 }}
										>
											AI Powered
										</Badge>
									</Group>
								</Box>

								{/* Chat area */}
								<ScrollArea
									h={320}
									px="lg"
									py="md"
									style={{ background: dark ? "#0f172a" : "#f8fafc" }}
								>
									{messages.map((msg) => (
										<Box
											key={msg.id}
											style={{
												display: "flex",
												justifyContent:
													msg.sender === "user" ? "flex-end" : "flex-start",
												marginBottom: 12,
												gap: 8,
												alignItems: "flex-end",
											}}
										>
											{msg.sender === "jenna" && (
												<Avatar
													size={28}
													radius="xl"
													style={{
														background:
															"linear-gradient(135deg, #3b82f6, #6366f1)",
														flexShrink: 0,
													}}
												>
													<IconMessage size={14} color="white" />
												</Avatar>
											)}
											<Box
												style={{
													backgroundColor:
														msg.sender === "user"
															? "#3B82F6"
															: dark
																? "#1e293b"
																: "white",
													color:
														msg.sender === "user"
															? "#fff"
															: dark
																? "#f1f5f9"
																: "#1e293b",
													padding: "10px 14px",
													borderRadius:
														msg.sender === "user"
															? "18px 18px 4px 18px"
															: "18px 18px 18px 4px",
													maxWidth: "72%",
													fontSize: 13,
													lineHeight: 1.6,
													boxShadow:
														msg.sender === "user"
															? "0 2px 8px rgba(59,130,246,0.3)"
															: `0 1px 4px ${dark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.08)"}`,
													border:
														msg.sender === "jenna"
															? `1px solid ${dark ? "#334155" : "#e2e8f0"}`
															: "none",
												}}
											>
												{msg.text}
											</Box>
											{msg.sender === "user" && (
												<Avatar
													size={28}
													radius="xl"
													color="blue"
													style={{ flexShrink: 0 }}
												>
													<Text size="xs" fw={700}>
														A
													</Text>
												</Avatar>
											)}
										</Box>
									))}
									{isLoading && (
										<Box
											style={{
												display: "flex",
												alignItems: "flex-end",
												gap: 8,
												marginBottom: 12,
											}}
										>
											<Avatar
												size={28}
												radius="xl"
												style={{
													background:
														"linear-gradient(135deg, #3b82f6, #6366f1)",
													flexShrink: 0,
												}}
											>
												<IconMessage size={14} color="white" />
											</Avatar>
											<Box
												style={{
													backgroundColor: dark ? "#1e293b" : "white",
													border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
													padding: "10px 16px",
													borderRadius: "18px 18px 18px 4px",
													display: "flex",
													gap: 4,
													alignItems: "center",
												}}
											>
												{[0, 1, 2].map((i) => (
													<Box
														key={i}
														style={{
															width: 7,
															height: 7,
															borderRadius: "50%",
															background: "#94a3b8",
															animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
														}}
													/>
												))}
											</Box>
										</Box>
									)}
									<div ref={chatBottomRef} />
								</ScrollArea>

								{/* Quick replies — hanya tampil jika hanya ada pesan awal */}
								{messages.length === 1 && (
									<Box
										px="lg"
										pb="sm"
										style={{ background: dark ? "#0f172a" : "#f8fafc" }}
									>
										<Text size="xs" c="dimmed" mb={6} fw={500}>
											Pertanyaan cepat:
										</Text>
										<Group gap={6} wrap="wrap">
											{QUICK_REPLIES.map((q) => (
												<Badge
													key={q}
													variant="outline"
													color="blue"
													size="sm"
													style={{ cursor: "pointer", fontWeight: 400 }}
													onClick={() => {
														setInputValue(q);
													}}
												>
													{q}
												</Badge>
											))}
										</Group>
									</Box>
								)}

								<Divider color={dark ? "#1e293b" : "#f1f5f9"} />

								{/* Input area */}
								<Box
									px="lg"
									py="md"
									style={{ background: dark ? "#1E293B" : "white" }}
								>
									<Group gap="sm">
										<TextInput
											flex={1}
											value={inputValue}
											onChange={(e) => setInputValue(e.target.value)}
											onKeyDown={handleKeyPress}
											placeholder="Ketik pesan Anda..."
											radius="xl"
											size="sm"
											disabled={isLoading}
											styles={{
												input: {
													background: dark ? "#0f172a" : "#f8fafc",
													border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
													"&:focus": { borderColor: "#3b82f6" },
												},
											}}
										/>
										<ActionIcon
											size={36}
											radius="xl"
											variant="filled"
											color="blue"
											disabled={isLoading || inputValue.trim() === ""}
											onClick={() => void handleSendMessage()}
											aria-label="Kirim pesan"
											style={{
												background: inputValue.trim()
													? "linear-gradient(135deg, #3b82f6, #6366f1)"
													: undefined,
												flexShrink: 0,
											}}
										>
											<IconSend size={16} />
										</ActionIcon>
									</Group>
									<Text size="xs" c="dimmed" ta="center" mt={8}>
										Jenna adalah asisten virtual — jawaban mungkin tidak selalu
										akurat
									</Text>
								</Box>
							</Box>
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
				styles={{
					content: { overflow: "hidden" },
					body: { padding: 0 },
				}}
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
							Panduan
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

			{/* Modal: Video Tutorial */}
			<Modal
				opened={!!selectedVideo}
				onClose={() => setSelectedVideo(null)}
				size="xl"
				radius="lg"
				padding="xl"
				withCloseButton={false}
				styles={{
					content: { overflow: "hidden" },
					body: { padding: 0 },
				}}
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
					<AspectRatio
						ratio={16 / 9}
						style={{ borderRadius: 8, overflow: "hidden" }}
					>
						<iframe
							src={selectedVideo?.url}
							title={selectedVideo?.title}
							allowFullScreen
							style={{ border: 0, borderRadius: 8 }}
						/>
					</AspectRatio>
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
				styles={{
					content: { overflow: "hidden" },
					body: { padding: 0 },
				}}
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
							background: dark ? "#0f172a" : "#f8fafc",
							border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
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
};

export default HelpPage;
