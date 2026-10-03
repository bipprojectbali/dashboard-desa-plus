import {
	Badge,
	Box,
	Divider,
	Group,
	type MantineSize,
	Modal,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import type { ReactNode } from "react";

interface HelpDetailModalProps {
	opened: boolean;
	onClose: () => void;
	size: MantineSize;
	/** Latar header (CSS gradient). */
	gradient: string;
	/** Warna ikon & badge di header. */
	accent: string;
	icon: ReactNode;
	badge: string;
	title?: string;
	subtitle: ReactNode;
	closeLabel: string;
	children: ReactNode;
}

/** Kerangka modal detail bantuan: header gradien, isi, dan tautan tutup. */
export function HelpDetailModal({
	opened,
	onClose,
	size,
	gradient,
	accent,
	icon,
	badge,
	title,
	subtitle,
	closeLabel,
	children,
}: HelpDetailModalProps) {
	return (
		<Modal
			opened={opened}
			onClose={onClose}
			size={size}
			radius="lg"
			padding="xl"
			withCloseButton={false}
			styles={{
				content: { overflow: "hidden" },
				body: { padding: 0 },
			}}
		>
			<Box px="xl" pt="xl" pb="md" style={{ background: gradient }}>
				<Group gap="sm" mb="xs">
					<ThemeIcon
						size={36}
						radius="md"
						color="white"
						variant="white"
						style={{ color: accent }}
					>
						{icon}
					</ThemeIcon>
					<Badge
						color="white"
						variant="white"
						size="sm"
						style={{ color: accent }}
					>
						{badge}
					</Badge>
				</Group>
				<Title order={3} c="white" mb={4}>
					{title}
				</Title>
				<Text size="sm" c="white" opacity={0.8}>
					{subtitle}
				</Text>
			</Box>

			<Divider />

			{children}

			<Divider />
			<Box px="xl" py="md" ta="right">
				<Text
					size="sm"
					c="dimmed"
					style={{ cursor: "pointer" }}
					onClick={onClose}
					fw={500}
				>
					{closeLabel}
				</Text>
			</Box>
		</Modal>
	);
}
