import { Grid } from "@mantine/core";
import { IconHeadphones } from "@tabler/icons-react";
import { HelpCard } from "@/components/ui/help-card";
import { HelpContactInfo } from "./help-contact-info";
import { type HelpPalette, helpCardStyle } from "./help-palette";
import { HelpTicketForm } from "./help-ticket-form";

/** Kartu Kontak Dukungan: info kontak desa di kiri, form tiket di kanan. */
export function HelpContactCard({
	title,
	dark,
	palette,
}: {
	title: string;
	dark: boolean;
	palette: HelpPalette;
}) {
	return (
		<HelpCard
			style={helpCardStyle(palette)}
			bg={palette.cardBg}
			icon={<IconHeadphones size={24} color="white" />}
			title={title}
			h="100%"
		>
			<Grid gutter={0}>
				<Grid.Col
					span={{ base: 12, sm: 4 }}
					style={{
						borderRight: `1px solid ${dark ? "#263345" : "#f0f4f8"}`,
						paddingRight: 20,
					}}
				>
					<HelpContactInfo dark={dark} />
				</Grid.Col>

				<Grid.Col
					span={{ base: 12, sm: 8 }}
					pl={{ base: 0, sm: "lg" }}
					pt={{ base: "md", sm: 0 }}
				>
					<HelpTicketForm dark={dark} />
				</Grid.Col>
			</Grid>
		</HelpCard>
	);
}
