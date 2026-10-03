import { Accordion, Text } from "@mantine/core";
import { IconHelpCircle } from "@tabler/icons-react";
import { HelpCard } from "@/components/ui/help-card";
import { adminFaqItems } from "./admin-help-content";
import { type HelpPalette, helpCardStyle } from "./help-palette";

/** Kartu FAQ admin (statis, tanpa kategori). */
export function AdminHelpFaqCard({ palette }: { palette: HelpPalette }) {
	return (
		<HelpCard
			style={helpCardStyle(palette)}
			bg={palette.cardBg}
			icon={<IconHelpCircle size={24} color="white" />}
			title="FAQ Admin"
			h="100%"
		>
			<Accordion variant="separated">
				{adminFaqItems.map((item) => (
					<Accordion.Item
						style={{ backgroundColor: palette.faqItemBg }}
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
	);
}
