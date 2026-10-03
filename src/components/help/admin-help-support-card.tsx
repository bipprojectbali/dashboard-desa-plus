import { Box, Text } from "@mantine/core";
import { IconHeadphones } from "@tabler/icons-react";
import { HelpCard } from "@/components/ui/help-card";
import { supportConfig } from "@/config/support";
import { type HelpPalette, helpCardStyle } from "./help-palette";

/** Kartu kontak support untuk administrator (email, WhatsApp, jam kerja). */
export function AdminHelpSupportCard({ palette }: { palette: HelpPalette }) {
	return (
		<HelpCard
			style={helpCardStyle(palette)}
			bg={palette.cardBg}
			icon={<IconHeadphones size={24} color="white" />}
			title="Hubungi Support"
			h="100%"
		>
			<Box>
				<Text fw={500}>Email</Text>
				<Text size="sm" c="dimmed" mb="md">
					<a href={`mailto:${supportConfig.email}`}>{supportConfig.email}</a>
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
	);
}
