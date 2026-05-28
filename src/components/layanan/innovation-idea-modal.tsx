import {
	Badge,
	Box,
	Button,
	Divider,
	Group,
	Modal,
	Paper,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
	Title,
	useMantineColorScheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
	IconBulb,
	IconCalendar,
	IconCategory,
	IconPhone,
	IconUser,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useTranslate } from "@/hooks/useTranslate";

export interface InnovationIdea {
	id: string;
	title: string;
	description: string;
	category: string;
	submitterName: string;
	submitterContact?: string;
	status: string;
	createdAt: string;
}

interface InnovationIdeaModalProps {
	idea: InnovationIdea | null;
	opened: boolean;
	onClose: () => void;
}

const getStatusMeta = (status: string): { color: string; label: string } => {
	switch (status.toUpperCase()) {
		case "BARU":
			return { color: "blue", label: "Baru" };
		case "DIKAJI":
			return { color: "yellow", label: "Dikaji" };
		case "DISETUJUI":
			return { color: "green", label: "Disetujui" };
		case "DITOLAK":
			return { color: "red", label: "Ditolak" };
		case "DIIMPLEMENTASI":
			return { color: "teal", label: "Diimplementasi" };
		default:
			return { color: "gray", label: status };
	}
};

const getCategoryColor = (category: string): string => {
	switch (category.toLowerCase()) {
		case "teknologi":
			return "#7C3AED";
		case "ekonomi":
			return "#059669";
		case "kesehatan":
			return "#DC2626";
		case "pendidikan":
			return "#D97706";
		default:
			return "#1e3a5f";
	}
};

