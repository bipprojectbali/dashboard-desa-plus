import {
	Accordion,
	ActionIcon,
	Alert,
	AspectRatio,
	Avatar,
	Badge,
	Box,
	Button,
	Container,
	Divider,
	FileButton,
	Grid,
	Group,
	Loader,
	Modal,
	ScrollArea,
	Select,
	SimpleGrid,
	Stack,
	Text,
	Textarea,
	TextInput,
	ThemeIcon,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import {
	IconBook,
	IconCheck,
	IconClock,
	IconFileText,
	IconHeadphones,
	IconHelpCircle,
	IconMail,
	IconMessage,
	IconPaperclip,
	IconPhone,
	IconPlayerPlay,
	IconSend,
	IconVideo,
	IconX,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { HelpCard } from "@/components/ui/help-card";
import { supportConfig } from "@/config/support";
import { useTranslate } from "@/hooks/useTranslate";

interface FaqItem {
	id: string;
	question: string;
	answer: string;
	category: string;
	order: number;
}

const KATEGORI_OPTIONS = [
	"Akses & Login",
	"Data & Sinkronisasi",
	"Fitur & Navigasi",
	"Laporan & Ekspor",
	"Lainnya",
];

const MAX_SCREENSHOT_BYTES = 2 * 1024 * 1024;

const HelpPage = () => {
	const t = useTranslate();
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";

	const guideItems = [
		{
			title: t.help.guideCaraLoginTitle,
			description: t.help.guideCaraLoginDesc,
			content: t.help.guideCaraLoginContent,
		},
		{
			title: t.help.guideNavTitle,
			description: t.help.guideNavDesc,
			content: t.help.guideNavContent,
		},
		{
			title: t.help.guideFiturTitle,
			description: t.help.guideFiturDesc,
			content: t.help.guideFiturContent,
		},
		{
			title: t.help.guideTipsTitle,
			description: t.help.guideTipsDesc,
			content: t.help.guideTipsContent,
		},
	];

	const [selectedGuide, setSelectedGuide] = useState<
		(typeof guideItems)[0] | null
	>(null);

	const videoItems = [
		{
			title: t.help.videoDashboardTitle,
			duration: "5:23",
			url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
		},
		{
			title: t.help.videoAnalisisTitle,
			duration: "8:45",
			url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
		},
		{
			title: t.help.videoLaporanTitle,
			duration: "6:12",
			url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
		},
		{
			title: t.help.videoExportTitle,
			duration: "4:30",
			url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
		},
	];

	const [selectedVideo, setSelectedVideo] = useState<
		(typeof videoItems)[0] | null
	>(null);

	const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
	const [faqLoading, setFaqLoading] = useState(true);

	const documentationItems = [
		{
			title: t.help.docApiTitle,
			description: t.help.docApiDesc,
			content: t.help.docApiContent,
		},
		{
			title: t.help.docIntegrasiTitle,
			description: t.help.docIntegrasiDesc,
			content: t.help.docIntegrasiContent,
		},
		{
			title: t.help.docFormatTitle,
			description: t.help.docFormatDesc,
			content: t.help.docFormatContent,
		},
		{
			title: t.help.docBestTitle,
			description: t.help.docBestDesc,
			content: t.help.docBestContent,
		},
	];

	const [selectedDoc, setSelectedDoc] = useState<
		(typeof documentationItems)[0] | null
	>(null);

	const stats = [
		{ value: "150+", label: t.help.artikelPanduan },
		{ value: "50+", label: t.help.videoTutorial },
		{ value: "24/7", label: t.help.supportAktif },
	];

	const [messages, setMessages] = useState([
		{
			id: 1,
			text: t.help.jennaGreeting,
			sender: "jenna",
		},
	]);
	const [inputValue, setInputValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const chatBottomRef = useRef<HTMLDivElement>(null);

	// --- Tiket state ---
	const [tiketNama, setTiketNama] = useState("");
	const [tiketEmail, setTiketEmail] = useState("");
	const [tiketKategori, setTiketKategori] = useState<string | null>(null);
	const [tiketDeskripsi, setTiketDeskripsi] = useState("");
	const [tiketFile, setTiketFile] = useState<File | null>(null);
	const [tiketSending, setTiketSending] = useState(false);
	const [tiketStatus, setTiketStatus] = useState<"idle" | "ok" | "error">(
		"idle",
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll on every message/loading change
	useEffect(() => {
		chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isLoading]);

	useEffect(() => {
		let cancelled = false;
		fetch("/api/bantuan/faq")
			.then((r) => r.json())
			.then((json: { data?: FaqItem[] }) => {
				if (!cancelled) setFaqItems(json.data ?? []);
			})
			.catch(() => {})
			.finally(() => {
				if (!cancelled) setFaqLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const faqByCategory = faqItems.reduce<Record<string, FaqItem[]>>(
		(acc, faq) => {
			const bucket = acc[faq.category];
			if (bucket) {
				bucket.push(faq);
			} else {
				acc[faq.category] = [faq];
			}
			return acc;
		},
		{},
	);
	const faqCategories = Object.keys(faqByCategory);

	const QUICK_REPLIES = [
		t.help.quickLogin,
		t.help.quickSync,
		t.help.quickFitur,
		t.help.quickBahasa,
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
			const reply = res.ok
				? json.reply
				: (json.error ?? t.help.terjadiKesalahan);

			setMessages((prev) => [
				...prev,
				{ id: Date.now() + 1, text: reply, sender: "jenna" },
			]);
		} catch {
			setMessages((prev) => [
				...prev,
				{
					id: Date.now() + 1,
					text: t.help.koneksiGagal,
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

	const handleKirimTiket = async () => {
		if (!tiketNama || !tiketEmail || !tiketKategori || !tiketDeskripsi) return;

		setTiketSending(true);
		setTiketStatus("idle");

		let screenshotBase64: string | undefined;
		let screenshotMime: string | undefined;

		if (tiketFile) {
			const buf = await tiketFile.arrayBuffer();
			const bytes = new Uint8Array(buf);
			let bin = "";
			for (let i = 0; i < bytes.length; i++) {
				bin += String.fromCharCode(bytes[i] as number);
			}
			screenshotBase64 = btoa(bin);
			screenshotMime = tiketFile.type;
		}

		try {
			const res = await fetch("/api/bantuan/kirim-tiket", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					nama: tiketNama,
					email: tiketEmail,
					kategori: tiketKategori,
					deskripsi: tiketDeskripsi,
					screenshotBase64,
					screenshotMime,
				}),
			});
			if (res.ok) {
				setTiketStatus("ok");
				setTiketNama("");
				setTiketEmail("");
				setTiketKategori(null);
				setTiketDeskripsi("");
				setTiketFile(null);
			} else {
				setTiketStatus("error");
			}
		} catch {
			setTiketStatus("error");
		} finally {
			setTiketSending(false);
		}
	};

	const cardStyle = {
		borderColor: dark ? "#334155" : "white",
		boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
		transition: "transform 0.15s ease, box-shadow 0.15s ease",
	};

	return (
		<Container size="lg" py="xl">
			<Title order={1} mb="xl" ta="center">
				{t.help.pusatBantuan}
			</Title>
			<Text size="lg" color="dimmed" ta="center" mb="xl">
				{t.help.subtitle}
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
							...cardStyle,
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
								style={cardStyle}
								bg={dark ? "#1E293B" : "white"}
								icon={<IconBook size={24} color="white" />}
								title={t.help.panduanMemulai}
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
								style={cardStyle}
								bg={dark ? "#1E293B" : "white"}
								icon={<IconVideo size={24} color="white" />}
								title={t.help.videoTutorial}
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
								style={cardStyle}
								bg={dark ? "#1E293B" : "white"}
								icon={<IconHelpCircle size={24} color="white" />}
								title={t.help.faq}
								h="100%"
							>
								{faqLoading ? (
									<Stack align="center" py="md">
										<Loader size="sm" />
									</Stack>
								) : faqItems.length === 0 ? (
									<Text size="sm" c="dimmed" ta="center" py="md">
										Belum ada FAQ tersedia
									</Text>
								) : (
									<ScrollArea h={380} type="auto" offsetScrollbars>
										{faqCategories.length === 1 ? (
											<Accordion variant="separated">
												{(faqByCategory[faqCategories[0] ?? ""] ?? []).map(
													(item) => (
														<Accordion.Item
															style={{
																backgroundColor: dark ? "#263852ff" : "#F1F5F9",
															}}
															key={item.id}
															value={item.id}
														>
															<Accordion.Control>
																{item.question}
															</Accordion.Control>
															<Accordion.Panel>
																<Text size="sm">{item.answer}</Text>
															</Accordion.Panel>
														</Accordion.Item>
													),
												)}
											</Accordion>
										) : (
											<Stack gap="sm">
												{faqCategories.map((cat) => (
													<Box key={cat}>
														<Text
															size="xs"
															fw={700}
															tt="uppercase"
															c="dimmed"
															mb="xs"
														>
															{cat}
														</Text>
														<Accordion variant="separated">
															{(faqByCategory[cat] ?? []).map((item) => (
																<Accordion.Item
																	style={{
																		backgroundColor: dark
																			? "#263852ff"
																			: "#F1F5F9",
																	}}
																	key={item.id}
																	value={item.id}
																>
																	<Accordion.Control>
																		{item.question}
																	</Accordion.Control>
																	<Accordion.Panel>
																		<Text size="sm">{item.answer}</Text>
																	</Accordion.Panel>
																</Accordion.Item>
															))}
														</Accordion>
													</Box>
												))}
											</Stack>
										)}
									</ScrollArea>
								)}
							</HelpCard>
						</Grid.Col>
					</Grid>
				</Box>

				<Box>
					<Grid>
						{/* Dokumentasi */}
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<HelpCard
								style={cardStyle}
								bg={dark ? "#1E293B" : "white"}
								icon={<IconFileText size={24} color="white" />}
								title={t.help.dokumentasi}
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

						{/* Kontak Dukungan */}
						<Grid.Col span={{ base: 12, sm: 12, md: 8 }}>
							<HelpCard
								style={cardStyle}
								bg={dark ? "#1E293B" : "white"}
								icon={<IconHeadphones size={24} color="white" />}
								title={t.help.kontakDukungan}
								h="100%"
							>
								<Grid gutter={0}>
									{/* Info Kontak Desa */}
									<Grid.Col
										span={{ base: 12, sm: 4 }}
										style={{
											borderRight: `1px solid ${dark ? "#263345" : "#f0f4f8"}`,
											paddingRight: 20,
										}}
									>
										<Box
											mb="md"
											px="xs"
											py={5}
											style={{
												background: dark
													? "rgba(37,99,235,0.1)"
													: "rgba(30,58,95,0.06)",
												borderRadius: 6,
											}}
										>
											<Text
												size="xs"
												fw={700}
												tt="uppercase"
												c={dark ? "blue.3" : "blue.8"}
												style={{ letterSpacing: 1 }}
											>
												{t.help.infoKontak}
											</Text>
										</Box>

										<Stack gap={0}>
											{[
												{
													color: "green" as const,
													icon: <IconPhone size={14} />,
													label: "WhatsApp",
													value: supportConfig.whatsapp.label,
													href: `https://wa.me/${supportConfig.whatsapp.number}`,
													linkColor: "#16a34a",
													external: true,
												},
												{
													color: "blue" as const,
													icon: <IconMail size={14} />,
													label: "Email",
													value: supportConfig.email,
													href: `mailto:${supportConfig.email}`,
													linkColor: "#2563eb",
													external: false,
												},
												{
													color: "orange" as const,
													icon: <IconClock size={14} />,
													label: t.help.jamOperasionalLabel,
													value: supportConfig.jamOperasional,
												},
												{
													color: "violet" as const,
													icon: <IconMessage size={14} />,
													label: t.help.waktuResponLabel,
													value: t.help.waktuResponValue,
												},
											].map((item) => (
												<Box
													key={item.label}
													py={10}
													style={{
														borderBottom: `1px solid ${dark ? "#1e293b" : "#f1f5f9"}`,
													}}
												>
													<Group gap={6} mb={3} wrap="nowrap">
														<ThemeIcon
															size={20}
															radius="sm"
															color={item.color}
															variant="light"
														>
															{item.icon}
														</ThemeIcon>
														<Text size="xs" c="dimmed" fw={500}>
															{item.label}
														</Text>
													</Group>
													{"href" in item && item.href ? (
														<Text
															size="sm"
															fw={600}
															component="a"
															href={item.href}
															target={
																"external" in item && item.external
																	? "_blank"
																	: undefined
															}
															rel={
																"external" in item && item.external
																	? "noreferrer"
																	: undefined
															}
															style={{
																color:
																	"linkColor" in item
																		? item.linkColor
																		: undefined,
																textDecoration: "none",
																paddingLeft: 26,
																display: "block",
															}}
														>
															{item.value}
														</Text>
													) : (
														<Text
															size="sm"
															fw={600}
															style={{ paddingLeft: 26 }}
														>
															{item.value}
														</Text>
													)}
												</Box>
											))}
										</Stack>
									</Grid.Col>

									{/* Form Tiket */}
									<Grid.Col
										span={{ base: 12, sm: 8 }}
										pl={{ base: 0, sm: "lg" }}
										pt={{ base: "md", sm: 0 }}
									>
										<Box
											mb="sm"
											px="xs"
											py={5}
											style={{
												background: dark
													? "rgba(37,99,235,0.1)"
													: "rgba(30,58,95,0.06)",
												borderRadius: 6,
											}}
										>
											<Text
												size="xs"
												fw={700}
												tt="uppercase"
												c={dark ? "blue.3" : "blue.8"}
												style={{ letterSpacing: 1 }}
											>
												Kirim Tiket Dukungan
											</Text>
										</Box>

										<Stack gap="xs">
											{tiketStatus === "ok" && (
												<Alert
													color="green"
													icon={<IconCheck size={14} />}
													withCloseButton
													onClose={() => setTiketStatus("idle")}
													py="xs"
													radius="md"
												>
													{t.help.tiketTerkirim}
												</Alert>
											)}
											{tiketStatus === "error" && (
												<Alert
													color="red"
													icon={<IconX size={14} />}
													withCloseButton
													onClose={() => setTiketStatus("idle")}
													py="xs"
													radius="md"
												>
													{t.help.tiketGagal}
												</Alert>
											)}

											<Grid gutter="xs">
												<Grid.Col span={6}>
													<TextInput
														label={t.help.formNama}
														placeholder="Nama Anda"
														value={tiketNama}
														onChange={(e) => setTiketNama(e.target.value)}
														size="sm"
													/>
												</Grid.Col>
												<Grid.Col span={6}>
													<TextInput
														label={t.help.formEmail}
														placeholder="email@contoh.com"
														type="email"
														value={tiketEmail}
														onChange={(e) => setTiketEmail(e.target.value)}
														size="sm"
													/>
												</Grid.Col>
											</Grid>

											<Select
												label={t.help.formKategori}
												placeholder="Pilih kategori masalah"
												data={KATEGORI_OPTIONS}
												value={tiketKategori}
												onChange={setTiketKategori}
												size="sm"
											/>

											<Textarea
												label={t.help.formDeskripsi}
												placeholder="Jelaskan masalah yang Anda alami secara detail..."
												minRows={3}
												maxRows={5}
												value={tiketDeskripsi}
												onChange={(e) => setTiketDeskripsi(e.target.value)}
												size="sm"
											/>

											<Group gap="xs" align="center" wrap="nowrap">
												<FileButton
													onChange={(file) => {
														if (file && file.size > MAX_SCREENSHOT_BYTES)
															return;
														setTiketFile(file);
													}}
													accept="image/png,image/jpeg"
												>
													{(props) => (
														<Button
															{...props}
															variant="default"
															size="xs"
															leftSection={<IconPaperclip size={13} />}
															style={{ flexShrink: 0 }}
														>
															{tiketFile
																? tiketFile.name
																: t.help.formScreenshot}
														</Button>
													)}
												</FileButton>
												{tiketFile && (
													<ActionIcon
														size="sm"
														variant="subtle"
														color="red"
														onClick={() => setTiketFile(null)}
														aria-label="Hapus file"
													>
														<IconX size={12} />
													</ActionIcon>
												)}
												<Text size="xs" c="dimmed">
													{t.help.formScreenshotHint}
												</Text>
											</Group>

											<Button
												fullWidth
												leftSection={<IconSend size={15} />}
												loading={tiketSending}
												disabled={
													!tiketNama ||
													!tiketEmail ||
													!tiketKategori ||
													tiketDeskripsi.length < 10
												}
												onClick={() => void handleKirimTiket()}
												size="sm"
												mt={4}
												style={{
													background:
														"linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
												}}
											>
												{t.help.kirimTiket}
											</Button>
										</Stack>
									</Grid.Col>
								</Grid>
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
							{t.help.panduanBadge}
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
						{t.help.tutup}
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
							{t.help.videoTutorial}
						</Badge>
					</Group>
					<Title order={3} c="white" mb={4}>
						{selectedVideo?.title}
					</Title>
					<Text size="sm" c="white" opacity={0.8}>
						{t.help.durasi}: {selectedVideo?.duration}
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
						{t.help.tutup}
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
							{t.help.dokumentasi}
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
						{t.help.tutup}
					</Text>
				</Box>
			</Modal>
		</Container>
	);
};

export default HelpPage;
