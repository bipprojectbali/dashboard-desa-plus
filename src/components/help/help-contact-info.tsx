import {
	Box,
	type DefaultMantineColor,
	Group,
	Stack,
	Text,
	ThemeIcon,
} from "@mantine/core";
import {
	IconClock,
	IconMail,
	IconMessage,
	IconPhone,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { supportConfig } from "@/config/support";
import { useTranslate } from "@/hooks/useTranslate";
import { HelpSectionLabel } from "./help-section-label";

interface ContactRow {
	color: DefaultMantineColor;
	icon: ReactNode;
	label: string;
	value: string;
	href?: string;
	external?: boolean;
}

/** Daftar kontak dukungan desa (WhatsApp, email, jam operasional, waktu respon). */
export function HelpContactInfo({ dark }: { dark: boolean }) {
	const t = useTranslate();
	const rows: ContactRow[] = [
		{
			color: "green",
			icon: <IconPhone size={14} />,
			label: "WhatsApp",
			value: supportConfig.whatsapp.label,
			href: `https://wa.me/${supportConfig.whatsapp.number}`,
			external: true,
		},
		{
			color: "blue",
			icon: <IconMail size={14} />,
			label: "Email",
			value: supportConfig.email,
			href: `mailto:${supportConfig.email}`,
			external: false,
		},
		{
			color: "orange",
			icon: <IconClock size={14} />,
			label: t.help.jamOperasionalLabel,
			value: supportConfig.jamOperasional,
		},
		{
			color: "violet",
			icon: <IconMessage size={14} />,
			label: t.help.waktuResponLabel,
			value: t.help.waktuResponValue,
		},
	];

	return (
		<>
			<HelpSectionLabel dark={dark} mb="md">
				{t.help.infoKontak}
			</HelpSectionLabel>

			<Stack gap={0}>
				{rows.map((item) => (
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
						{item.href ? (
							<Text
								size="sm"
								fw={600}
								component="a"
								href={item.href}
								target={item.external ? "_blank" : undefined}
								rel={item.external ? "noreferrer" : undefined}
								c={item.color}
								style={{ textDecoration: "none", display: "block" }}
							>
								{item.value}
							</Text>
						) : (
							<Text size="sm" fw={600}>
								{item.value}
							</Text>
						)}
					</Box>
				))}
			</Stack>
		</>
	);
}