export const InnovationIdeaModal = ({
	idea,
	opened,
	onClose,
}: InnovationIdeaModalProps) => {
	const t = useTranslate();
	const { colorScheme } = useMantineColorScheme();
	const dark = colorScheme === "dark";
	const isMobile = useMediaQuery("(max-width: 48em)");

	if (!idea) return null;

	const statusMeta = getStatusMeta(idea.status);
	const categoryColor = getCategoryColor(idea.category);
	const sectionBg = dark ? "#1E293B" : "white";
	const cardBg = dark ? "#0F172A" : "#F8FAFC";
	const borderColor = dark ? "#334155" : "#E2E8F0";
	const labelColor = dark ? "dark.2" : "dimmed";

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Group gap="xs">
					<ThemeIcon
						radius="xl"
						size="md"
						variant="gradient"
						gradient={{ from: "#1e3a5f", to: "#7C3AED", deg: 135 }}
					>
						<IconBulb size={14} />
					</ThemeIcon>
					<Text fw={700} size="md" c={dark ? "white" : "#1e3a5f"}>
						{t.pengaduanLayanan.detailIde}
					</Text>
				</Group>
			}
			size="lg"
			radius="xl"
			padding="xl"
			centered
			fullScreen={!!isMobile}
			styles={{
				header: {
					backgroundColor: sectionBg,
					borderBottom: `1px solid ${borderColor}`,
				},
				body: {
					backgroundColor: cardBg,
					padding: 0,
					overflowY: "auto",
					maxHeight: "75vh",
				},
				content: { backgroundColor: cardBg, overflow: "hidden" },
			}}
		>
			<Stack gap={0}>
				{/* Banner */}
				<Box
					p="xl"
					style={{
						background: `linear-gradient(135deg, #1e3a5f 0%, ${categoryColor} 100%)`,
					}}
				>
					<Stack gap="sm">
						<Group gap="xs" wrap="wrap">
							<Badge
								size="sm"
								radius="xl"
								variant="filled"
								color={statusMeta.color}
							>
								{statusMeta.label}
							</Badge>
							<Badge
								size="sm"
								radius="xl"
								variant="outline"
								color="white"
								style={{ borderColor: "rgba(255,255,255,0.5)", color: "white" }}
							>
								{idea.category}
							</Badge>
						</Group>
						<Title order={3} c="white" style={{ lineHeight: 1.3 }}>
							{idea.title}
						</Title>
						<Text size="xs" c="blue.2">
							{dayjs(idea.createdAt).format("DD MMMM YYYY")}
						</Text>
					</Stack>
				</Box>

				<Stack gap="lg" p="xl">
					{/* Description */}
					<Paper
						radius="lg"
						p="md"
						bg={sectionBg}
						withBorder
						style={{ borderColor }}
					>
						<Group gap="xs" mb="sm">
							<ThemeIcon size="sm" radius="xl" variant="light" color="violet">
								<IconBulb size={12} />
							</ThemeIcon>
							<Text size="sm" fw={600} c={dark ? "white" : "#1e3a5f"}>
								{t.pengaduanLayanan.deskripsiIde}
							</Text>
						</Group>
						<Text
							size="sm"
							c={dark ? "dark.1" : "gray.7"}
							style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}
						>
							{idea.description}
						</Text>
					</Paper>

					<Divider color={borderColor} />

					{/* Info grid */}
					<SimpleGrid cols={2} spacing="md">
						<InfoItem
							icon={<IconUser size={14} />}
							label={t.pengaduanLayanan.pengusul}
							value={idea.submitterName}
							dark={dark}
							labelColor={labelColor}
							borderColor={borderColor}
							sectionBg={sectionBg}
						/>
						<InfoItem
							icon={<IconPhone size={14} />}
							label={t.pengaduanLayanan.kontakPengusul}
							value={idea.submitterContact ?? t.pengaduanLayanan.tidakAdaKontak}
							dim={!idea.submitterContact}
							dark={dark}
							labelColor={labelColor}
							borderColor={borderColor}
							sectionBg={sectionBg}
						/>
						<InfoItem
							icon={<IconCalendar size={14} />}
							label={t.pengaduanLayanan.diajukanPada}
							value={dayjs(idea.createdAt).format("DD MMM YYYY, HH:mm")}
							dark={dark}
							labelColor={labelColor}
							borderColor={borderColor}
							sectionBg={sectionBg}
						/>
						<InfoItem
							icon={<IconCategory size={14} />}
							label={t.pengaduanLayanan.kategoriIde}
							value={idea.category}
							dark={dark}
							labelColor={labelColor}
							borderColor={borderColor}
							sectionBg={sectionBg}
							accent={categoryColor}
						/>
					</SimpleGrid>
				</Stack>

				{/* Footer */}
				<Box
					px="xl"
					pb="xl"
					style={{ borderTop: `1px solid ${borderColor}`, paddingTop: 16 }}
				>
					<Button
						fullWidth
						radius="xl"
						variant="light"
						color="darmasaba-blue"
						onClick={onClose}
					>
						{t.pengaduanLayanan.tutupIde}
					</Button>
				</Box>
			</Stack>
		</Modal>
	);
};

interface InfoItemProps {
	icon: React.ReactNode;
	label: string;
	value: string;
	dim?: boolean;
	dark: boolean;
	labelColor: string;
	borderColor: string;
	sectionBg: string;
	accent?: string;
}

const InfoItem = ({
	icon,
	label,
	value,
	dim,
	dark,
	labelColor,
	borderColor,
	sectionBg,
	accent,
}: InfoItemProps) => (
	<Paper radius="lg" p="md" bg={sectionBg} withBorder style={{ borderColor }}>
		<Group gap="xs" mb={4}>
			<ThemeIcon
				size="xs"
				radius="xl"
				variant="light"
				color={accent ? undefined : "blue"}
				style={
					accent ? { backgroundColor: `${accent}22`, color: accent } : undefined
				}
			>
				{icon}
			</ThemeIcon>
			<Text size="xs" c={labelColor} fw={500}>
				{label}
			</Text>
		</Group>
		<Text
			fw={600}
			size="sm"
			c={dim ? labelColor : dark ? "white" : "#1e3a5f"}
			style={{ lineHeight: 1.4 }}
		>
			{value}
		</Text>
	</Paper>
);
