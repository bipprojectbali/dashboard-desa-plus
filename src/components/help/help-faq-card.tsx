import { Accordion, Box, Loader, ScrollArea, Stack, Text } from "@mantine/core";
import { IconHelpCircle } from "@tabler/icons-react";
import { HelpCard } from "@/components/ui/help-card";
import { groupFaqByCategory } from "./faq-by-category";
import type { FaqItem } from "./help-content.types";
import { type HelpPalette, helpCardStyle } from "./help-palette";
import { useFaqItems } from "./use-faq-items";

function FaqAccordion({
	items,
	palette,
}: {
	items: FaqItem[];
	palette: HelpPalette;
}) {
	return (
		<Accordion variant="separated">
			{items.map((item) => (
				<Accordion.Item
					style={{ backgroundColor: palette.faqItemBg }}
					key={item.id}
					value={item.id}
				>
					<Accordion.Control>{item.question}</Accordion.Control>
					<Accordion.Panel>
						<Text size="sm">{item.answer}</Text>
					</Accordion.Panel>
				</Accordion.Item>
			))}
		</Accordion>
	);
}

/** Kartu FAQ halaman Bantuan: dimuat dari server, dikelompokkan per kategori bila lebih dari satu. */
export function HelpFaqCard({
	title,
	palette,
}: {
	title: string;
	palette: HelpPalette;
}) {
	const { faqItems, faqLoading } = useFaqItems();
	const faqByCategory = groupFaqByCategory(faqItems);
	const faqCategories = Object.keys(faqByCategory);

	return (
		<HelpCard
			style={helpCardStyle(palette)}
			bg={palette.cardBg}
			icon={<IconHelpCircle size={24} color="white" />}
			title={title}
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
						<FaqAccordion
							items={faqByCategory[faqCategories[0] ?? ""] ?? []}
							palette={palette}
						/>
					) : (
						<Stack gap="sm">
							{faqCategories.map((cat) => (
								<Box key={cat}>
									<Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs">
										{cat}
									</Text>
									<FaqAccordion
										items={faqByCategory[cat] ?? []}
										palette={palette}
									/>
								</Box>
							))}
						</Stack>
					)}
				</ScrollArea>
			)}
		</HelpCard>
	);
}
