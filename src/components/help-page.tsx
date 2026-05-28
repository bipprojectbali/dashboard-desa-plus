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
import { useTranslate } from "@/hooks/useTranslate";

const HelpPage = () => {
	const t = useTranslate();
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";
	// Sample data for sections
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

	const faqItems = [
		{ question: t.help.faqQ1, answer: t.help.faqA1 },
		{ question: t.help.faqQ2, answer: t.help.faqA2 },
		{ question: t.help.faqQ3, answer: t.help.faqA3 },
		{ question: t.help.faqQ4, answer: t.help.faqA4 },
	];

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

	// State for chat functionality
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll on every message/loading change
	useEffect(() => {
		chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isLoading]);

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
								style={{
									borderColor: dark ? "#334155" : "white",
									boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
									transition: "transform 0.15s ease, box-shadow 0.15s ease",
								}}
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
								style={{
									borderColor: dark ? "#334155" : "white",
									boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
									transition: "transform 0.15s ease, box-shadow 0.15s ease",
								}}
								bg={dark ? "#1E293B" : "white"}
								icon={<IconHelpCircle size={24} color="white" />}
								title={t.help.faq}
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
								title={t.help.hubungiSupport}
								h="100%"
							>
								<Box>
									<Text fw={500}>{t.help.emailLabel}</Text>
									<Text size="sm" color="dimmed" mb="md">
										<a href={`mailto:${supportConfig.email}`}>
											{supportConfig.email}
										</a>
									</Text>

									<Text fw={500}>{t.help.whatsappLabel}</Text>
									<Text size="sm" color="dimmed" mb="md">
										<a href={`https://wa.me/${supportConfig.whatsapp.number}`}>
											{supportConfig.whatsapp.label}
										</a>
									</Text>

									<Text fw={500}>{t.help.jamKerjaLabel}</Text>
									<Text size="sm" color="dimmed">
										{t.help.jamKerjaValue}
									</Text>

									<Text fw={500} mt="md">
										{t.help.waktuResponLabel}
									</Text>
									<Text size="sm" color="dimmed">
										{t.help.waktuResponValue}
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

						{/* Jenna - Virtual Assistant (disabled) */}
						{false && (
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
															{t.help.virtualAssistantOnline}
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
												{t.help.aiPowered}
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
												{t.help.pertanyaanCepat}
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
												placeholder={t.help.ketikPesan}
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
												aria-label={t.help.kirimPesan}
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
											{t.help.jennaDisclaimer}
										</Text>
									</Box>
								</Box>
							</Grid.Col>
						)}
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
